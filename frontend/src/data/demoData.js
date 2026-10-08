const album = (name, image) => ({ name, images: [{ url: image }] })
const artist = (id, name) => ({ id, name })

const artists = {
  lume: artist('demo-artist-lume', 'LUME'),
  marina: artist('demo-artist-marina-sete', 'Marina Sete'),
  vale: artist('demo-artist-vale-norte', 'Vale Norte'),
  noa: artist('demo-artist-noa', 'NØA'),
  monaco: artist('demo-artist-monaco', 'Monaco'),
  iris: artist('demo-artist-iris', 'Íris'),
}

const albums = {
  noiteInteira: album('Noite Inteira', '/demo/albums/noite-inteira.svg'),
  quaseAgosto: album('Quase Agosto', '/demo/albums/quase-agosto.svg'),
  entreEstacoes: album('Entre Estações', '/demo/albums/entre-estacoes.svg'),
  offline: album('Offline', '/demo/albums/offline.svg'),
  ladoB: album('Lado B', '/demo/albums/lado-b.svg'),
  casaVazia: album('Casa Vazia', '/demo/albums/casa-vazia.svg'),
}

const makeTrack = (id, name, trackArtist, trackAlbum, durationMs) => ({
  id,
  uri: `spotify:track:${id}`,
  name,
  artists: [trackArtist],
  album: trackAlbum,
  duration_ms: durationMs,
  preview_url: null,
})

export const demoUser = {
  id: 'demo-user-alex',
  display_name: 'Alex Costa',
  images: [{ url: '/demo/demo-avatar.svg' }],
}

export const demoTopTracks = [
  makeTrack('demo-track-01', 'Depois das 23', artists.lume, albums.noiteInteira, 208000),
  makeTrack('demo-track-02', 'Quase Agosto', artists.marina, albums.quaseAgosto, 194000),
  makeTrack('demo-track-03', 'Linha Azul', artists.vale, albums.entreEstacoes, 226000),
  makeTrack('demo-track-04', 'Sem Sinal', artists.noa, albums.offline, 181000),
  makeTrack('demo-track-05', 'Maré Baixa', artists.marina, albums.quaseAgosto, 217000),
  makeTrack('demo-track-06', 'Fica Mais Um Pouco', artists.monaco, albums.ladoB, 202000),
  makeTrack('demo-track-07', 'Vidro Fumê', artists.lume, albums.noiteInteira, 236000),
  makeTrack('demo-track-08', '3:17', artists.noa, albums.offline, 197000),
  makeTrack('demo-track-09', 'Domingo', artists.iris, albums.casaVazia, 211000),
  makeTrack('demo-track-10', 'Outro Lugar', artists.vale, albums.entreEstacoes, 244000),
  makeTrack('demo-track-11', 'Contraluz', artists.monaco, albums.ladoB, 188000),
  makeTrack('demo-track-12', 'Antes de Ir', artists.iris, albums.casaVazia, 229000),
]

export const demoTopArtists = [
  {
    id: artists.lume.id,
    name: artists.lume.name,
    genres: ['alternative pop', 'indie pop', 'synthpop'],
    images: [{ url: '/demo/artists/lume.svg' }],
  },
  {
    id: artists.marina.id,
    name: artists.marina.name,
    genres: ['mpb', 'neo soul', 'indie'],
    images: [{ url: '/demo/artists/marina-sete.svg' }],
  },
  {
    id: artists.vale.id,
    name: artists.vale.name,
    genres: ['indie rock', 'dream pop', 'alternative'],
    images: [{ url: '/demo/artists/vale-norte.svg' }],
  },
  {
    id: artists.noa.id,
    name: artists.noa.name,
    genres: ['electronica', 'ambient pop', 'downtempo'],
    images: [{ url: '/demo/artists/noa.svg' }],
  },
  {
    id: artists.monaco.id,
    name: artists.monaco.name,
    genres: ['alternative r&b', 'bedroom pop', 'neo soul'],
    images: [{ url: '/demo/artists/monaco.svg' }],
  },
  {
    id: artists.iris.id,
    name: artists.iris.name,
    genres: ['jazz pop', 'bossa nova', 'singer-songwriter'],
    images: [{ url: '/demo/artists/iris.svg' }],
  },
]

const playlist = (id, name, description, image, total, isPublic = false) => ({
  id,
  name,
  description,
  public: isPublic,
  collaborative: false,
  tracks: { total },
  images: [{ url: image }],
  owner: { id: demoUser.id, display_name: demoUser.display_name },
})

export const demoPlaylists = [
  playlist('demo-playlist-01', 'depois das 23', 'pra ouvir voltando pra casa', '/demo/playlists/depois-das-23.svg', 8, true),
  playlist('demo-playlist-02', 'janela aberta', 'fim de tarde, chuva e fone alto', '/demo/playlists/janela-aberta.svg', 7),
  playlist('demo-playlist-03', 'sem pressa', 'domingo, café e nada urgente', '/demo/playlists/sem-pressa.svg', 6, true),
  playlist('demo-playlist-04', 'trânsito noturno', 'músicas que funcionam melhor no carro', '/demo/playlists/transito-noturno.svg', 7),
  playlist('demo-playlist-05', 'em repeat', 'as que eu não consegui parar de ouvir', '/demo/playlists/em-repeat.svg', 5),
  playlist('demo-playlist-06', 'novas rotas', 'coisas que encontrei este mês', '/demo/playlists/novas-rotas.svg', 8, true),
]

export const demoPlaylistTracks = {
  'demo-playlist-01': [demoTopTracks[0], demoTopTracks[6], demoTopTracks[3], demoTopTracks[7], demoTopTracks[10], demoTopTracks[2], demoTopTracks[5], demoTopTracks[11]],
  'demo-playlist-02': [demoTopTracks[1], demoTopTracks[4], demoTopTracks[8], demoTopTracks[11], demoTopTracks[5], demoTopTracks[9], demoTopTracks[2]],
  'demo-playlist-03': [demoTopTracks[8], demoTopTracks[11], demoTopTracks[4], demoTopTracks[1], demoTopTracks[5], demoTopTracks[9]],
  'demo-playlist-04': [demoTopTracks[3], demoTopTracks[7], demoTopTracks[2], demoTopTracks[9], demoTopTracks[6], demoTopTracks[0], demoTopTracks[10]],
  'demo-playlist-05': [demoTopTracks[0], demoTopTracks[1], demoTopTracks[3], demoTopTracks[5], demoTopTracks[8]],
  'demo-playlist-06': [demoTopTracks[10], demoTopTracks[9], demoTopTracks[7], demoTopTracks[4], demoTopTracks[11], demoTopTracks[2], demoTopTracks[6], demoTopTracks[5]],
}

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString()
const daysAgoAt = (days, hour, minute) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

export const demoRecentTracks = [
  { track: demoTopTracks[0], played_at: minutesAgo(18) },
  { track: demoTopTracks[1], played_at: minutesAgo(52) },
  { track: demoTopTracks[3], played_at: minutesAgo(96) },
  { track: demoTopTracks[6], played_at: daysAgoAt(0, 9, 12) },
  { track: demoTopTracks[4], played_at: daysAgoAt(0, 8, 41) },
  { track: demoTopTracks[8], played_at: daysAgoAt(1, 22, 37) },
  { track: demoTopTracks[5], played_at: daysAgoAt(1, 21, 54) },
  { track: demoTopTracks[2], played_at: daysAgoAt(1, 18, 18) },
  { track: demoTopTracks[9], played_at: daysAgoAt(1, 17, 46) },
  { track: demoTopTracks[7], played_at: daysAgoAt(2, 0, 17) },
  { track: demoTopTracks[10], played_at: daysAgoAt(2, 0, 3) },
  { track: demoTopTracks[11], played_at: daysAgoAt(2, 23, 41) },
]

export const demoAudioFeatures = [
  { id: 'demo-track-01', danceability: .67, energy: .61, valence: .48, acousticness: .19, instrumentalness: .02, speechiness: .05 },
  { id: 'demo-track-02', danceability: .54, energy: .43, valence: .57, acousticness: .48, instrumentalness: .01, speechiness: .04 },
  { id: 'demo-track-03', danceability: .59, energy: .68, valence: .52, acousticness: .16, instrumentalness: .07, speechiness: .05 },
  { id: 'demo-track-04', danceability: .72, energy: .55, valence: .39, acousticness: .21, instrumentalness: .18, speechiness: .04 },
  { id: 'demo-track-05', danceability: .58, energy: .47, valence: .62, acousticness: .52, instrumentalness: .00, speechiness: .04 },
  { id: 'demo-track-06', danceability: .71, energy: .58, valence: .66, acousticness: .24, instrumentalness: .01, speechiness: .06 },
  { id: 'demo-track-07', danceability: .64, energy: .65, valence: .45, acousticness: .14, instrumentalness: .03, speechiness: .05 },
  { id: 'demo-track-08', danceability: .75, energy: .49, valence: .34, acousticness: .31, instrumentalness: .22, speechiness: .03 },
  { id: 'demo-track-09', danceability: .49, energy: .36, valence: .70, acousticness: .71, instrumentalness: .02, speechiness: .04 },
  { id: 'demo-track-10', danceability: .56, energy: .63, valence: .50, acousticness: .20, instrumentalness: .09, speechiness: .05 },
  { id: 'demo-track-11', danceability: .69, energy: .57, valence: .54, acousticness: .27, instrumentalness: .01, speechiness: .05 },
  { id: 'demo-track-12', danceability: .51, energy: .40, valence: .64, acousticness: .65, instrumentalness: .03, speechiness: .03 },
]

export const demoStats = {
  totalSavedTracks: 312,
  totalFollowedArtists: 47,
  totalPlaylists: demoPlaylists.length,
  averageTracksPerDay: 9,
  listeningTime: { today: 1.8, week: 12.4, month: 48.6 },
  topGenres: [
    { name: 'Indie pop', count: 12 },
    { name: 'Alternative', count: 10 },
    { name: 'Neo soul', count: 8 },
    { name: 'Electronic', count: 7 },
    { name: 'MPB', count: 6 },
  ],
}

export const demoListeningHistory = [
  { date: new Date().toDateString(), tracks: 9, artists: 6, totalTime: 34, topTrack: demoTopTracks[0], mood: 'night' },
  { date: new Date(Date.now() - 86400000).toDateString(), tracks: 14, artists: 8, totalTime: 51, topTrack: demoTopTracks[3], mood: 'focused' },
  { date: new Date(Date.now() - 172800000).toDateString(), tracks: 11, artists: 7, totalTime: 42, topTrack: demoTopTracks[8], mood: 'calm' },
]

export const simulateApiDelay = (ms = 320) => new Promise((resolve) => setTimeout(resolve, ms))
