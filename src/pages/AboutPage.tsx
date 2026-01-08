import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Sobre Nós" 
        description="Conheça o JG News, portal de notícias comprometido com jornalismo de qualidade e informação confiável para o público brasileiro."
        keywords="sobre JG News, quem somos, jornalismo, redação, equipe editorial"
      />
      <Header />
      
      <main className="flex-1 container py-12">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black text-news-primary mb-6">
            Sobre o JG News
          </h1>
          
          <div className="prose prose-lg max-w-none text-news-secondary">
            <p className="lead text-xl mb-6">
              O JG News é um portal de notícias digital comprometido em levar informação de qualidade, 
              confiável e atualizada para leitores em todo o Brasil.
            </p>
            
            <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">Nossa Missão</h2>
            <p>
              Nosso compromisso é fornecer jornalismo independente, ético e transparente. 
              Acreditamos que a informação de qualidade é fundamental para uma sociedade democrática 
              e trabalhamos diariamente para trazer as notícias mais relevantes de forma clara e objetiva.
            </p>
            
            <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">Nossos Valores</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Verdade:</strong> Compromisso com a apuração rigorosa dos fatos</li>
              <li><strong>Independência:</strong> Jornalismo livre de interesses políticos ou econômicos</li>
              <li><strong>Transparência:</strong> Clareza sobre nossas fontes e métodos</li>
              <li><strong>Respeito:</strong> Tratamento ético das fontes e dos leitores</li>
              <li><strong>Inovação:</strong> Uso de tecnologia para melhor informar</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">Cobertura Editorial</h2>
            <p>
              Nossa equipe cobre as principais editorias do jornalismo brasileiro:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Política:</strong> Acompanhamento do cenário político nacional</li>
              <li><strong>Economia:</strong> Análises e notícias do mercado financeiro</li>
              <li><strong>Esportes:</strong> Cobertura completa do mundo esportivo</li>
              <li><strong>Tecnologia:</strong> Novidades do universo tech e inovação</li>
              <li><strong>Entretenimento:</strong> Cultura, celebridades e lazer</li>
              <li><strong>Mundo:</strong> Notícias internacionais relevantes</li>
              <li><strong>Brasil:</strong> Acontecimentos de todo o território nacional</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-news-primary mt-8 mb-4">Contato</h2>
            <p>
              Para entrar em contato com nossa redação, envie um e-mail para{" "}
              <a href="mailto:contato@jgnews.com.br" className="text-primary hover:underline">
                contato@jgnews.com.br
              </a>
            </p>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutPage;
