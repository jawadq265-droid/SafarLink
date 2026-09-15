import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import CitySearchInput from '../../components/user/common/city-search-input';

const BusPage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';

    const [fromCity, setFromCity] = useState('');
    const [toCity, setToCity] = useState('');
    const [travelDate, setTravelDate] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const [popularRoutes, setPopularRoutes] = useState<any[]>([]);
    const [buses, setBuses] = useState<any[]>(() => {
        const saved = localStorage.getItem("buses");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return parsed
                    .filter((b: any) => b.status === "Active")
                    .map((b: any) => {
                        const [from, to] = (b.route || "").split(/ - | to | ➔ |->/i);
                        return {
                            id: b._id || b.id,
                            name: b.name,
                            from: b.from || from || 'Lahore',
                            to: b.to || to || 'Islamabad',
                            time: b.time,
                            price: `Rs. ${b.price}`,
                            seats: b.seatsLeft ?? b.totalSeats ?? 30,
                            backgroundImage: b.busImage || b.image
                        };
                    });
            } catch (e) {
                // ignore
            }
        }
        return [];
    });

    const [displayedBuses, setDisplayedBuses] = useState<any[]>(buses);

    // Fetch live popular routes and fleet buses from backend
    useEffect(() => {
        const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";

        fetch(`${baseUrl}buses/popular`)
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.routes)) {
                    setPopularRoutes(data.routes);
                }
            })
            .catch(err => console.error("Error fetching popular routes:", err));

        fetch(`${baseUrl}buses`)
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.buses)) {
                    const formatted = data.buses
                        .filter((b: any) => b.status === "Active")
                        .map((b: any) => {
                            const [from, to] = (b.route || "").split(/ - | to | ➔ |->/i);
                            return {
                                id: b._id || b.id,
                                name: b.name,
                                from: b.from || from || 'Lahore',
                                to: b.to || to || 'Islamabad',
                                time: b.time,
                                price: `Rs. ${b.price}`,
                                seats: b.seatsLeft ?? b.totalSeats ?? 30,
                                backgroundImage: b.busImage || b.image
                            };
                        });
                    setBuses(formatted);
                    if (!hasSearched) {
                        setDisplayedBuses(formatted);
                    }
                }
            })
            .catch(err => console.error("Error fetching fleet buses:", err));
    }, []);

    // Check if query params were passed from homepage (e.g. /bus?from=Lahore&to=Islamabad)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const fromParam = params.get("from");
        const toParam = params.get("to");
        if (fromParam && toParam) {
            setFromCity(fromParam);
            setToCity(toParam);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateStr = tomorrow.toISOString().split('T')[0];
            setTravelDate(dateStr);
            executeSearch(fromParam, toParam, dateStr);
        }
    }, [buses.length]);

    const executeSearch = (from: string, to: string, date: string) => {
        if (!from.trim() || !to.trim() || !date) {
            toast.error("Please enter departure city, arrival city, and select a travel date.");
            return;
        }
        if (from.toLowerCase().trim() === to.toLowerCase().trim()) {
            toast.error("Departure and arrival cities cannot be the same.");
            return;
        }

        // Filter existing buses in database matching this route
        const matches = buses.filter((b: any) => 
            b.from.toLowerCase().trim() === from.toLowerCase().trim() &&
            b.to.toLowerCase().trim() === to.toLowerCase().trim()
        ).map((b: any) => ({
            ...b,
            date: date
        }));

        // Generate recommended buses if fewer than 2 match
        const templates = [
            { name: "Safar Express (Executive)", time: "08:00 AM", priceOffset: 0, seats: 32, image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2000&auto=format&fit=crop" },
            { name: "Daewoo Gold (Premium)", time: "01:30 PM", priceOffset: 450, seats: 18, image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2000&auto=format&fit=crop" },
            { name: "Bilal Travels (Business Class)", time: "06:00 PM", priceOffset: 250, seats: 25, image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2000&auto=format&fit=crop" },
            { name: "Safar Royal (VIP Sleeper)", time: "10:30 PM", priceOffset: 900, seats: 12, image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2000&auto=format&fit=crop" }
        ];

        const generated = matches.length > 0 ? [] : templates.map((tpl, i) => ({
            id: `rec-${i}-${Date.now()}`,
            name: tpl.name,
            from: from.trim(),
            to: to.trim(),
            time: tpl.time,
            price: `Rs. ${1600 + tpl.priceOffset}`,
            seats: tpl.seats,
            backgroundImage: tpl.image,
            date: date,
            isRecommended: true
        }));

        setDisplayedBuses([...matches, ...generated]);
        setHasSearched(true);
    };

    const handleSearch = () => {
        executeSearch(fromCity, toCity, travelDate);
    };

    const handleRouteClick = (from: string, to: string) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        setFromCity(from);
        setToCity(to);
        setTravelDate(dateStr);

        executeSearch(from, to, dateStr);

        // Smooth scroll to listings
        setTimeout(() => {
            document.getElementById('bus-listings')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleBook = (bus: any) => {
        const token = localStorage.getItem("token");
        if (token) {
            localStorage.setItem("booking_bus", JSON.stringify({
                ...bus,
                date: bus.date || travelDate
            }));
            navigate("/book-now");
        } else {
            navigate("/login");
        }
    };

    return (
        <div className="bg-[#fcfbf9] min-h-screen">
            {/* Search Section */}
            <div className="bg-[#1b1b1b] py-24 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-serif text-white opacity-[0.02] whitespace-nowrap pointer-events-none">
                    SAFARLINK
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <p className="text-[10px] text-[#aa8453] tracking-[0.6em] uppercase font-condensed mb-4 text-center">{t('bus.journey_begins')}</p>
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-12 text-center">{t('bus.book_tickets')}</h1>
                    <div className="luxury-card p-8 max-w-5xl mx-auto rounded-none">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <CitySearchInput 
                                    label={t('bus.from')} 
                                    placeholder={t('bus.departure')} 
                                    value={fromCity} 
                                    onChange={setFromCity} 
                                />
                            </div>
                            <div>
                                <CitySearchInput 
                                    label={t('bus.to')} 
                                    placeholder={t('bus.arrival')} 
                                    value={toCity} 
                                    onChange={setToCity} 
                                />
                            </div>
                            <div className="relative group">
                                <label className="block text-[10px] text-[#aa8453] tracking-[0.4em] uppercase font-condensed mb-3 ml-1">{t('bus.date')}</label>
                                <input 
                                    type="date" 
                                    value={travelDate}
                                    onChange={(e) => setTravelDate(e.target.value)}
                                    className="w-full px-5 py-5 bg-white border-b border-gray-300 group-focus-within:border-[#aa8453] outline-none transition-all duration-500 font-serif text-lg text-gray-800 placeholder:text-gray-300 placeholder:font-light" 
                                />
                            </div>
                            <div className="flex flex-col justify-end">
                                <label className="block text-[10px] tracking-[0.4em] uppercase font-condensed mb-3 ml-1 invisible">{t('bus.search_buses')}</label>
                                <button onClick={handleSearch} className="w-full luxury-button !py-5">{t('bus.search_buses')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular Routes Section (Only shown before search) */}
            {!hasSearched && popularRoutes.length > 0 && (
                <div className="container mx-auto px-6 pt-20 pb-10">
                    <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed mb-2">Our Most Booked</p>
                    <h2 className="text-4xl font-serif text-gray-900 mb-10">Popular Routes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {popularRoutes.map((route, i) => (
                            <div 
                                key={route._id || i}
                                onClick={() => handleRouteClick(route.from, route.to)}
                                className="luxury-card cursor-pointer h-[320px] relative overflow-hidden group/route border border-gray-100/50 hover:border-[#aa8453]/40 transition-all duration-500 p-0"
                            >
                                <div className="absolute inset-0 bg-black/60 group-hover/route:bg-black/50 transition-colors duration-500 z-10"></div>
                                <img
                                    src={route.image}
                                    className="w-full h-full object-cover transition-transform duration-[8s] group-hover/route:scale-105"
                                    alt={`${route.from} to ${route.to}`}
                                />
                                <div className="absolute inset-0 p-8 flex flex-col justify-between z-20 text-white">
                                    <span className="text-[9px] text-[#aa8453] tracking-[0.2em] uppercase font-condensed font-semibold">
                                        {route.operator || route.name}
                                    </span>
                                    <div>
                                        <h3 className="text-2xl font-serif mb-1 group-hover/route:text-[#aa8453] transition-colors">
                                            {route.from} ➔ {route.to}
                                        </h3>
                                        <p className="text-xs text-gray-300 font-light font-condensed uppercase tracking-wider">
                                            Starting Fare: <span className="text-white font-serif font-bold text-sm ml-1">Rs. {route.price}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bus Listings */}
            <div id="bus-listings" className="container mx-auto px-6 py-20">
                <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed mb-2">
                    {hasSearched ? t('bus.select_ride') : 'EXPLORE FLEET'}
                </p>
                <h2 className="text-4xl font-serif text-gray-900 mb-10">
                    {hasSearched ? `${t('bus.available_buses')} (${fromCity} ➔ ${toCity})` : t('bus.available_buses')}
                </h2>
                <div className="grid gap-6">
                    {displayedBuses.length > 0 ? (
                        displayedBuses.map((bus: any) => (
                            <div
                                key={bus.id}
                                className={`relative overflow-hidden luxury-card p-0 flex flex-col md:flex-row justify-between items-stretch ${bus.backgroundImage ? 'text-white border-none' : 'bg-white border border-gray-100'}`}
                                style={bus.backgroundImage ? { backgroundImage: `url(${bus.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                            >
                                {bus.backgroundImage && <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 z-0"></div>}

                                {bus.isRecommended && (
                                    <div className="absolute top-4 right-4 z-20 bg-[#aa8453] text-white text-[9px] tracking-[0.2em] font-condensed uppercase px-3 py-1 font-bold shadow-md">
                                        {t('bus.recommended') || 'RECOMMENDED'}
                                    </div>
                                )}

                                <div className="relative z-10 p-8 flex-grow">
                                    <h3 className={`text-3xl font-serif ${bus.backgroundImage ? 'text-white' : 'text-gray-900'}`}>{bus.name}</h3>
                                    <div className={`flex items-center mt-2 ${bus.backgroundImage ? 'text-gray-100' : 'text-gray-600'}`}>
                                        <span className="font-semibold">{bus.from}</span>
                                        <svg className={`w-5 h-5 mx-2 rtl:rotate-180 ${bus.backgroundImage ? 'text-gray-300' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        <span className="font-semibold">{bus.to}</span>
                                    </div>
                                    <p className={`text-sm mt-1 ${bus.backgroundImage ? 'text-gray-200' : 'text-gray-500'}`}>{t('bus.departure_label')}: {bus.time}</p>
                                </div>
                                <div className="relative z-10 p-8 flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-s border-white/10 md:w-64 backdrop-blur-sm bg-black/10">
                                    <p className="text-[10px] text-gray-300 tracking-[0.2em] uppercase font-condensed mb-1">{t('bus.starting_from')}</p>
                                    <div className={`text-3xl font-serif ${bus.backgroundImage ? 'text-white' : 'text-[#aa8453]'}`}>{bus.price}</div>
                                    <p className={`text-[10px] tracking-[0.1em] uppercase font-condensed mt-2 mb-6 ${bus.backgroundImage ? 'text-[#aa8453]' : 'text-green-600'}`}>{bus.seats} {t('bus.seats_left')}</p>
                                    <button onClick={() => handleBook(bus)} className="luxury-button !px-8 w-full">{t('bus.book_now')}</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white border border-gray-100">
                            <p className="text-gray-400 font-serif text-lg">No buses found. Please search for a route above.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusPage;
