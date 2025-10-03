// 1. IMPORTAÇÕES E CONFIGURAÇÃO INICIAL
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 2. MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'html')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// 3. ROTA PRINCIPAL (OPCIONAL, MAS BOA PRÁTICA)
// Esta rota garante que ao aceder a "/", o seu index.html é servido.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// 4. INICIAR O SERVIDOR
app.listen(port, () => {
    console.log(`Servidor a rodar em http://localhost:${port}`);
});