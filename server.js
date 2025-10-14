// server.js

// 1. IMPORTAÇÕES E CONFIGURAÇÃO INICIAL
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Necessário para a função de login
const jwt = require('jsonwebtoken'); // Necessário para a função de login
const cookieParser = require('cookie-parser'); // <-- Adicionado
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // <-- ADICIONE ESTA LINHA
const Image = require('./Models/Image');

// Importa o nosso Modelo de Utilizador
const User = require('./Models/User');
const { protect } = require('./middleware/authMiddleware');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const port = process.env.PORT || 3000;

// 2. CONEXÃO COM A BASE DE DADOS
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Atlas Conectado com Sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB Atlas:', error.message);
    process.exit(1);
  }
};
connectDB();

// 3. MIDDLEWARE
app.use(express.urlencoded({ extended: true })); // Para formulários HTML
app.use(express.json()); // Para receber JSON
app.use(cookieParser()); // <-- Adicionado para gerir cookies

// Servir ficheiros estáticos
app.use(express.static(path.join(__dirname, 'html')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// 4. ROTAS DA APLICAÇÃO

// API IA Stable core requisições

// server.js

app.post('/api/ia/generate', protect, async (req, res) => {
  try {
    const { prompt, output_format = 'webp', negative_prompt = '' } = req.body;

    // --- NOVO: Bloco de Tradução via Microserviço ---
    console.log('Chamando microserviço de tradução...');
    const TRANSLATION_SERVICE_URL = 'http://localhost:5001/translate';

    // 1. Traduz o prompt principal
    const transResponse = await axios.post(TRANSLATION_SERVICE_URL, { text: prompt });
    const translatedPrompt = transResponse.data.translatedText;

    let translatedNegativePrompt = '';
    // 2. Se houver um prompt negativo, traduz também
    if (negative_prompt) {
      const transNegativeResponse = await axios.post(TRANSLATION_SERVICE_URL, { text: negative_prompt });
      translatedNegativePrompt = transNegativeResponse.data.translatedText;
    }

    console.log(`Prompt Original: "${prompt}" -> Traduzido: "${translatedPrompt}"`);
    // --- Fim do Bloco de Tradução ---

    // O resto do seu código continua exatamente igual, usando as variáveis traduzidas
    const formData = new FormData();
    formData.append('prompt', translatedPrompt);
    formData.append('output_format', output_format);
    if (translatedNegativePrompt) {
      formData.append('negative_prompt', translatedNegativePrompt);
    }
    
    // Gera a imagem com a API da Stability AI (como antes)
    const responseFromStability = await axios.post(
      `https://api.stability.ai/v2beta/stable-image/generate/core`,
      formData,
      {
        responseType: 'arraybuffer',
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: 'image/*',
        },
      }
    );

    if (responseFromStability.status !== 200) {
      throw new Error(`${responseFromStability.status}: ${responseFromStability.data.toString()}`);
    }

    const imageBuffer = Buffer.from(responseFromStability.data);

    // Faz o upload do buffer para o Cloudinary
    const cloudinaryUpload = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(imageBuffer);
      });
    };

    const uploadResult = await cloudinaryUpload();
    const imageUrl = uploadResult.secure_url;
    
    // --- Guardar o histórico ---
    const imageLog = new Image({
        imageUrl: imageUrl, // assumindo que imageUrl foi obtida do Cloudinary
        prompt: prompt, // Salva o prompt original em português
        user: req.user._id,
    });
    await imageLog.save();

    return res.status(200).json({ 
      message: 'Imagem gerada com sucesso!', 
      imageUrl: imageUrl 
    });

  } catch (error) {
    // ... seu tratamento de erro ...
    console.error("Erro na rota de geração de imagem:", error.response ? error.response.data : error.message);
    return res.status(500).json({ message: 'Ocorreu um erro ao gerar a imagem.' });
  }

});

// Rota Principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// --- ROTA DE CADASTRO ---
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Este e-mail já está a ser utilizado.' });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: 'Utilizador registado com sucesso!' });
  } catch (error) {
    console.error('Erro no registo:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// --- ROTA DE LOGIN (COM COOKIES HTTPONLY) ---
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      // Define o token num cookie seguro em vez de o enviar no corpo da resposta
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      });

      // Envia apenas os dados públicos do utilizador de volta
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

app.post('/api/users/forgot-password', async (req, res) => {
  let user; // <-- 1. Declaramos 'user' aqui fora com 'let'

  try {
    const { email } = req.body;
    user = await User.findOne({ email }); // <-- 2. Atribuímos o valor aqui (sem 'const')

    if (!user) {
      return res.status(200).json({ message: 'Se um utilizador com este e-mail existir, um link de recuperação foi enviado.' });
    }

    // ... (resto da lógica de gerar token e enviar e-mail continua igual)
    const resetToken = crypto.randomBytes(20).toString('hex');

    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `http://${req.get('host')}/reset-password.html?token=${resetToken}`;
    
    // Adicione o console.log para teste
    console.log('Link de Reset (para teste):', resetUrl);

    const message = `Você recebeu este e-mail porque solicitou uma redefinição de senha...`;
    
    // (Lembre-se de adicionar a sua configuração do Nodemailer aqui)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    await transporter.sendMail({
      to: user.email,
      subject: 'Link para Redefinição de Senha',
      text: message
    });

    res.status(200).json({ message: 'Um e-mail de recuperação foi enviado.' });

  } catch (error) {
    // 3. Agora o 'catch' tem acesso à variável 'user'
    if (user) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        // Precisamos de usar um 'await' aqui também para garantir que salva
        await user.save({ validateBeforeSave: false }); 
    }
    console.error('Erro no forgot-password:', error);
    res.status(500).json({ message: 'Erro ao enviar e-mail de recuperação.' });
  }
});

app.post('/api/users/reset-password/:token', async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      // Adicionamos 'return' aqui
      return res.status(400).json({ message: 'O token é inválido ou expirou.' });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Adicionamos 'return' aqui
    return res.status(200).json({ message: 'Senha redefinida com sucesso!' });

  } catch (error) {
    console.error('Erro no reset-password:', error);
    // E aqui também
    return res.status(500).json({ message: 'Erro ao redefinir a senha.' });
  }
});

app.put('/api/users/profile', protect, async (req, res) => {
  try {
    const user = req.user;

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      // Adicionamos 'return' para garantir que a função termina aqui
      return res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      });
    } else {
      // Adicionamos 'return' aqui também
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    // E aqui também
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

app.post('/api/users/logout', (req, res) => {
  // A forma de "apagar" um cookie é enviá-lo novamente com um valor vazio
  // e uma data de expiração no passado.
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // Define a expiração para o início dos tempos (imediatamente)
  });

  res.status(200).json({ message: 'Logout bem-sucedido.' });
});

// 5. INICIAR O SERVIDOR
app.listen(port, () => {
    console.log(`Servidor a rodar em http://localhost:${port}`);
});