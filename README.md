# My Universe Spotify

Um projeto completo que integra com a API do Spotify, permitindo autenticação OAuth2 e acesso aos dados do usuário.

## 🚀 Estrutura do Projeto

```
my-universe-spotify/
├── backend/          # API Node.js + Express
├── frontend/         # Aplicação React + Vite
└── README.md
```

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js + Express
- OAuth2 com Spotify
- Middlewares de autenticação
- CORS configurado
- Cookies httpOnly para tokens

### Frontend
- React + Vite
- React Router DOM
- TailwindCSS
- Chart.js para gráficos
- Axios para requisições

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Spotify Developer

## 🔧 Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/pedrobicas/spotify-project.git
cd my-universe-spotify
```

### 2. Configure as permissões do Spotify (IMPORTANTE!)

**Antes de executar, configure as permissões necessárias:**

1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Selecione sua aplicação `my-universe-spotify`
3. Em **App Settings** > **Redirect URIs**, adicione:
   ```
   http://127.0.0.1:8080/auth/callback
   ```


### 3. Configure as variáveis de ambiente

#### Backend (.env)
```bash
cd backend
cp env.example .env
```

Edite o arquivo `.env` com suas credenciais do Spotify:
```env
SPOTIFY_CLIENT_ID=seu_client_aqui
SPOTIFY_CLIENT_SECRET=seu_client_secret_aqui
REDIRECT_URI=http://127.0.0.1:8080/auth/callback
FRONTEND_URL=http://127.0.0.1:5173
PORT=8080
NODE_ENV=development
COOKIE_SECRET=uma_chave_secreta_aleatoria_aqui
```

#### Frontend (.env.local)
```bash
cd ../frontend
cp .env.example .env.local
```

Edite o arquivo `.env.local`:
```env
VITE_API_URL=http://localhost:8080
```

### 4. Instale as dependências

#### Backend
```bash
cd ../backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

## 🚀 Executando o Projeto

### Backend
```bash
cd backend
npm run dev    # Desenvolvimento com nodemon
npm start      # Produção
```

O backend estará rodando em: http://127.0.0.1:8080

### Frontend
```bash
cd frontend
npm run dev
```

O frontend estará rodando em: http://127.0.0.1:5173

## 🔐 Autenticação

1. Acesse http://127.0.0.1:5173
2. Clique em "Login with Spotify"
3. Autorize o aplicativo no Spotify com as permissões solicitadas
4. Você será redirecionado de volta para o dashboard

**⚠️ Importante**: Se você encontrar erros de permissões insuficientes, verifique se configurou corretamente no Spotify Developer Dashboard.

## 🆘 Resolução de Problemas

### Erro de CORS
- Certifique-se de que o backend está rodando em `http://127.0.0.1:8080`
- Verifique se o frontend está rodando em `http://127.0.0.1:5173`

### Problemas de Autenticação
- Verifique se o `REDIRECT_URI` está configurado como `http://127.0.0.1:8080/auth/callback`
- Certifique-se de que o `COOKIE_SECRET` está definido no backend

## 📁 Estrutura de Arquivos

### Backend
```
backend/
├── routes/           # Rotas da API
├── controllers/      # Controladores
├── services/         # Lógica de negócio
├── middlewares/      # Middlewares (auth, CORS, etc.)
├── .env.example      # Exemplo de variáveis de ambiente
├── package.json      # Dependências e scripts
└── server.js         # Arquivo principal
```

### Frontend
```
frontend/
├── src/
│   ├── components/   # Componentes reutilizáveis
│   ├── pages/        # Páginas da aplicação
│   ├── services/     # Serviços de API
│   ├── hooks/        # Hooks customizados
│   └── styles/       # Estilos globais
├── .env.example      # Exemplo de variáveis de ambiente
├── package.json      # Dependências e scripts
└── vite.config.js    # Configuração do Vite
```

## 🔒 Segurança

- Tokens são armazenados em cookies httpOnly
- CORS configurado com origin específico
- Middleware de autenticação em todas as rotas protegidas
- Variáveis de ambiente para credenciais sensíveis

## 📱 Funcionalidades

- ✅ Autenticação OAuth2 com Spotify
- ✅ Dashboard com informações do usuário
- ✅ Listagem de playlists
- ✅ Criação de novas playlists
- ✅ Análise de features de áudio
- ✅ Design responsivo com TailwindCSS
- ✅ Gráficos interativos

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.