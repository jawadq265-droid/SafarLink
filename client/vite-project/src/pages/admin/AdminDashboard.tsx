import React, { useState } from 'react';
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
  Ticket,
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface BusType {
  id: any;
  _id?: string;
  name: string;
  route: string;
  from?: string;
  to?: string;
  time: string;
  status: string;
  seatsLeft: number;
  totalSeats: number;
  price: number;
  image: string;
  busImage?: string;
  isPopular?: boolean;
  operator?: string;
}

interface BookingType {
  id: string;
  userName: string;
  bus: string;
  date: string;
  amount: string;
  phone: string;
  cnic: string;
  seats: string[];
  type: string;
}

interface UserType {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  dateJoined: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();

  const userRole = localStorage.getItem("role") || "user";
  const userEmail = localStorage.getItem("userEmail") || "";
  const userName = localStorage.getItem("userName") || "User";
  const isSuperAdmin = userRole === "superadmin" || userEmail === "superadmin@safarlink.com";

  // State-driven Fleet Matrix connected to MongoDB
  const [buses, setBuses] = useState<BusType[]>(() => {
    const saved = localStorage.getItem("buses");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  const fetchBuses = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
    fetch(`${baseUrl}buses`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.buses)) {
          const formatted = data.buses.map((b: any) => ({
            id: b._id || b.id,
            _id: b._id,
            name: b.name,
            route: b.route,
            from: b.from,
            to: b.to,
            time: b.time,
            status: b.status,
            seatsLeft: b.seatsLeft ?? b.totalSeats ?? 40,
            totalSeats: b.totalSeats ?? 40,
            price: b.price,
            image: b.image,
            busImage: b.busImage,
            isPopular: b.isPopular !== undefined ? b.isPopular : true,
            operator: b.operator || b.name
          }));
          setBuses(formatted);
          localStorage.setItem("buses", JSON.stringify(formatted));
        }
      })
      .catch(err => console.error("Error loading buses from backend:", err));
  };

  React.useEffect(() => {
    fetchBuses();
  }, []);

  React.useEffect(() => {
    localStorage.setItem("buses", JSON.stringify(buses));
  }, [buses]);

  const [bookings, setBookings] = useState<BookingType[]>([]);

  React.useEffect(() => {
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
    fetch(`${baseUrl}payment/bookings`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.bookings)) {
          const formatted = data.bookings.map((b: any) => ({
            id: b.ticketId || b._id,
            userName: b.userName,
            bus: b.bus,
            date: b.date,
            amount: b.amount,
            phone: b.passengerPhone || b.phone,
            cnic: b.passengerCnic || b.cnic,
            seats: b.seats || [],
            type: b.type || 'Upcoming'
          }));
          setBookings(formatted);
        }
      })
      .catch(err => console.error("Error loading real bookings:", err));
  }, []);

  // State-driven Users Directory
  const [usersList, setUsersList] = useState<UserType[]>([
    { id: 'US-001', name: 'Jawad Ahmad', email: 'jawad@example.com', phone: '0300-1234567', role: 'user', dateJoined: '2024-01-15' },
    { id: 'US-002', name: 'Ali Khan', email: 'ali@example.com', phone: '0311-9876543', role: 'user', dateJoined: '2024-02-18' },
    { id: 'US-003', name: 'Sara Malik', email: 'sara@example.com', phone: '0321-5555555', role: 'user', dateJoined: '2024-03-22' },
    { id: 'US-004', name: 'Hamza Sheikh', email: 'hamza@example.com', phone: '0345-6666666', role: 'user', dateJoined: '2024-04-10' },
  ]);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'dashboard' : 'my-bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null);

  // Add Bus Modal states
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [newBusName, setNewBusName] = useState('');
  const [newBusRoute, setNewBusRoute] = useState('');
  const [newBusImage, setNewBusImage] = useState('');
  const [newBusBusImage, setNewBusBusImage] = useState('');
  const [newBusFare, setNewBusFare] = useState('');
  const [newBusCapacity, setNewBusCapacity] = useState('');
  const [newBusTime, setNewBusTime] = useState('');
  const [newBusIsPopular, setNewBusIsPopular] = useState(true);

  // Edit Bus Modal states
  const [editingBus, setEditingBus] = useState<BusType | null>(null);
  const [editBusName, setEditBusName] = useState('');
  const [editBusRoute, setEditBusRoute] = useState('');
  const [editBusImage, setEditBusImage] = useState('');
  const [editBusBusImage, setEditBusBusImage] = useState('');
  const [editBusFare, setEditBusFare] = useState('');
  const [editBusCapacity, setEditBusCapacity] = useState('');
  const [editBusTime, setEditBusTime] = useState('');
  const [editBusStatus, setEditBusStatus] = useState('');
  const [editBusIsPopular, setEditBusIsPopular] = useState(true);

  const stats = [
    { title: 'Total Buses', value: buses.length.toString(), icon: Bus, color: 'bg-[#aa8453]', trend: '+2 this month' },
    { title: 'Total Bookings', value: bookings.length.toString(), icon: Calendar, color: 'bg-[#1b1b1b]', trend: '+12% from last week' },
    { title: 'Total Users', value: usersList.length.toString(), icon: Users, color: 'bg-[#aa8453]', trend: '+4 today' },
    { title: 'Revenue', value: `Rs. ${buses.reduce((acc, curr) => acc + (curr.totalSeats - curr.seatsLeft) * curr.price, 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-[#1b1b1b]', trend: '+8% vs last month' },
  ];

  // Filtering Logic
  const filteredBuses = buses.filter(bus => 
    bus.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    bus.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = isSuperAdmin
    ? bookings.filter(booking => {
        const matchesSearch = booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              booking.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              booking.bus.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = dateFilter ? booking.date === dateFilter : true;
        return matchesSearch && matchesDate;
      })
    : bookings.filter(booking => booking.userName.toLowerCase() === 'you' || booking.userName.toLowerCase() === userName.toLowerCase() || booking.id === 'BK-001');

  const filteredUsers = usersList.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    toast.success("Logged out successfully");
    navigate('/login');
  };

  const handleNewBusImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBusImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewBusBusImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBusBusImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditBusImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditBusImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditBusBusImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditBusBusImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Bus Handler
  const handleAddBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusName || !newBusRoute || !newBusFare || !newBusCapacity || !newBusTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    const parseRouteCities = (routeStr: string) => {
      const parts = routeStr.trim().split(/\s*(?:⇄|↔|⇌|➔|->|-->|–|—|-|\bto\b|\/)\s*/i).filter(Boolean);
      return {
        from: parts[0]?.trim() || "Lahore",
        to: parts[1]?.trim() || "Islamabad"
      };
    };

    const { from: resolvedFrom, to: resolvedTo } = parseRouteCities(newBusRoute);
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
    const payload = {
      name: newBusName.trim(),
      route: newBusRoute.trim(),
      from: resolvedFrom,
      to: resolvedTo,
      time: newBusTime.trim(),
      status: 'Active',
      totalSeats: parseInt(newBusCapacity),
      price: parseInt(newBusFare),
      image: newBusImage || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
      busImage: newBusBusImage || 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
      isPopular: newBusIsPopular
    };

    fetch(`${baseUrl}buses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.bus) {
          toast.success("New route manifest initialized successfully in database");
          fetchBuses();
          setShowAddBusModal(false);
          // Clear inputs
          setNewBusName('');
          setNewBusRoute('');
          setNewBusImage('');
          setNewBusBusImage('');
          setNewBusFare('');
          setNewBusCapacity('');
          setNewBusTime('');
          setNewBusIsPopular(true);
        } else {
          toast.error(data.message || "Failed to add route");
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to add route to database");
      });
  };

  // Open Edit Modal
  const openEditModal = (bus: BusType) => {
    setEditingBus(bus);
    setEditBusName(bus.name);
    setEditBusRoute(bus.route);
    setEditBusImage(bus.image);
    setEditBusBusImage(bus.busImage || '');
    setEditBusFare(bus.price.toString());
    setEditBusCapacity(bus.totalSeats.toString());
    setEditBusTime(bus.time);
    setEditBusStatus(bus.status);
    setEditBusIsPopular(bus.isPopular !== undefined ? bus.isPopular : true);
  };

  // Save Edit Handler
  const handleEditBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBus) return;
    if (!editBusName || !editBusRoute || !editBusFare || !editBusCapacity || !editBusTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    const parseRouteCities = (routeStr: string) => {
      const parts = routeStr.trim().split(/\s*(?:⇄|↔|⇌|➔|->|-->|–|—|-|\bto\b|\/)\s*/i).filter(Boolean);
      return {
        from: parts[0]?.trim() || "Lahore",
        to: parts[1]?.trim() || "Islamabad"
      };
    };

    const { from: resolvedFrom, to: resolvedTo } = parseRouteCities(editBusRoute);
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
    const payload = {
      name: editBusName.trim(),
      route: editBusRoute.trim(),
      from: resolvedFrom,
      to: resolvedTo,
      time: editBusTime.trim(),
      status: editBusStatus,
      totalSeats: parseInt(editBusCapacity),
      price: parseInt(editBusFare),
      image: editBusImage,
      busImage: editBusBusImage,
      isPopular: editBusIsPopular
    };

    fetch(`${baseUrl}buses/${editingBus._id || editingBus.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          toast.success("Route parameters updated in database");
          fetchBuses();
          setEditingBus(null);
        } else {
          toast.error(data.message || "Failed to update route");
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to update route");
      });
  };

  // Delete Bus Handler
  const handleDeleteBus = (id: any) => {
    if (window.confirm("Are you sure you want to retire this route manifest?")) {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
      fetch(`${baseUrl}buses/${id}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            toast.success("Route manifest retired successfully from database");
            fetchBuses();
          } else {
            toast.error(data.message || "Failed to delete route");
          }
        })
        .catch(err => {
          console.error(err);
          toast.error("Failed to delete route");
        });
    }
  };

  // Toggle Popular Route status Handler
  const handleTogglePopular = (bus: BusType) => {
    const targetId = bus._id || bus.id;
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
    fetch(`${baseUrl}buses/${targetId}/toggle-popular`, {
      method: 'PATCH'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          toast.success(data.message || `Route marked as ${data.isPopular ? "Popular" : "Standard"}`);
          fetchBuses();
        } else {
          toast.error(data.message || "Failed to toggle popular status");
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to toggle popular status");
      });
  };

  // Delete User Handler
  const handleDeleteUser = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsersList(usersList.filter(user => user.id !== id));
      toast.success("User removed successfully from directory");
    }
  };

  return (
    <div className="flex h-screen bg-[#fcfaf7] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1b1b1b] flex flex-col z-20 shadow-2xl border-r border-[#aa8453]/20">
        <div className="p-6 border-b border-[#aa8453]/20 bg-[#141414] flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif text-white tracking-tighter">Safar<span className="text-[#aa8453] font-light italic">Link</span></span>
            <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md ${isSuperAdmin ? 'bg-[#aa8453] text-white' : 'bg-white/10 text-gray-300'}`}>
              {isSuperAdmin ? 'Super' : 'Portal'}
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {isSuperAdmin ? (
            <>
              <button
                onClick={() => { setActiveTab('dashboard'); setSearchTerm(''); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-[#aa8453] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <LayoutDashboard size={18} />
                <span className="font-medium text-sm">Overview</span>
              </button>

              <button
                onClick={() => { setActiveTab('buses'); setSearchTerm(''); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'buses' ? 'bg-[#aa8453] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Bus size={18} />
                <span className="font-medium text-sm">Manage Fleet</span>
              </button>

              <button
                onClick={() => { setActiveTab('bookings'); setSearchTerm(''); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'bookings' ? 'bg-[#aa8453] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Calendar size={18} />
                <span className="font-medium text-sm">All Bookings</span>
              </button>

              <button
                onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'users' ? 'bg-[#aa8453] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Users size={18} />
                <span className="font-medium text-sm">User Directory</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setActiveTab('my-bookings'); setSearchTerm(''); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'my-bookings' ? 'bg-[#aa8453] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Ticket size={18} />
                <span className="font-medium text-sm">My Bookings</span>
              </button>
              <Link
                to="/bus"
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-gray-400 hover:bg-white/5 hover:text-white`}
              >
                <Plus size={18} />
                <span className="font-medium text-sm">New Booking</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-[#aa8453]/20 bg-[#141414]">
          <button
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-red-950/40 text-red-400 hover:text-white hover:bg-red-900/60 rounded-xl font-bold transition-all duration-300 shadow-inner"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Header */}
        <header className="sticky top-0 bg-[#fcfaf7]/85 backdrop-blur-md border-b border-[#aa8453]/10 z-10 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {activeTab === 'dashboard' ? (
              <Link to="/" className="flex items-center space-x-2 text-gray-500 hover:text-[#aa8453] transition-colors group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold font-condensed tracking-wider text-[#aa8453] uppercase">Back To Home</span>
              </Link>
            ) : (
              <h1 className="text-2xl font-serif font-black text-gray-800 capitalize tracking-tight">
                {activeTab === 'my-bookings' ? 'My Travel History' : activeTab === 'buses' ? 'Fleet Matrix' : activeTab === 'users' ? 'User Directory' : 'All Bookings'}
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isSuperAdmin && activeTab === 'bookings' && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#aa8453]/20 rounded-full shadow-sm">
                <Filter size={14} className="text-[#aa8453]" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="text-xs font-bold text-gray-600 outline-none border-none bg-transparent"
                />
              </div>
            )}
            <div className="flex items-center space-x-3 ml-4 border-l pl-4 border-gray-200">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-serif font-black shadow-lg bg-[#aa8453]`}>
                {userName.substring(0, 1).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-black text-gray-800 leading-none mb-1">{isSuperAdmin ? 'Super Admin' : 'Active User'}</p>
                <p className="text-[9px] text-[#aa8453] font-bold uppercase tracking-widest">{userEmail}</p>
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
                  <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-[#aa8453]/10 hover:border-[#aa8453]/30 transition-all duration-300 hover:shadow-md group overflow-hidden relative">
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">{stat.title}</p>
                        <h3 className="text-2xl font-serif font-bold text-gray-800">{stat.value}</h3>
                      </div>
                      <div className={`${stat.color} p-3 rounded-2xl text-white group-hover:rotate-6 transition duration-300 shadow-md`}>
                        <stat.icon size={20} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-[10px] relative z-10">
                      <span className="text-[#aa8453] font-black mr-1 uppercase">↑ {stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions & Recent */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Buses Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-[#aa8453]/10 overflow-hidden">
                  <div className="p-6 border-b border-[#aa8453]/10 flex items-center justify-between">
                    <h3 className="text-lg font-serif font-bold text-gray-800">Live Fleet Performance</h3>
                    <button 
                      onClick={() => setActiveTab('buses')}
                      className="flex items-center space-x-1 text-[#aa8453] hover:text-[#8e6d45] font-bold text-xs uppercase tracking-widest"
                    >
                      <span>Full Fleet</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-[10px] font-black text-gray-400 G-100 uppercase tracking-widest bg-[#fcfaf7]/50">
                          <th className="px-6 py-4">Vehicle</th>
                          <th className="px-6 py-4">Availability</th>
                          <th className="px-6 py-4">Condition</th>
                          <th className="px-6 py-4 text-right">Load</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {buses.slice(0, 4).map((bus) => (
                          <tr key={bus.id} className="hover:bg-[#fcfaf7]/40 transition-all group">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${bus.seatsLeft === 0 ? 'bg-red-50 text-red-600' : 'bg-[#aa8453]/10 text-[#aa8453]'}`}>
                                  <Bus size={18} />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-800 text-sm leading-none mb-1">{bus.name}</p>
                                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{bus.route}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-black ${bus.seatsLeft < 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                                  {bus.seatsLeft}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase">Seats Left</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${bus.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                                bus.status === 'On Trip' ? 'bg-amber-50 text-[#aa8453]' :
                                  'bg-red-50 text-red-600'
                                }`}>
                                {bus.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                                <div
                                  className={`h-full transition-all duration-1000 ${bus.seatsLeft === 0 ? 'bg-red-500' : 'bg-[#aa8453]'}`}
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
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#aa8453]/10">
                    <h3 className="text-lg font-serif font-bold text-gray-800 mb-6">Operations</h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowAddBusModal(true)}
                        className="w-full flex items-center justify-center space-x-2 py-4 bg-[#aa8453] text-white rounded-2xl font-bold hover:bg-[#8e6d45] shadow-lg shadow-amber-100 transition-all duration-300"
                      >
                        <Plus size={18} />
                        <span className="text-sm font-condensed tracking-wider uppercase">Register New Vehicle</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('buses')}
                        className="w-full flex items-center justify-center space-x-2 py-4 bg-white border border-[#aa8453]/30 text-gray-700 rounded-2xl font-bold hover:bg-[#fcfaf7] transition-all duration-300"
                      >
                        <Calendar size={18} />
                        <span className="text-sm font-condensed tracking-wider uppercase">Update Schedules</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#1b1b1b] p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden group border border-[#aa8453]/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-all duration-700">
                      <TrendingUp size={120} />
                    </div>
                    <h4 className="text-xl font-serif text-[#aa8453] font-bold mb-2 relative z-10">Neural Sync</h4>
                    <p className="text-xs text-gray-400 mb-8 relative z-10 leading-relaxed">System-wide terminal synchronization is active at 99.9% precision.</p>
                    <div className="flex items-center space-x-3 text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] relative z-10 bg-emerald-400/10 w-fit px-4 py-2 rounded-full border border-emerald-400/20">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div>
                      <span>Live Cloud Matrix Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'buses' && isSuperAdmin && (
            <div className="space-y-8">
              <div className="bg-white rounded-3xl shadow-sm border border-[#aa8453]/10 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-gray-800">Fleet & Route Matrix</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Configure your inter-city network</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search fleet..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-full focus:ring-1 focus:ring-[#aa8453] outline-none w-64 transition-all text-sm font-medium"
                      />
                    </div>
                    <button 
                      onClick={() => setShowAddBusModal(true)}
                      className="flex items-center space-x-2 px-6 py-2 bg-[#aa8453] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#8e6d45] transition-all duration-300 shadow-md"
                    >
                      <Plus size={14} />
                      <span>Add Route</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] bg-[#fcfaf7]/50">
                        <th className="px-8 py-5">Vehicle Image</th>
                        <th className="px-8 py-5">Service Name</th>
                        <th className="px-8 py-5">Route Link</th>
                        <th className="px-8 py-5">Pricing</th>
                        <th className="px-8 py-5">Popular Route</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredBuses.map((bus) => (
                        <tr key={bus.id} className="hover:bg-[#fcfaf7]/20 transition-all group">
                          <td className="px-8 py-6">
                            <div className="w-20 h-14 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                              <img 
                                src={bus.image} 
                                className="w-full h-full object-cover" 
                                alt={bus.name} 
                              />
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="font-bold text-gray-800 text-sm leading-none mb-1">{bus.name}</p>
                            <p className="text-[10px] text-[#aa8453] font-bold uppercase tracking-tighter">Luxury Executive</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <MapPin size={12} className="text-[#aa8453]" />
                              <span className="text-sm font-medium text-gray-700">{bus.route}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="font-bold text-gray-800 tracking-tighter">Rs. {bus.price.toLocaleString()}</span>
                          </td>
                          <td className="px-8 py-6">
                            <button
                              onClick={() => handleTogglePopular(bus)}
                              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-300 border ${
                                bus.isPopular
                                  ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 shadow-sm'
                                  : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                              }`}
                              title="Click to toggle whether this route appears in Popular Routes"
                            >
                              <Star size={12} className={bus.isPopular ? "fill-amber-400 text-amber-500" : "text-gray-300"} />
                              <span>{bus.isPopular ? "Popular" : "Standard"}</span>
                            </button>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              bus.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
                              bus.status === 'On Trip' ? 'bg-amber-50 text-[#aa8453]' :
                              'bg-red-50 text-red-600'
                            }`}>
                              {bus.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={() => handleTogglePopular(bus)}
                                title={bus.isPopular ? "Remove from Popular Routes" : "Promote to Popular Routes"}
                                className={`p-2 rounded-lg transition-all duration-300 ${bus.isPopular ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-gray-50'}`}
                              >
                                <Star size={16} className={bus.isPopular ? "fill-amber-400" : ""} />
                              </button>
                              <button 
                                onClick={() => openEditModal(bus)}
                                className="p-2 text-gray-400 hover:text-[#aa8453] hover:bg-[#aa8453]/10 rounded-lg transition-all duration-300"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteBus(bus._id || bus.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && isSuperAdmin && (
            <div className="bg-white rounded-3xl shadow-sm border border-[#aa8453]/10 overflow-hidden">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-gray-800">User Directory</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage registered passengers</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-full focus:ring-1 focus:ring-[#aa8453] outline-none w-64 transition-all text-sm font-medium"
                  />
                </div>
              </div>
              
              {filteredUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] bg-[#fcfaf7]/50">
                        <th className="px-8 py-5">Name</th>
                        <th className="px-8 py-5">Email</th>
                        <th className="px-8 py-5">Phone</th>
                        <th className="px-8 py-5">Role</th>
                        <th className="px-8 py-5">Date Joined</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-[#fcfaf7]/20 transition-all group">
                          <td className="px-8 py-6 font-bold text-gray-800 text-sm">{user.name}</td>
                          <td className="px-8 py-6 text-sm text-gray-600">{user.email}</td>
                          <td className="px-8 py-6 text-sm text-gray-600">{user.phone}</td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#aa8453]/10 text-[#aa8453]">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-xs text-gray-400">{user.dateJoined}</td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'bookings' || activeTab === 'my-bookings') && (
            <div className="bg-white rounded-3xl shadow-sm border border-[#aa8453]/10 overflow-hidden">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-gray-800">{isSuperAdmin ? 'Fleet Bookings' : 'My Trips'}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Records: {filteredBookings.length}</p>
                </div>
                <div className="flex items-center space-x-4">
                  {isSuperAdmin && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-full focus:ring-1 focus:ring-[#aa8453] outline-none w-64 transition-all text-sm font-medium"
                      />
                    </div>
                  )}
                  {!isSuperAdmin && (
                    <Link to="/bus" className="px-6 py-2 bg-[#aa8453] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#8e6d45] transition-all duration-300 shadow-md">
                      Book New
                    </Link>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] bg-[#fcfaf7]/50">
                      <th className="px-8 py-5">Record ID</th>
                      <th className="px-8 py-5">{isSuperAdmin ? 'Passenger' : 'Service'}</th>
                      <th className="px-8 py-5">Destination / Route</th>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5">Fare</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-[#fcfaf7]/20 transition-all group">
                        <td className="px-8 py-6">
                          <span className="font-bold text-[#aa8453] text-sm tracking-tighter">#{booking.id}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-[#fcfaf7] rounded-2xl flex items-center justify-center text-[#aa8453] font-bold text-lg shadow-inner">
                              {isSuperAdmin ? booking.userName.charAt(0) : <Bus size={18} />}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm leading-none mb-1">{isSuperAdmin ? booking.userName : booking.bus}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                {isSuperAdmin ? 'Registered Client' : 'Premium Service'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <p className="text-sm font-bold text-gray-700 leading-none mb-1">{booking.bus}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Inter-City Link</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="px-3 py-1 bg-gray-100 rounded-lg w-fit">
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{booking.date}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-bold text-gray-800 text-sm tracking-tighter">{booking.amount}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="p-3 text-[#aa8453] hover:bg-[#aa8453]/10 rounded-2xl transition-all duration-300"
                          >
                            <Eye size={18} />
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

      {/* Add Bus Modal */}
      {showAddBusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAddBusModal(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#aa8453]/20 animate-in zoom-in duration-300">
            <div className="bg-[#1b1b1b] p-10 text-white relative border-b border-[#aa8453]/30">
              <button onClick={() => setShowAddBusModal(false)} className="absolute top-8 right-8 w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <X size={20} />
              </button>
              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#aa8453] mb-3">System Configuration</p>
              <h2 className="text-3xl font-serif tracking-tighter">Register New Route</h2>
            </div>
            <form onSubmit={handleAddBus} className="p-10 space-y-6 bg-white max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Service Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Safar Gold" 
                    value={newBusName}
                    onChange={(e) => setNewBusName(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Route Path</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Lahore - Multan" 
                    value={newBusRoute}
                    onChange={(e) => setNewBusRoute(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Route Image (Homepage)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleNewBusImageChange}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Bus Image (Booking Page)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleNewBusBusImageChange}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Fare (Rs.)</label>
                  <input 
                    type="number" 
                    placeholder="1500" 
                    value={newBusFare}
                    onChange={(e) => setNewBusFare(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Capacity</label>
                  <input 
                    type="number" 
                    placeholder="40" 
                    value={newBusCapacity}
                    onChange={(e) => setNewBusCapacity(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Departure Time</label>
                  <input 
                    type="time" 
                    value={newBusTime}
                    onChange={(e) => setNewBusTime(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-2xl">
                <input 
                  type="checkbox" 
                  id="newBusIsPopular" 
                  checked={newBusIsPopular} 
                  onChange={(e) => setNewBusIsPopular(e.target.checked)} 
                  className="w-5 h-5 accent-[#aa8453] cursor-pointer"
                />
                <label htmlFor="newBusIsPopular" className="cursor-pointer text-xs font-bold text-gray-700 flex items-center space-x-2">
                  <Star size={15} className="fill-amber-400 text-amber-500" />
                  <span>Feature in Popular Routes (Showcase on Homepage & Bus Popular Routes)</span>
                </label>
              </div>
              <button 
                type="submit" 
                className="w-full py-5 bg-[#1b1b1b] hover:bg-black text-white font-condensed tracking-widest uppercase text-sm border-none rounded-2xl transition duration-300"
              >
                Initialize Route Manifest
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bus Modal */}
      {editingBus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setEditingBus(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#aa8453]/20 animate-in zoom-in duration-300">
            <div className="bg-[#1b1b1b] p-10 text-white relative border-b border-[#aa8453]/30">
              <button onClick={() => setEditingBus(null)} className="absolute top-8 right-8 w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <X size={20} />
              </button>
              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#aa8453] mb-3">System Modification</p>
              <h2 className="text-3xl font-serif tracking-tighter">Edit Route: {editingBus.name}</h2>
            </div>
            <form onSubmit={handleEditBus} className="p-10 space-y-6 bg-white max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Service Name</label>
                  <input 
                    type="text" 
                    value={editBusName}
                    onChange={(e) => setEditBusName(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Route Path</label>
                  <input 
                    type="text" 
                    value={editBusRoute}
                    onChange={(e) => setEditBusRoute(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Status</label>
                  <select 
                    value={editBusStatus}
                    onChange={(e) => setEditBusStatus(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Route Image (Homepage)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleEditBusImageChange}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Bus Image (Booking Page)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleEditBusBusImageChange}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Fare (Rs.)</label>
                  <input 
                    type="number" 
                    value={editBusFare}
                    onChange={(e) => setEditBusFare(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Capacity</label>
                  <input 
                    type="number" 
                    value={editBusCapacity}
                    onChange={(e) => setEditBusCapacity(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Departure Time</label>
                  <input 
                    type="time" 
                    value={editBusTime}
                    onChange={(e) => setEditBusTime(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-2xl">
                <input 
                  type="checkbox" 
                  id="editBusIsPopular" 
                  checked={editBusIsPopular} 
                  onChange={(e) => setEditBusIsPopular(e.target.checked)} 
                  className="w-5 h-5 accent-[#aa8453] cursor-pointer"
                />
                <label htmlFor="editBusIsPopular" className="cursor-pointer text-xs font-bold text-gray-700 flex items-center space-x-2">
                  <Star size={15} className="fill-amber-400 text-amber-500" />
                  <span>Feature in Popular Routes (Showcase on Homepage & Bus Popular Routes)</span>
                </label>
              </div>
              <button 
                type="submit" 
                className="w-full py-5 bg-[#aa8453] hover:bg-[#8e6d45] text-white font-condensed tracking-widest uppercase text-sm border-none rounded-2xl transition duration-300"
              >
                Apply Manifest Modifications
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedBooking(null)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#aa8453]/20 animate-in zoom-in duration-300">
            <div className="bg-[#1b1b1b] p-10 text-white relative border-b border-[#aa8453]/30">
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-8 right-8 w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 backdrop-blur-md"
              >
                <X size={20} />
              </button>
              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#aa8453] mb-3">Electronic Manifest</p>
              <h2 className="text-3xl font-serif tracking-tighter">{selectedBooking.id}</h2>
            </div>
            <div className="p-10 space-y-8 bg-white">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-300 tracking-[0.2em] mb-1">Passenger</p>
                  <p className="font-bold text-gray-800 text-lg tracking-tight">{isSuperAdmin ? selectedBooking.userName : userName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-300 tracking-[0.2em] mb-1">Identifier</p>
                  <p className="font-bold text-gray-800 text-lg tracking-tight">{selectedBooking.cnic}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-300 tracking-[0.2em] mb-1">Contact</p>
                  <p className="font-bold text-gray-800 text-lg tracking-tight">{selectedBooking.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-300 tracking-[0.2em] mb-1">Total Paid</p>
                  <p className="font-bold text-[#aa8453] text-xl tracking-tighter">{selectedBooking.amount}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-300 tracking-[0.2em] mb-3">Journey Parameters</p>
                <div className="bg-[#fcfaf7] rounded-3xl p-6 flex justify-between items-center shadow-inner border border-[#aa8453]/10">
                  <div>
                    <p className="text-base font-bold text-gray-800 tracking-tight leading-none mb-1">{selectedBooking.bus}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedBooking.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-[#aa8453] tracking-widest mb-1">Seats Allocated</p>
                    <p className="font-bold text-[#aa8453] text-xl tracking-tighter">{selectedBooking.seats.join(", ")}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => toast.success("Downloading ticket manifest...")}
                  className="flex-1 py-4 bg-[#aa8453] text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-[#8e6d45] transition-all duration-300 shadow-md"
                >
                  Download Ticket
                </button>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-gray-200 transition-all duration-300"
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
