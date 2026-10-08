# My Universe

**My Universe** é uma experiência web conectada ao Spotify para explorar biblioteca, histórico de reprodução, artistas, playlists e descoberta musical em uma interface própria.

O projeto não tenta recriar o cliente oficial do Spotify. A proposta é usar os dados da conta como matéria-prima para uma experiência mais pessoal: entender o que está sendo ouvido, navegar pela biblioteca, descobrir novas faixas e controlar a reprodução sem transformar tudo em um painel de métricas.

A aplicação é full stack: o frontend React conversa com uma API Express responsável pelo OAuth, sessão, chamadas à Spotify Web API e operações de playback e playlists.

## Funcionalidades

### Dashboard

A página inicial concentra os dados mais relevantes da conta conectada e permite alternar o período analisado.

- top faixas;
- top artistas;
- visão resumida do perfil musical;
- reprodução direta a partir das listas;
- estados de loading, erro e ausência de dados tratados na interface.

### Biblioteca de playlists

A biblioteca permite navegar e gerenciar playlists sem sair da aplicação.

- visualização em grade ou lista;
- busca e ordenação;
- criação de playlists;
- edição de nome, descrição e visibilidade;
- visualização das faixas de uma playlist;
- inclusão e remoção de músicas;
- reordenação de faixas;
- remoção da playlist da biblioteca;
- reprodução iniciada a partir de qualquer faixa disponível.

### Descobrir

A área de descoberta monta seleções a partir de diferentes contextos.

- seleção baseada no horário do dia;
- descoberta por mood;
- combinação de gêneros;
- exploração por região;
- faixas menos óbvias quando a API disponibiliza os dados necessários.

Quando algum recurso da Spotify Web API não está disponível para a aplicação conectada, o backend retorna um fallback explícito. A interface não apresenta valores inventados como se fossem dados da conta.

### Perfil

O perfil reúne informações da conta e da biblioteca que realmente são retornadas pelo Spotify, como:

- faixas salvas;
- artistas seguidos;
- atividade recente;
- resumo dos dados disponíveis para a conta autenticada.

### Player global

A aplicação possui um player persistente entre as páginas privadas.

Ele suporta:

- play/pause;
- faixa anterior;
- próxima faixa;
- início de reprodução em dispositivo ativo;
- estado da música atual compartilhado entre as telas.

O playback real depende de um dispositivo Spotify disponível, das permissões concedidas à aplicação e das restrições da conta conectada.

### Modo demo

O projeto pode ser explorado sem login no Spotify.

O modo demo usa um catálogo fictício próprio, com capas e perfis armazenados no próprio frontend. Playlists, reprodução e alterações feitas durante a navegação ficam em `sessionStorage`, então a demonstração continua consistente ao navegar e atualizar a página sem depender de imagens externas ou de uma conta Spotify.

## Stack

### Frontend

- React 18
- Vite 5
- React Router
- Axios
- Lucide React
- Tailwind CSS / PostCSS

### Backend

- Node.js
- Express
- Axios
- Spotify Web API
- OAuth 2.0 Authorization Code
- Helmet
- express-rate-limit
- cookie-parser

## Arquitetura

```text
┌──────────────────────┐
│      Navegador       │
└──────────┬───────────┘
           │
           │ React / Vite
           ▼
┌──────────────────────┐
│       Frontend       │
│       Vercel         │
└──────────┬───────────┘
           │
           │ HTTPS + cookies
           ▼
┌──────────────────────┐
│    API Node/Express  │
│       Railway        │
├──────────────────────┤
│ OAuth                │
│ Sessão               │
│ Playlists            │
│ Playback             │
│ Discovery            │
└──────────┬───────────┘
           │
           │ Spotify Web API
           ▼
┌──────────────────────┐
│       Spotify        │
└──────────────────────┘
```

O frontend não recebe o access token diretamente. O login e a renovação da sessão são tratados pela API e os tokens ficam em cookies `httpOnly`.

## Estrutura do projeto

```text
.
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── env.example
│   ├── railway.toml
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── demo/              # capas e avatares usados apenas na demonstração
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── env.example
│   ├── vercel.json
│   └── vite.config.js
│
├── .github/workflows/ci.yml
├── .nvmrc
├── LICENSE
└── README.md
```

## Rodando localmente

### Requisitos

- Node.js 20+
- npm
- uma aplicação criada no Spotify for Developers para utilizar login real

O modo demo funciona sem credenciais do Spotify.

### Backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie `backend/.env` a partir de `backend/env.example`:

```env
SPOTIFY_CLIENT_ID=seu_client_id
SPOTIFY_CLIENT_SECRET=seu_client_secret
REDIRECT_URI=http://127.0.0.1:8080/auth/callback

FRONTEND_URL=http://127.0.0.1:5173
ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173

PORT=8080
NODE_ENV=development
COOKIE_SECRET=uma_chave_longa_e_aleatoria
```

Para gerar um `COOKIE_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

No Spotify Developer Dashboard, cadastre exatamente:

```text
http://127.0.0.1:8080/auth/callback
```

Inicie a API:

```bash
npm run dev
```

A API ficará disponível em:

```text
http://127.0.0.1:8080
```

Health check:

```text
GET http://127.0.0.1:8080/health
```

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
```

Crie `frontend/.env.local`:

```env
VITE_API_URL=http://127.0.0.1:8080
VITE_DEMO_ONLY=false
```

Inicie o Vite:

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://127.0.0.1:5173
```

Para publicar uma versão exclusivamente demonstrativa:

```env
VITE_DEMO_ONLY=true
```

## Validação

Na raiz do projeto, depois de instalar as dependências do frontend e do backend, você pode validar tudo com:

```bash
npm run verify
```

Para validar apenas o frontend:

```bash
cd frontend
npm run verify
```

O comando executa:

```text
ESLint
  ↓
Vite production build
```

Também é possível executar separadamente:

```bash
npm run lint
npm run build
npm run preview
```

No backend, o CI também executa `node --check` em `server.js`, controllers, middlewares, routes e services. O repositório inclui um workflow em `.github/workflows/ci.yml`, então pushes e pull requests também passam por lint/build do frontend e verificação de sintaxe do backend.

## Repositório

O projeto foi organizado para ser publicado como monorepo no GitHub sem arquivos de ambiente, dependências instaladas ou builds locais. O `.gitignore` cobre `node_modules`, `dist`, `.env`, logs e arquivos de IDE. A raiz usa Node 20 (`.nvmrc`) e contém scripts para desenvolvimento e validação.

Com as dependências instaladas:

```bash
npm run dev
npm run verify
```

A demo não depende de CDN de imagens: todas as capas e avatares fictícios ficam em `frontend/public/demo`.

## Deploy

A estrutura de produção usada pelo projeto é:

```text
frontend/ → Vercel
backend/  → Railway
OAuth     → Spotify Developer Dashboard
```

O deploy deve ser feito primeiro no backend, porque o frontend precisa conhecer a URL pública da API.

### 1. Backend no Railway

Crie ou conecte um serviço Railway ao repositório.

Configure o **Root Directory** como:

```text
backend
```

O repositório já inclui `backend/railway.toml` com o comando de produção e o health check. No Railway, mantenha o **Root Directory** como `backend`; a plataforma usará `npm start` e `/health`.

Adicione as variáveis:

```env
SPOTIFY_CLIENT_ID=<client-id-do-spotify>
SPOTIFY_CLIENT_SECRET=<client-secret-do-spotify>

REDIRECT_URI=https://<dominio-do-backend>/auth/callback
FRONTEND_URL=https://<dominio-do-frontend>
ALLOWED_ORIGINS=https://<dominio-do-frontend>

NODE_ENV=production
COOKIE_SECRET=<chave-aleatoria-longa>
```

Não defina uma porta fixa no Railway. O servidor já utiliza `process.env.PORT` quando a plataforma fornece uma porta.

Após o deploy, confirme:

```text
https://<dominio-do-backend>/health
```

A resposta esperada é:

```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### 2. Callback de produção no Spotify

No Spotify Developer Dashboard, abra a aplicação usada pelo projeto e adicione em **Redirect URIs**:

```text
https://<dominio-do-backend>/auth/callback
```

Esse endereço precisa ser exatamente igual ao valor de `REDIRECT_URI` configurado no Railway.

O `SPOTIFY_CLIENT_SECRET` fica somente no backend.

Nunca coloque essa variável no Vercel e nunca crie uma variável `VITE_SPOTIFY_CLIENT_SECRET`.

### 3. Frontend na Vercel

Importe o mesmo repositório na Vercel e configure:

```text
Root Directory: frontend
Framework Preset: Vite
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
```

Variáveis de ambiente:

```env
VITE_API_URL=https://<dominio-do-backend>
VITE_DEMO_ONLY=false
```

O arquivo `frontend/vercel.json` já contém o rewrite necessário para que rotas do React Router continuem funcionando ao acessar uma página diretamente ou pressionar `F5`.

### 4. Conectar a URL final do frontend ao backend

Depois que a Vercel gerar o domínio definitivo, volte ao Railway e configure exatamente essa origem:

```env
FRONTEND_URL=https://<dominio-do-frontend>
ALLOWED_ORIGINS=https://<dominio-do-frontend>
```

Se você utilizar mais de uma origem permitida, separe por vírgula:

```env
ALLOWED_ORIGINS=https://app.exemplo.com,https://projeto.vercel.app
```

### 5. Domínio próprio

A configuração mais robusta é manter frontend e backend em subdomínios do mesmo domínio:

```text
music.seudominio.com      → Vercel
music-api.seudominio.com  → Railway
```

Nesse cenário:

```env
# Railway
FRONTEND_URL=https://music.seudominio.com
ALLOWED_ORIGINS=https://music.seudominio.com
REDIRECT_URI=https://music-api.seudominio.com/auth/callback
```

```env
# Vercel
VITE_API_URL=https://music-api.seudominio.com
VITE_DEMO_ONLY=false
```

E no Spotify Developer Dashboard:

```text
https://music-api.seudominio.com/auth/callback
```

### 6. Checklist depois do deploy

Confirme os seguintes pontos em produção:

- `/health` do backend retorna `200`;
- a página inicial do frontend abre sem erro;
- o modo demo funciona;
- o botão de login abre a autorização do Spotify;
- o callback retorna para a aplicação;
- atualizar `/dashboard` com `F5` não gera `404`;
- a sessão continua ativa após atualizar a página;
- playlists são carregadas;
- uma playlist abre suas faixas;
- busca e descoberta retornam dados ou fallback tratado;
- playback informa corretamente quando não existe dispositivo Spotify ativo.

## Autenticação

O login utiliza o Authorization Code flow do Spotify.

Fluxo:

```text
Frontend
   ↓
GET /auth/login
   ↓
Backend gera state
   ↓
Spotify OAuth
   ↓
GET /auth/callback
   ↓
Backend valida state
   ↓
Backend troca code por tokens
   ↓
Cookies httpOnly
   ↓
Frontend autenticado
```

O backend também utiliza o refresh token para recuperar uma sessão quando o access token expira.

Os tokens do Spotify:

- não são enviados na URL do frontend;
- não ficam em `localStorage`;
- não ficam disponíveis diretamente para o JavaScript da aplicação.

## Segurança

O backend possui:

- cookies `httpOnly`;
- cookies `Secure` em produção;
- validação do `state` do OAuth;
- CORS limitado às origens configuradas;
- bloqueio de requisições mutáveis vindas de origens desconhecidas;
- Helmet;
- rate limiting separado para autenticação e API;
- limite de tamanho do corpo das requisições.

Arquivos `.env` e `.env.local` não devem ser versionados.

Se uma credencial do Spotify for publicada acidentalmente, ela deve ser rotacionada no Spotify Developer Dashboard.

## API

As rotas abaixo passam pelo backend e exigem sessão autenticada, com exceção das rotas de autenticação e `/health`.

### Conta

```text
GET /api/me
GET /api/me/saved-tracks
GET /api/me/followed-artists
GET /api/me/stats
```

### Histórico e preferências

```text
GET /api/top/tracks
GET /api/top/artists
GET /api/recently-played
GET /api/now-playing
```

### Playlists

```text
GET    /api/playlists
POST   /api/playlists
PUT    /api/playlists/:playlistId
DELETE /api/playlists/:playlistId

GET    /api/playlists/:playlistId/tracks
POST   /api/playlists/:playlistId/tracks
DELETE /api/playlists/:playlistId/tracks
PUT    /api/playlists/:playlistId/tracks/reorder
```

### Busca e descoberta

```text
GET /api/search/tracks
GET /api/search/playlists
GET /api/recommendations
GET /api/tracks/:trackId
GET /api/playlists/:playlistId/analytics
```

### Player

```text
PUT  /api/player/play
PUT  /api/player/pause
PUT  /api/player/start
POST /api/player/next
POST /api/player/previous
GET  /api/player/devices
```

### Autenticação

```text
GET  /auth/login
GET  /auth/callback
GET  /auth/check
POST /auth/refresh_token
POST /auth/logout
```

## Spotify Development Mode

Para aplicações em **Development Mode**, o Spotify aplica regras próprias de acesso. Em 2026, o proprietário do app precisa manter Spotify Premium e novos aplicativos têm limite de usuários autorizados. Essas regras pertencem à plataforma e não são contornadas pelo projeto.

Referência: [February 2026 Web API Dev Mode Changes — Migration Guide](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide).

## Observações sobre a Spotify Web API

O funcionamento de algumas áreas depende dos recursos disponíveis para a aplicação cadastrada no Spotify e das permissões da conta autenticada.

Operações de playback podem exigir um dispositivo Spotify ativo. Recursos de recomendação também podem sofrer limitações conforme o modo de acesso da aplicação. Esses casos são tratados no frontend para que ausência de permissão ou disponibilidade não seja exibida como dado real.

---

Desenvolvido por [Pedro Bicas](https://pedrobicas.com) · [GitHub](https://github.com/pedrobicas)
