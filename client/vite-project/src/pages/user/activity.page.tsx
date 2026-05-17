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
    <div className="min-h-screen bg-[#fcfbf9] pt-32 pb-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed mb-2">YOUR JOURNEYS</p>
            <h1 className="text-4xl font-serif text-gray-900">My Activity</h1>
            <p className="text-gray-500 mt-3 font-light">Manage and view your previous bus bookings.</p>
          </div>
          <Link 
            to="/bus" 
            className="mt-6 md:mt-0 luxury-button flex items-center justify-center space-x-2"
          >
            <span>BOOK NEW TRIP</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid gap-6">
          {previousBookings.length > 0 ? (
            previousBookings.map((booking) => (
              <div key={booking.id} className="luxury-card p-8">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-6">
                      <span className={`px-4 py-1 text-[10px] tracking-[0.2em] uppercase font-condensed border ${
                        booking.status === 'Upcoming' ? 'bg-[#aa8453]/10 text-[#aa8453] border-[#aa8453]/20' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {booking.status}
                      </span>
                      <span className="text-sm text-gray-400 flex items-center">
                        <Hash size={14} className="mr-1" />
                        {booking.id}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-serif text-gray-900 mb-6">{booking.busName}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-start space-x-3">
                        <div className="p-3 bg-[#fcfbf9] border border-gray-100 text-[#aa8453]">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-condensed mb-1">Route</p>
                          <p className="text-sm font-medium text-gray-800">{booking.from} to {booking.to}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="p-3 bg-[#fcfbf9] border border-gray-100 text-[#aa8453]">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-condensed mb-1">Date & Time</p>
                          <p className="text-sm font-medium text-gray-800">{booking.date} at {booking.time}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="p-3 bg-[#fcfbf9] border border-gray-100 text-[#aa8453]">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-condensed mb-1">Amount Paid</p>
                          <p className="text-sm font-medium text-gray-800">{booking.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 md:mt-0 md:ml-8 flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-gray-100 pt-8 md:pt-0 md:pl-12 md:w-64">
                    <div className="text-center md:text-right mb-6">
                      <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-condensed mb-1">Seats</p>
                      <p className="text-2xl font-serif text-[#aa8453]">{booking.seats.join(", ")}</p>
                    </div>
                    <button className="luxury-button-outline w-full !px-4">
                      DOWNLOAD TICKET
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="luxury-card p-20 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-[#fcfbf9] border border-[#aa8453]/20 flex items-center justify-center mx-auto mb-8 text-[#aa8453]">
                <Calendar size={40} strokeWidth={1} />
              </div>
              <h2 className="text-3xl font-serif text-gray-900 mb-4">No bookings yet</h2>
              <p className="text-gray-500 mb-10 max-w-md mx-auto font-light leading-relaxed">Your travel history will appear here once you start booking trips with SafarLink.</p>
              <Link 
                to="/bus" 
                className="luxury-button"
              >
                FIND A BUS
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivityPage;
