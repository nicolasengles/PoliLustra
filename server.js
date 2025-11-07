const MENSAGEM_ERRO_PADRAO = 'Erro interno do servidor. Entre em contato conosco caso o problema persista.';

// 1. IMPORTAÇÕES E CONFIGURAÇÃO INICIAL
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Necessário para a função de login
// const jwt = require('jsonwebtoken'); // Necessário para a função de login
// const cookieParser = require('cookie-parser'); // <-- Adicionado
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // <-- ADICIONE ESTA LINHA
const Image = require('./Models/Image');
const cors = require('cors');

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
// app.use(cookieParser()); // <-- Adicionado para gerir cookies

app.use(cors({
  origin: true, // Permite que qualquer origem envie cookies (bom para desenvolvimento)
  credentials: true // Essencial! Permite que o navegador envie cookies na requisição
}));

// Servir ficheiros estáticos
app.use(express.static(path.join(__dirname, 'html')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const session = require('express-session');
app.use(session({
  secret: ';hnodawhd;ouawhd;oiawbh;foawh',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// 4. ROTAS DA APLICAÇÃO

// API IA Stable core requisições

// server.js

// ROTAS DAS PÁGINAS 
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/configuracoes', protect, (req, res) => {
  res.render('configuracoes');
});

app.get('/editar', (req, res) => {
  res.render('editar');
});

app.get('/faq', (req, res) => {
  res.render('faq');
});

app.get('/gerador', protect, (req, res) => {
  res.render('gerador');
});

app.get('/historico', protect, (req, res) => {
  res.render('historico', );
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/cadastro', (req, res) => {
  res.render('cadastro');
});

app.get('/sobre', (req, res) => {
  res.render('sobre');
});

app.get('/termos-e-condicoes', (req, res) => {
  res.render('termos-e-condicoes');
});

app.get('/checksession', (req, res) => {
  res.send(req.session);
});

app.get('/politica-de-privacidade', (req, res) => {
  res.render('politica-de-privacidade');
});

// app.get('/contato', (req, res) => {
//   res.render('contato', {
//     user: req.user
//   });
// });

app.post('/api/ia/generate', protect, async (req, res) => {
  try {
    // 1. RECEBER OS CAMPOS ESTRUTURADOS DO CORPO DA REQUISIÇÃO
    const { 
      materia,
      assunto,
      estilo,
      prompt_personalizado, 
      output_format = 'webp', 
      negative_prompt = '' 
    } = req.body;

    // 2. VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS
    // Garante que o frontend enviou as informações necessárias.
    if (!materia || !assunto || !prompt_personalizado) {
        return res.status(400).json({ message: 'Os campos matéria, assunto e prompt_personalizado são obrigatórios.' });
    }

    // 3. CONSTRUÇÃO DO PROMPT FINAL
    // Criamos um prompt descritivo a partir das peças, otimizado para a IA.
    // const finalPrompt = `Imagem educacional para uma aula de ${materia} sobre ${assunto}. A cena deve ilustrar vividamente "${prompt_personalizado}". Estilo de arte digital, detalhado, cinematográfico e claro.`;
    const finalPrompt = `Imagem educacional para uma aula de ${materia} sobre ${assunto}. A cena deve ilustrar vividamente "${prompt_personalizado}". Estilo de arte tipo ${estilo}.`;
    
    console.log(`Prompt Construído: "${finalPrompt}"`);

    // 4. TRADUÇÃO VIA MICROSERVIÇO
    console.log('Chamando microserviço de tradução...');
    const TRANSLATION_SERVICE_URL = 'http://localhost:5001/translate';

    const transResponse = await axios.post(TRANSLATION_SERVICE_URL, { text: finalPrompt });
    const translatedPrompt = transResponse.data.translatedText;

    let translatedNegativePrompt = '';
    if (negative_prompt) {
      const transNegativeResponse = await axios.post(TRANSLATION_SERVICE_URL, { text: negative_prompt });
      translatedNegativePrompt = transNegativeResponse.data.translatedText;
    }

    // 5. PREPARAÇÃO E CHAMADA À API DE IA (STABILITY AI)
    const formData = new FormData();
    formData.append('prompt', translatedPrompt);
    formData.append('output_format', output_format);
    if (translatedNegativePrompt) {
      formData.append('negative_prompt', translatedNegativePrompt);
    }
    
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

    // 6. UPLOAD DA IMAGEM PARA O CLOUDINARY
    const imageBuffer = Buffer.from(responseFromStability.data);
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
    
    // 7. SALVAR O REGISTRO COMPLETO NO BANCO DE DADOS
    const imageLog = new Image({
        imageUrl: imageUrl,
        prompt: finalPrompt, // O prompt completo que nós construímos
        materia: materia, // O "ingrediente" original
        assunto: assunto, // O "ingrediente" original
        prompt_personalizado: prompt_personalizado, // O "ingrediente" original
        user: req.user._id,
    });
    await imageLog.save();

    // 8. ENVIAR RESPOSTA DE SUCESSO
    return res.status(200).json({ 
      message: 'Imagem gerada com sucesso!', 
      imageUrl: imageUrl 
    });

  } catch (error) {
    console.error("Erro na rota de geração de imagem:", error.response ? (error.response.data.toString() || error.message) : error.message);
    return res.status(500).json({ message: 'Ocorreu um erro ao gerar a imagem.' });
  }
});

app.get('/api/ia/history', protect, async (req, res) => {
  try {
    const fotoS = await Image.find({user:req.user._id}).sort({createdAt:-1});

    return res.status(200).json({ message: 'Histórico encontrado:', imagens: fotoS});

  } catch (error) {
    console.error("Erro ao carregar o histórico:", error.response ? error.response.data : error.message);
    return res.status(500).json({ message: 'Ocorreu um erro ao encontrar o histórico'});
  }

});

app.delete('/api/ia/history/:id', protect, async (req, res) => {
  try {
    // 1. ENCONTRAR A IMAGEM NO BANCO DE DADOS
    // Usamos o ID que veio como parâmetro na URL (req.params.id)
    const image = await Image.findById(req.params.id);

    // 2. VERIFICAÇÃO DE SEGURANÇA 1: A IMAGEM EXISTE?
    // Se findById não encontrar nada, ele retorna null.
    if (!image) {
      return res.status(404).json({ message: 'Imagem não encontrada.' });
    }

    // 3. VERIFICAÇÃO DE SEGURANÇA 2: O USUÁRIO É O DONO DA IMAGEM?
    // Comparamos o ID do dono da imagem (image.user) com o ID do usuário
    // que está logado (req.user._id), que o middleware 'protect' nos deu.
    // Usamos .toString() para garantir uma comparação correta entre os ObjectIDs.
    if (image.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Não autorizado. Você não é o dono desta imagem.' });
    }

    // 4. DELETAR A IMAGEM DO CLOUDINARY
    // Primeiro, precisamos extrair o 'public_id' da URL da imagem.
    // Ex: "https://.../upload/v123/public_id.webp" -> "public_id"
    const publicId = image.imageUrl.split('/').pop().split('.')[0];
    
    // Chamamos a função 'destroy' do uploader do Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // 5. DELETAR A IMAGEM DO BANCO DE DADOS
    // Agora que o arquivo foi removido da nuvem, removemos o registro do nosso DB.
    await Image.findByIdAndDelete(req.params.id);

    // 6. ENVIAR RESPOSTA DE SUCESSO
    return res.status(200).json({ message: 'Imagem deletada com sucesso.' });

  } catch (error) {
    console.error("Erro ao deletar imagem:", error.message);
    return res.status(500).json({ message: 'Ocorreu um erro interno ao deletar a imagem.' });
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Este e-mail já está sendo utilizado.' });
    }

    const user = new User({ name, email, password });
    await user.save();

    if (user) {
      req.session.user = { 
        _id: user._id,
        name: user.name,
        email: user.email,
      };

      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(400).json({ message: 'Dados de utilizador inválidos.' });
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      const errorMessage = messages[0];
      return res.status(400).json({ message: errorMessage });
    }

    console.error('Erro no registo:', error);
    res.status(500).json({ message: MENSAGEM_ERRO_PADRAO });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      req.session.user = { 
        _id: user._id,
        name: user.name,
        email: user.email,
      };

      res.status(200).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
      });
      
    } else {
      res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ message: MENSAGEM_ERRO_PADRAO });
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

// app.put('/api/users/profile', protect, async (req, res) => {
//   try {
//     const user = req.user;

//     if (user) {
//       user.name = req.body.name || user.name;
//       user.email = req.body.email || user.email;

//       if (req.body.password) {
//         user.password = req.body.password;
//       }

//       const updatedUser = await user.save();

//       // Adicionamos 'return' para garantir que a função termina aqui
//       return res.status(200).json({
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//       });
//     } else {
//       // Adicionamos 'return' aqui também
//       return res.status(404).json({ message: 'Utilizador não encontrado.' });
//     }
//   } catch (error) {
//     console.error('Erro ao atualizar perfil:', error);
//     // E aqui também
//     return res.status(500).json({ message: 'Erro interno do servidor.' });
//   }
// });

app.put('/api/users/alterar-nome', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (await user.matchPassword(req.body.senha) === false) {
        return res.status(400).json({ message: 'Senha incorreta.' });
      }

      if (req.body.novoNome == user.name) {
        return res.status(400).json({ message: 'O novo nome não pode ser igual ao atual.' });
      }

      user.name = req.body.novoNome;

      const updatedUser = await user.save();

      req.session.user.name = updatedUser.name;

      req.session.save((err) => {
          if (err) {
              console.error('Erro ao atualizar sessão:', err);
              return res.status(500).json({ success: false, message: 'Erro ao atualizar sessão.' });
          }

          res.status(200).json({ success: true });
      });
    } else {
      return res.status(400).json({ message: 'Erro de autenticação: Usuário não encontrado.' });
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      const errorMessage = messages[0];
      return res.status(400).json({ message: errorMessage });
    }
    console.error('Erro:', error);
    return res.status(500).json({ message: MENSAGEM_ERRO_PADRAO });
  }
});

app.put('/api/users/alterar-email', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (await user.matchPassword(req.body.senha) === false) {
        return res.status(400).json({ message: 'Senha incorreta.' });
      }

      if (req.body.novoEmail == user.email) {
        return res.status(400).json({ message: 'O novo email não pode ser igual ao atual.' });
      }

      user.email = req.body.novoEmail;

      const updatedUser = await user.save();

      req.session.user.email = updatedUser.email;

      req.session.save((err) => {
          if (err) {
              console.error('Erro ao atualizar sessão:', err);
              return res.status(500).json({ success: false, message: 'Erro ao atualizar sessão.' });
          }

          res.status(200).json({ success: true });
      });
    } else {
      return res.status(400).json({ message: 'Erro de autenticação: Usuário não encontrado.' });
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      const errorMessage = messages[0];
      return res.status(400).json({ message: errorMessage });
    }
    console.error('Erro:', error);
    return res.status(500).json({ message: MENSAGEM_ERRO_PADRAO });
  }
});

app.put('/api/users/alterar-senha', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (await user.matchPassword(req.body.senha) === false) {
        return res.status(400).json({ message: 'Senha incorreta.' });
      }

      if (await user.matchPassword(req.body.novaSenha) === true) {
        return res.status(400).json({ message: 'A nova senha não pode ser igual à atual.' });
      }

      user.password = req.body.novaSenha;

      await user.save();

      res.status(200).json({ success: true });

    } else {
      return res.status(400).json({ message: 'Erro de autenticação: Usuário não encontrado.' });
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      const errorMessage = messages[0];
      return res.status(400).json({ message: errorMessage });
    }
    console.error('Erro:', error);
    return res.status(500).json({ message: MENSAGEM_ERRO_PADRAO });
  }
});

app.delete('/api/users/excluir-conta', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (await user.matchPassword(req.body.senha) === false) {
        return res.status(400).json({ message: 'Senha incorreta.' });
      }

      await user.deleteOne();

      req.session.destroy(err => {
        if (err) {
          return next(err); 
        }
        res.status(200).json({ success: true });
      });
    } else {
      return res.status(400).json({ message: 'Erro de autenticação: Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ message: MENSAGEM_ERRO_PADRAO });
  }
});

app.post('/api/users/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return next(err); 
    }

    res.status(200).json({ redirectUrl: '/' });
  });
});

// INICIAR O SERVIDOR
app.listen(port, () => {
    console.log(`Servidor a rodar em http://localhost:${port}`);
});