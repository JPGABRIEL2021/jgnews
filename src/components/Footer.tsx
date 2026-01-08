import { Link } from "react-router-dom";
import { categories } from "@/data/mockPosts";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background mt-12">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-black text-primary">JG</span>
              <span className="text-2xl font-black text-background ml-1">News</span>
            </Link>
            <p className="text-background/60 text-sm">
              Seu portal de notícias atualizado 24 horas por dia.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-background mb-4">Editorias</h3>
            <ul className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    to={`/category/${category.toLowerCase()}`}
                    className="text-sm text-background/60 hover:text-primary transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-bold text-background mb-4">Institucional</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-sm text-background/60 hover:text-primary transition-colors">
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-background/60 hover:text-primary transition-colors">
                  Fale conosco
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-background/60 hover:text-primary transition-colors">
                  Política de privacidade
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-background/60 hover:text-primary transition-colors">
                  Termos de uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 text-center">
          <p className="text-sm text-background/40">
            © {new Date().getFullYear()} JG News. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
