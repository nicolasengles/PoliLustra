# PoliLustra
![Logo do PoliLustra](public/images/logo_hor.png)

PoliLustra é uma plataforma web de geração de imagens por Inteligência Artificial, projetada especificamente para fins educacionais. Criado por estudantes de Ciência da Computação do Instituto Mauá de Tecnologia, o projeto serve como uma ferramenta de apoio para professores e alunos do Colégio Poliedro, permitindo a criação de recursos visuais personalizados para aulas, apresentações e materiais de estudo.

## 📜 Índice

* [Sobre o Projeto](#-sobre-o-projeto)
* [✨ Recursos Principais](#-recursos-principais)
* [🛠️ Pilha Tecnológica](#-pilha-tecnológica)
* [🚀 Começando](#-começando)
    * [Pré-requisitos](#pré-requisitos)
    * [Configuração do Ambiente](#configuração-do-ambiente)
    * [Executando a Aplicação](#executando-a-aplicação)
* [📁 Estrutura de Arquivos](#-estrutura-de-arquivos)

## 📖 Sobre o Projeto

O objetivo principal do PoliLustra é fornecer uma ferramenta acessível e segura para que a comunidade do Colégio Poliedro possa aproveitar o poder da IA generativa. A plataforma permite que usuários autenticados (alunos e professores com e-mails institucionais) gerem imagens com base em prompts estruturados, selecionando matéria, tema, estilo e uma descrição personalizada.

A plataforma inclui um microsserviço de tradução que converte os prompts do português para o inglês antes de enviá-los à API da Stability AI, garantindo melhores resultados. As imagens geradas são armazenadas no Cloudinary e vinculadas à conta do usuário, que pode visualizá-las em seu histórico pessoal.

## ✨ Recursos Principais

* **Autenticação de Usuários:** Sistema completo de cadastro, login e logout usando sessões.
    * Validação de e-mail para garantir acesso apenas a domínios (`@p4ed.com`, `@sistemapoliedro.com`).
    * Recuperação de senha por e-mail (Nodemailer).
* **Geração de Imagens com IA:**
    * Formulário estruturado (Matéria, Tema, Estilo, Descrição) para guiar o usuário.
    * Integração com a API da **Stability AI** (`v2beta/stable-image/generate/core`).
    * Microsserviço de tradução (Python/Flask) para converter prompts PT-BR -> EN.
* **Histórico de Imagens:**
    * Galeria pessoal (`/historico`) que exibe todas as imagens geradas pelo usuário.
    * Opção de **Download** em múltiplos formatos (JPG, PNG) com conversão feita pelo Cloudinary.
    * Opção de **Excluir** imagens (remove do Cloudinary e do MongoDB).
* **Gerenciamento de Conta:**
    * Página de configurações (`/configuracoes`) onde o usuário pode alterar nome, e-mail e senha.
    * Funcionalidade de exclusão de conta.
* **Armazenamento em Nuvem:**
    * Integração total com **Cloudinary** para upload e armazenamento permanente das imagens geradas.

## 🛠️ Pilha Tecnológica

A plataforma é construída como um monorepo com um servidor principal e um microsserviço.

### Servidor Principal (Node.js / Express)
* **Backend:** Node.js, Express
* **Banco de Dados:** MongoDB com Mongoose
* **Autenticação:** `express-session`, `bcryptjs` (para hash de senhas)
* **View Engine:** EJS (Embedded JavaScript)
* **Frontend:** Bootstrap 5, SASS/SCSS
* **Serviços Externos:** Cloudinary (Armazenamento), Stability AI (Geração de Imagem), Nodemailer (E-mails)

### Microsserviço de Tradução
* **Framework:** Python, Flask
* **Tradução:** `deep_translator` (GoogleTranslator)

## 🚀 Começando

Siga estas instruções para configurar e executar o projeto em seu ambiente de desenvolvimento.

### Pré-requisitos

* [Node.js](https://nodejs.org/) (v18 ou superior)
* [npm](https://www.npmjs.com/) (geralmente incluído no Node.js)
* [Python](https://www.python.org/) (v3.8 ou superior)
* [pip](https://pip.pypa.io/en/stable/installation/) (gerenciador de pacotes Python)
* Acesso a um cluster MongoDB (local ou Atlas)
* Contas e chaves de API para:
    * Stability AI
    * Cloudinary
    * Um provedor de e-mail (ex: Gmail) para o Nodemailer

### Configuração do Ambiente

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/nicolasengles/PoliLustra.git](https://github.com/nicolasengles/PoliLustra.git)
    cd PoliLustra
    ```

2.  **Instale as dependências do Node.js:**
    ```bash
    npm install
    ```

3.  **Instale as dependências do Python:**
    ```bash
    cd servico-traducao
    pip install Flask deep-translator
    cd ..
    ```

4.  **Crie o arquivo de ambiente (`.env`):**
    Na raiz do projeto, crie um arquivo `.env` e adicione as seguintes variáveis (baseado em `server.js` e `copilot-instructions.md`):

    ```env
    # Conexão com o MongoDB
    MONGO_URI=seu_mongo_connection_string

    # API da Stability AI
    STABILITY_API_KEY=sua_stability_api_key

    # Credenciais do Cloudinary
    CLOUDINARY_CLOUD_NAME=seu_cloud_name
    CLOUDINARY_API_KEY=sua_api_key
    CLOUDINARY_API_SECRET=seu_api_secret

    # Credenciais do Nodemailer (para recuperação de senha)
    EMAIL_USER=seu_email@gmail.com
    EMAIL_PASS=sua_senha_de_app_do_gmail
    ```

### Executando a Aplicação

O projeto requer que dois servidores sejam executados simultaneamente: o servidor Node.js e o microsserviço de tradução Python.

1.  **Terminal 1: Iniciar o Servidor Principal (Node.js + SASS Watcher):**
    O comando `dev` no `package.json` inicia o `nodemon` para o servidor e o `sass --watch` ao mesmo tempo.

    ```bash
    npm run dev
    ```
    Isso iniciará o servidor principal em `http://localhost:3000`.

2.  **Terminal 2: Iniciar o Microsserviço (Python):**
    ```bash
    cd servico-traducao
    python app.py
    ```
    Isso iniciará o servidor de tradução em `http://localhost:5001`.

Agora você pode acessar `http://localhost:3000` no seu navegador.