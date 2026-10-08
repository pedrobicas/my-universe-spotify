# My Universe

Uma experiência pessoal para explorar sua biblioteca e seus hábitos no Spotify com uma interface escura, editorial e focada em música.

O projeto é dividido em um frontend React/Vite e uma API Node/Express. Ele inclui login OAuth com Spotify, dashboard, biblioteca de playlists, descoberta, perfil, player persistente, configurações locais e um modo demonstração que funciona sem conta conectada.

## O que mudou nesta versão

- Novo sistema visual inspirado na lógica de produto do Spotify: superfícies escuras, conteúdo em primeiro plano, verde usado apenas para ação/estado e menos efeitos decorativos.
- Navegação desktop com sidebar persistente, navegação móvel dedicada e player global integrado ao shell da aplicação.
- Dashboard reconstruído para usar somente dados retornados pela API; métricas aleatórias/estimadas foram removidas.
- Biblioteca de playlists redesenhada com busca, ordenação, grade/lista, detalhe editorial, edição e gerenciamento de faixas.
- Descoberta reorganizada em seleções por momento, mood, mistura de gêneros e regiões, com fallback quando recursos de recomendação não estão disponíveis.
- Perfil e configurações simplificados para não exibir informações inventadas ou campos que o Spotify não entrega mais.
- Modo demo mais consistente: reprodução, playlists, inclusão, remoção e reordenação de faixas mantêm estado durante a sessão.
- OAuth endurecido: tokens ficam em cookies `httpOnly`, não são enviados na URL nem persistidos em `localStorage`, e o parâmetro `state` é validado.
- Sessão pode ser renovada pelo refresh token também durante o `checkAuth`.
- Backend adaptado aos endpoints atuais de playlist (`/items`, `/me/playlists`) e remoção da biblioteca.
- CORS, rate limiting, Helmet e validação de origem para requisições mutáveis.

## Stack

**Frontend:** React 18, Vite 5, React Router, Axios, Lucide React, Tailwind/PostCSS como pipeline de CSS.

**Backend:** Node.js, Express, Axios, Spotify Web API, OAuth 2.0, cookies `httpOnly`, Helmet e express-rate-limit.

## Requisitos

- Node.js 20+ recomendado
- npm
- Uma aplicação criada no Spotify for Developers para usar o login real

O modo demo não exige credenciais do Spotify.

## Configuração

### Backend

```bash
cd backend
cp env.example .env
npm install
```

Preencha `backend/.env`:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
REDIRECT_URI=http://127.0.0.1:8080/auth/callback
FRONTEND_URL=http://127.0.0.1:5173
ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
PORT=8080
NODE_ENV=development
COOKIE_SECRET=replace_with_a_long_random_secret
```

No painel do Spotify, cadastre exatamente o mesmo `REDIRECT_URI` usado acima.

### Frontend

```bash
cd frontend
cp env.example .env.local
npm install
```

`frontend/.env.local`:

```env
VITE_API_URL=http://127.0.0.1:8080
VITE_DEMO_ONLY=false
```

Use `VITE_DEMO_ONLY=true` quando quiser publicar uma versão que expõe somente a demonstração.

## Executando

Em dois terminais:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

Frontend: `http://127.0.0.1:5173`  
Backend: `http://127.0.0.1:8080`

Também existe o endpoint de saúde da API em `GET /health`.

## Scripts úteis

No frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

No backend:

```bash
npm run dev
npm start
```

## Estrutura

```text
.
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── env.example
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── env.example
│   └── vite.config.js
└── README.md
```

## Autenticação e segurança

O backend realiza o Authorization Code flow. O navegador recebe apenas cookies de sessão `httpOnly`; access token e refresh token não são colocados em query string nem no armazenamento local do frontend. O `state` do OAuth é gerado de forma criptograficamente segura e conferido no callback.

Em produção, frontend e backend devem ser servidos por HTTPS. Prefira hosts no mesmo site/domínio (por exemplo `app.seudominio.com` e `api.seudominio.com`) para evitar bloqueios modernos de cookies cross-site. Configure `FRONTEND_URL` e `ALLOWED_ORIGINS` com as origens públicas corretas.

## Compatibilidade com a Spotify Web API

A Spotify Web API muda com frequência. Esta versão usa os endpoints atuais para criação e gerenciamento de playlists e inclui fallback para áreas que podem estar limitadas dependendo do tipo/idade da aplicação Spotify. Se um recurso não estiver disponível para sua aplicação, a UI tenta degradar de forma explícita em vez de fabricar dados.

Algumas operações de playback exigem um dispositivo Spotify ativo e podem depender das permissões/condições da conta conectada. No Development Mode atual, o Spotify também exige Premium do proprietário do app e aplica limites próprios a novos aplicativos/usuários autorizados.

## Deploy

O frontend pode ser publicado separadamente (por exemplo, Vercel) e o backend em um host Node. Para produção:

- defina `VITE_API_URL` com a URL pública HTTPS do backend;
- defina `FRONTEND_URL` com a URL pública HTTPS do frontend;
- inclua a origem do frontend em `ALLOWED_ORIGINS`;
- atualize `REDIRECT_URI` no `.env` e no Spotify Developer Dashboard;
- não versione arquivos `.env` nem credenciais.

## Licença

MIT.
