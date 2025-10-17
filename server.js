require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/configuracoes', (req, res) => {
  res.render('configuracoes');
});

app.get('/sobre', (req, res) => {
  res.render('sobre');
});

app.get('/gerador', (req, res) => {
  res.render('gerador');
});

app.get('/termos', (req, res) => {
  res.render('termos');
});

app.get('/faq', (req, res) => {
  res.render('faq');
});

app.get('/historico', (req, res) => {
  res.render('historico');
});

app.get('/editar', (req, res) => {
  res.render('editar');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port} (${process.env.NODE_ENV})`);
});