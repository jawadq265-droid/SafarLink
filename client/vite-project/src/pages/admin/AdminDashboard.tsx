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
  Star,
  Download,
  Share2,
  ShieldCheck,
  QrCode,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { downloadTicketPDF, shareTicketPDF, formatVoyageDate } from '../../utils/ticket-pdf';

// Robust bus time helpers for runtime departure countdowns
export const parseBusTime = (timeStr?: string) => {
  if (!timeStr) return { hours: 10, minutes: 0 };
  const str = timeStr.trim();
  const match = str.match(/^(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?/);
  if (!match) return { hours: 10, minutes: 0 };

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const mer = match[3]?.toUpperCase();

  if (mer === 'PM' && hours < 12) hours += 12;
  if (mer === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
};

export const formatTime12h = (hours: number, minutes: number) => {
  const mer = hours >= 12 ? 'PM' : 'AM';
  let h = hours % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${mer}`;
};

export const advanceTime1h = (timeStr?: string) => {
  const { hours, minutes } = parseBusTime(timeStr);
  const nextHours = (hours + 1) % 24;
  return formatTime12h(nextHours, minutes);
};

export const toTimeInputValue = (timeStr?: string) => {
  if (!timeStr) return "10:00";
  const { hours, minutes } = parseBusTime(timeStr);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const formatDisplayDepartureTime = (timeStr?: string) => {
  if (!timeStr) return "10:00 AM";
  const { hours, minutes } = parseBusTime(timeStr);
  return formatTime12h(hours, minutes);
};

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
  status?: string;
  routeFrom?: string;
  routeTo?: string;
  departureTime?: string;
  passengerEmail?: string;
  refundAmount?: number;
  refundPercentage?: number;
  refundStatus?: string;
  cancelledAt?: string;
  boardedAt?: string;
  qrCodeDataUrl?: string;
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

  // Live Runtime Clock for Fleet Departure Countdowns
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const lastProcessedHourRef = React.useRef<number>(new Date().getHours());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // 1-second precision runtime update
    return () => clearInterval(timer);
  }, []);

  // Track which departures have already completed rollover to prevent duplicate triggers
  const lastProcessedDepartureRef = React.useRef<{ [busId: string]: string }>({});

  // Single bus departure rollover: when remaining time reaches 0, that specific bus departs,
  // its seats reset to full capacity, and next departure time is scheduled 1 hour later
  const handleSingleBusDepartureRollover = async (bus: BusType) => {
    const nextTime = advanceTime1h(bus.time);
    const busId = bus._id || bus.id;

    // 1. Immediately update local state so UI updates in real-time
    setBuses((prevBuses) =>
      prevBuses.map((b) =>
        (b._id === busId || b.id === busId)
          ? {
              ...b,
              seatsLeft: b.totalSeats || 40,
              time: nextTime
            }
          : b
      )
    );

    // 2. Persist to MongoDB backend
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
      await fetch(`${baseUrl}buses/${busId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seatsLeft: bus.totalSeats || 40,
          time: nextTime
        })
      });
    } catch (err) {
      console.error(`Failed to sync departure rollover for ${bus.name}:`, err);
    }

    toast.success(
      `${bus.name} (${bus.route}) has departed! New bus arrived at station. Seats reset for ${nextTime} departure.`,
      { icon: "🚌", duration: 6000 }
    );
  };

  // Monitor each bus's departure countdown at runtime
  React.useEffect(() => {
    buses.forEach((bus) => {
      const busId = bus._id || bus.id;
      if (!busId) return;

      const { hours, minutes } = parseBusTime(bus.time);
      const targetDate = new Date(
        currentTime.getFullYear(),
        currentTime.getMonth(),
        currentTime.getDate(),
        hours,
        minutes,
        0,
        0
      );

      const diffMs = targetDate.getTime() - currentTime.getTime();

      // If departure countdown reached 0 (diff <= 0) within the last 5 minutes, trigger single bus rollover
      if (diffMs <= 0 && diffMs > -300000) {
        const departureKey = `${busId}_${bus.time}`;
        if (lastProcessedDepartureRef.current[busId] !== departureKey) {
          lastProcessedDepartureRef.current[busId] = departureKey;
          handleSingleBusDepartureRollover(bus);
        }
      }
    });
  }, [currentTime, buses]);

  // Helper to compute runtime departure countdown for each bus using its selected departure time
  const getBusDepartureRuntime = (bus: BusType) => {
    const { hours, minutes } = parseBusTime(bus.time);
    let target = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      hours,
      minutes,
      0,
      0
    );

    // If scheduled departure passed more than 5 minutes ago (e.g. from earlier today),
    // catch it up to the current active hourly dispatch slot:
    if (currentTime.getTime() - target.getTime() > 300000) {
      const elapsedHours = Math.floor((currentTime.getTime() - target.getTime()) / (3600 * 1000));
      target.setHours(target.getHours() + elapsedHours + 1);
    }

    const diffMs = target.getTime() - currentTime.getTime();
    const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
    const hoursLeft = Math.floor(totalSecs / 3600);
    const minsLeft = Math.floor((totalSecs % 3600) / 60);
    const secsLeft = totalSecs % 60;

    const formattedTime = formatTime12h(target.getHours(), target.getMinutes());

    let displayCountdown = "";
    if (totalSecs === 0) {
      displayCountdown = "Departing now";
    } else if (hoursLeft > 0) {
      displayCountdown = minsLeft > 0 ? `${hoursLeft}h ${minsLeft}m left` : `${hoursLeft}h left`;
    } else if (minsLeft > 0) {
      displayCountdown = `${minsLeft}m left`;
    } else {
      displayCountdown = `${secsLeft}s left`;
    }

    return {
      formattedTime,
      minsLeft,
      secsLeft,
      displayCountdown
    };
  };

  const [bookings, setBookings] = useState<BookingType[]>([]);

  const fetchBookings = () => {
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
            type: b.type || 'Upcoming',
            status: b.status || b.type || 'Upcoming',
            routeFrom: b.routeFrom,
            routeTo: b.routeTo,
            departureTime: b.departureTime,
            passengerEmail: b.passengerEmail,
            refundAmount: b.refundAmount,
            refundPercentage: b.refundPercentage,
            refundStatus: b.refundStatus,
            cancelledAt: b.cancelledAt,
            boardedAt: b.boardedAt,
            qrCodeDataUrl: b.qrCodeDataUrl
          }));
          setBookings(formatted);
        }
      })
      .catch(err => console.error("Error loading real bookings:", err));
  };

  React.useEffect(() => {
    fetchBookings();
  }, []);

  const handleAdminCancelBooking = async (booking: BookingType) => {
    if (!window.confirm(`Are you sure you want to cancel Ticket #${booking.id} and process customer refund?`)) {
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
      const res = await fetch(`${baseUrl}payment/cancel-booking/${encodeURIComponent(booking.id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Cancelled by Admin via Management Dashboard" })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Booking cancelled and refund processed");
        fetchBookings();
        fetchBuses();
        setSelectedBooking(null);
      } else {
        toast.error(data.message || "Failed to cancel booking");
      }
    } catch (err) {
      toast.error("Failed to connect to cancellation gateway");
    }
  };

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

  // Helper to compute dynamic booked seat metrics and load percentage for each bus
  const getBusSeatMetrics = (bus: BusType) => {
    const matchingBookings = bookings.filter(b => 
      b.bus && (
        b.bus.trim().toLowerCase().includes(bus.name.trim().toLowerCase()) || 
        bus.name.trim().toLowerCase().includes(b.bus.trim().toLowerCase())
      )
    );

    const bookedSeatSet = new Set<string>();
    matchingBookings.forEach(b => {
      if (Array.isArray(b.seats)) {
        b.seats.forEach((s: any) => bookedSeatSet.add(String(s)));
      }
    });

    const bookedCount = bookedSeatSet.size;
    const effectiveSeatsLeft = bookedCount > 0 
      ? Math.max(0, (bus.totalSeats || 40) - bookedCount)
      : (bus.seatsLeft ?? bus.totalSeats ?? 40);

    const loadPercent = Math.min(100, Math.round(((bus.totalSeats - effectiveSeatsLeft) / (bus.totalSeats || 40)) * 100));

    return {
      bookedCount,
      effectiveSeatsLeft,
      loadPercent
    };
  };

  const stats = [
    { title: 'Total Buses', value: buses.length.toString(), icon: Bus, color: 'bg-[#aa8453]', trend: '+2 this month' },
    { title: 'Total Bookings', value: bookings.length.toString(), icon: Calendar, color: 'bg-[#1b1b1b]', trend: '+12% from last week' },
    { title: 'Total Users', value: usersList.length.toString(), icon: Users, color: 'bg-[#aa8453]', trend: '+4 today' },
    { title: 'Revenue', value: `Rs. ${buses.reduce((acc, curr) => {
        const { effectiveSeatsLeft } = getBusSeatMetrics(curr);
        return acc + (curr.totalSeats - effectiveSeatsLeft) * curr.price;
      }, 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-[#1b1b1b]', trend: '+8% vs last month' },
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
      time: formatDisplayDepartureTime(newBusTime),
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
        if (data.success) {
          toast.success("New route deployed to fleet");
          fetchBuses();
          setShowAddBusModal(false);
          setNewBusName('');
          setNewBusRoute('');
          setNewBusFare('');
          setNewBusCapacity('');
          setNewBusImage('');
          setNewBusBusImage('');
          setNewBusTime('');
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
    setEditBusTime(toTimeInputValue(bus.time));
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
      time: formatDisplayDepartureTime(editBusTime),
      status: "Active",
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

  // Download Ticket PDF from Admin / User Manifest
  const handleDownloadAdminTicket = (booking: BookingType) => {
    let from = booking.routeFrom;
    let to = booking.routeTo;
    if (!from || !to) {
      const parts = (booking.bus || "").split(/\s*(?:⇄|↔|⇌|➔|->|-->|–|—|-|\bto\b|\/)\s*/i).filter(Boolean);
      if (parts.length >= 2) {
        from = parts[0].trim();
        to = parts[1].trim();
      } else {
        from = "Lahore";
        to = "Islamabad";
      }
    }

    downloadTicketPDF({
      passengerName: isSuperAdmin ? booking.userName : userName,
      phone: booking.phone,
      cnic: booking.cnic,
      email: booking.passengerEmail || userEmail,
      ticketId: booking.id,
      busName: booking.bus,
      routeFrom: from,
      routeTo: to,
      date: booking.date,
      time: booking.departureTime || "08:00 AM",
      seats: Array.isArray(booking.seats) ? booking.seats.join(", ") : String(booking.seats || "Single Seat"),
      amount: booking.amount
    });
  };

  // Share Ticket PDF via Web Share / WhatsApp fallback
  const handleShareAdminTicket = async (booking: BookingType) => {
    let from = booking.routeFrom;
    let to = booking.routeTo;
    if (!from || !to) {
      const parts = (booking.bus || "").split(/\s*(?:⇄|↔|⇌|➔|->|-->|–|—|-|\bto\b|\/)\s*/i).filter(Boolean);
      if (parts.length >= 2) {
        from = parts[0].trim();
        to = parts[1].trim();
      } else {
        from = "Lahore";
        to = "Islamabad";
      }
    }

    await shareTicketPDF({
      passengerName: isSuperAdmin ? booking.userName : userName,
      phone: booking.phone,
      cnic: booking.cnic,
      email: booking.passengerEmail || userEmail,
      ticketId: booking.id,
      busName: booking.bus,
      routeFrom: from,
      routeTo: to,
      date: booking.date,
      time: booking.departureTime || "08:00 AM",
      seats: Array.isArray(booking.seats) ? booking.seats.join(", ") : String(booking.seats || "Single Seat"),
      amount: booking.amount
    });
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

              <Link
                to="/verify-ticket"
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-gray-400 hover:bg-white/5 hover:text-white`}
              >
                <ShieldCheck size={18} className="text-[#aa8453]" />
                <span className="font-medium text-sm">QR Ticket Scanner</span>
              </Link>
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
                to="/verify-ticket"
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-gray-400 hover:bg-white/5 hover:text-white`}
              >
                <ShieldCheck size={18} className="text-[#aa8453]" />
                <span className="font-medium text-sm">Verify Ticket QR</span>
              </Link>
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
                  <div className="p-6 border-b border-[#aa8453]/10 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-serif font-bold text-gray-800">Live Fleet Performance</h3>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold tracking-wider uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>1h Dispatch Cycle</span>
                      </span>
                      <button 
                        onClick={() => setActiveTab('buses')}
                        className="flex items-center space-x-1 text-[#aa8453] hover:text-[#8e6d45] font-bold text-xs uppercase tracking-widest"
                      >
                        <span>Full Fleet</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest bg-[#fcfaf7]/50">
                          <th className="px-6 py-4">Vehicle</th>
                          <th className="px-6 py-4">Availability</th>
                          <th className="px-6 py-4">Departure Time</th>
                          <th className="px-6 py-4 text-right">Load</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {buses.slice(0, 4).map((bus) => {
                          const depRuntime = getBusDepartureRuntime(bus);
                          const { effectiveSeatsLeft, loadPercent } = getBusSeatMetrics(bus);
                          return (
                            <tr key={bus.id || bus._id} className="hover:bg-[#fcfaf7]/40 transition-all group">
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${effectiveSeatsLeft === 0 ? 'bg-red-50 text-red-600' : 'bg-[#aa8453]/10 text-[#aa8453]'}`}>
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
                                  <span className={`text-sm font-black ${effectiveSeatsLeft < 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {effectiveSeatsLeft}
                                  </span>
                                  <span className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase">Seats Left</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2.5">
                                  <div className="p-1.5 bg-[#aa8453]/10 text-[#aa8453] rounded-lg">
                                    <Clock size={14} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-gray-800 leading-none mb-1">{depRuntime.formattedTime}</p>
                                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-amber-50 text-[#aa8453] border border-[#aa8453]/20 animate-pulse">
                                      {depRuntime.displayCountdown}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end space-x-3">
                                  <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                                    <div
                                      className={`h-full transition-all duration-1000 ${effectiveSeatsLeft === 0 ? 'bg-red-500' : 'bg-[#aa8453]'}`}
                                      style={{ width: `${loadPercent}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[10px] font-black text-gray-600 w-8 text-right">{loadPercent}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
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
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBookings.map((booking) => {
                      const isCancelled = booking.status === 'Cancelled' || booking.status === 'Refunded';
                      const isBoarded = booking.status === 'Boarded';
                      return (
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
                          <td className="px-8 py-6">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCancelled
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : isBoarded
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {booking.status || 'Upcoming'}
                            </span>
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
                      );
                    })}
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
              <div className="grid grid-cols-2 gap-6">
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
            <div className="bg-[#1b1b1b] p-8 text-white relative border-b border-[#aa8453]/30">
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-8 right-8 w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 backdrop-blur-md"
              >
                <X size={20} />
              </button>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#aa8453]">Electronic Manifest</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  selectedBooking.status === 'Cancelled' || selectedBooking.status === 'Refunded'
                    ? 'bg-red-500 text-white'
                    : selectedBooking.status === 'Boarded'
                      ? 'bg-blue-500 text-white'
                      : 'bg-emerald-500 text-white'
                }`}>
                  {selectedBooking.status || 'Upcoming'}
                </span>
              </div>
              <h2 className="text-3xl font-serif tracking-tighter">{selectedBooking.id}</h2>
            </div>
            <div className="p-8 space-y-6 bg-white max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-1">Passenger</p>
                  <p className="font-bold text-gray-800 text-base tracking-tight">{isSuperAdmin ? selectedBooking.userName : userName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-1">Identifier</p>
                  <p className="font-bold text-gray-800 text-base tracking-tight">{selectedBooking.cnic}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-1">Contact</p>
                  <p className="font-bold text-gray-800 text-base tracking-tight">{selectedBooking.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-1">Total Paid</p>
                  <p className="font-bold text-[#aa8453] text-lg tracking-tighter">{selectedBooking.amount}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-2">Journey Parameters</p>
                <div className="bg-[#fcfaf7] rounded-2xl p-5 flex justify-between items-center shadow-inner border border-[#aa8453]/10">
                  <div>
                    <p className="text-base font-bold text-gray-800 tracking-tight leading-none mb-1">{selectedBooking.bus}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatVoyageDate(selectedBooking.date)} at {selectedBooking.departureTime || '08:00 AM'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-[#aa8453] tracking-widest mb-1">Seats Allocated</p>
                    <p className="font-bold text-[#aa8453] text-lg tracking-tighter">{selectedBooking.seats.join(", ")}</p>
                  </div>
                </div>
              </div>

              {/* Cancellation & Refund Info if Cancelled */}
              {(selectedBooking.status === 'Cancelled' || selectedBooking.status === 'Refunded') && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs space-y-1">
                  <p className="font-bold flex items-center">
                    <AlertTriangle size={14} className="mr-1.5 text-red-600" />
                    Booking Cancelled
                  </p>
                  <p>Refund Processed: <strong>Rs. {selectedBooking.refundAmount?.toLocaleString() || 0}</strong> ({selectedBooking.refundPercentage || 0}% tier).</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleDownloadAdminTicket(selectedBooking)}
                    className="flex-1 py-3.5 px-3 bg-[#aa8453] text-white rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-[#8e6d45] transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                  >
                    <Download size={15} />
                    <span>Download PDF</span>
                  </button>

                  <Link
                    to={`/verify-ticket?id=${encodeURIComponent(selectedBooking.id)}`}
                    target="_blank"
                    className="py-3.5 px-4 bg-gray-900 text-white rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-black transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    <QrCode size={15} className="text-[#aa8453]" />
                    <span>Verify QR</span>
                  </Link>

                  <button
                    onClick={() => handleShareAdminTicket(selectedBooking)}
                    className="py-3.5 px-4 bg-amber-50 text-[#aa8453] border border-[#aa8453]/30 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-amber-100 transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    <Share2 size={15} />
                    <span>Share</span>
                  </button>
                </div>

                {/* Cancel Booking Admin Action */}
                {isSuperAdmin && (selectedBooking.status === 'Upcoming' || !selectedBooking.status) && (
                  <button
                    onClick={() => handleAdminCancelBooking(selectedBooking)}
                    className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center space-x-2"
                  >
                    <RotateCcw size={14} />
                    <span>Cancel Booking & Process Refund</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-gray-200 transition-all duration-300"
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
