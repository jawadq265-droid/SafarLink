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
  Menu,
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
  AlertTriangle,
  Tag,
  Percent,
  Send,
  Copy,
  Sparkles,
  Gift,
  Mail,
  Check,
  Image as ImageIcon,
  Bell
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { downloadTicketPDF, shareTicketPDF, formatVoyageDate } from '../../utils/ticket-pdf';

export interface PromotionType {
  _id: string;
  id?: string;
  title: string;
  message: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number | null;
  minBookingAmount?: number;
  expiryDate: string;
  startDate?: string;
  imageUrl?: string;
  isActive: boolean;
  usageCount: number;
  usageLimit?: number | null;
  notifiedSubscribers?: boolean;
  subscribersNotifiedCount?: number;
  lastNotifiedAt?: string;
  createdAt?: string;
  isExpired?: boolean;
}

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

export const getNextHourlySlot = (timeStr?: string, fromDate?: Date) => {
  const now = fromDate || new Date();
  const { hours, minutes } = parseBusTime(timeStr);
  let target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  );

  if (now.getTime() >= target.getTime()) {
    const elapsedHours = Math.floor((now.getTime() - target.getTime()) / (3600 * 1000));
    target.setHours(target.getHours() + elapsedHours + 1);
  }
  return formatTime12h(target.getHours(), target.getMinutes());
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

export const formatFriendlyDateDisplay = (dateStr?: string) => {
  if (!dateStr) return "No Expiry";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
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
  cancelledBy?: string;
  cancellationReason?: string;
  boardedAt?: string;
  qrCodeDataUrl?: string;
}

interface UserType {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  dateJoined: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();

  const userRole = localStorage.getItem("role") || "user";
  const userEmail = localStorage.getItem("userEmail") || "";
  const userName = localStorage.getItem("userName") || "User";
  const isSuperAdmin = userRole === "superadmin" || userEmail === "superadmin@safarlink.com";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
  // its seats reset to full capacity (0 bookings), and next departure time is scheduled 1 hour later
  const handleSingleBusDepartureRollover = async (bus: BusType) => {
    const nextTime = getNextHourlySlot(bus.time, currentTime);
    const busId = bus._id || bus.id;

    // 1. Immediately update buses state so UI updates in real-time
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

    // 2. Mark existing upcoming bookings for this departed bus as Completed so the new fleet has 0 bookings
    setBookings((prevBookings) =>
      prevBookings.map((b) => {
        const matchesBus = b.bus && (
          b.bus.trim().toLowerCase().includes(bus.name.trim().toLowerCase()) ||
          bus.name.trim().toLowerCase().includes(b.bus.trim().toLowerCase())
        );
        if (matchesBus && b.status !== 'Cancelled' && b.status !== 'Refunded') {
          return { ...b, status: 'Completed', type: 'Completed' };
        }
        return b;
      })
    );

    // 3. Persist to MongoDB backend (resets seatsLeft and marks departed bookings as Completed)
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
      await fetch(`${baseUrl}buses/${busId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seatsLeft: bus.totalSeats || 40,
          time: nextTime,
          resetBookings: true
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

      // If departure countdown reached 0 (diff <= 0), trigger single bus rollover
      if (diffMs <= 0) {
        const departureKey = `${busId}_${bus.time}_${currentTime.getHours()}`;
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

    // If scheduled departure passed (e.g. from earlier today),
    // catch it up to the current active hourly dispatch slot:
    if (currentTime.getTime() >= target.getTime()) {
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
    // Pass role=superadmin so the backend returns all bookings for admin view
    fetch(`${baseUrl}payment/bookings?role=superadmin`)
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
            cancelledBy: b.cancelledBy,
            cancellationReason: b.cancellationReason,
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
        body: JSON.stringify({
          reason: "Cancelled by Admin via Management Dashboard",
          cancelledBy: `Superadmin (${userEmail || "superadmin@safarlink.com"})`,
          role: "superadmin",
          email: userEmail || "superadmin@safarlink.com"
        })
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

  // State-driven Users Directory connected to MongoDB
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
      const res = await fetch(`${baseUrl}users`);
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsersList(data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  React.useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

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

  // Promotions Management State
  const [promotions, setPromotions] = useState<PromotionType[]>([]);
  const [isPromotionsLoading, setIsPromotionsLoading] = useState(false);
  const [promoStatusFilter, setPromoStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [promoSearchTerm, setPromoSearchTerm] = useState('');
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionType | null>(null);
  const [isSavingPromo, setIsSavingPromo] = useState(false);
  const [isNotifyingPromoId, setIsNotifyingPromoId] = useState<string | null>(null);
  const [deletePromoModal, setDeletePromoModal] = useState<PromotionType | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [promoFormData, setPromoFormData] = useState({
    title: '',
    message: '',
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '20',
    maxDiscount: '',
    minBookingAmount: '0',
    expiryDate: '',
    imageUrl: '',
    isActive: true,
    notifySubscribers: true,
  });

  const generateRandomPromoCode = () => {
    const prefixes = ['SAFAR', 'SUPER', 'VOYAGE', 'VIP', 'EXPRESS', 'SAVE'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    const newCode = `${randomPrefix}${randomNum}`;
    setPromoFormData((prev) => ({ ...prev, code: newCode }));
  };

  const fetchPromotions = async () => {
    setIsPromotionsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
      const res = await fetch(`${baseUrl}promotions`);
      const data = await res.json();
      if (data.success && Array.isArray(data.promotions)) {
        setPromotions(data.promotions);
      }
    } catch (err) {
      console.error("Error fetching promotions:", err);
    } finally {
      setIsPromotionsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isSuperAdmin) {
      fetchPromotions();
    }
  }, [isSuperAdmin]);

  const handleOpenCreatePromoModal = () => {
    setEditingPromotion(null);
    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 14);
    const year = defaultExpiry.getFullYear();
    const month = String(defaultExpiry.getMonth() + 1).padStart(2, '0');
    const day = String(defaultExpiry.getDate()).padStart(2, '0');
    const hours = String(defaultExpiry.getHours()).padStart(2, '0');
    const mins = String(defaultExpiry.getMinutes()).padStart(2, '0');
    const expiryStr = `${year}-${month}-${day}T${hours}:${mins}`;

    const randomNum = Math.floor(10 + Math.random() * 90);

    setPromoFormData({
      title: '',
      message: '',
      code: `SAFAR${randomNum}`,
      discountType: 'percentage',
      discountValue: '20',
      maxDiscount: '',
      minBookingAmount: '0',
      expiryDate: expiryStr,
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
      isActive: true,
      notifySubscribers: true,
    });
    setIsPromoModalOpen(true);
  };

  const handleOpenEditPromoModal = (promo: PromotionType) => {
    setEditingPromotion(promo);
    let expiryStr = '';
    if (promo.expiryDate) {
      const d = new Date(promo.expiryDate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      expiryStr = `${year}-${month}-${day}T${hours}:${mins}`;
    }

    setPromoFormData({
      title: promo.title || '',
      message: promo.message || '',
      code: promo.code || '',
      discountType: promo.discountType || 'percentage',
      discountValue: String(promo.discountValue || 20),
      maxDiscount: promo.maxDiscount ? String(promo.maxDiscount) : '',
      minBookingAmount: promo.minBookingAmount ? String(promo.minBookingAmount) : '0',
      expiryDate: expiryStr,
      imageUrl: promo.imageUrl || '',
      isActive: promo.isActive !== false,
      notifySubscribers: false,
    });
    setIsPromoModalOpen(true);
  };

  const handleSavePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoFormData.title.trim() || !promoFormData.message.trim() || !promoFormData.code.trim() || !promoFormData.expiryDate) {
      toast.error("Please fill in all required fields (Title, Message, Promo Code, Expiry Date).");
      return;
    }

    const discountValNum = Number(promoFormData.discountValue);
    if (isNaN(discountValNum) || discountValNum <= 0) {
      toast.error("Please enter a valid discount value greater than 0.");
      return;
    }

    setIsSavingPromo(true);
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";

    try {
      const payload = {
        title: promoFormData.title.trim(),
        message: promoFormData.message.trim(),
        code: promoFormData.code.trim().toUpperCase(),
        discountType: promoFormData.discountType,
        discountValue: discountValNum,
        maxDiscount: promoFormData.maxDiscount ? Number(promoFormData.maxDiscount) : null,
        minBookingAmount: promoFormData.minBookingAmount ? Number(promoFormData.minBookingAmount) : 0,
        expiryDate: new Date(promoFormData.expiryDate).toISOString(),
        imageUrl: promoFormData.imageUrl.trim(),
        isActive: promoFormData.isActive,
        notifySubscribers: editingPromotion ? false : promoFormData.notifySubscribers,
      };

      const url = editingPromotion ? `${baseUrl}promotions/${editingPromotion._id}` : `${baseUrl}promotions`;
      const method = editingPromotion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save promotion");
      }

      if (!editingPromotion && promoFormData.notifySubscribers && data.notifyResult?.sentCount) {
        toast.success(`Promotion created & ${data.notifyResult.sentCount} subscribers notified via email!`);
      } else {
        toast.success(editingPromotion ? "Promotion updated successfully" : "Promotion created successfully");
      }

      setIsPromoModalOpen(false);
      fetchPromotions();
    } catch (err: any) {
      console.error("Save promotion error:", err);
      toast.error(err.message || "Error saving promotion");
    } finally {
      setIsSavingPromo(false);
    }
  };

  const handleTogglePromotionActive = async (promo: PromotionType) => {
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
    try {
      const res = await fetch(`${baseUrl}promotions/${promo._id}/toggle-status`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Promotion "${promo.code}" is now ${data.promotion.isActive ? 'Active' : 'Deactivated'}`);
        fetchPromotions();
      } else {
        toast.error(data.message || "Failed to toggle status");
      }
    } catch (err) {
      toast.error("Failed to update promotion status");
    }
  };

  const handleDeletePromotion = async () => {
    if (!deletePromoModal) return;
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
    try {
      const res = await fetch(`${baseUrl}promotions/${deletePromoModal._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Promotion "${deletePromoModal.code}" deleted successfully`);
        setDeletePromoModal(null);
        fetchPromotions();
      } else {
        toast.error(data.message || "Failed to delete promotion");
      }
    } catch (err) {
      toast.error("Failed to delete promotion");
    }
  };

  const handleBroadcastPromotion = async (promo: PromotionType) => {
    setIsNotifyingPromoId(promo._id);
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
    try {
      const res = await fetch(`${baseUrl}promotions/${promo._id}/notify-subscribers`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Dispatched promo broadcast to ${data.result?.sentCount ?? 'all'} newsletter subscribers!`);
        fetchPromotions();
      } else {
        toast.error(data.message || "Failed to broadcast promotion to subscribers");
      }
    } catch (err) {
      toast.error("Failed to connect to email broadcast system");
    } finally {
      setIsNotifyingPromoId(null);
    }
  };

  const handleCopyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Promo code "${code}" copied to clipboard!`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const filteredPromotions = promotions.filter((promo) => {
    const isExpired = new Date(promo.expiryDate) < new Date();
    if (promoStatusFilter === 'active' && (!promo.isActive || isExpired)) return false;
    if (promoStatusFilter === 'inactive' && promo.isActive) return false;
    if (promoStatusFilter === 'expired' && !isExpired) return false;

    if (!promoSearchTerm.trim()) return true;
    const term = promoSearchTerm.toLowerCase().trim();
    return (
      (promo.code || '').toLowerCase().includes(term) ||
      (promo.title || '').toLowerCase().includes(term) ||
      (promo.message || '').toLowerCase().includes(term)
    );
  });

  // Helper to compute dynamic booked seat metrics and load percentage for each bus
  const getBusSeatMetrics = (bus: BusType) => {
    const matchingBookings = bookings.filter(b => 
      b.bus &&
      (b.status === 'Upcoming' || !b.status || b.type === 'Upcoming') &&
      b.status !== 'Completed' &&
      b.status !== 'Cancelled' &&
      b.status !== 'Refunded' &&
      (
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

  const normalizedUserEmail = userEmail.trim().toLowerCase();
  const normalizedUserName = userName.trim().toLowerCase();

  const filteredBookings = isSuperAdmin
    ? bookings.filter(booking => {
        const matchesSearch = (booking.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                              (booking.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                              (booking.bus?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                              (booking.passengerEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesDate = dateFilter ? booking.date === dateFilter : true;
        return matchesSearch && matchesDate;
      })
    : bookings.filter(booking => {
        const bEmail = (booking.passengerEmail || '').trim().toLowerCase();
        const bName = (booking.userName || '').trim().toLowerCase();

        // 1. Primary check: Email match (case-insensitive)
        const emailMatch = Boolean(normalizedUserEmail && bEmail && bEmail === normalizedUserEmail);

        // 2. Name match (case-insensitive, exact or partial)
        const nameMatch = Boolean(normalizedUserName && normalizedUserName !== 'user' && bName && (
          bName === normalizedUserName ||
          bName.includes(normalizedUserName) ||
          normalizedUserName.includes(bName)
        ));

        // 3. Match latest booking in localStorage
        let isLatest = false;
        try {
          const latest = localStorage.getItem("latest_booking");
          if (latest) {
            const parsed = JSON.parse(latest);
            if (parsed.ticketId && (parsed.ticketId === booking.id || parsed.ticketId === (booking as any).ticketId)) {
              isLatest = true;
            }
          }
        } catch (e) {}

        const isDummy = bName === 'you' || booking.id === 'BK-001';

        const matchesSearch = searchTerm ? (
          bName.includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.bus.toLowerCase().includes(searchTerm.toLowerCase())
        ) : true;

        const matchesDate = dateFilter ? booking.date === dateFilter : true;

        return (emailMatch || nameMatch || isLatest || isDummy) && matchesSearch && matchesDate;
      });

  const filteredUsers = usersList.filter(user => 
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phone || '').includes(searchTerm) ||
    (user.role || '').toLowerCase().includes(searchTerm.toLowerCase())
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
  const handleDeleteUser = async (id: string, name?: string) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${name || 'Account'}" from the database?`)) {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
      try {
        const res = await fetch(`${baseUrl}users/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          toast.success(data.message || "User deleted successfully");
          fetchUsers();
        } else {
          toast.error(data.message || "Failed to delete user");
        }
      } catch (err) {
        toast.error("Failed to connect to user service");
      }
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
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#1b1b1b] flex flex-col shadow-2xl border-r border-[#aa8453]/20 transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:z-20 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 sm:p-6 border-b border-[#aa8453]/20 bg-[#141414] flex items-center justify-between">
          <Link to="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center space-x-2">
            <span className="text-2xl font-serif text-white tracking-tighter">Safar<span className="text-[#aa8453] font-light italic">Link</span></span>
            <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md ${isSuperAdmin ? 'bg-[#aa8453] text-white' : 'bg-white/10 text-gray-300'}`}>
              {isSuperAdmin ? 'Super' : 'Portal'}
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          {isSuperAdmin ? (
            <>
              <button
                onClick={() => { setActiveTab('dashboard'); setSearchTerm(''); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-[#aa8453] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <LayoutDashboard size={18} />
                <span className="font-medium text-sm">Overview</span>
              </button>

              <button
                onClick={() => { setActiveTab('buses'); setSearchTerm(''); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'buses' ? 'bg-[#aa8453] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Bus size={18} />
                <span className="font-medium text-sm">Manage Fleet</span>
              </button>

              <button
                onClick={() => { setActiveTab('bookings'); setSearchTerm(''); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'bookings' ? 'bg-[#aa8453] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Calendar size={18} />
                <span className="font-medium text-sm">All Bookings</span>
              </button>

              <button
                onClick={() => { setActiveTab('users'); setSearchTerm(''); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'users' ? 'bg-[#aa8453] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Users size={18} />
                <span className="font-medium text-sm">User Directory</span>
              </button>

              <button
                onClick={() => { setActiveTab('promotions'); setSearchTerm(''); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'promotions' ? 'bg-[#aa8453] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Tag size={18} />
                <span className="font-medium text-sm">Promotions & Offers</span>
              </button>

              <Link
                to="/verify-ticket"
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-gray-400 hover:bg-white/5 hover:text-white`}
              >
                <ShieldCheck size={18} className="text-[#aa8453]" />
                <span className="font-medium text-sm">Ticket Verification</span>
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => { setActiveTab('my-bookings'); setSearchTerm(''); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'my-bookings' ? 'bg-[#aa8453] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Ticket size={18} />
                <span className="font-medium text-sm">My Bookings</span>
              </button>
              <Link
                to="/verify-ticket"
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-gray-400 hover:bg-white/5 hover:text-white`}
              >
                <ShieldCheck size={18} className="text-[#aa8453]" />
                <span className="font-medium text-sm">Verify Ticket</span>
              </Link>
              <Link
                to="/bus"
                onClick={() => setIsSidebarOpen(false)}
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
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-red-950/40 text-red-400 hover:text-white hover:bg-red-900/60 rounded-xl font-bold transition-all duration-300 shadow-inner cursor-pointer"
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
        <header className="sticky top-0 bg-[#fcfaf7] border-b border-[#aa8453]/20 shadow-sm z-30 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            {/* Mobile hamburger button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-white border border-[#aa8453]/25 shadow-sm text-gray-700 hover:text-[#aa8453] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>

            {activeTab === 'dashboard' ? (
              <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 text-gray-500 hover:text-[#aa8453] transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform sm:w-[18px] sm:h-[18px]" />
                <span className="text-xs sm:text-sm font-bold font-condensed tracking-wider text-[#aa8453] uppercase whitespace-nowrap">Back To Home</span>
              </Link>
            ) : (
              <h1 className="text-lg sm:text-xl md:text-2xl font-serif font-black text-gray-800 capitalize tracking-tight truncate max-w-[170px] sm:max-w-none">
                {activeTab === 'my-bookings' ? 'My Travel History' : activeTab === 'buses' ? 'Fleet Matrix' : activeTab === 'users' ? 'User Directory' : activeTab === 'promotions' ? 'Promotions & Discounts' : 'All Bookings'}
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isSuperAdmin && activeTab === 'bookings' && (
              <div className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white border border-[#aa8453]/20 rounded-full shadow-sm">
                <Filter size={13} className="text-[#aa8453] shrink-0" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="text-[11px] sm:text-xs font-bold text-gray-600 outline-none border-none bg-transparent"
                />
              </div>
            )}
            <div className="flex items-center space-x-2 sm:space-x-3 sm:ml-2 sm:border-l sm:pl-3 border-gray-200">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white font-serif font-black text-xs sm:text-sm shadow-md bg-[#aa8453] shrink-0`}>
                {userName ? userName.substring(0, 1).toUpperCase() : "U"}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-black text-gray-800 leading-none mb-1">{isSuperAdmin ? 'Super Admin' : 'Active User'}</p>
                <p className="text-[9px] text-[#aa8453] font-bold uppercase tracking-widest truncate max-w-[140px] lg:max-w-[180px]">{userEmail}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && isSuperAdmin && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-[#aa8453]/10 hover:border-[#aa8453]/30 transition-all duration-300 hover:shadow-md group overflow-hidden relative">
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">{stat.title}</p>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-800">{stat.value}</h3>
                      </div>
                      <div className={`${stat.color} p-2.5 sm:p-3 rounded-2xl text-white group-hover:rotate-6 transition duration-300 shadow-md shrink-0`}>
                        <stat.icon size={18} />
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 flex items-center text-[10px] relative z-10">
                      <span className="text-[#aa8453] font-black mr-1 uppercase">↑ {stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions & Recent */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Recent Buses Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-[#aa8453]/10 overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-[#aa8453]/10 flex items-center justify-between flex-wrap gap-2.5">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-gray-800">Live Fleet Performance</h3>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <span className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>1h Dispatch Cycle</span>
                      </span>
                      <button 
                        onClick={() => setActiveTab('buses')}
                        className="flex items-center space-x-1 text-[#aa8453] hover:text-[#8e6d45] font-bold text-[11px] sm:text-xs uppercase tracking-widest cursor-pointer"
                      >
                        <span>Full Fleet</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px]">
                      <thead>
                        <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest bg-[#fcfaf7]/50">
                          <th className="px-4 sm:px-6 py-3.5 sm:py-4">Vehicle</th>
                          <th className="px-4 sm:px-6 py-3.5 sm:py-4">Availability</th>
                          <th className="px-4 sm:px-6 py-3.5 sm:py-4">Departure Time</th>
                          <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-right">Load</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {buses.slice(0, 4).map((bus) => {
                          const depRuntime = getBusDepartureRuntime(bus);
                          const { effectiveSeatsLeft, loadPercent } = getBusSeatMetrics(bus);
                          return (
                            <tr key={bus.id || bus._id} className="hover:bg-[#fcfaf7]/40 transition-all group">
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${effectiveSeatsLeft === 0 ? 'bg-red-50 text-red-600' : 'bg-[#aa8453]/10 text-[#aa8453]'}`}>
                                    <Bus size={17} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-800 text-xs sm:text-sm leading-none mb-1">{bus.name}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{bus.route}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs sm:text-sm font-black ${effectiveSeatsLeft < 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {effectiveSeatsLeft}
                                  </span>
                                  <span className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase">Seats Left</span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                                <div className="flex items-center space-x-2">
                                  <div className="p-1 sm:p-1.5 bg-[#aa8453]/10 text-[#aa8453] rounded-lg shrink-0">
                                    <Clock size={13} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-gray-800 leading-none mb-1">{depRuntime.formattedTime}</p>
                                    <span className="inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-black tracking-wider uppercase bg-amber-50 text-[#aa8453] border border-[#aa8453]/20 animate-pulse">
                                      {depRuntime.displayCountdown}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                                <div className="flex items-center justify-end space-x-2 sm:space-x-3">
                                  <div className="w-16 sm:w-24 bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
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
                  <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-[#aa8453]/10">
                    <h3 className="text-base sm:text-lg font-serif font-bold text-gray-800 mb-4 sm:mb-6">Operations</h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowAddBusModal(true)}
                        className="w-full flex items-center justify-center space-x-2 py-3.5 sm:py-4 bg-[#aa8453] text-white rounded-2xl font-bold hover:bg-[#8e6d45] shadow-lg shadow-amber-100 transition-all duration-300 cursor-pointer"
                      >
                        <Plus size={18} />
                        <span className="text-xs sm:text-sm font-condensed tracking-wider uppercase">Register New Vehicle</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('buses')}
                        className="w-full flex items-center justify-center space-x-2 py-3.5 sm:py-4 bg-white border border-[#aa8453]/30 text-gray-700 rounded-2xl font-bold hover:bg-[#fcfaf7] transition-all duration-300 cursor-pointer"
                      >
                        <Calendar size={18} />
                        <span className="text-xs sm:text-sm font-condensed tracking-wider uppercase">Update Schedules</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#1b1b1b] p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl text-white relative overflow-hidden group border border-[#aa8453]/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-all duration-700 pointer-events-none">
                      <TrendingUp size={120} />
                    </div>
                    <h4 className="text-lg sm:text-xl font-serif text-[#aa8453] font-bold mb-2 relative z-10">Neural Sync</h4>
                    <p className="text-xs text-gray-400 mb-6 sm:mb-8 relative z-10 leading-relaxed">System-wide terminal synchronization is active at 99.9% precision.</p>
                    <div className="flex items-center space-x-2 sm:space-x-3 text-emerald-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em] relative z-10 bg-emerald-400/10 w-fit px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-emerald-400/20">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div>
                      <span>Live Cloud Matrix Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'buses' && isSuperAdmin && (
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-[#aa8453]/10 overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-800">Fleet & Route Matrix</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Configure your inter-city network</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search fleet..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-full focus:ring-1 focus:ring-[#aa8453] outline-none w-full sm:w-56 md:w-64 transition-all text-sm font-medium"
                      />
                    </div>
                    <button 
                      onClick={() => setShowAddBusModal(true)}
                      className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#aa8453] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#8e6d45] transition-all duration-300 shadow-md cursor-pointer shrink-0"
                    >
                      <Plus size={14} />
                      <span>Add Route</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] bg-[#fcfaf7]/50">
                        <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Vehicle Image</th>
                        <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Service Name</th>
                        <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Route Link</th>
                        <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Pricing</th>
                        <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Popular Route</th>
                        <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredBuses.map((bus) => (
                        <tr key={bus.id} className="hover:bg-[#fcfaf7]/20 transition-all group">
                          <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                            <div className="w-16 h-12 sm:w-20 sm:h-14 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                              <img 
                                src={bus.image} 
                                className="w-full h-full object-cover" 
                                alt={bus.name} 
                              />
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                            <p className="font-bold text-gray-800 text-xs sm:text-sm leading-none mb-1">{bus.name}</p>
                            <p className="text-[10px] text-[#aa8453] font-bold uppercase tracking-tighter">Luxury Executive</p>
                          </td>
                          <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                            <div className="flex items-center space-x-2">
                              <MapPin size={12} className="text-[#aa8453] shrink-0" />
                              <span className="text-xs sm:text-sm font-medium text-gray-700">{bus.route}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                            <span className="font-bold text-gray-800 tracking-tighter text-xs sm:text-sm">Rs. {bus.price.toLocaleString()}</span>
                          </td>
                          <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                            <button
                              onClick={() => handleTogglePopular(bus)}
                              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase transition-all duration-300 border cursor-pointer ${
                                bus.isPopular
                                  ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 shadow-sm'
                                  : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                              }`}
                              title="Click to toggle whether this route appears in Popular Routes"
                            >
                              <Star size={11} className={bus.isPopular ? "fill-amber-400 text-amber-500" : "text-gray-300"} />
                              <span>{bus.isPopular ? "Popular" : "Standard"}</span>
                            </button>
                          </td>
                          <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-right">
                            <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                              <button 
                                onClick={() => handleTogglePopular(bus)}
                                title={bus.isPopular ? "Remove from Popular Routes" : "Promote to Popular Routes"}
                                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 cursor-pointer ${bus.isPopular ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-gray-50'}`}
                              >
                                <Star size={15} className={bus.isPopular ? "fill-amber-400" : ""} />
                              </button>
                              <button 
                                onClick={() => openEditModal(bus)}
                                className="p-1.5 sm:p-2 text-gray-400 hover:text-[#aa8453] hover:bg-[#aa8453]/10 rounded-lg transition-all duration-300 cursor-pointer"
                              >
                                <Edit size={15} />
                              </button>
                              <button 
                                onClick={() => handleDeleteBus(bus._id || bus.id)}
                                className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 cursor-pointer"
                              >
                                <Trash2 size={15} />
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
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-[#aa8453]/10 overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-800">User Directory</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Total Registered Users: {usersList.length}
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search users by name, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-full focus:ring-1 focus:ring-[#aa8453] outline-none w-full transition-all text-sm font-medium"
                    />
                  </div>
                  <button
                    onClick={fetchUsers}
                    title="Refresh Directory"
                    disabled={isUsersLoading}
                    className="p-2.5 bg-gray-50 hover:bg-[#aa8453]/10 text-gray-600 hover:text-[#aa8453] border border-gray-200 rounded-full transition-all duration-300 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw size={15} className={isUsersLoading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>
              
              {isUsersLoading ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-[#aa8453] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading passenger directory...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <Users size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] bg-[#fcfaf7]/50">
                        <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Name</th>
                        <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Email</th>
                        {/* <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Phone</th> */}
                        <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Role</th>
                        <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Date Joined</th>
                        <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((user) => {
                        const isSuperAdminAccount = user.role === 'superadmin' || user.email === 'superadmin@safarlink.com';
                        return (
                          <tr key={user.id} className="hover:bg-[#fcfaf7]/20 transition-all group">
                            <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 font-bold text-gray-800 text-xs sm:text-sm">
                              {user.name}
                            </td>
                            <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-xs sm:text-sm text-gray-600">
                              {user.email}
                            </td>
                            {/* <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-xs sm:text-sm text-gray-600">
                              {user.phone || "—"}
                            </td> */}
                            <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                              <span className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                isSuperAdminAccount 
                                  ? 'bg-[#aa8453] text-white shadow-sm' 
                                  : 'bg-[#aa8453]/10 text-[#aa8453]'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-xs text-gray-400 font-medium">
                              {user.dateJoined}
                            </td>
                            <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-right">
                              {isSuperAdminAccount ? (
                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider px-2 py-1 bg-gray-50 rounded">
                                  Protected
                                </span>
                              ) : (
                                <button 
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                  title="Delete User Account"
                                  className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 cursor-pointer"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'bookings' || activeTab === 'my-bookings') && (
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-[#aa8453]/10 overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-800">{isSuperAdmin ? 'Fleet Bookings' : 'My Trips'}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Records: {filteredBookings.length}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4 w-full sm:w-auto">
                  {isSuperAdmin && (
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-full focus:ring-1 focus:ring-[#aa8453] outline-none w-full sm:w-64 transition-all text-sm font-medium"
                      />
                    </div>
                  )}
                  {!isSuperAdmin && (
                    <Link to="/bus" className="px-5 py-2.5 bg-[#aa8453] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#8e6d45] transition-all duration-300 shadow-md text-center">
                      Book New
                    </Link>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] bg-[#fcfaf7]/50">
                      <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Record ID</th>
                      <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">{isSuperAdmin ? 'Passenger' : 'Service'}</th>
                      <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Destination / Route</th>
                      <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Date</th>
                      <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Fare</th>
                      <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5">Status</th>
                      <th className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBookings.map((booking) => {
                      const isCancelled = booking.status === 'Cancelled' || booking.status === 'Refunded';
                      const isBoarded = booking.status === 'Boarded';
                      return (
                        <tr key={booking.id} className="hover:bg-[#fcfaf7]/20 transition-all group">
                          <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                            <span className="font-bold text-[#aa8453] text-xs sm:text-sm tracking-tighter">#{booking.id}</span>
                          </td>
                          <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#fcfaf7] rounded-2xl flex items-center justify-center text-[#aa8453] font-bold text-base sm:text-lg shadow-inner shrink-0">
                                {isSuperAdmin ? booking.userName.charAt(0) : <Bus size={17} />}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-xs sm:text-sm leading-none mb-1">{isSuperAdmin ? booking.userName : booking.bus}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                  {isSuperAdmin ? 'Registered Client' : 'Premium Service'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                            <div className="flex flex-col">
                              <p className="text-xs sm:text-sm font-bold text-gray-700 leading-none mb-1">{booking.bus}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Inter-City Link</p>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                            <div className="px-2.5 py-1 bg-gray-100 rounded-lg w-fit">
                              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{booking.date}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                            <span className="font-bold text-gray-800 text-xs sm:text-sm tracking-tighter">{booking.amount}</span>
                          </td>
                          <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                              isCancelled
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : isBoarded
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : booking.status === 'Completed'
                                    ? 'bg-gray-100 text-gray-700 border border-gray-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {booking.status || 'Upcoming'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-right">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="p-2 sm:p-3 text-[#aa8453] hover:bg-[#aa8453]/10 rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer"
                            >
                              <Eye size={17} />
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

          {activeTab === 'promotions' && isSuperAdmin && (
            <div className="space-y-6 sm:space-y-8">
              {/* Promotions Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
                <div className="bg-white p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-[#aa8453]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Promotions</p>
                    <h3 className="text-2xl sm:text-3xl font-serif font-black text-gray-800 mt-1">{promotions.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#aa8453]/10 flex items-center justify-center text-[#aa8453]">
                    <Tag size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-[#aa8453]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Campaigns</p>
                    <h3 className="text-2xl sm:text-3xl font-serif font-black text-emerald-700 mt-1">
                      {promotions.filter(p => p.isActive && new Date(p.expiryDate) >= new Date()).length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Sparkles size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-[#aa8453]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expired / Inactive</p>
                    <h3 className="text-2xl sm:text-3xl font-serif font-black text-amber-700 mt-1">
                      {promotions.filter(p => !p.isActive || new Date(p.expiryDate) < new Date()).length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Clock size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-[#aa8453]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Redemptions</p>
                    <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#aa8453] mt-1">
                      {promotions.reduce((sum, p) => sum + (p.usageCount || 0), 0)}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#aa8453]/10 flex items-center justify-center text-[#aa8453]">
                    <Percent size={22} />
                  </div>
                </div>
              </div>

              {/* Action Bar & Filter Bar */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-[#aa8453]/10 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-800">Promotions & Vouchers</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Manage discount campaigns, broadcast to newsletter subscribers, & monitor promo redemptions
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search promo or code..."
                        value={promoSearchTerm}
                        onChange={(e) => setPromoSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-full focus:ring-1 focus:ring-[#aa8453] outline-none w-full text-xs sm:text-sm font-medium"
                      />
                    </div>

                    <button
                      onClick={handleOpenCreatePromoModal}
                      className="px-5 py-2.5 bg-[#aa8453] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#8e6d45] transition-all duration-300 shadow-md flex items-center space-x-2 cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>Create Promotion</span>
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
                  {(['all', 'active', 'inactive', 'expired'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setPromoStatusFilter(filter)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        promoStatusFilter === filter
                          ? 'bg-[#1b1b1b] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Promotions Grid */}
                {isPromotionsLoading ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-10 h-10 border-2 border-gray-200 border-t-[#aa8453] rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Loading Promotions...</p>
                  </div>
                ) : filteredPromotions.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="w-16 h-16 bg-[#fcfaf7] rounded-full flex items-center justify-center text-[#aa8453] mx-auto border border-[#aa8453]/20">
                      <Tag size={28} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-700 font-serif">No promotions found</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        {promoSearchTerm || promoStatusFilter !== 'all'
                          ? "Try adjusting your search query or status filter."
                          : "Create your first promotional discount campaign to boost bus reservations."}
                      </p>
                    </div>
                    <button
                      onClick={handleOpenCreatePromoModal}
                      className="px-6 py-2.5 bg-[#aa8453] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#8e6d45] transition-all cursor-pointer shadow-md inline-flex items-center space-x-2"
                    >
                      <Plus size={15} />
                      <span>Create New Promotion</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-6">
                    {filteredPromotions.map((promo) => {
                      const isExpired = new Date(promo.expiryDate) < new Date();
                      const expiryFormatted = formatFriendlyDateDisplay(promo.expiryDate);
                      const isNotifying = isNotifyingPromoId === promo._id;

                      return (
                        <div
                          key={promo._id}
                          className="bg-white rounded-2xl border border-gray-200 hover:border-[#aa8453]/40 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden flex flex-col justify-between"
                        >
                          <div>
                            {/* Image Header */}
                            <div className="relative h-44 bg-[#1b1b1b] overflow-hidden group">
                              {promo.imageUrl ? (
                                <img
                                  src={promo.imageUrl}
                                  alt={promo.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  onError={(e: any) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-[#1b1b1b] via-[#2a241e] to-[#aa8453]/30 flex items-center justify-center p-4 text-center">
                                  <span className="text-3xl font-serif text-white tracking-widest font-light opacity-80">
                                    SAFAR<span className="text-[#aa8453] italic font-normal">LINK</span>
                                  </span>
                                </div>
                              )}

                              {/* Status Badge */}
                              <div className="absolute top-3 left-3 flex gap-2">
                                {isExpired ? (
                                  <span className="px-2.5 py-1 bg-red-600/95 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow">
                                    Expired
                                  </span>
                                ) : promo.isActive ? (
                                  <span className="px-2.5 py-1 bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                    Active
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-gray-700/95 backdrop-blur-md text-gray-200 text-[10px] font-bold rounded-full uppercase tracking-wider shadow">
                                    Inactive
                                  </span>
                                )}
                              </div>

                              {/* Discount Badge */}
                              <div className="absolute top-3 right-3">
                                <span className="px-3 py-1 bg-[#aa8453] text-white text-xs font-black rounded-full uppercase tracking-wider shadow-lg">
                                  {promo.discountType === 'percentage'
                                    ? `${promo.discountValue}% OFF`
                                    : `Rs. ${promo.discountValue} OFF`}
                                </span>
                              </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-5 space-y-4">
                              {/* Title & Message */}
                              <div>
                                <h4 className="text-lg font-bold font-serif text-gray-900 leading-snug line-clamp-1">
                                  {promo.title}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                                  {promo.message}
                                </p>
                              </div>

                              {/* Promo Code Box with Copy */}
                              <div className="bg-[#fcfaf7] border border-dashed border-[#aa8453] p-3 rounded-xl flex items-center justify-between">
                                <div>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-condensed">
                                    Promo Code
                                  </p>
                                  <span className="font-serif font-black text-base text-gray-900 tracking-wider">
                                    {promo.code}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopyPromoCode(promo.code)}
                                  className="p-2 hover:bg-white text-[#aa8453] rounded-lg border border-transparent hover:border-[#aa8453]/20 transition-all cursor-pointer flex items-center space-x-1 text-xs font-bold"
                                  title="Copy promo code"
                                >
                                  {copiedCode === promo.code ? (
                                    <Check size={16} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                  <span className="text-[10px] uppercase font-condensed">
                                    {copiedCode === promo.code ? "Copied" : "Copy"}
                                  </span>
                                </button>
                              </div>

                              {/* Meta Details */}
                              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                                <div className="space-y-0.5">
                                  <span className="text-gray-400 uppercase tracking-wider font-condensed text-[10px] block">
                                    Expires
                                  </span>
                                  <span className={`font-semibold ${isExpired ? 'text-red-600' : 'text-gray-700'}`}>
                                    {expiryFormatted}
                                  </span>
                                </div>

                                <div className="space-y-0.5 text-right">
                                  <span className="text-gray-400 uppercase tracking-wider font-condensed text-[10px] block">
                                    Redemptions
                                  </span>
                                  <span className="font-semibold text-gray-800">
                                    {promo.usageCount || 0} times
                                  </span>
                                </div>
                              </div>

                              {promo.minBookingAmount && promo.minBookingAmount > 0 && (
                                <p className="text-[11px] text-gray-500 italic">
                                  * Min booking amount: Rs. {promo.minBookingAmount}
                                </p>
                              )}

                              {/* Subscriber Notification Pill */}
                              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                                <span className="text-gray-500 flex items-center gap-1.5">
                                  <Mail size={13} className="text-[#aa8453]" />
                                  {promo.notifiedSubscribers ? (
                                    <span className="text-emerald-700 font-medium">
                                      Notified {promo.subscribersNotifiedCount || 0} subscribers
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">Not broadcasted yet</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Bar at card bottom */}
                          <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                            {/* Toggle Active Button */}
                            <button
                              onClick={() => handleTogglePromotionActive(promo)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                promo.isActive
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              }`}
                              title={promo.isActive ? "Deactivate promo" : "Activate promo"}
                            >
                              {promo.isActive ? 'Deactivate' : 'Activate'}
                            </button>

                            {/* Broadcast / Send to subscribers button */}
                            <button
                              onClick={() => handleBroadcastPromotion(promo)}
                              disabled={isNotifying || !promo.isActive || isExpired}
                              className="px-3 py-1.5 bg-[#aa8453] hover:bg-[#8e6d45] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                              title="Broadcast promotion to all newsletter subscribers"
                            >
                              {isNotifying ? (
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Send size={13} />
                              )}
                              <span>Email VIPs</span>
                            </button>

                            <div className="flex items-center space-x-1">
                              {/* Edit Button */}
                              <button
                                onClick={() => handleOpenEditPromoModal(promo)}
                                className="p-2 text-gray-500 hover:text-[#aa8453] hover:bg-white rounded-lg transition-all cursor-pointer"
                                title="Edit promotion"
                              >
                                <Edit size={16} />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => setDeletePromoModal(promo)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                title="Delete promotion"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Bus Modal */}
      {showAddBusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAddBusModal(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#aa8453]/20 animate-in zoom-in duration-300">
            <div className="bg-[#1b1b1b] p-5 sm:p-8 md:p-10 text-white relative border-b border-[#aa8453]/30">
              <button onClick={() => setShowAddBusModal(false)} className="absolute top-4 sm:top-8 right-4 sm:right-8 w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 cursor-pointer">
                <X size={18} />
              </button>
              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#aa8453] mb-2 sm:mb-3">System Configuration</p>
              <h2 className="text-2xl sm:text-3xl font-serif tracking-tighter">Register New Route</h2>
            </div>
            <form onSubmit={handleAddBus} className="p-5 sm:p-8 md:p-10 space-y-4 sm:space-y-6 bg-white max-h-[75vh] sm:max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Service Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Safar Gold" 
                    value={newBusName}
                    onChange={(e) => setNewBusName(e.target.value)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Route Path</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Lahore - Multan" 
                    value={newBusRoute}
                    onChange={(e) => setNewBusRoute(e.target.value)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Route Image (Homepage)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleNewBusImageChange}
                    className="w-full px-3 sm:px-6 py-2.5 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-xs sm:text-sm" 
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Bus Image (Booking Page)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleNewBusBusImageChange}
                    className="w-full px-3 sm:px-6 py-2.5 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-xs sm:text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Fare (Rs.)</label>
                  <input 
                    type="number" 
                    placeholder="1500" 
                    value={newBusFare}
                    onChange={(e) => setNewBusFare(e.target.value)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Capacity</label>
                  <input 
                    type="number" 
                    placeholder="40" 
                    value={newBusCapacity}
                    onChange={(e) => setNewBusCapacity(e.target.value)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Departure Time</label>
                  <input 
                    type="time" 
                    value={newBusTime}
                    onChange={(e) => setNewBusTime(e.target.value)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3.5 sm:p-4 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-xl sm:rounded-2xl">
                <input 
                  type="checkbox" 
                  id="newBusIsPopular" 
                  checked={newBusIsPopular} 
                  onChange={(e) => setNewBusIsPopular(e.target.checked)} 
                  className="w-4 h-4 sm:w-5 sm:h-5 accent-[#aa8453] cursor-pointer"
                />
                <label htmlFor="newBusIsPopular" className="cursor-pointer text-[11px] sm:text-xs font-bold text-gray-700 flex items-center space-x-2">
                  <Star size={14} className="fill-amber-400 text-amber-500 shrink-0" />
                  <span>Feature in Popular Routes (Showcase on Homepage & Bus Popular Routes)</span>
                </label>
              </div>
              <button 
                type="submit" 
                className="w-full py-4 sm:py-5 bg-[#1b1b1b] hover:bg-black text-white font-condensed tracking-widest uppercase text-xs sm:text-sm border-none rounded-xl sm:rounded-2xl transition duration-300 cursor-pointer shadow-lg"
              >
                Initialize Route Manifest
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bus Modal */}
      {editingBus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setEditingBus(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#aa8453]/20 animate-in zoom-in duration-300">
            <div className="bg-[#1b1b1b] p-5 sm:p-8 md:p-10 text-white relative border-b border-[#aa8453]/30">
              <button onClick={() => setEditingBus(null)} className="absolute top-4 sm:top-8 right-4 sm:right-8 w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 cursor-pointer">
                <X size={18} />
              </button>
              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#aa8453] mb-2 sm:mb-3">System Modification</p>
              <h2 className="text-2xl sm:text-3xl font-serif tracking-tighter truncate max-w-[280px] sm:max-w-none">Edit Route: {editingBus.name}</h2>
            </div>
            <form onSubmit={handleEditBus} className="p-5 sm:p-8 md:p-10 space-y-4 sm:space-y-6 bg-white max-h-[75vh] sm:max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Service Name</label>
                  <input 
                    type="text" 
                    value={editBusName}
                    onChange={(e) => setEditBusName(e.target.value)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Route Path</label>
                  <input 
                    type="text" 
                    value={editBusRoute}
                    onChange={(e) => setEditBusRoute(e.target.value)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Route Image (Homepage)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleEditBusImageChange}
                    className="w-full px-3 sm:px-6 py-2.5 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-xs sm:text-sm" 
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Bus Image (Booking Page)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleEditBusBusImageChange}
                    className="w-full px-3 sm:px-6 py-2.5 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-xs sm:text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Fare (Rs.)</label>
                  <input 
                    type="number" 
                    value={editBusFare}
                    onChange={(e) => setEditBusFare(e.target.value)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Capacity</label>
                  <input 
                    type="number" 
                    value={editBusCapacity}
                    onChange={(e) => setEditBusCapacity(e.target.value)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Departure Time</label>
                  <input 
                    type="time" 
                    value={editBusTime}
                    onChange={(e) => setEditBusTime(e.target.value)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all font-medium text-sm" 
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3.5 sm:p-4 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-xl sm:rounded-2xl">
                <input 
                  type="checkbox" 
                  id="editBusIsPopular" 
                  checked={editBusIsPopular} 
                  onChange={(e) => setEditBusIsPopular(e.target.checked)} 
                  className="w-4 h-4 sm:w-5 sm:h-5 accent-[#aa8453] cursor-pointer"
                />
                <label htmlFor="editBusIsPopular" className="cursor-pointer text-[11px] sm:text-xs font-bold text-gray-700 flex items-center space-x-2">
                  <Star size={14} className="fill-amber-400 text-amber-500 shrink-0" />
                  <span>Feature in Popular Routes (Showcase on Homepage & Bus Popular Routes)</span>
                </label>
              </div>
              <button 
                type="submit" 
                className="w-full py-4 sm:py-5 bg-[#aa8453] hover:bg-[#8e6d45] text-white font-condensed tracking-widest uppercase text-xs sm:text-sm border-none rounded-xl sm:rounded-2xl transition duration-300 cursor-pointer shadow-lg"
              >
                Apply Manifest Modifications
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedBooking(null)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#aa8453]/20 animate-in zoom-in duration-300">
            <div className="bg-[#1b1b1b] p-5 sm:p-8 text-white relative border-b border-[#aa8453]/30">
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-4 sm:top-8 right-4 sm:right-8 w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 backdrop-blur-md cursor-pointer"
              >
                <X size={18} />
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
              <h2 className="text-2xl sm:text-3xl font-serif tracking-tighter truncate max-w-[280px] sm:max-w-none">{selectedBooking.id}</h2>
            </div>
            <div className="p-5 sm:p-8 space-y-4 sm:space-y-6 bg-white max-h-[75vh] sm:max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-1">Passenger</p>
                  <p className="font-bold text-gray-800 text-sm sm:text-base tracking-tight">{isSuperAdmin ? selectedBooking.userName : userName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-1">Identifier</p>
                  <p className="font-bold text-gray-800 text-sm sm:text-base tracking-tight">{selectedBooking.cnic}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-1">Contact</p>
                  <p className="font-bold text-gray-800 text-sm sm:text-base tracking-tight">{selectedBooking.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-1">Total Paid</p>
                  <p className="font-bold text-[#aa8453] text-base sm:text-lg tracking-tighter">{selectedBooking.amount}</p>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 border-t border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-2">Journey Parameters</p>
                <div className="bg-[#fcfaf7] rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-inner border border-[#aa8453]/10">
                  <div>
                    <p className="text-sm sm:text-base font-bold text-gray-800 tracking-tight leading-none mb-1">{selectedBooking.bus}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatVoyageDate(selectedBooking.date)} at {selectedBooking.departureTime || '08:00 AM'}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase font-bold text-[#aa8453] tracking-widest mb-1">Seats Allocated</p>
                    <p className="font-bold text-[#aa8453] text-base sm:text-lg tracking-tighter">{selectedBooking.seats.join(", ")}</p>
                  </div>
                </div>
              </div>

              {/* Cancellation & Refund Info if Cancelled */}
              {(selectedBooking.status === 'Cancelled' || selectedBooking.status === 'Refunded') && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl text-red-900 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold flex items-center text-red-950">
                      <AlertTriangle size={15} className="mr-1.5 text-red-600 shrink-0" />
                      Booking Cancelled
                    </p>
                    {selectedBooking.cancelledAt && (
                      <span className="text-[10px] text-red-600 font-mono">
                        {new Date(selectedBooking.cancelledAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p>
                    Station Status: <strong className="text-red-950 font-bold">{selectedBooking.cancelledBy || `Cancelled by Superadmin`}</strong>
                  </p>
                  <p>Refund Processed: <strong>Rs. {selectedBooking.refundAmount?.toLocaleString() || 0}</strong> ({selectedBooking.refundPercentage || 25}% policy tier).</p>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold text-[11px]">
                    Notice: Your amount will be refunded within 2-3 working days!
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 sm:space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleDownloadAdminTicket(selectedBooking)}
                    className="flex-1 py-3 sm:py-3.5 px-3 bg-[#aa8453] text-white rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-[#8e6d45] transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download size={15} />
                    <span>Download PDF</span>
                  </button>

                  <Link
                    to={`/verify-ticket?id=${encodeURIComponent(selectedBooking.id)}`}
                    target="_blank"
                    className="py-3 sm:py-3.5 px-4 bg-gray-900 text-white rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-black transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    <QrCode size={15} className="text-[#aa8453]" />
                    <span>Verify QR</span>
                  </Link>

                  <button
                    onClick={() => handleShareAdminTicket(selectedBooking)}
                    className="py-3 sm:py-3.5 px-4 bg-amber-50 text-[#aa8453] border border-[#aa8453]/30 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-amber-100 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 size={15} />
                    <span>Share</span>
                  </button>
                </div>

                {/* Cancel Booking Admin Action */}
                {isSuperAdmin && (selectedBooking.status === 'Upcoming' || !selectedBooking.status) && (
                  <button
                    onClick={() => handleAdminCancelBooking(selectedBooking)}
                    className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Cancel Booking & Process Refund</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-gray-200 transition-all duration-300 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Promotion Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !isSavingPromo && setIsPromoModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#aa8453]/20 animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#1b1b1b] p-5 sm:p-7 text-white relative border-b border-[#aa8453]/30 shrink-0">
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                disabled={isSavingPromo}
                className="absolute top-4 sm:top-6 right-4 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 backdrop-blur-md cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="flex items-center space-x-2.5 mb-1.5">
                <span className="p-1.5 bg-[#aa8453]/20 rounded-lg text-[#aa8453]">
                  <Tag size={16} />
                </span>
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#aa8453]">
                  {editingPromotion ? 'Modify Campaign' : 'Exclusive Campaign Creation'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif tracking-tight">
                {editingPromotion ? 'Edit Promotion Voucher' : 'Create New Promotion'}
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePromotion} className="p-5 sm:p-7 space-y-4 sm:space-y-5 bg-white overflow-y-auto">
              {/* Campaign Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1 flex items-center gap-1">
                  <span>Campaign Title</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Spring Super Voyage Sale"
                  value={promoFormData.title}
                  onChange={(e) => setPromoFormData({ ...promoFormData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all text-sm font-medium text-gray-800"
                />
              </div>

              {/* Promo Code & Auto-generate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1 flex items-center gap-1">
                    <span>Voucher Promo Code</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="e.g., SAFAR25"
                      value={promoFormData.code}
                      onChange={(e) => setPromoFormData({ ...promoFormData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                      className="w-full pl-4 pr-24 py-3 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all text-sm font-mono font-black tracking-widest text-[#aa8453]"
                    />
                    <button
                      type="button"
                      onClick={generateRandomPromoCode}
                      className="absolute right-1.5 px-2.5 py-1.5 bg-[#aa8453]/10 hover:bg-[#aa8453]/20 text-[#aa8453] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={11} />
                      <span>Generate</span>
                    </button>
                  </div>
                </div>

                {/* Expiry Date & Time */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1 flex items-center gap-1">
                    <span>Valid Until (Expiry Date & Time)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={promoFormData.expiryDate}
                    onChange={(e) => setPromoFormData({ ...promoFormData, expiryDate: e.target.value })}
                    className="w-full px-4 py-3 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all text-sm font-medium text-gray-800"
                  />
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Discount Mode</label>
                  <div className="flex bg-[#fcfaf7] p-1 border border-[#aa8453]/20 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPromoFormData({ ...promoFormData, discountType: 'percentage' })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        promoFormData.discountType === 'percentage'
                          ? 'bg-[#aa8453] text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      % Percent
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromoFormData({ ...promoFormData, discountType: 'fixed' })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        promoFormData.discountType === 'fixed'
                          ? 'bg-[#aa8453] text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Fixed Rs.
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1 flex items-center gap-1">
                    <span>{promoFormData.discountType === 'percentage' ? 'Discount Rate (%)' : 'Discount Amount (Rs.)'}</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max={promoFormData.discountType === 'percentage' ? '100' : '50000'}
                      placeholder={promoFormData.discountType === 'percentage' ? '20' : '500'}
                      value={promoFormData.discountValue}
                      onChange={(e) => setPromoFormData({ ...promoFormData, discountValue: e.target.value })}
                      className="w-full px-4 py-3 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all text-sm font-bold text-gray-800"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      {promoFormData.discountType === 'percentage' ? '%' : 'PKR'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">
                    {promoFormData.discountType === 'percentage' ? 'Max Cap (Rs. Optional)' : 'Min Ticket Total (Rs.)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={promoFormData.discountType === 'percentage' ? 'e.g. 1000' : 'e.g. 1500'}
                    value={promoFormData.discountType === 'percentage' ? promoFormData.maxDiscount : promoFormData.minBookingAmount}
                    onChange={(e) => {
                      if (promoFormData.discountType === 'percentage') {
                        setPromoFormData({ ...promoFormData, maxDiscount: e.target.value });
                      } else {
                        setPromoFormData({ ...promoFormData, minBookingAmount: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-3 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all text-sm font-medium text-gray-800"
                  />
                </div>
              </div>

              {/* Promotion Pitch / Message */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1 flex items-center gap-1">
                  <span>Promotion Pitch & Message</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your special offer. This message will be sent in the newsletter email and shown to passengers..."
                  value={promoFormData.message}
                  onChange={(e) => setPromoFormData({ ...promoFormData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all text-sm font-medium text-gray-800 resize-none"
                />
              </div>

              {/* Banner Picture Option & Live Preview */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ImageIcon size={13} className="text-[#aa8453]" />
                    <span>Picture Banner Option (Included in Email & Cards)</span>
                  </span>
                  <span className="text-[9px] text-gray-400 font-normal">Direct Image URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={promoFormData.imageUrl}
                  onChange={(e) => setPromoFormData({ ...promoFormData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-xl focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none transition-all text-xs font-mono text-gray-700"
                />

                {/* Preset Banner Quick Pickers */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-gray-400 self-center mr-1">Presets:</span>
                  {[
                    { label: '🚌 Luxury Coach', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop' },
                    { label: '🌄 Scenic Voyage', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop' },
                    { label: '🌃 Night Express', url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=800&auto=format&fit=crop' },
                    { label: '✨ Gold Travel', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPromoFormData({ ...promoFormData, imageUrl: preset.url })}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-[#aa8453]/10 hover:text-[#aa8453] rounded-lg text-[10px] font-bold text-gray-600 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Live Preview Box */}
                {promoFormData.imageUrl && (
                  <div className="relative h-28 rounded-xl overflow-hidden border border-[#aa8453]/20 mt-2 group">
                    <img
                      src={promoFormData.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-3 text-white">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <p className="text-xs font-serif font-bold text-white leading-tight">
                            {promoFormData.title || 'Campaign Title Preview'}
                          </p>
                          <p className="text-[10px] text-amber-200 font-mono font-bold tracking-wider">
                            Code: {promoFormData.code || 'SAFAR20'}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-[#aa8453] text-white text-[10px] font-black rounded-lg uppercase">
                          {promoFormData.discountType === 'percentage' ? `${promoFormData.discountValue || 0}% OFF` : `Rs. ${promoFormData.discountValue || 0} OFF`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status and Subscriber Notification Option */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-[#fcfaf7] border border-[#aa8453]/20 rounded-xl">
                  <input
                    type="checkbox"
                    id="promoIsActive"
                    checked={promoFormData.isActive}
                    onChange={(e) => setPromoFormData({ ...promoFormData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#aa8453] cursor-pointer"
                  />
                  <label htmlFor="promoIsActive" className="cursor-pointer text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                    <span>Activate Campaign Immediately</span>
                    <span className="text-[10px] text-gray-400 font-normal">(Passengers can apply this code right away)</span>
                  </label>
                </div>

                {!editingPromotion && (
                  <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="promoNotifySubscribers"
                        checked={promoFormData.notifySubscribers}
                        onChange={(e) => setPromoFormData({ ...promoFormData, notifySubscribers: e.target.checked })}
                        className="w-4 h-4 mt-0.5 accent-[#aa8453] cursor-pointer"
                      />
                      <div>
                        <label htmlFor="promoNotifySubscribers" className="cursor-pointer text-xs font-bold text-[#aa8453] flex items-center space-x-1.5">
                          <Mail size={14} />
                          <span>Automatically notify all newsletter subscribers via email</span>
                        </label>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                          Dispatches a luxury branded email with your campaign message, picture banner, promo code voucher, discount rate, and expiry timestamp to all registered newsletter subscribers.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  disabled={isSavingPromo}
                  className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPromo}
                  className="flex-1 py-3.5 bg-[#aa8453] hover:bg-[#8e6d45] text-white font-condensed tracking-widest uppercase text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingPromo ? (
                    <span>Publishing Campaign...</span>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>{editingPromotion ? 'Update Promotion' : 'Publish & Broadcast'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Promotion Confirmation Dialog */}
      {deletePromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setDeletePromoModal(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-200 text-center animate-in zoom-in duration-300">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 size={26} />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-1.5">Delete Promotion Campaign?</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-gray-800">"{deletePromoModal.title}"</strong> with promo code <span className="font-mono font-bold text-[#aa8453] bg-amber-50 px-1.5 py-0.5 rounded">[{deletePromoModal.code}]</span>? Passengers will no longer be able to redeem this voucher.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletePromoModal(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePromotion}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                Delete Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
