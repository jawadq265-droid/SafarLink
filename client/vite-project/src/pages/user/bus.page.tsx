import CitySearchInput from '../../components/user/common/city-search-input';
// import FloatingButton from '../../components/user/common/floatingButton'

const BusPage = () => {
    const buses = [
        { id: 1, name: 'Safar Express', from: 'Lahore', to: 'Islamabad', time: '10:00 AM', price: '1500 PKR', seats: 12 },
        { id: 2, name: 'Sky Ways', from: 'Karachi', to: 'Hyderabad', time: '02:00 PM', price: '800 PKR', seats: 25 },
        { id: 3, name: 'Daewoo', from: 'Peshawar', to: 'Rawalpindi', time: '05:00 PM', price: '1200 PKR', seats: 5 },
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Search Section */}
            <div className="bg-sky-600 py-12">
                <div className="container mx-auto px-6">
                    <h1 className="text-3xl font-bold text-white mb-8 text-center">Book Bus Tickets</h1>
                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <CitySearchInput label="From" placeholder="Departure" />
                            </div>
                            <div>
                                <CitySearchInput label="To" placeholder="Arrival" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition" />
                            </div>
                            <div className="flex items-end">
                                <button className="w-full py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 shadow-md transition hover:scale-105">Search Buses</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bus Listings */}
            <div className="container mx-auto px-6 py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Buses</h2>
                <div className="grid gap-6">
                    {buses.map((bus) => (
                        <div key={bus.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition flex flex-col md:flex-row justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-sky-700">{bus.name}</h3>
                                <div className="flex items-center text-gray-600 mt-2">
                                    <span className="font-semibold">{bus.from}</span>
                                    <svg className="w-5 h-5 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    <span className="font-semibold">{bus.to}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Departure: {bus.time}</p>
                            </div>
                            <div className="text-center md:text-right mt-4 md:mt-0">
                                <div className="text-2xl font-bold text-orange-500">{bus.price}</div>
                                <p className="text-sm text-green-600 font-medium mb-3">{bus.seats} seats left</p>
                                <button className="px-6 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition">Book Now</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BusPage;
