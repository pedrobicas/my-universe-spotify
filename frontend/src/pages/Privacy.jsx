import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Privacy = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-green-400 hover:text-green-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Política de Privacidade
          </h1>
          <p className="text-gray-400 mt-2">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-green max-w-none">
          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introdução</h2>
              <p className="text-gray-300 leading-relaxed">
                O My Universe Spotify ("nós", "nosso" ou "aplicação") respeita sua privacidade e está 
                comprometido em proteger suas informações pessoais. Esta política descreve como coletamos, 
                usamos e protegemos seus dados quando você usa nossa aplicação.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Dados Coletados</h2>
              <p className="text-gray-300 mb-4">Coletamos apenas dados do Spotify necessários para o funcionamento da aplicação:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Informações básicas do perfil (nome, foto, país)</li>
                <li>Endereço de email para identificação</li>
                <li>Músicas e artistas mais ouvidos</li>
                <li>Playlists públicas e privadas</li>
                <li>Histórico de reprodução recente</li>
                <li>Músicas curtidas/salvas</li>
                <li>Artistas seguidos</li>
                <li>Estado atual de reprodução (quando aplicável)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Como Usamos Seus Dados</h2>
              <p className="text-gray-300 mb-4">Seus dados são usados exclusivamente para:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Exibir suas estatísticas musicais personalizadas</li>
                <li>Gerar análises e insights sobre seus hábitos de escuta</li>
                <li>Criar visualizações interativas de seus dados</li>
                <li>Fornecer recomendações musicais baseadas em suas preferências</li>
                <li>Permitir criação e edição de playlists</li>
                <li>Melhorar a experiência geral da aplicação</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Armazenamento e Segurança</h2>
              <p className="text-gray-300 leading-relaxed">
                Não armazenamos permanentemente seus dados musicais. Os tokens de acesso são temporários 
                e seus dados são processados em tempo real através da API do Spotify. Utilizamos cookies 
                seguros (httpOnly) para manter sua sessão ativa. Todos os dados são transmitidos através 
                de conexões HTTPS criptografadas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Compartilhamento de Dados</h2>
              <p className="text-gray-300 leading-relaxed">
                Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros. Seus dados 
                são usados apenas dentro da nossa aplicação para fornecer os serviços descritos. 
                Não temos acesso aos arquivos de música - apenas aos metadados fornecidos pela API do Spotify.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Seus Direitos</h2>
              <p className="text-gray-300 mb-4">Você tem o direito de:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Revogar o acesso da aplicação a qualquer momento através das configurações do Spotify</li>
                <li>Solicitar a exclusão de dados armazenados</li>
                <li>Solicitar informações sobre quais dados coletamos</li>
                <li>Fazer logout e limpar todos os tokens de acesso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies e Tecnologias Similares</h2>
              <p className="text-gray-300 leading-relaxed">
                Utilizamos cookies essenciais para manter sua sessão segura. Não utilizamos cookies 
                de rastreamento ou análise de terceiros. Você pode limpar os cookies através das 
                configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Alterações nesta Política</h2>
              <p className="text-gray-300 leading-relaxed">
                Podemos atualizar esta política ocasionalmente. Notificaremos sobre mudanças significativas 
                através da aplicação. A data da última atualização será sempre exibida no topo desta página.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Contato</h2>
              <p className="text-gray-300 leading-relaxed">
                Se você tiver dúvidas sobre esta política de privacidade ou sobre como tratamos seus dados, 
                entre em contato conosco através do GitHub ou do email fornecido na aplicação.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Privacy
