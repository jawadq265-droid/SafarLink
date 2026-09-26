import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  ChevronRight,
  Hash,
  Download,
  Share2,
  QrCode,
  AlertTriangle,
  X,
  CheckCircle2,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { downloadTicketPDF, shareTicketPDF, generateTicketQRCode, formatVoyageDate } from '../../utils/ticket-pdf';

interface BookingRecord {
  id: string;
  _id?: string;
  ticketId: string;
  userName: string;
  passengerPhone: string;
  passengerCnic: string;
  passengerEmail: string;
  bus: string;
  date: string;
  departureTime: string;
  routeFrom: string;
  routeTo: string;
  seats: string[];
  amount: string;
  status: string;
  refundAmount?: number;
  refundPercentage?: number;
  refundStatus?: string;
  cancelledAt?: string;
  qrCodeDataUrl?: string;
}

const UserActivityPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState<BookingRecord | null>(null);
  const [ticketQrUrl, setTicketQrUrl] = useState<string>('');
  
  const [cancellingTicket, setCancellingTicket] = useState<BookingRecord | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [isCancelling, setIsCancelling] = useState(false);

  const userEmail = localStorage.getItem("userEmail") || "";
  const userName = localStorage.getItem("userName") || "";

  const fetchUserBookings = () => {
    setLoading(true);
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
    fetch(`${baseUrl}payment/bookings`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.bookings)) {
          // Format bookings
          const formatted: BookingRecord[] = data.bookings.map((b: any) => ({
            id: b.ticketId || b._id,
            ticketId: b.ticketId || b._id,
            userName: b.userName,
            passengerPhone: b.passengerPhone || b.phone || "",
            passengerCnic: b.passengerCnic || b.cnic || "",
            passengerEmail: b.passengerEmail || "",
            bus: b.bus,
            date: b.date,
            departureTime: b.departureTime || "08:00 AM",
            routeFrom: b.routeFrom || "Lahore",
            routeTo: b.routeTo || "Islamabad",
            seats: Array.isArray(b.seats) ? b.seats : [String(b.seats || "")],
            amount: b.amount,
            status: b.status || b.type || "Upcoming",
            refundAmount: b.refundAmount,
            refundPercentage: b.refundPercentage,
            refundStatus: b.refundStatus,
            cancelledAt: b.cancelledAt,
            qrCodeDataUrl: b.qrCodeDataUrl
          }));

          // Filter by user if logged in
          if (userEmail) {
            const filtered = formatted.filter(b => 
              b.passengerEmail?.toLowerCase() === userEmail.toLowerCase() ||
              (userName && b.userName?.toLowerCase() === userName.toLowerCase())
            );
            setBookings(filtered.length > 0 ? filtered : formatted);
          } else {
            setBookings(formatted);
          }
        }
      })
      .catch(err => {
        console.error("Error fetching bookings:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserBookings();
  }, [userEmail, userName]);

  // Open digital QR modal
  const handleOpenQRModal = async (booking: BookingRecord) => {
    setSelectedTicket(booking);
    if (booking.qrCodeDataUrl) {
      setTicketQrUrl(booking.qrCodeDataUrl);
    } else {
      const qr = await generateTicketQRCode(booking.ticketId);
      setTicketQrUrl(qr);
    }
  };

  // Download PDF from card
  const handleDownload = (booking: BookingRecord) => {
    downloadTicketPDF({
      passengerName: booking.userName,
      phone: booking.passengerPhone,
      cnic: booking.passengerCnic,
      email: booking.passengerEmail,
      ticketId: booking.ticketId,
      busName: booking.bus,
      routeFrom: booking.routeFrom,
      routeTo: booking.routeTo,
      date: booking.date,
      time: booking.departureTime,
      seats: booking.seats.join(", "),
      amount: booking.amount,
      qrDataUrl: booking.qrCodeDataUrl
    });
  };

  // Share ticket
  const handleShare = async (booking: BookingRecord) => {
    await shareTicketPDF({
      passengerName: booking.userName,
      phone: booking.passengerPhone,
      cnic: booking.passengerCnic,
      email: booking.passengerEmail,
      ticketId: booking.ticketId,
      busName: booking.bus,
      routeFrom: booking.routeFrom,
      routeTo: booking.routeTo,
      date: booking.date,
      time: booking.departureTime,
      seats: booking.seats.join(", "),
      amount: booking.amount,
      qrDataUrl: booking.qrCodeDataUrl
    });
  };

  // Calculate estimated refund preview
  const getRefundEstimate = (booking: BookingRecord) => {
    try {
      const departureDateStr = booking.date;
      const timeStr = booking.departureTime || "08:00 AM";
      const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?/);
      let hours = 8;
      let minutes = 0;
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        const mer = timeMatch[3]?.toUpperCase();
        if (mer === 'PM' && hours < 12) hours += 12;
        if (mer === 'AM' && hours === 12) hours = 0;
      }

      const depParts = departureDateStr.split(/[-/]/);
      let year = parseInt(depParts[0], 10);
      let month = parseInt(depParts[1], 10) - 1;
      let day = parseInt(depParts[2], 10);
      if (depParts[0].length <= 2 && depParts[2].length === 4) {
        day = parseInt(depParts[0], 10);
        month = parseInt(depParts[1], 10) - 1;
        year = parseInt(depParts[2], 10);
      }

      const departureDateTime = new Date(year, month, day, hours, minutes, 0);
      const now = new Date();
      const diffMs = departureDateTime.getTime() - now.getTime();
      const hoursRemaining = diffMs / (1000 * 60 * 60);

      const percentage = (hoursRemaining * 60 >= 30) ? 25 : 0;

      const paidNum = parseInt(String(booking.amount).replace(/[^\d]/g, ''), 10) || 0;
      const refundAmt = Math.round((paidNum * percentage) / 100);

      return { percentage, refundAmt, hoursRemaining };
    } catch (e) {
      return { percentage: 25, refundAmt: 0, hoursRemaining: 48 };
    }
  };

  // Submit cancellation
  const handleConfirmCancel = async () => {
    if (!cancellingTicket) return;
    setIsCancelling(true);

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
      const loggedInEmail = localStorage.getItem("userEmail") || "";
      const userRole = localStorage.getItem("role") || "user";
      const isSuperAdmin = userRole === "superadmin" || loggedInEmail.toLowerCase() === "superadmin@safarlink.com";

      const cancelledBy = isSuperAdmin
        ? `Superadmin (${loggedInEmail || "superadmin@safarlink.com"})`
        : `User (${loggedInEmail || cancellingTicket.passengerEmail})`;

      const res = await fetch(`${baseUrl}payment/cancel-booking/${encodeURIComponent(cancellingTicket.ticketId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReason,
          cancelledBy,
          role: userRole,
          email: loggedInEmail || cancellingTicket.passengerEmail
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Booking cancelled and refund processed!");
        setCancellingTicket(null);
        fetchUserBookings();
      } else {
        toast.error(data.message || "Failed to cancel booking");
      }
    } catch (err) {
      console.error("Cancellation error:", err);
      toast.error("Failed to connect to cancellation gateway");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] pt-32 pb-24 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed mb-1 font-bold">PASSENGER PORTAL</p>
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 tracking-tight">My Bookings & E-Tickets</h1>
            <p className="text-gray-500 text-sm mt-1 font-light">Access your digital QR passes, download receipts, or manage cancellations.</p>
          </div>
          
          <div className="mt-6 md:mt-0 flex items-center space-x-3">
            <Link 
              to="/verify-ticket" 
              className="px-5 py-3 border border-gray-300 hover:border-[#aa8453] bg-white text-gray-800 hover:text-[#aa8453] font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center space-x-2"
            >
              <QrCode size={15} />
              <span>Verify Ticket QR</span>
            </Link>

            <Link 
              to="/bus" 
              className="px-6 py-3 bg-[#aa8453] hover:bg-[#8f6d40] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center space-x-2"
            >
              <span>Book New Trip</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-[#aa8453] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-500 font-serif">Loading your voyage manifests...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const isCancelled = booking.status === 'Cancelled' || booking.status === 'Refunded';
              const isBoarded = booking.status === 'Boarded';
              const isUpcoming = booking.status === 'Upcoming';

              return (
                <div 
                  key={booking.id} 
                  className={`luxury-card p-6 md:p-8 relative overflow-hidden transition-all duration-300 ${
                    isCancelled ? 'opacity-85 border-red-200 bg-red-50/20' : 'hover:shadow-2xl border-gray-100'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    
                    {/* Left Details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-bold font-condensed rounded-md ${
                          isCancelled 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : isBoarded
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {booking.status}
                        </span>

                        <span className="text-xs text-gray-500 font-mono font-medium flex items-center">
                          <Hash size={12} className="mr-0.5 text-gray-400" />
                          {booking.ticketId}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-serif text-gray-900 font-bold">{booking.bus}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Passenger: <strong className="text-gray-800">{booking.userName}</strong> • CNIC: {booking.passengerCnic}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border border-gray-100">
                          <div className="p-2 bg-[#fcfbf9] text-[#aa8453] rounded-md">
                            <MapPin size={16} />
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400 tracking-[0.2em] uppercase font-condensed font-bold">ROUTE</p>
                            <p className="text-sm font-semibold text-gray-800">{booking.routeFrom} ➔ {booking.routeTo}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border border-gray-100">
                          <div className="p-2 bg-[#fcfbf9] text-[#aa8453] rounded-md">
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400 tracking-[0.2em] uppercase font-condensed font-bold">DATE & TIME</p>
                            <p className="text-sm font-semibold text-gray-800">{formatVoyageDate(booking.date)} at {booking.departureTime}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border border-gray-100">
                          <div className="p-2 bg-[#fcfbf9] text-[#aa8453] rounded-md">
                            <CreditCard size={16} />
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400 tracking-[0.2em] uppercase font-condensed font-bold">AMOUNT PAID</p>
                            <p className="text-sm font-bold text-[#aa8453]">{booking.amount}</p>
                          </div>
                        </div>
                      </div>

                      {/* Refund Notice if Cancelled */}
                      {isCancelled && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
                          <span>Cancelled on {booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleDateString() : "record"}.</span>
                          <span className="font-bold">Refund: Rs. {booking.refundAmount?.toLocaleString() || 0} ({booking.refundPercentage || 0}%)</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Right Action Box */}
                    <div className="lg:w-64 flex flex-col justify-between items-center lg:items-end border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                      <div className="text-center lg:text-right mb-4">
                        <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-condensed font-bold mb-0.5">ALLOCATED SEAT(S)</p>
                        <p className="text-2xl font-serif font-bold text-[#aa8453]">{booking.seats.join(", ")}</p>
                      </div>

                      <div className="w-full space-y-2">
                        {!isCancelled && (
                          <button 
                            onClick={() => handleOpenQRModal(booking)}
                            className="w-full py-2.5 px-4 bg-[#1b1b1b] hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow flex items-center justify-center space-x-2"
                          >
                            <QrCode size={14} className="text-[#aa8453]" />
                            <span>View Digital QR</span>
                          </button>
                        )}

                        <div className="flex gap-2 w-full">
                          <button 
                            onClick={() => handleDownload(booking)}
                            className="flex-1 py-2 px-3 border border-gray-200 hover:border-[#aa8453] bg-white hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-1"
                            title="Download PDF"
                          >
                            <Download size={13} />
                            <span>PDF</span>
                          </button>

                          <button 
                            onClick={() => handleShare(booking)}
                            className="flex-1 py-2 px-3 border border-gray-200 hover:border-[#aa8453] bg-white hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-1"
                            title="Share on WhatsApp / Web"
                          >
                            <Share2 size={13} />
                            <span>Share</span>
                          </button>
                        </div>

                        {/* Cancel & Refund Button */}
                        {isUpcoming && (
                          <button 
                            onClick={() => setCancellingTicket(booking)}
                            className="w-full py-2 px-4 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-1.5"
                          >
                            <RotateCcw size={13} />
                            <span>Cancel & Refund</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="luxury-card p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[#fcfbf9] border border-[#aa8453]/20 flex items-center justify-center mx-auto mb-6 text-[#aa8453] rounded-2xl">
              <Calendar size={36} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-serif text-gray-900 mb-2 font-bold">No active bookings found</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto font-light text-sm">Your reservation history and digital QR tickets will automatically appear here.</p>
            <Link to="/bus" className="luxury-button !px-8 !py-3 uppercase text-xs font-bold tracking-wider">
              Explore Fleet & Book
            </Link>
          </div>
        )}

      </div>

      {/* Digital QR E-Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#aa8453]/30 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-600 flex items-center justify-center shadow transition-all"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="bg-[#1b1b1b] p-6 text-center text-white relative">
              <span className="text-[9px] text-[#aa8453] font-bold tracking-widest uppercase font-condensed">OFFICIAL PASSENGER PASS</span>
              <h2 className="text-xl font-serif font-bold text-white mt-0.5">Safar<span className="text-[#aa8453] italic">Link</span> E-Ticket</h2>
              <p className="text-xs text-gray-300 font-mono mt-1">TICKET ID: {selectedTicket.ticketId}</p>
            </div>

            {/* QR Section */}
            <div className="p-6 text-center space-y-4">
              <div className="p-4 bg-[#fcfaf7] border-2 border-dashed border-[#aa8453]/40 rounded-2xl inline-block shadow-inner">
                {ticketQrUrl ? (
                  <img src={ticketQrUrl} alt="Ticket QR Code" className="w-48 h-48 mx-auto object-contain" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                    <QrCode size={48} className="animate-pulse text-[#aa8453]" />
                  </div>
                )}
                <p className="text-[10px] text-[#aa8453] uppercase font-bold tracking-widest mt-2">Scan at Terminal Gate</p>
              </div>

              {/* Journey Details */}
              <div className="bg-gray-50 p-4 rounded-xl text-left text-xs space-y-2 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Passenger:</span>
                  <span className="font-bold text-gray-800">{selectedTicket.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fleet:</span>
                  <span className="font-bold text-gray-800">{selectedTicket.bus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Route:</span>
                  <span className="font-bold text-[#aa8453]">{selectedTicket.routeFrom} ➔ {selectedTicket.routeTo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Departure:</span>
                  <span className="font-bold text-gray-800">{selectedTicket.departureTime} ({formatVoyageDate(selectedTicket.date)})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Seat(s):</span>
                  <span className="font-bold text-[#aa8453] text-sm">{selectedTicket.seats.join(", ")}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(selectedTicket)}
                  className="flex-1 py-3 bg-[#aa8453] hover:bg-[#8f6d40] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 shadow"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>

                <Link
                  to={`/verify-ticket?id=${encodeURIComponent(selectedTicket.ticketId)}`}
                  target="_blank"
                  className="py-3 px-4 border border-gray-300 hover:border-[#aa8453] bg-white text-gray-800 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1"
                >
                  <ExternalLink size={14} />
                  <span>Verify</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Cancellation & Refund Confirmation Modal */}
      {cancellingTicket && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-red-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 bg-rose-50 border-b border-rose-100 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-rose-900">Cancel Booking & Request Refund</h3>
                <p className="text-xs text-rose-700">Ticket ID: {cancellingTicket.ticketId}</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Refund calculation breakdown */}
              {(() => {
                const estimate = getRefundEstimate(cancellingTicket);
                return (
                  <div className="bg-[#fcfaf7] p-4 rounded-xl border border-[#aa8453]/20 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Original Amount:</span>
                      <span className="font-bold text-gray-800">{cancellingTicket.amount}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Refund Policy Tier:</span>
                      <span className="font-bold text-[#aa8453]">{estimate.percentage}% Refund Tier</span>
                    </div>

                    <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-900">Estimated Refund:</span>
                      <span className="text-xl font-serif font-bold text-emerald-600">Rs. {estimate.refundAmt.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Policy Notes & Refund Notice */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1 text-xs">
                <p className="font-bold flex items-center">
                  <CheckCircle2 size={15} className="mr-1.5 text-emerald-600" />
                  Refund Notice
                </p>
                <p className="font-bold text-emerald-800">
                  Your amount will be refunded within 2-3 working days!
                </p>
                <p className="text-[11px] text-emerald-700">
                  Cancellation is valid up to 30 minutes before bus departure timing.
                </p>
              </div>

              {/* Cancellation Reason */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#aa8453]"
                >
                  <option value="Change of plans">Change of travel plans</option>
                  <option value="Booked wrong date/time">Booked wrong date or time</option>
                  <option value="Emergency circumstances">Personal emergency</option>
                  <option value="Found alternative transport">Found alternative transport</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingTicket(null)}
                  disabled={isCancelling}
                  className="flex-1 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Keep Booking
                </button>

                {(() => {
                  const est = getRefundEstimate(cancellingTicket);
                  const isCutoff = est.hoursRemaining * 60 < 30;
                  return (
                    <button
                      type="button"
                      onClick={handleConfirmCancel}
                      disabled={isCancelling || isCutoff}
                      className={`flex-1 py-3 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-1.5 ${
                        isCutoff 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer disabled:opacity-50'
                      }`}
                    >
                      {isCancelling ? (
                        <span>Processing...</span>
                      ) : isCutoff ? (
                        <span>Cutoff Passed (&lt;30m)</span>
                      ) : (
                        <>
                          <RotateCcw size={14} />
                          <span>Confirm Cancellation</span>
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserActivityPage;
