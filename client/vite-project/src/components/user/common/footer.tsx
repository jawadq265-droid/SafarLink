import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, ArrowUp, Send } from 'lucide-react';
import SafarLink_Logo from '../../../assets/images/SafariLink_Logo.jpg';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Subscribed successfully! Thank you.');
    setEmail('');
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
            <Link to="/" onClick={scrollToTop} className="flex items-center space-x-4 group">
              <div className="relative">
                <img
                  src={SafarLink_Logo}
                  alt="SafarLink Logo"
                  className="w-14 h-14 rounded-sm object-contain brightness-110 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 border border-[#aa8453]/30 -m-1 group-hover:m-0 transition-all duration-500"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-serif tracking-widest leading-none">SAFARLINK</span>
                <span className="text-[10px] text-[#aa8453] tracking-[0.4em] uppercase mt-1 font-condensed">Ticket Portal</span>
              </div>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed font-light max-w-xs">
              Pakistan's premier unified digital manifest for luxury inter-city travel. Connecting you to a curated network of elite transport operators.
            </p>
            <div className="flex space-x-6">
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
            <h4 className="text-xs tracking-[0.4em] uppercase text-[#aa8453] font-condensed">Navigation</h4>
            <ul className="space-y-6">
              {[
                { name: 'Home', path: '/' },
                { name: 'Bus Tickets', path: '/bus' },
                { name: 'About Safari', path: '/AboutUs' },
                { name: 'Contact Concierge', path: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="text-white/60 hover:text-[#aa8453] text-sm transition-colors duration-300 font-light tracking-wide flex items-center group"
                  >
                    <span className="w-0 group-hover:w-4 h-[1px] bg-[#aa8453] transition-all duration-300 mr-0 group-hover:mr-3"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-10">
            <h4 className="text-xs tracking-[0.4em] uppercase text-[#aa8453] font-condensed">Contact Details</h4>
            <ul className="space-y-8">
              <li className="flex items-start space-x-6 group">
                <div className="w-12 h-12 border border-white/5 flex items-center justify-center text-[#aa8453] group-hover:bg-[#aa8453]/10 transition-colors">
                  <MapPin size={20} strokeWidth={1.5} />
                </div>
                <div className="pt-1">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-condensed mb-1">Corporate Office</p>
                  <p className="text-white/70 text-sm font-light">Gulberg III, Lahore, Pakistan</p>
                </div>
              </li>
              <li className="flex items-start space-x-6 group">
                <div className="w-12 h-12 border border-white/5 flex items-center justify-center text-[#aa8453] group-hover:bg-[#aa8453]/10 transition-colors">
                  <Phone size={20} strokeWidth={1.5} />
                </div>
                <div className="pt-1">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-condensed mb-1">24/7 Helpline</p>
                  <p className="text-white/70 text-sm font-light">+92 300 1234567</p>
                </div>
              </li>
              <li className="flex items-start space-x-6 group">
                <div className="w-12 h-12 border border-white/5 flex items-center justify-center text-[#aa8453] group-hover:bg-[#aa8453]/10 transition-colors">
                  <Mail size={20} strokeWidth={1.5} />
                </div>
                <div className="pt-1">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-condensed mb-1">Digital Mail</p>
                  <p className="text-white/70 text-sm font-light">safarlink0@gmail.com</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="space-y-10">
            <h4 className="text-xs tracking-[0.4em] uppercase text-[#aa8453] font-condensed">Newsletter</h4>
            <p className="text-white/40 text-sm font-light leading-relaxed">
              Subscribe to receive exclusive travel offers and route updates.
            </p>
            <form className="relative flex items-center" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border-b border-white/10 px-2 py-4 pr-10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#aa8453] transition-colors"
                required
              />
              <button
                type="submit"
                className="absolute right-2 text-[#aa8453] hover:text-white transition-colors"
                aria-label="Subscribe"
              >
                <Send size={18} strokeWidth={1.5} />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-around items-center gap-8">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-condensed">
            &copy; {new Date().getFullYear()} SAFARLINK PREMIER PORTAL. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center space-x-12">
            <a href="#" className="text-[10px] text-white/30 hover:text-[#aa8453] uppercase tracking-[0.3em] font-condensed transition-colors">Privacy Policy</a>
            <a href="#" className="text-[10px] text-white/30 hover:text-[#aa8453] uppercase tracking-[0.3em] font-condensed transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
