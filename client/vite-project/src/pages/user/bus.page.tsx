import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CitySearchInput from '../../components/user/common/city-search-input';
// import FloatingButton from '../../components/user/common/floatingButton'

const BusPage = () => {
    const navigate = useNavigate();
    const [buses] = useState(() => {
        const saved = localStorage.getItem("buses");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return parsed
                    .filter((b: any) => b.status === "Active")
                    .map((b: any) => {
                        const [from, to] = b.route.split(" - ");
                        return {
                            id: b.id,
                            name: b.name,
                            from: from || 'Lahore',
                            to: to || 'Islamabad',
                            time: b.time,
                            price: `Rs. ${b.price}`,
                            seats: b.seatsLeft,
                            backgroundImage: b.busImage || b.image
                        };
                    });
            } catch (e) {
                // ignore
            }
        }
        return [];
    });

    const handleBook = (bus: any) => {
        const token = localStorage.getItem("token");
        if (token) {
            localStorage.setItem("booking_bus", JSON.stringify(bus));
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
                    <p className="text-[10px] text-[#aa8453] tracking-[0.6em] uppercase font-condensed mb-4 text-center">YOUR JOURNEY BEGINS</p>
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-12 text-center">Book Bus Tickets</h1>
                    <div className="luxury-card p-8 max-w-5xl mx-auto rounded-none">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <CitySearchInput label="From" placeholder="Departure" />
                            </div>
                            <div>
                                <CitySearchInput label="To" placeholder="Arrival" />
                            </div>
                            <div>
                                <label className="block text-[10px] tracking-[0.2em] font-condensed uppercase text-gray-500 mb-2">Date</label>
                                <input type="date" className="w-full px-4 py-3 border border-gray-200 focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition rounded-none bg-gray-50" />
                            </div>
                            <div className="flex items-end">
                                <button className="w-full luxury-button !py-4">SEARCH BUSES</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bus Listings */}
            <div className="container mx-auto px-6 py-20">
                <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed mb-2">SELECT YOUR RIDE</p>
                <h2 className="text-4xl font-serif text-gray-900 mb-10">Available Buses</h2>
                <div className="grid gap-6">
                    {buses.map((bus: any) => (
                        <div
                            key={bus.id}
                            className={`relative overflow-hidden luxury-card p-0 flex flex-col md:flex-row justify-between items-stretch ${bus.backgroundImage ? 'text-white' : 'bg-white'}`}
                            style={bus.backgroundImage ? { backgroundImage: `url(${bus.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                        >
                            {bus.backgroundImage && <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 z-0"></div>}

                            <div className="relative z-10 p-8 flex-grow">
                                <h3 className={`text-3xl font-serif ${bus.backgroundImage ? 'text-white' : 'text-gray-900'}`}>{bus.name}</h3>
                                <div className={`flex items-center mt-2 ${bus.backgroundImage ? 'text-gray-100' : 'text-gray-600'}`}>
                                    <span className="font-semibold">{bus.from}</span>
                                    <svg className={`w-5 h-5 mx-2 ${bus.backgroundImage ? 'text-gray-300' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    <span className="font-semibold">{bus.to}</span>
                                </div>
                                <p className={`text-sm mt-1 ${bus.backgroundImage ? 'text-gray-200' : 'text-gray-500'}`}>Departure: {bus.time}</p>
                            </div>
                            <div className="relative z-10 p-8 flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-white/10 md:w-64 backdrop-blur-sm bg-black/10">
                                <p className="text-[10px] text-gray-300 tracking-[0.2em] uppercase font-condensed mb-1">Starting from</p>
                                <div className={`text-3xl font-serif ${bus.backgroundImage ? 'text-white' : 'text-[#aa8453]'}`}>{bus.price}</div>
                                <p className={`text-[10px] tracking-[0.1em] uppercase font-condensed mt-2 mb-6 ${bus.backgroundImage ? 'text-[#aa8453]' : 'text-green-600'}`}>{bus.seats} seats left</p>
                                <button onClick={() => handleBook(bus)} className="luxury-button !px-8 w-full">BOOK NOW</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BusPage;
