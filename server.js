require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV == 'development') {
  const livereload = require('livereload');
  const connectLiveReload = require('connect-livereload');
  
  const liveReloadServer = livereload.createServer();
  liveReloadServer.watch(path.join(__dirname, 'public'));
  
  app.use(connectLiveReload());
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'html')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port} (${process.env.NODE_ENV})`);
});