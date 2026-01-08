import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const TermsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Termos de Uso" 
        description="Termos e condições de uso do portal JG News. Conheça seus direitos e responsabilidades ao acessar nosso conteúdo."
        keywords="termos de uso, condições, direitos autorais, responsabilidades, regras"
      />
      <Header />
      
      <main className="flex-1 container py-12">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black text-news-primary mb-6">
            Termos de Uso
          </h1>
          
          <p className="text-sm text-news-muted mb-8">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
          
          <div className="prose prose-lg max-w-none text-news-secondary space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar o portal JG News ("Portal"), você concorda em cumprir e 
                estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte 
                destes termos, não deverá utilizar nossos serviços.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">2. Descrição do Serviço</h2>
              <p>
                O JG News é um portal de notícias digital que oferece conteúdo jornalístico em 
                diversas categorias, incluindo política, economia, esportes, tecnologia, 
                entretenimento e notícias do Brasil e do mundo.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">3. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo publicado no JG News, incluindo textos, imagens, vídeos, gráficos, 
                logotipos e design, é protegido por direitos autorais e outras leis de propriedade 
                intelectual.
              </p>
              <p>É expressamente proibido:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Reproduzir, distribuir ou modificar o conteúdo sem autorização prévia</li>
                <li>Utilizar o conteúdo para fins comerciais sem licenciamento</li>
                <li>Remover avisos de direitos autorais ou marcas d'água</li>
                <li>Criar obras derivadas do conteúdo original</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">4. Uso Permitido</h2>
              <p>Você pode:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ler e acessar o conteúdo para uso pessoal e não comercial</li>
                <li>Compartilhar links para as matérias em redes sociais</li>
                <li>Citar trechos pequenos com a devida atribuição e link para a matéria original</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">5. Conduta do Usuário</h2>
              <p>Ao utilizar nosso Portal, você concorda em não:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violar qualquer lei local, estadual, nacional ou internacional aplicável</li>
                <li>Transmitir conteúdo ilegal, ofensivo, difamatório ou que viole direitos de terceiros</li>
                <li>Tentar acessar áreas restritas do Portal sem autorização</li>
                <li>Utilizar robôs, scrapers ou outras ferramentas automatizadas</li>
                <li>Interferir no funcionamento do Portal ou servidores</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">6. Conteúdo de Terceiros</h2>
              <p>
                O Portal pode conter links para sites de terceiros. Não somos responsáveis pelo 
                conteúdo, práticas de privacidade ou políticas desses sites externos.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">7. Isenção de Responsabilidade</h2>
              <p>
                O conteúdo do JG News é fornecido "como está" e "conforme disponível". Nos 
                esforçamos para manter as informações precisas e atualizadas, mas não garantimos 
                a exatidão, integridade ou atualidade de todo o conteúdo.
              </p>
              <p>
                O JG News não se responsabiliza por decisões tomadas com base em informações 
                publicadas no Portal.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">8. Modificações</h2>
              <p>
                Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. 
                As alterações entram em vigor imediatamente após a publicação. O uso continuado 
                do Portal após alterações constitui aceitação dos novos termos.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">9. Lei Aplicável</h2>
              <p>
                Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. 
                Qualquer disputa será submetida à jurisdição dos tribunais brasileiros.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">10. Contato</h2>
              <p>
                Para questões sobre estes Termos de Uso, entre em contato:
              </p>
              <p>
                E-mail:{" "}
                <a href="mailto:contato@jgnews.com.br" className="text-primary hover:underline">
                  contato@jgnews.com.br
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

export default TermsPage;
