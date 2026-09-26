import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  LogOut,
  User,
  Globe
} from 'lucide-react';
import SafarLink_Logo from '../../../assets/images/SafariLink_Logo.jpg';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || "");
  const navRef = useRef<HTMLElement | null>(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ur' : 'en';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update authentication states on route change & close mobile menu automatically
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    setUserRole(localStorage.getItem("role") || "");
    setUserEmail(localStorage.getItem("userEmail") || "");
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside the nav container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const isSuperAdmin = userRole === "superadmin" || userEmail === "superadmin@safarlink.com";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setUserRole("");
    setUserEmail("");
    setIsMobileMenuOpen(false);
    toast.success("Successfully logged out");
    navigate("/login");
  };

  const navLinks = [
    { name: t('navbar.home'), path: '/' },
    { name: t('navbar.bus_routes'), path: '/bus' },
    { name: t('navbar.about_us'), path: '/AboutUs' },
    { name: t('navbar.contact'), path: '/contact' },
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#141414]/95 backdrop-blur-md shadow-2xl py-3 border-b border-[#aa8453]/20"
          : "bg-[#1b1b1b] shadow-xl py-3.5 sm:py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">

          {/* Logo & Brand Section */}
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center space-x-2.5 sm:space-x-3.5 shrink-0 group select-none"
          >
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 shrink-0">
              <img
                src={SafarLink_Logo}
                alt="SafarLink Logo"
                className="w-full h-full rounded-sm object-contain brightness-110"
              />
              <div className="absolute inset-0 border border-[#aa8453]/30 -m-0.5 sm:-m-1 group-hover:m-0 transition-all duration-500"></div>
            </div>
            <div className="flex flex-col text-left justify-center">
              <span className="text-base sm:text-xl md:text-2xl font-serif text-white tracking-wider sm:tracking-widest leading-none font-bold">
                SAFARLINK
              </span>
              <span className="text-[7.5px] sm:text-[9px] md:text-[10px] text-[#aa8453] tracking-[0.25em] sm:tracking-[0.35em] md:tracking-[0.4em] uppercase mt-1 leading-none">
                {t('navbar.portal_subtitle')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link, idx) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={idx}
                  to={link.path}
                  className={`text-xs font-condensed tracking-[0.2em] uppercase font-medium transition-colors relative py-1.5 group ${
                    isActive ? "text-[#aa8453]" : "text-white/80 hover:text-[#aa8453]"
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-[1.5px] bg-[#aa8453] transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  ></span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Action & Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={isSuperAdmin ? "/admin" : "/bookings"}
                  className="h-9 px-4 inline-flex items-center gap-2 bg-[#aa8453] hover:bg-[#8e6d45] text-white rounded-full text-xs font-condensed tracking-[0.15em] font-bold uppercase transition-all duration-300 shadow-md shadow-amber-950/20 border border-[#aa8453]"
                >
                  <LayoutDashboard size={14} />
                  <span>{isSuperAdmin ? t('navbar.admin_panel') : t('navbar.dashboard')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="h-9 px-3.5 inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-condensed tracking-[0.15em] uppercase hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>{t('navbar.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="h-9 px-3.5 inline-flex items-center text-white/80 hover:text-[#aa8453] text-xs font-condensed tracking-[0.2em] uppercase transition-colors"
                >
                  {t('navbar.login')}
                </Link>
                <Link to="/signup">
                  <button className="h-9 px-5 inline-flex items-center justify-center border border-[#aa8453] bg-[#aa8453]/15 hover:bg-[#aa8453] text-white text-xs font-condensed tracking-[0.2em] font-bold uppercase rounded-full transition-all duration-300 cursor-pointer shadow-sm">
                    {t('navbar.join_now')}
                  </button>
                </Link>
              </div>
            )}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="h-9 px-3.5 inline-flex items-center justify-center text-[#aa8453] border border-[#aa8453]/60 hover:border-[#aa8453] hover:bg-[#aa8453] hover:text-white rounded-full text-xs font-serif font-bold tracking-wider transition-all cursor-pointer"
              title="Change Language"
            >
              {i18n.language === 'en' ? 'UR' : 'EN'}
            </button>
          </div>

          {/* Mobile & Tablet Controls */}
          <div className="flex lg:hidden items-center space-x-2 sm:space-x-3">
            {/* Tablet-only Admin Panel Button */}
            {isLoggedIn && (
              <Link
                to={isSuperAdmin ? "/admin" : "/bookings"}
                className="hidden sm:inline-flex md:inline-flex items-center gap-1.5 h-8 px-3 bg-[#aa8453] hover:bg-[#8e6d45] text-white rounded-full text-[10px] font-condensed tracking-[0.15em] font-bold uppercase border border-[#aa8453] transition-all"
              >
                <LayoutDashboard size={13} />
                <span>{isSuperAdmin ? t('navbar.admin_panel') : t('navbar.dashboard')}</span>
              </Link>
            )}

            {/* Compact Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="h-8 px-2.5 inline-flex items-center justify-center text-[#aa8453] border border-[#aa8453]/60 rounded-full text-[11px] font-serif font-bold hover:bg-[#aa8453] hover:text-white transition-all cursor-pointer"
            >
              {i18n.language === 'en' ? 'UR' : 'EN'}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-white hover:text-[#aa8453] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#aa8453]/40 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X size={22} className="text-[#aa8453]" />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile & Tablet Navigation Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="lg:hidden border-t border-[#aa8453]/20 bg-[#161616]/98 backdrop-blur-xl shadow-2xl overflow-hidden mt-3"
          >
            <div className="container mx-auto px-5 py-5 space-y-4 max-h-[calc(100vh-75px)] overflow-y-auto overscroll-contain">

              {/* User Profile / Admin Banner in Drawer */}
              {isLoggedIn ? (
                <div className="space-y-2.5 pb-2 border-b border-white/10">
                  <div className="p-3 bg-white/5 border border-[#aa8453]/25 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#aa8453]/20 border border-[#aa8453]/40 flex items-center justify-center text-[#aa8453] shrink-0">
                        <User size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-white text-xs font-medium truncate max-w-[200px]">
                          {userEmail || "SafarLink User"}
                        </div>
                        <div className="text-[9px] text-[#aa8453] tracking-widest uppercase font-condensed mt-0.5">
                          {isSuperAdmin ? "Super Admin" : userRole === "admin" ? "Admin" : "Verified Traveler"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={isSuperAdmin ? "/admin" : "/bookings"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full h-11 bg-[#aa8453] hover:bg-[#8e6d45] text-white rounded-xl text-xs font-condensed tracking-[0.2em] font-bold uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20 transition-all border border-[#aa8453]"
                  >
                    <LayoutDashboard size={15} />
                    <span>{isSuperAdmin ? t('navbar.admin_panel') : t('navbar.dashboard')}</span>
                  </Link>
                </div>
              ) : null}

              {/* Navigation Items with Uniform Dimensions */}
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`h-11 px-4 rounded-xl flex items-center justify-between text-xs font-condensed tracking-[0.2em] uppercase transition-all duration-200 ${
                        isActive
                          ? "bg-[#aa8453]/15 text-[#aa8453] font-bold border-l-2 border-[#aa8453]"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronRight
                        size={14}
                        className={isActive ? "text-[#aa8453]" : "text-white/30"}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Auth Buttons for Logged-Out Users */}
              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="h-11 flex items-center justify-center border border-white/20 hover:border-white/40 text-white rounded-xl text-xs font-condensed tracking-[0.2em] uppercase transition-colors hover:bg-white/5"
                  >
                    {t('navbar.login')}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="h-11 flex items-center justify-center bg-[#aa8453] hover:bg-[#8e6d45] text-white rounded-xl text-xs font-condensed tracking-[0.2em] font-bold uppercase transition-all shadow-md shadow-amber-950/20"
                  >
                    {t('navbar.join_now')}
                  </Link>
                </div>
              ) : (
                /* Logout Button for Logged-In Users */
                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={handleLogout}
                    className="w-full h-11 flex items-center justify-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-condensed tracking-[0.2em] uppercase transition-colors cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>{t('navbar.logout')}</span>
                  </button>
                </div>
              )}

              {/* Mobile Drawer Footer with Language & Branding */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-white/50 text-xs">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-[#aa8453] hover:text-white transition-colors cursor-pointer"
                >
                  <Globe size={14} />
                  <span className="font-serif">
                    {i18n.language === 'en' ? 'اردو میں دیکھیں (UR)' : 'Switch to English (EN)'}
                  </span>
                </button>
                <span className="text-[10px] text-white/30 tracking-widest uppercase font-serif">
                  SAFARLINK
                </span>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
