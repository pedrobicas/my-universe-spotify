import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Terms = () => {
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
            Termos de Serviço
          </h1>
          <p className="text-gray-400 mt-2">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-green max-w-none">
          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-300 leading-relaxed">
                Ao acessar e usar o My Universe Spotify ("aplicação"), você concorda em cumprir e estar 
                vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, 
                não use a aplicação.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Descrição do Serviço</h2>
              <p className="text-gray-300 leading-relaxed">
                O My Universe Spotify é uma aplicação web que fornece análises e visualizações dos seus 
                dados musicais do Spotify, incluindo estatísticas personalizadas, descoberta musical 
                e ferramentas de gerenciamento de playlists.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Requisitos de Uso</h2>
              <p className="text-gray-300 mb-4">Para usar esta aplicação, você deve:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Ter uma conta ativa do Spotify (gratuita ou premium)</li>
                <li>Ser maior de 13 anos (ou idade mínima legal em sua jurisdição)</li>
                <li>Fornecer informações precisas durante o processo de autenticação</li>
                <li>Cumprir com os Termos de Serviço do Spotify</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Uso Permitido</h2>
              <p className="text-gray-300 mb-4">Você pode usar a aplicação para:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Visualizar suas estatísticas musicais pessoais</li>
                <li>Descobrir novas músicas baseadas em suas preferências</li>
                <li>Criar e gerenciar playlists</li>
                <li>Analisar seus hábitos de escuta</li>
                <li>Uso pessoal e não comercial</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Uso Proibido</h2>
              <p className="text-gray-300 mb-4">Você NÃO pode:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Usar a aplicação para fins comerciais sem autorização</li>
                <li>Tentar contornar limitações técnicas</li>
                <li>Fazer engenharia reversa do código</li>
                <li>Violar direitos autorais ou propriedade intelectual</li>
                <li>Usar a aplicação para atividades ilegais</li>
                <li>Compartilhar suas credenciais de acesso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Propriedade Intelectual</h2>
              <p className="text-gray-300 leading-relaxed">
                O código, design e funcionalidades da aplicação são de propriedade do desenvolvedor. 
                Os dados musicais pertencem ao Spotify e aos respectivos detentores de direitos autorais. 
                Você mantém os direitos sobre suas playlists e dados pessoais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Limitações de Responsabilidade</h2>
              <p className="text-gray-300 mb-4">A aplicação é fornecida "como está". Não garantimos:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Disponibilidade ininterrupta do serviço</li>
                <li>Precisão absoluta das análises</li>
                <li>Compatibilidade com todas as funcionalidades do Spotify</li>
                <li>Que o serviço atenderá a todas as suas necessidades</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Modificações do Serviço</h2>
              <p className="text-gray-300 leading-relaxed">
                Reservamos o direito de modificar, suspender ou descontinuar qualquer aspecto da aplicação 
                a qualquer momento, com ou sem aviso prévio. Também podemos atualizar estes termos 
                ocasionalmente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Encerramento</h2>
              <p className="text-gray-300 leading-relaxed">
                Você pode encerrar o uso da aplicação a qualquer momento removendo a autorização nas 
                configurações do Spotify. Podemos encerrar ou suspender seu acesso se você violar 
                estes termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Conformidade com o Spotify</h2>
              <p className="text-gray-300 leading-relaxed">
                Esta aplicação é construída usando a API Web do Spotify e está sujeita aos Termos de 
                Serviço do Spotify. Ao usar nossa aplicação, você também concorda em cumprir os termos 
                do Spotify.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Lei Aplicável</h2>
              <p className="text-gray-300 leading-relaxed">
                Estes termos são regidos pelas leis do Brasil. Qualquer disputa será resolvida nos 
                tribunais competentes do Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contato</h2>
              <p className="text-gray-300 leading-relaxed">
                Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco através 
                do GitHub ou do email fornecido na aplicação.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Terms
