import LegalLayout from '../components/LegalLayout'

const Privacy = () => (
  <LegalLayout eyebrow="LEGAL / PRIVACIDADE" title="Privacidade sem letra miúda." intro="O My Universe usa dados autorizados pelo Spotify para montar suas visualizações e recursos. Esta página resume como o projeto lida com essas informações.">
    <section><h2>1. Dados acessados</h2><p>Conforme as permissões concedidas, a aplicação pode acessar informações básicas do perfil, rankings de músicas e artistas, playlists, reproduções recentes, itens salvos, artistas seguidos e estado de reprodução.</p></section>
    <section><h2>2. Para que os dados são usados</h2><p>Os dados são usados para renderizar estatísticas, histórico, recomendações, gerenciamento de playlists e controles de reprodução dentro do próprio produto.</p></section>
    <section><h2>3. Dados locais</h2><p>Preferências de interface e o estado do modo demonstração podem ser salvos no armazenamento local do navegador. Você pode limpar esses dados nas configurações do My Universe ou diretamente no navegador.</p></section>
    <section><h2>4. Spotify e autenticação</h2><p>A autenticação é feita por meio do fluxo do Spotify. As permissões concedidas podem ser revogadas na sua conta do Spotify. A disponibilidade de recursos depende das regras e permissões da API do Spotify.</p></section>
    <section><h2>5. Compartilhamento</h2><p>O projeto não foi desenhado para vender dados pessoais. Recursos de compartilhamento só são acionados quando você solicita explicitamente compartilhar um link ou conteúdo.</p></section>
    <section><h2>6. Segurança e limitações</h2><p>Credenciais e tokens devem ser tratados como informações sensíveis e transmitidos apenas por conexões seguras. Como qualquer aplicação integrada a terceiros, a segurança também depende da configuração de implantação, do navegador e dos serviços externos utilizados.</p></section>
    <section><h2>7. Seus controles</h2><p>Você pode sair da aplicação, apagar dados locais, revogar o acesso pelo Spotify e usar o modo demonstração sem conectar uma conta real.</p></section>
    <section><h2>8. Alterações</h2><p>Esta política pode ser atualizada quando o produto ou as integrações mudarem. A data de revisão é mantida no topo da página.</p></section>
  </LegalLayout>
)

export default Privacy
