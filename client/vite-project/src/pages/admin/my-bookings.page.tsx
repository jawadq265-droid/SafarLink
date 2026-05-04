const MyBookingsPage = () => {
    const bookings = [
        { id: 101, type: 'Bus', service: 'Safar Express', from: 'Lahore', to: 'Islamabad', date: '2023-10-15', status: 'Completed', price: '1500 PKR' },
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">My Bookings</h1>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {bookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-gray-600 font-semibold">Booking ID</th>
                                        <th className="px-6 py-4 text-gray-600 font-semibold">Type</th>
                                        <th className="px-6 py-4 text-gray-600 font-semibold">Service</th>
                                        <th className="px-6 py-4 text-gray-600 font-semibold">Route</th>
                                        <th className="px-6 py-4 text-gray-600 font-semibold">Date</th>
                                        <th className="px-6 py-4 text-gray-600 font-semibold">Price</th>
                                        <th className="px-6 py-4 text-gray-600 font-semibold">Status</th>
                                        <th className="px-6 py-4 text-gray-600 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-medium text-gray-900">#{booking.id}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${booking.type === 'Bus' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {booking.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{booking.service}</td>
                                            <td className="px-6 py-4 text-gray-700">{booking.from} <span className="text-gray-400">→</span> {booking.to}</td>
                                            <td className="px-6 py-4 text-gray-700">{booking.date}</td>
                                            <td className="px-6 py-4 text-gray-900 font-semibold">{booking.price}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-sky-600 hover:text-sky-800 font-medium text-sm">View Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <p className="text-xl">No bookings found.</p>
                            <button className="mt-4 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition">Book a Trip</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBookingsPage;
