import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Política de Privacidade" 
        description="Política de privacidade do JG News. Saiba como coletamos, usamos e protegemos seus dados pessoais."
        keywords="política de privacidade, LGPD, proteção de dados, privacidade, cookies"
      />
      <Header />
      
      <main className="flex-1 container py-12">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black text-news-primary mb-6">
            Política de Privacidade
          </h1>
          
          <p className="text-sm text-news-muted mb-8">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
          
          <div className="prose prose-lg max-w-none text-news-secondary space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">1. Introdução</h2>
              <p>
                O JG News ("nós", "nosso" ou "Portal") está comprometido em proteger a privacidade 
                de nossos usuários. Esta Política de Privacidade explica como coletamos, usamos, 
                divulgamos e protegemos suas informações pessoais quando você visita nosso portal 
                de notícias.
              </p>
              <p>
                Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">2. Informações que Coletamos</h2>
              <p>Podemos coletar os seguintes tipos de informações:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dados de navegação:</strong> Endereço IP, tipo de navegador, páginas visitadas, tempo de permanência</li>
                <li><strong>Dados fornecidos voluntariamente:</strong> Nome, e-mail e outras informações enviadas através de formulários de contato</li>
                <li><strong>Cookies e tecnologias similares:</strong> Para melhorar a experiência do usuário e fins de análise</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">3. Como Usamos suas Informações</h2>
              <p>Utilizamos as informações coletadas para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Personalizar a experiência do usuário</li>
                <li>Enviar notificações (mediante consentimento)</li>
                <li>Análise estatística do uso do portal</li>
                <li>Responder a contatos e solicitações</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">4. Cookies</h2>
              <p>
                Utilizamos cookies para melhorar sua experiência em nosso portal. Cookies são 
                pequenos arquivos de texto armazenados em seu dispositivo que nos ajudam a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Lembrar suas preferências</li>
                <li>Entender como você usa nosso site</li>
                <li>Oferecer conteúdo personalizado</li>
                <li>Melhorar a performance do portal</li>
              </ul>
              <p>
                Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">5. Compartilhamento de Dados</h2>
              <p>
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros 
                para fins de marketing. Podemos compartilhar dados com:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prestadores de serviços que auxiliam na operação do portal</li>
                <li>Autoridades legais, quando exigido por lei</li>
                <li>Serviços de análise de tráfego (dados anonimizados)</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">6. Seus Direitos</h2>
              <p>De acordo com a LGPD, você tem direito a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Revogar o consentimento</li>
                <li>Solicitar a portabilidade dos dados</li>
              </ul>
              <p>
                Para exercer esses direitos, entre em contato pelo e-mail:{" "}
                <a href="mailto:jptenorio.alves@gmail.com" className="text-primary hover:underline">
                  jptenorio.alves@gmail.com
                </a>
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">7. Segurança</h2>
              <p>
                Implementamos medidas técnicas e organizacionais adequadas para proteger suas 
                informações pessoais contra acesso não autorizado, alteração, divulgação ou 
                destruição.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">8. Alterações nesta Política</h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Recomendamos que 
                você revise esta página regularmente para se manter informado sobre nossas práticas.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">9. Contato</h2>
              <p>
                Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco:
              </p>
              <p>
                E-mail:{" "}
                <a href="mailto:jptenorio.alves@gmail.com" className="text-primary hover:underline">
                  jptenorio.alves@gmail.com
                </a>
              </p>
            </section>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPage;
