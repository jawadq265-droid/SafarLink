import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SafarLink_Logo from '../../../assets/images/SafariLink_Logo.jpg';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ur' : 'en';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-[#1b1b1b] shadow-2xl py-4`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">

          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-4">
            <div className="relative group">
              <img
                src={SafarLink_Logo}
                alt="SafarLink Logo"
                className="w-12 h-12 rounded-sm object-contain brightness-110"
              />
              <div className="absolute inset-0 border border-[#aa8453]/30 -m-1 group-hover:m-0 transition-all duration-500"></div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-2xl font-serif text-white tracking-widest leading-none">SAFARLINK</span>
              <span className="text-[10px] text-[#aa8453] tracking-[0.4em] uppercase mt-1">{t('navbar.portal_subtitle')}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-12">
            {[
              { name: t('navbar.home'), path: '/' },
              { name: t('navbar.bus_routes'), path: '/bus' },
              { name: t('navbar.about_us'), path: '/AboutUs' },
              { name: t('navbar.contact'), path: '/contact' },
            ].map((link, idx) => (
              <Link
                key={idx}
                to={link.path}
                className="text-white text-xs font-condensed tracking-[0.2em] hover:text-[#aa8453] transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#aa8453] transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Auth/Book Now Button */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/login" className="text-white text-xs font-condensed tracking-[0.2em] hover:text-[#aa8453] transition-colors">
              {t('navbar.login')}
            </Link>
            <Link to="/signup">
              <button className="luxury-button hover:bg-white text-sm !py-3 !px-5 !text-[10px] text-white border border-white rounded-full cursor-pointer hover:text-[#aa8453] transition-colors hover:border-[#aa8453]">
                {t('navbar.join_now')}
              </button>
            </Link>
            <button 
              onClick={toggleLanguage}
              className="text-[#aa8453] border border-[#aa8453] rounded-full px-3 py-1 text-xs hover:bg-[#aa8453] hover:text-white transition-all font-serif"
            >
              {i18n.language === 'en' ? 'UR' : 'EN'}
            </button>
          </div>

          {/* Mobile Toggle Placeholder */}
          <div className="lg:hidden text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
