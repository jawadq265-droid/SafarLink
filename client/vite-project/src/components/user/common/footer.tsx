import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SafarLink_Logo from '../../../assets/images/SafariLink_Logo.jpg';
import toast from 'react-hot-toast';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const isUrdu = i18n.language === 'ur';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const baseUrl = (import.meta.env.VITE_BASE_URL || "/api/v1/").replace(/['"]/g, "").replace(/\/?$/, "/");

    try {
      const res = await fetch(`${baseUrl}auth/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        throw new Error((data && data.message) || String(t('footer.subscribe_failed')));
      }

      if (data && data.isAlreadySubscribed) {
        toast.success(String(t('footer.already_subscribed')));
      } else {
        toast.success(String(t('footer.subscribed_success')));
      }
      setEmail('');
    } catch (err: any) {
      console.error("Newsletter subscription error:", err);
      toast.error(err.message || t('footer.subscribe_failed'));
    }
  };

  return (
    <footer className="bg-[#1b1b1b] text-white pt-32 pb-16 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[15rem] font-serif text-white opacity-[0.02] whitespace-nowrap pointer-events-none">
        SAFARLINK
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-24">

          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-10">
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-4 group">
              <div className="relative shrink-0">
                <img
                  src={SafarLink_Logo}
                  alt="SafarLink Logo"
                  className="w-14 h-14 rounded-sm object-contain brightness-110 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 border border-[#aa8453]/30 -m-1 group-hover:m-0 transition-all duration-500"></div>
              </div>
              <div className="flex flex-col text-start">
                <span className="text-2xl font-serif tracking-widest leading-none">SAFARLINK</span>
                <span className="text-[10px] text-[#aa8453] tracking-[0.4em] uppercase mt-1 font-condensed">
                  {t('footer.portal_subtitle')}
                </span>
              </div>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed font-light max-w-xs text-start">
              {t('footer.brand_description')}
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: <Instagram size={18} />, label: 'Instagram' },
                { icon: <Facebook size={18} />, label: 'Facebook' },
                { icon: <Twitter size={18} />, label: 'Twitter' }
              ].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#aa8453] hover:border-[#aa8453]/50 transition-all duration-500"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-10">
            <h4 className="text-xs tracking-[0.4em] uppercase text-[#aa8453] font-condensed text-start">
              {t('footer.navigation_title')}
            </h4>
            <ul className="space-y-6">
              {[
                { name: t('footer.home'), path: '/' },
                { name: t('footer.bus_tickets'), path: '/bus' },
                { name: t('footer.about_safari'), path: '/AboutUs' },
                { name: t('footer.contact_concierge'), path: '/contact' }
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="text-white/60 hover:text-[#aa8453] text-sm transition-colors duration-300 font-light tracking-wide flex items-center group"
                  >
                    <span className="w-0 group-hover:w-4 h-[1px] bg-[#aa8453] transition-all duration-300 me-0 group-hover:me-3"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-10">
            <h4 className="text-xs tracking-[0.4em] uppercase text-[#aa8453] font-condensed text-start">
              {t('footer.contact_details')}
            </h4>
            <ul className="space-y-8">
              <li className="flex items-start gap-6 group">
                <div className="w-12 h-12 shrink-0 border border-white/5 flex items-center justify-center text-[#aa8453] group-hover:bg-[#aa8453]/10 transition-colors">
                  <MapPin size={20} strokeWidth={1.5} />
                </div>
                <div className="pt-1 text-start">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-condensed mb-1">
                    {t('footer.corporate_office')}
                  </p>
                  <p className="text-white/70 text-sm font-light">
                    {t('footer.corporate_address')}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-6 group">
                <div className="w-12 h-12 shrink-0 border border-white/5 flex items-center justify-center text-[#aa8453] group-hover:bg-[#aa8453]/10 transition-colors">
                  <Phone size={20} strokeWidth={1.5} />
                </div>
                <div className="pt-1 text-start">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-condensed mb-1">
                    {t('footer.helpline')}
                  </p>
                  <p className="text-white/70 text-sm font-light" dir="ltr">
                    +92 300 1234567
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-6 group">
                <div className="w-12 h-12 shrink-0 border border-white/5 flex items-center justify-center text-[#aa8453] group-hover:bg-[#aa8453]/10 transition-colors">
                  <Mail size={20} strokeWidth={1.5} />
                </div>
                <div className="pt-1 text-start">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-condensed mb-1">
                    {t('footer.digital_mail')}
                  </p>
                  <p className="text-white/70 text-sm font-light">
                    safarlink0@gmail.com
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="space-y-10">
            <h4 className="text-xs tracking-[0.4em] uppercase text-[#aa8453] font-condensed text-start">
              {t('footer.newsletter')}
            </h4>
            <p className="text-white/40 text-sm font-light leading-relaxed text-start">
              {t('footer.newsletter_desc')}
            </p>
            <form className="relative flex items-center" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder={t('footer.email_placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border-b border-white/10 px-2 py-4 pe-10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#aa8453] transition-colors text-start"
                required
              />
              <button
                type="submit"
                className="absolute end-2 text-[#aa8453] hover:text-white transition-colors"
                aria-label={t('footer.subscribe')}
              >
                <Send size={18} strokeWidth={1.5} className={isUrdu ? "rotate-180" : ""} />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-around items-center gap-8 text-center md:text-start">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-condensed">
            &copy; {new Date().getFullYear()} {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-8 md:gap-12">
            <a href="#" className="text-[10px] text-white/30 hover:text-[#aa8453] uppercase tracking-[0.3em] font-condensed transition-colors">
              {t('footer.privacy_policy')}
            </a>
            <a href="#" className="text-[10px] text-white/30 hover:text-[#aa8453] uppercase tracking-[0.3em] font-condensed transition-colors">
              {t('footer.terms_of_service')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
