// models/Image.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    prompt: {
        type: String,
        required: true,
    },
    // Esta é a parte importante: a ligação com o utilizador
    user: {
        type: mongoose.Schema.Types.ObjectId, // Guarda o ID do utilizador
        ref: 'User', // Cria uma referência ao modelo 'User'
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Image = mongoose.model('Image', imageSchema);
module.exports = mongoose.models.Image || mongoose.model('Image', imageSchema);