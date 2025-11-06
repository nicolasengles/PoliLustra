const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const allowedDomains = ['@p4ed.com', '@sistemapoliedro.com'];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome é obrigatório.'],
    minlength: [5, 'O nome deve ter no mínimo 5 caracteres.'],
    maxlength: [70, 'O nome deve ter no máximo 70 caracteres.'],
    validate: {
      validator: function (name) {
        return name.trim().split(/\s+/).length > 1;
      },
      message: 'Por favor, insira seu nome completo.'
    }
  },
  email: {
    type: String,
    required: [true, 'O e-mail é obrigatório.'],
    unique: true,
    match: [/.+\@.+\..+/, 'Por favor, insira um e-mail válido.'],
    maxlength: [254, 'O e-mail deve ter no máximo 254 caracteres.'],
    validate: {
      validator: function (email) {
        return allowedDomains.some(domain => email.endsWith(domain));
      },
      message: 'O email deve pertencer a um domínio do Colégio Poliedro ("@p4ed.com" ou "@sistemapoliedro.com").'
    }
  },
  password: {
    type: String,
    required: [true, 'A senha é obrigatória.'],
    validate: {
      validator: function(password) {
        if (!this.isModified('password')) { return true; }
        return password.length >= 8 && password.length <= 100 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[\W_]/.test(password);
      },
      message: 'A senha deve ter no mínimo 8 e 100 caracteres, incluindo pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.'
    },
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