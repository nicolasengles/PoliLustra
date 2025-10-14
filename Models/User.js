// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- NOVA: Lista de domínios permitidos ---
const allowedDomains = ['@p4ed.com', '@sistemapoliedro.com'];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome é obrigatório.'],
  },
  email: {
    type: String,
    required: [true, 'O e-mail é obrigatório.'],
    unique: true,
    match: [/.+\@.+\..+/, 'Por favor, insira um e-mail válido.'],
    
    // ****** VALIDAÇÃO PERSONALIZADA ADICIONADA AQUI ******
    // validate: {
    //   validator: function (email) {
    //     // Verifica se o e-mail termina com algum dos domínios permitidos
    //     return allowedDomains.some(domain => email.endsWith(domain));
    //   },
    //   message: props => `${props.value} não é de um domínio permitido.`
    // }
    // ******************************************************

  },
  password: {
    type: String,
    required: [true, 'A senha é obrigatória.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

    passwordResetToken: String,
    passwordResetExpires: Date,

});

// Middleware (Hook) para encriptar a senha ANTES de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = mongoose.models.User || mongoose.model('User', userSchema);