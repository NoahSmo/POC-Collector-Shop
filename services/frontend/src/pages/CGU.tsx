import { useTranslation } from 'react-i18next';

export default function CGU() {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-cinzel text-vintage-gold mb-2 tracking-widest">{t('terms_of_service').toUpperCase()}</h1>
        <div className="w-16 h-0.5 bg-vintage-gold mx-auto opacity-50"></div>
      </header>

      <div className="border border-vintage-gold/20 rounded-lg bg-black/40 p-8 shadow-inner font-lora text-vintage-gold-muted/80 space-y-6 leading-relaxed">
        
        <section>
          <h2 className="text-vintage-gold font-cinzel text-xl mb-3">1. Objet</h2>
          <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme Collector.shop, une marketplace C2C dédiée à l'achat et la vente d'objets de collection entre particuliers.</p>
        </section>

        <section>
          <h2 className="text-vintage-gold font-cinzel text-xl mb-3">2. Inscription</h2>
          <p>L'inscription est gratuite et ouverte à toute personne physique majeure. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants de connexion.</p>
        </section>

        <section>
          <h2 className="text-vintage-gold font-cinzel text-xl mb-3">3. Mise en vente</h2>
          <p>Tout utilisateur inscrit peut mettre en vente des objets de collection. Chaque annonce est soumise à une modération par l'équipe Collector.shop avant publication. Les articles doivent être conformes à la description fournie.</p>
        </section>

        <section>
          <h2 className="text-vintage-gold font-cinzel text-xl mb-3">4. Transactions & Paiement</h2>
          <p>Les paiements sont sécurisés via Stripe. Collector.shop ne stocke aucune donnée bancaire. Les transactions sont finales une fois le paiement confirmé par le webhook Stripe.</p>
        </section>

        <section>
          <h2 className="text-vintage-gold font-cinzel text-xl mb-3">5. Responsabilité</h2>
          <p>Collector.shop agit en tant qu'intermédiaire technique. La plateforme ne peut être tenue responsable de la qualité, de l'authenticité ou de la conformité des articles vendus par les utilisateurs.</p>
        </section>

        <section>
          <h2 className="text-vintage-gold font-cinzel text-xl mb-3">6. Protection des données</h2>
          <p>Les données personnelles sont traitées conformément au RGPD. Les mots de passe sont hashés (bcrypt) et les communications sont sécurisées via JWT. L'utilisateur peut demander la suppression de ses données à tout moment.</p>
        </section>

        <section>
          <h2 className="text-vintage-gold font-cinzel text-xl mb-3">7. Propriété intellectuelle</h2>
          <p>Le contenu de la plateforme (design, code, textes) est la propriété de Collector.shop. Les utilisateurs conservent la propriété intellectuelle des photos et descriptions de leurs annonces.</p>
        </section>

        <section>
          <h2 className="text-vintage-gold font-cinzel text-xl mb-3">8. Modification des CGU</h2>
          <p>Collector.shop se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle.</p>
        </section>

        <p className="text-sm text-vintage-gold-muted/40 pt-4 text-center italic">Dernière mise à jour : Février 2026</p>
      </div>
    </div>
  );
}
