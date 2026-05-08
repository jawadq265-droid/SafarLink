import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, MapPin, Bus, Clock, ArrowRight, ShieldCheck, Globe, Star, Search } from 'lucide-react';
import CitySearchInput from '../../components/user/common/city-search-input';
import { useLenis } from '../../lib/lenis';
import { Link } from 'react-router-dom';

const HOME = () => {
  useLenis();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      subtitle: "PAKISTAN'S PREMIER TICKET PORTAL",
      title: "Your Gateway To Every",
      accentTitle: "Destination",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2000&auto=format&fit=crop"
    },
    {
      subtitle: "ALL MAJOR BUS OPERATORS IN ONE PLACE",
      title: "Book Your Journey",
      accentTitle: "Instantly Online",
      image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2000&auto=format&fit=crop"
    }
  ];

  const routes_data = [
    { from: 'Lahore', to: 'Karachi', price: '4500', image: 'https://images.unsplash.com/photo-1596468138838-067a3036495b?q=80&w=1000&auto=format&fit=crop', company: 'Daewoo Express' },
    { from: 'Islamabad', to: 'Lahore', price: '1200', image: 'https://images.unsplash.com/photo-1563297677-4401a89c922a?q=80&w=1000&auto=format&fit=crop', company: 'Faisal Movers' },
    { from: 'Karachi', to: 'Multan', price: '2800', image: 'https://images.unsplash.com/photo-1622320496181-7053e77f00f1?q=80&w=1000&auto=format&fit=crop', company: 'Bilal Travels' },
    { from: 'Peshawar', to: 'Islamabad', price: '800', image: 'https://images.unsplash.com/photo-1627806551676-e9100411a76c?q=80&w=1000&auto=format&fit=crop', company: 'Sania Express' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white">

      {/* Hero Section */}
      <section className="relative h-screen min-h-[850px] flex items-center overflow-hidden bg-[#1b1b1b]">
        {/* Background Animation */}
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-black/70 z-10" />
            <img
              src={heroSlides[currentSlide].image}
              className="w-full h-full object-cover"
              alt="Hero Background"
            />
          </motion.div>
        </AnimatePresence>

        <div className="container mx-auto px-6 relative z-20 -mt-20">
          <div className="max-w-4xl">
            {/* Animated Title & Subtitle Area - Fixed height to prevent jumps */}
            <div className="relative h-[300px] md:h-[400px] flex flex-col justify-end mb-8">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                  className="w-full"
                >
                  <p className="text-[#aa8453] text-xs tracking-[0.6em] uppercase font-condensed mb-6 bg-[#aa8453]/10 inline-block px-4 py-2 border border-[#aa8453]/20">
                    {heroSlides[currentSlide].subtitle}
                  </p>
                  <h1 className="text-6xl md:text-8xl text-white font-serif leading-[1.1]">
                    {heroSlides[currentSlide].title} <br />
                    <span className="italic font-light text-[#aa8453]">{heroSlides[currentSlide].accentTitle}</span>
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Static Content (Remains perfectly in place) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <p className="text-white/60 text-lg md:text-xl font-light max-w-2xl leading-relaxed mb-12">
                We bring together Pakistan's most trusted bus companies. Compare prices, check real-time seat availability, and book your tickets in seconds.
              </p>
              <div className="flex flex-wrap gap-6">
                <button 
                  onClick={() => document.getElementById('popular-routes')?.scrollIntoView({ behavior: 'smooth' })}
                  className="luxury-button !px-12 flex items-center space-x-3"
                >
                  <span>BOOK YOUR TICKET</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-48 pt-80 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 border-l border-t border-[#aa8453]/30 hidden md:block"></div>
            <div className="relative overflow-hidden rounded-sm shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2000&auto=format&fit=crop"
                className="w-full h-[600px] object-cover transition-transform duration-[20s] group-hover:scale-110"
                alt="Bus Terminal"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 border-r border-b border-[#aa8453]/30 hidden md:block"></div>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed">PAKISTAN'S #1 BUS TICKET PORTAL</p>
              <h2 className="text-5xl md:text-6xl font-serif leading-tight">Connecting You to Every Destination</h2>
            </div>
            <p className="text-gray-500 leading-relaxed max-w-xl text-lg">
              SafarLink is your unified digital window to Pakistan's vast bus network. We provide a seamless bridge between you and the country's most reliable transport operators, making travel planning effortless.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="flex items-start space-x-5">
                <div className="p-4 bg-[#fcfbf9] text-[#aa8453] rounded-none border border-gray-100">
                  <Globe size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-serif mb-2">Unified Network</h4>
                  <p className="text-sm text-gray-400 font-light">Access schedules for all major operators in one platform.</p>
                </div>
              </div>
              <div className="flex items-start space-x-5">
                <div className="p-4 bg-[#fcfbf9] text-[#aa8453] rounded-none border border-gray-100">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-serif mb-2">Safe & Secure</h4>
                  <p className="text-sm text-gray-400 font-light">Your data and payments are protected by high-end encryption.</p>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <Link to="/AboutUs"><button className="luxury-button !px-12">LEARN MORE</button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Quote Section */}
      <section className="py-40 bg-[#1b1b1b] text-center px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-serif text-white opacity-[0.01] whitespace-nowrap pointer-events-none">
          SAFARLINK
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <span className="text-[10px] text-[#aa8453] tracking-[0.6em] uppercase mb-10 block">TRUSTED BY MILLIONS</span>
          <h2 className="text-4xl md:text-7xl font-serif text-white italic max-w-4xl mx-auto leading-tight">
            "Your journey matters to us. We ensure every ticket booked is a step towards a safe adventure."
          </h2>
          <div className="mt-12 w-20 h-[1px] bg-[#aa8453] mx-auto"></div>
        </motion.div>
      </section>

      {/* Routes Section - Clean Single Row Card Design */}
      <section id="popular-routes" className="py-32 bg-[#fcfbf9]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20">
            <div className="space-y-4">
              <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed">POPULAR INTER-CITY ROUTES</p>
              <h2 className="text-5xl md:text-6xl font-serif">Plan Your Next Trip</h2>
            </div>
            <button className="text-[#aa8453] text-xs tracking-widest font-condensed flex items-center space-x-3 group uppercase">
              <span>EXPLORE ALL ROUTES</span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {routes_data.map((route, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="luxury-card h-[500px]"
              >
                <img
                  src={route.image}
                  className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
                  alt={route.from}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-center space-x-2 mb-4">
                    <Bus size={12} className="text-[#aa8453]" />
                    <span className="text-[10px] text-[#aa8453] tracking-[0.2em] uppercase font-condensed">{route.company}</span>
                  </div>
                  <h3 className="text-3xl font-serif mb-6">{route.from} <br /> to {route.to}</h3>
                  <div className="flex items-end justify-between border-t border-white/20 pt-6">
                    <div>
                      <p className="text-[10px] text-gray-400 tracking-[0.1em] uppercase font-condensed mb-1">Starting from</p>
                      <p className="text-2xl font-serif">{route.price} <span className="text-xs font-light text-white/50 tracking-normal">PKR</span></p>
                    </div>
                    <button className="w-12 h-12 border border-white/30 rounded-none flex items-center justify-center hover:bg-[#aa8453] hover:border-[#aa8453] transition-all">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="luxury-button !py-3 !px-8 !text-[10px]">BUY TICKET</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
};

export default HOME;