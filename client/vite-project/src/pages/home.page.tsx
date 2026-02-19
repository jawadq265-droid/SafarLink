import { useState, useEffect } from 'react';
import CitySearchInput from '../components/common/city-search-input';
import carousel2 from '../assets/images/carousel2.jpg';
import carousel1 from '../assets/images/carousel1.jpg';

const HOME = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: carousel1,
      title: 'Premium Bus Travel',
      subtitle: 'Experience comfort on the road'
    },
    {
      image: carousel2,
      title: 'Scenic Train Journeys',
      subtitle: 'Discover Pakistan on rails'
    },
    {
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=800&fit=crop', // Travel Vibe
      title: 'Explore New Destinations',
      subtitle: 'Your adventure begins here'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const changeSlide = (direction: number) => {
    setCurrentSlide((prev) => {
      const newSlide = prev + direction;
      if (newSlide >= 3) return 0;
      if (newSlide < 0) return 2;
      return newSlide;
    });
  };


  return (
    <div className="bg-gray-50">

      {/* Hero Carousel */}
      <div className="relative h-[600px] overflow-hidden -mt-20">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/40" /> {/* Overlay for text readability */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-6">
                  <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">{slide.title}</h1>
                  <p className="text-xl md:text-2xl mb-8 opacity-95 drop-shadow-md">{slide.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button
          onClick={() => changeSlide(-1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-sm transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => changeSlide(1)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-sm transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Search Box */}
      <div className="container mx-auto px-6 -mt-24 relative z-30 mb-20">
        <div className="backdrop-blur-md bg-white/95 rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto border border-white/20">
          <div className="flex gap-4 mb-6">
            <button className="flex-1 py-3 bg-sky-600 text-white rounded-lg font-semibold shadow-md">Bus</button>
            <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">Train</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <CitySearchInput label="From" placeholder="Departure City" />
            </div>
            <div>
              <CitySearchInput label="To" placeholder="Arrival City" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition" />
            </div>
            <div className="flex items-end">
              <button className="w-full py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 shadow-md transition hover:scale-105">Search</button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">Next-Gen Travel Platform</h2>
        <p className="text-center text-gray-600 mb-12 text-lg">Technology meets convenience</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-sky-100 transition hover:-translate-y-2">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Mobile First</h3>
            <p className="text-gray-600">Book on-the-go with our intuitive mobile app. Your tickets, always accessible.</p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-cyan-100 transition hover:-translate-y-2">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Real-Time Updates</h3>
            <p className="text-gray-600">Live tracking, instant notifications, and up-to-date schedule information.</p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 transition hover:-translate-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Lightning Fast</h3>
            <p className="text-gray-600">Blazing-fast booking experience with our optimized platform technology.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HOME;