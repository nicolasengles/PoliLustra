const MENSAGEM_ERRO_PADRAO = 'Erro interno do servidor. Entre em contato conosco caso o problema persista.';

require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Image = require('./Models/Image');
const cors = require('cors');

const User = require('./Models/User');
const { protect } = require('./middleware/authMiddleware');
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

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Atlas conectado.');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB Atlas:', error.message);
    process.exit(1);
  }
};
connectDB();

app.use(express.json());

app.use(cors({
  origin: true,
  credentials: true
}));

app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const session = require('express-session');
app.use(session({
  secret: require('crypto').randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/configuracoes', protect, (req, res) => {
  res.render('configuracoes');
});

app.get('/faq', (req, res) => {
  res.render('faq');
});

app.get('/gerador', protect, (req, res) => {
  res.render('gerador');
});

app.get('/historico', protect, async (req, res) => {
  try {
    const imagensDoUsuario = await Image.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.render('historico', { imagens: imagensDoUsuario });

  } catch (err) {
    console.error("Erro (/historico):", err);
    res.status(500).send({ message: MENSAGEM_ERRO_PADRAO });
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/criar-conta', (req, res) => {
  res.render('criar-conta');
});

app.get('/sobre', (req, res) => {
  res.render('sobre');
});

app.get('/termos-e-condicoes', (req, res) => {
  res.render('termos-e-condicoes');
});

app.get('/politica-de-privacidade', (req, res) => {
  res.render('politica-de-privacidade');
});

app.post('/api/ia/gerar-imagem', protect, async (req, res) => {
  try {
    const { materia, assunto, estilo, descricao } = req.body;

    if (!materia || !assunto || !descricao) {
        return res.status(400).json({ message: 'Os campos matéria, assunto e descrição são obrigatórios.' });
    }

    const finalPrompt = `Imagem educacional para uma aula de ${materia} sobre ${assunto}. A cena deve ilustrar "${descricao}" no seguinte estilo de arte: ${estilo}.`;

    const TRANSLATION_SERVICE_URL = 'http://localhost:5001/translate';

    const transResponse = await axios.post(TRANSLATION_SERVICE_URL, { text: finalPrompt });
    const translatedPrompt = transResponse.data.translatedText;

    const formData = new FormData();
    formData.append('prompt', translatedPrompt);
    formData.append('output_format', 'webp');
    
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

    const imageLog = new Image({
        imageUrl: imageUrl,
        prompt: finalPrompt,
        materia: materia,
        assunto: assunto,
        descricao: descricao,
        user: req.user._id,
    });
    await imageLog.save();

    return res.status(200).json({
      success: true,
      imageUrl: imageUrl 
    });

  } catch (error) {
    console.error("Erro (/api/ia/gerar-imagem):", error);
    return res.status(500).json({ message: MENSAGEM_ERRO_PADRAO });
  }
});

app.delete('/api/historico/excluir-imagem/:id', protect, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: 'Imagem não encontrada.' });
    }

    if (image.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }

    const publicId = image.imageUrl.split('/').pop().split('.')[0];

    await cloudinary.uploader.destroy(publicId);

    await Image.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Imagem deletada com sucesso.'
    });

  } catch (error) {
    console.error("Erro (/api/historico/excluir-imagem/:id):", error.message);
    return res.status(500).json({ message: MENSAGEM_ERRO_PADRAO });
  }
});

app.post('/api/conta/criar-conta', async (req, res) => {
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
      throw new Error('Erro de sessão ao autenticar o usuário criado.');
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      const errorMessage = messages[0];
      return res.status(400).json({ message: errorMessage });
    }

    console.error('Erro (/api/conta/criar-conta):', error);
    res.status(500).json({ message: MENSAGEM_ERRO_PADRAO });
  }
});

app.post('/api/conta/login', async (req, res) => {
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
    console.error('Erro (/api/conta/login):', error);
    res.status(500).json({ message: MENSAGEM_ERRO_PADRAO });
  }
});

app.put('/api/conta/alterar-nome', protect, async (req, res) => {
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
          throw new Error('Erro ao atualizar sessão.');
        }

        res.status(200).json({ success: true });
      });
    } else {
      throw new Error('Erro de autenticação.');
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      const errorMessage = messages[0];
      return res.status(400).json({ message: errorMessage });
    }
    console.error('Erro (/api/conta/alterar-nome):', error);
    return res.status(500).json({ message: MENSAGEM_ERRO_PADRAO });
  }
});

app.put('/api/conta/alterar-email', protect, async (req, res) => {
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
            throw new Error('Erro ao atualizar sessão.');
          }

          res.status(200).json({ success: true });
      });
    } else {
      throw new Error('Erro de autenticação.');
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      const errorMessage = messages[0];
      return res.status(400).json({ message: errorMessage });
    }
    console.error('Erro (/api/conta/alterar-email):', error);
    return res.status(500).json({ message: MENSAGEM_ERRO_PADRAO });
  }
});

app.put('/api/conta/alterar-senha', protect, async (req, res) => {
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
      throw new Error('Erro de autenticação.');
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      const errorMessage = messages[0];
      return res.status(400).json({ message: errorMessage });
    }
    console.error('Erro (/api/conta/alterar-senha):', error);
    return res.status(500).json({ message: MENSAGEM_ERRO_PADRAO });
  }
});

app.delete('/api/conta/excluir-conta', protect, async (req, res, next) => {
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
      throw new Error('Erro de autenticação.');
    }
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ message: MENSAGEM_ERRO_PADRAO });
  }
});

app.post('/api/conta/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return next(err); 
    }

    res.status(200).json({ redirectUrl: '/' });
  });
});

app.listen(port, () => {
    console.log(`Servidor a rodar em http://localhost:${port}`);
});