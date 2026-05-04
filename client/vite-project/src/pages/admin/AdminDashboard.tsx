import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Bus, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  TrendingUp, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  ChevronRight,
  Filter,
  Eye,
  X,
  Ticket
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const userRole = localStorage.getItem("role") || "user";
  const userEmail = localStorage.getItem("userEmail") || "";
  const userName = localStorage.getItem("userName") || "User";
  const isSuperAdmin = userRole === "superadmin" || userEmail === "superadmin@safarlink.com";

  // If regular user, default to 'my-bookings', else 'dashboard'
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'dashboard' : 'my-bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const stats = [
    { title: 'Total Buses', value: '24', icon: Bus, color: 'bg-blue-500', trend: '+2 this month' },
    { title: 'Total Bookings', value: '1,284', icon: Calendar, color: 'bg-sky-500', trend: '+12% from last week' },
    { title: 'Total Users', value: '850', icon: Users, color: 'bg-indigo-500', trend: '+54 today' },
    { title: 'Revenue', value: '450k PKR', icon: TrendingUp, color: 'bg-emerald-500', trend: '+8% vs last month' },
  ];

  const recentBuses = [
    { id: 1, name: 'Safar Express', route: 'Lahore - Islamabad', time: '08:00 AM', status: 'Active', seatsLeft: 12, totalSeats: 40 },
    { id: 2, name: 'Daewoo Gold', route: 'Karachi - Lahore', time: '10:30 PM', status: 'On Trip', seatsLeft: 5, totalSeats: 45 },
    { id: 3, name: 'Sania Express', route: 'Multan - Lahore', time: '02:15 PM', status: 'Maintenance', seatsLeft: 0, totalSeats: 38 },
    { id: 4, name: 'Bilal Travels', route: 'Peshawar - Rawalpindi', time: '04:00 PM', status: 'Active', seatsLeft: 22, totalSeats: 42 },
  ];

  const allBookings = [
    { id: 'BK-001', userName: 'Jawad Ahmad', bus: 'Safar Express', date: '2024-05-10', amount: '1500 PKR', phone: '0300-1234567', cnic: '35201-0000000-1', seats: ['A1', 'A2'], type: 'Upcoming' },
    { id: 'BK-002', userName: 'Ali Khan', bus: 'Daewoo Gold', date: '2024-05-11', amount: '4500 PKR', phone: '0311-9876543', cnic: '35201-1111111-2', seats: ['C4'], type: 'Upcoming' },
    { id: 'BK-003', userName: 'Sara Malik', bus: 'Sania Express', date: '2024-05-10', amount: '1200 PKR', phone: '0321-5555555', cnic: '35201-2222222-3', seats: ['B10'], type: 'Completed' },
    { id: 'BK-004', userName: 'Hamza Sheikh', bus: 'Bilal Travels', date: '2024-05-12', amount: '3000 PKR', phone: '0345-6666666', cnic: '35201-3333333-4', seats: ['D1', 'D2'], type: 'Upcoming' },
  ];

  // For regular users, we show a subset of bookings (simulated)
  const myBookings = [
    { id: 'BK-001', userName: 'You', bus: 'Safar Express', date: '2024-05-10', amount: '1500 PKR', phone: '0300-1234567', cnic: '35201-0000000-1', seats: ['A1', 'A2'], status: 'Upcoming' },
  ];

  const filteredBookings = isSuperAdmin 
    ? allBookings.filter(booking => {
        const matchesSearch = booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) || booking.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = dateFilter ? booking.date === dateFilter : true;
        return matchesSearch && matchesDate;
      })
    : myBookings;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-20 shadow-xl">
        <div className="p-6 border-b border-gray-100 bg-sky-600">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black text-white tracking-tighter">SafarLink</span>
            <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full ${isSuperAdmin ? 'bg-red-500 text-white' : 'bg-white text-sky-600'}`}>
                {isSuperAdmin ? 'Super' : 'Portal'}
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 mt-4">
          {isSuperAdmin ? (
            <>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <LayoutDashboard size={20} />
                <span className="font-bold text-sm">Overview</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('buses')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${activeTab === 'buses' ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Bus size={20} />
                <span className="font-bold text-sm">Manage Fleet</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${activeTab === 'bookings' ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Calendar size={20} />
                <span className="font-bold text-sm">All Bookings</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${activeTab === 'users' ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Users size={20} />
                <span className="font-bold text-sm">User Directory</span>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setActiveTab('my-bookings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${activeTab === 'my-bookings' ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Ticket size={20} />
                <span className="font-bold text-sm">My Bookings</span>
              </button>
              <Link 
                to="/book-now"
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition text-gray-500 hover:bg-gray-50`}
              >
                <Plus size={20} />
                <span className="font-bold text-sm">New Booking</span>
              </Link>
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <button 
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition shadow-sm shadow-red-50"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-800 capitalize tracking-tight">
            {activeTab === 'my-bookings' ? 'My Travel History' : activeTab}
          </h1>
          
          <div className="flex items-center space-x-4">
            {isSuperAdmin && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search fleet or users..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-sky-500 outline-none w-64 transition-all text-sm font-medium"
                />
              </div>
            )}
            {isSuperAdmin && activeTab === 'bookings' && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-100 rounded-full shadow-sm">
                    <Filter size={16} className="text-gray-400" />
                    <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="text-xs font-bold text-gray-600 outline-none border-none bg-transparent"
                    />
                </div>
            )}
            <div className="flex items-center space-x-3 ml-4 border-l pl-4 border-gray-200">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black shadow-lg ${isSuperAdmin ? 'bg-red-500' : 'bg-sky-500'}`}>
                {userName.substring(0, 1).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-black text-gray-800 leading-none mb-1">{isSuperAdmin ? 'Super Admin' : 'Active User'}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{userEmail}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'dashboard' && isSuperAdmin && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{stat.title}</p>
                        <h3 className="text-3xl font-black text-gray-800">{stat.value}</h3>
                      </div>
                      <div className={`${stat.color} p-3 rounded-2xl text-white group-hover:scale-110 transition shadow-lg`}>
                        <stat.icon size={24} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-[10px] relative z-10">
                      <span className="text-emerald-500 font-black mr-1 uppercase">↑ {stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions & Recent */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Buses Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-lg font-black text-gray-800">Live Fleet Performance</h3>
                    <button className="flex items-center space-x-1 text-sky-600 hover:text-sky-700 font-black text-xs uppercase tracking-widest">
                      <span>Full Fleet</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                          <th className="px-6 py-4">Vehicle</th>
                          <th className="px-6 py-4">Availability</th>
                          <th className="px-6 py-4">Condition</th>
                          <th className="px-6 py-4 text-right">Load</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {recentBuses.map((bus) => (
                          <tr key={bus.id} className="hover:bg-gray-50 transition-all group">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${bus.seatsLeft === 0 ? 'bg-red-50 text-red-600' : 'bg-sky-50 text-sky-600'}`}>
                                  <Bus size={18} />
                                </div>
                                <div>
                                    <p className="font-black text-gray-800 text-sm leading-none mb-1">{bus.name}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">{bus.route}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                    <span className={`text-sm font-black ${bus.seatsLeft < 10 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {bus.seatsLeft}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase">Seats Left</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                bus.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 
                                bus.status === 'On Trip' ? 'bg-sky-100 text-sky-600' : 
                                'bg-orange-100 text-orange-600'
                              }`}>
                                {bus.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${bus.seatsLeft === 0 ? 'bg-red-500' : 'bg-sky-600'}`}
                                        style={{ width: `${((bus.totalSeats - bus.seatsLeft) / bus.totalSeats) * 100}%` }}
                                    ></div>
                                </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-gray-800 mb-6">Operations</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-center space-x-2 py-4 bg-sky-600 text-white rounded-2xl font-black hover:bg-sky-700 shadow-xl shadow-sky-100 transition transform hover:scale-[1.02]">
                        <Plus size={20} />
                        <span className="text-sm">Register New Vehicle</span>
                      </button>
                      <button className="w-full flex items-center justify-center space-x-2 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-black hover:bg-gray-50 transition transform hover:scale-[1.02]">
                        <Calendar size={20} />
                        <span className="text-sm">Update Schedules</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-900 to-black p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-all duration-700">
                        <TrendingUp size={120} />
                    </div>
                    <h4 className="text-xl font-black mb-2 relative z-10">Neural Sync</h4>
                    <p className="text-sm text-gray-400 mb-8 relative z-10 leading-relaxed">System-wide terminal synchronization is active at 99.9% precision.</p>
                    <div className="flex items-center space-x-3 text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] relative z-10 bg-emerald-400/10 w-fit px-4 py-2 rounded-full border border-emerald-400/20">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                        <span>Live Cloud Matrix Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {(activeTab === 'bookings' || activeTab === 'my-bookings') && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-gray-800">{isSuperAdmin ? 'Fleet Bookings' : 'My Trips'}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Records: {filteredBookings.length}</p>
                    </div>
                    {!isSuperAdmin && (
                        <Link to="/bus" className="px-6 py-2 bg-sky-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-sky-700 transition shadow-lg shadow-sky-100">
                            Book New
                        </Link>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] bg-gray-50/50">
                                <th className="px-8 py-5">Record ID</th>
                                <th className="px-8 py-5">{isSuperAdmin ? 'Passenger' : 'Service'}</th>
                                <th className="px-8 py-5">Destination / Route</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">Fare</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-sky-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <span className="font-black text-sky-600 text-sm tracking-tighter">#{booking.id}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black text-lg shadow-inner">
                                                {isSuperAdmin ? booking.userName.charAt(0) : <Bus size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 text-sm leading-none mb-1">{isSuperAdmin ? booking.userName : booking.bus}</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                                                    {isSuperAdmin ? 'Registered Client' : 'Premium Service'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-black text-gray-700 leading-none mb-1">{booking.bus}</p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Inter-City Link</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="px-3 py-1 bg-gray-100 rounded-lg w-fit">
                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">{booking.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-black text-gray-800 text-base tracking-tighter">{booking.amount}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => setSelectedBooking(booking)}
                                            className="p-3 text-sky-600 hover:bg-sky-100 rounded-2xl transition-all transform hover:rotate-12"
                                        >
                                            <Eye size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}
        </div>
      </main>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedBooking(null)}></div>
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-500 border border-white/20">
                <div className="bg-sky-600 p-10 text-white relative">
                    <button 
                        onClick={() => setSelectedBooking(null)}
                        className="absolute top-8 right-8 w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/60 mb-3">Electronic Manifest</p>
                    <h2 className="text-4xl font-black tracking-tighter">{selectedBooking.id}</h2>
                </div>
                <div className="p-10 space-y-10 bg-white">
                    <div className="grid grid-cols-2 gap-10">
                        <div>
                            <p className="text-[10px] uppercase font-black text-gray-300 tracking-[0.2em] mb-2">Passenger</p>
                            <p className="font-black text-gray-800 text-xl tracking-tight">{isSuperAdmin ? selectedBooking.userName : 'You'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-gray-300 tracking-[0.2em] mb-2">Identifier</p>
                            <p className="font-black text-gray-800 text-xl tracking-tight">{selectedBooking.cnic}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-gray-300 tracking-[0.2em] mb-2">Contact</p>
                            <p className="font-black text-gray-800 text-xl tracking-tight">{selectedBooking.phone}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-gray-300 tracking-[0.2em] mb-2">Total Paid</p>
                            <p className="font-black text-sky-600 text-2xl tracking-tighter">{selectedBooking.amount}</p>
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t-2 border-dashed border-gray-100">
                        <p className="text-[10px] uppercase font-black text-gray-300 tracking-[0.2em] mb-5">Journey Parameters</p>
                        <div className="bg-gray-50 rounded-3xl p-6 flex justify-between items-center shadow-inner">
                            <div>
                                <p className="text-lg font-black text-gray-800 tracking-tight leading-none mb-1">{selectedBooking.bus}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedBooking.date}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-black text-sky-400 tracking-widest mb-1">Seats Allocated</p>
                                <p className="font-black text-sky-600 text-2xl tracking-tighter">{selectedBooking.seats.join(", ")}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button 
                            className="flex-1 py-5 bg-sky-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-sky-700 transition shadow-xl shadow-sky-100"
                        >
                            Download Ticket
                        </button>
                        <button 
                            onClick={() => setSelectedBooking(null)}
                            className="px-8 py-5 bg-gray-100 text-gray-400 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-gray-200 hover:text-gray-600 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
