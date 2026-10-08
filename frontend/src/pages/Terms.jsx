import LegalLayout from '../components/LegalLayout'

const Terms = () => (
  <LegalLayout eyebrow="LEGAL / TERMOS" title="Termos de uso." intro="Regras básicas para usar o My Universe e entender os limites de uma aplicação conectada ao Spotify.">
    <section><h2>1. Uso do serviço</h2><p>Ao usar o My Universe, você concorda em utilizar a aplicação de forma lícita e de acordo com os termos aplicáveis do Spotify e das plataformas utilizadas na implantação.</p></section>
    <section><h2>2. O que o produto faz</h2><p>O My Universe organiza e apresenta dados musicais, oferece ferramentas de descoberta, visualização de histórico, gerenciamento de playlists e, quando permitido, controles de reprodução.</p></section>
    <section><h2>3. Conta e permissões</h2><p>Algumas funções exigem uma conta do Spotify e permissões específicas. Recursos podem variar conforme o tipo de conta, disponibilidade da API, região e dispositivo ativo.</p></section>
    <section><h2>4. Uso aceitável</h2><p>Não tente contornar limitações técnicas, abusar da API, acessar dados de terceiros sem autorização ou usar o serviço para atividades ilícitas.</p></section>
    <section><h2>5. Propriedade intelectual</h2><p>Marcas, catálogos e metadados de terceiros pertencem aos respectivos titulares. O código e a interface do My Universe permanecem sujeitos à licença e aos direitos definidos pelo projeto.</p></section>
    <section><h2>6. Disponibilidade</h2><p>O serviço depende de APIs e serviços externos e pode ficar indisponível ou ter funcionalidades alteradas sem aviso. Não há garantia de disponibilidade contínua nem de que toda informação retornada por terceiros esteja completa.</p></section>
    <section><h2>7. Modo demonstração</h2><p>O modo demo usa dados simulados para apresentar a interface. Esses dados não representam um usuário real e podem não reproduzir todas as limitações do Spotify em produção.</p></section>
    <section><h2>8. Mudanças</h2><p>O produto e estes termos podem mudar conforme novas funcionalidades sejam adicionadas ou integrações sejam atualizadas.</p></section>
  </LegalLayout>
)

export default Terms
