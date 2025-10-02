require('dotenv').config();
const express = require('express');
const app = express();

// Usa a porta definida no .env ou a porta 3000 como padrão
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>Polilustra</h1>');
});

app.listen(port, () => {
  console.log(`Servidor a rodar em http://localhost:${port}`);
});