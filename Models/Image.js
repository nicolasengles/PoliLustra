// Models/Image.js

const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  
  // O prompt final que foi construído e enviado para a IA
  prompt: { type: String, required: true },
  
  // Nossos novos campos para guardar os "ingredientes" do prompt
  materia: { type: String, required: true },
  assunto: { type: String, required: true },
  prompt_personalizado: { type: String, required: true },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// A única linha de exportação necessária, que é a mais segura.
module.exports = mongoose.models.Image || mongoose.model('Image', imageSchema);