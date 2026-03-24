import CitySearchInput from '../../components/user/common/city-search-input';

const TrainPage = () => {
    const trains = [
        { id: 1, name: 'Green Line', from: 'Karachi', to: 'Rawalpindi', time: '10:00 PM', price: '4500 PKR', seats: 20, backgroundImage: 'https://plus.unsplash.com/premium_photo-1676122795719-6fa9374a46c5?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 2, name: 'Tezgam', from: 'Lahore', to: 'Karachi', time: '06:00 AM', price: '3000 PKR', seats: 45, backgroundImage: 'https://images.unsplash.com/photo-1426086800127-2601510ca027?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 3, name: 'Karakoram Express', from: 'Faisalabad', to: 'Lahore', time: '08:00 AM', price: '800 PKR', seats: 15, backgroundImage: 'https://images.unsplash.com/photo-1515165562839-978bbcf18277?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Search Section */}
            <div className="bg-sky-600 py-12">
                <div className="container mx-auto px-6">
                    <h1 className="text-3xl font-bold text-white mb-8 text-center">Book Train Tickets</h1>
                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <CitySearchInput label="From" placeholder="Departure Station" />
                            </div>
                            <div>
                                <CitySearchInput label="To" placeholder="Arrival Station" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition" />
                            </div>
                            <div className="flex items-end">
                                <button className="w-full py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 shadow-md transition hover:scale-105">Search Trains</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Train Listings */}
            <div className="container mx-auto px-6 py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Trains</h2>
                <div className="grid gap-6">
                    {trains.map((train) => (
                        <div
                            key={train.id}
                            className={`relative overflow-hidden rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition flex flex-col md:flex-row justify-between items-center ${train.backgroundImage ? 'text-white' : 'bg-white'}`}
                            style={train.backgroundImage ? { backgroundImage: `url(${train.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                        >
                            {train.backgroundImage && <div className="absolute inset-0 bg-black/50 z-0"></div>}

                            <div className="relative z-10">
                                <div className="flex items-center gap-3">
                                    <h3 className={`text-xl font-bold ${train.backgroundImage ? 'text-white' : 'text-sky-700'}`}>{train.name}</h3>
                                    <span className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded-full font-bold">AC Business</span>
                                </div>
                                <div className={`flex items-center mt-2 ${train.backgroundImage ? 'text-gray-100' : 'text-gray-600'}`}>
                                    <span className="font-semibold">{train.from}</span>
                                    <svg className={`w-5 h-5 mx-2 ${train.backgroundImage ? 'text-gray-300' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    <span className="font-semibold">{train.to}</span>
                                </div>
                                <p className={`text-sm mt-1 ${train.backgroundImage ? 'text-gray-200' : 'text-gray-500'}`}>Departure: {train.time}</p>
                            </div>
                            <div className="relative z-10 text-center md:text-right mt-4 md:mt-0">
                                <div className={`text-2xl font-bold ${train.backgroundImage ? 'text-orange-400' : 'text-orange-500'}`}>{train.price}</div>
                                <p className={`text-sm font-medium mb-3 ${train.backgroundImage ? 'text-green-300' : 'text-green-600'}`}>{train.seats} seats left</p>
                                <button className="px-6 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition">Book Now</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrainPage;
