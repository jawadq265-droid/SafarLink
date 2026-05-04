import React from 'react';
import { Calendar, MapPin, Clock, CreditCard, ChevronRight, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserActivityPage = () => {
  const previousBookings = [
    {
      id: "BK-7892",
      busName: "Safar Express",
      from: "Lahore",
      to: "Islamabad",
      date: "2024-05-10",
      time: "09:00 AM",
      price: "1500 PKR",
      status: "Upcoming",
      seats: ["A1", "A2"]
    },
    {
      id: "BK-4561",
      busName: "Daewoo Gold",
      from: "Karachi",
      to: "Lahore",
      date: "2024-04-15",
      time: "10:30 PM",
      price: "4500 PKR",
      status: "Completed",
      seats: ["C4"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Activity</h1>
            <p className="text-gray-500 mt-2">Manage and view your previous bus bookings.</p>
          </div>
          <Link 
            to="/bus" 
            className="mt-4 md:mt-0 px-6 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition shadow-lg shadow-sky-100 flex items-center justify-center space-x-2"
          >
            <span>Book New Trip</span>
            <ChevronRight size={18} />
          </Link>
        </div>

        <div className="grid gap-6">
          {previousBookings.length > 0 ? (
            previousBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'Upcoming' ? 'bg-sky-100 text-sky-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {booking.status}
                      </span>
                      <span className="text-sm text-gray-400 flex items-center">
                        <Hash size={14} className="mr-1" />
                        {booking.id}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{booking.busName}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold">Route</p>
                          <p className="text-sm font-semibold text-gray-700">{booking.from} to {booking.to}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold">Date & Time</p>
                          <p className="text-sm font-semibold text-gray-700">{booking.date} at {booking.time}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold">Amount Paid</p>
                          <p className="text-sm font-semibold text-gray-700">{booking.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 md:mt-0 md:ml-8 flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                    <div className="text-center md:text-right mb-4">
                      <p className="text-xs text-gray-400 uppercase font-bold">Seats</p>
                      <p className="text-lg font-bold text-sky-600">{booking.seats.join(", ")}</p>
                    </div>
                    <button className="w-full md:w-auto px-4 py-2 border border-sky-100 text-sky-600 rounded-lg text-sm font-bold hover:bg-sky-50 transition">
                      Download Ticket
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Calendar size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No bookings yet</h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">Your travel history will appear here once you start booking trips with SafarLink.</p>
              <Link 
                to="/bus" 
                className="inline-flex px-8 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition shadow-lg shadow-sky-100"
              >
                Find a Bus
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivityPage;
