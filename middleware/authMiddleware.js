// // middleware/authMiddleware.js

// const jwt = require('jsonwebtoken');
// const User = require('../Models/User');

// const protect = async (req, res, next) => {
//   let token;

//   if (req.cookies && req.cookies.token) {
//     try {
//       // 1. Pega no token do cookie
//       token = req.cookies.token;

//       // 2. Verifica o token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // 3. Encontra o utilizador e anexa-o ao pedido
//       req.user = await User.findById(decoded.id).select('-password');

//       // 4. Passa para a próxima fase E PARA a execução desta função
//       return next();

//     } catch (error) {
//       console.error('Erro de autenticação:', error);
//       // Se houver um erro, envia a resposta E PARA a execução
//       return res.status(401).json({ message: 'Não autorizado, o token falhou.' });
//     }
//   }

//   // Se chegámos aqui, é porque não havia token
//   // Envia a resposta E PARA a execução
//   return res.status(401).json({ message: 'Não autorizado, sem token.' });
// };

// module.exports = { protect };

// This is the new 'protect' function.
// It checks for a session user instead of a token.

const protect = (req, res, next) => {
  // Check if req.session.user exists
  if (req.session.user) {
    // User is authenticated
    // We can also attach the user to req.user if other parts
    // of the app expect it (optional, but good practice)
    req.user = req.session.user;
    next();
  } else {
    // User is not authenticated
    // You can send an error message if you want,
    // but redirecting to login is standard.
    // req.flash('error', 'Please log in to view this page'); // (If you use connect-flash)
    res.redirect('/login');
  }
};

module.exports = { protect };