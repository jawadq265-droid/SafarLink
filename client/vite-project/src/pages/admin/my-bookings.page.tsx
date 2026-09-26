import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Calendar, MapPin, Download, QrCode, ArrowLeft, RefreshCw } from 'lucide-react';
import { downloadTicketPDF, formatVoyageDate } from '../../utils/ticket-pdf';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem("userEmail") || "";
  const userName = localStorage.getItem("userName") || "";

  const loadBookings = () => {
    setLoading(true);
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
    fetch(`${baseUrl}payment/bookings`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.bookings)) {
          let list = data.bookings;
          if (userEmail) {
            const filtered = list.filter((b: any) =>
              b.passengerEmail?.toLowerCase() === userEmail.toLowerCase() ||
              (userName && b.userName?.toLowerCase() === userName.toLowerCase())
            );
            setBookings(filtered.length > 0 ? filtered : list);
          } else {
            setBookings(list);
          }
        }
      })
      .catch(err => console.error("Error fetching bookings:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleDownload = (booking: any) => {
    downloadTicketPDF({
      passengerName: booking.userName,
      phone: booking.passengerPhone,
      cnic: booking.passengerCnic,
      email: booking.passengerEmail,
      ticketId: booking.ticketId || booking._id,
      busName: booking.bus,
      routeFrom: booking.routeFrom,
      routeTo: booking.routeTo,
      date: booking.date,
      time: booking.departureTime,
      seats: Array.isArray(booking.seats) ? booking.seats.join(", ") : String(booking.seats),
      amount: booking.amount,
      qrDataUrl: booking.qrCodeDataUrl
    });
  };

  return (
    <div className="bg-[#fcfaf7] min-h-screen pt-24 sm:pt-28 pb-16 sm:pb-20 font-sans">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-gray-200 gap-4">
          <div>
            <Link to="/admin" className="inline-flex items-center space-x-1 text-xs text-[#aa8453] uppercase font-bold tracking-wider mb-2 hover:underline">
              <ArrowLeft size={14} />
              <span>Back to Admin Dashboard</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800">Booking Records & Manifests</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Live customer bookings, payment clearance receipts, and QR validation statuses.</p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={loadBookings}
              className="p-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-xl transition cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-[#aa8453]" : ""} />
            </button>
            <Link
              to="/verify-ticket"
              className="px-4 sm:px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center space-x-2 shadow cursor-pointer"
            >
              <QrCode size={14} className="text-[#aa8453]" />
              <span>QR Scanner</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 sm:p-16 text-center text-gray-500 font-serif">
              <div className="w-8 h-8 border-2 border-[#aa8453] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p>Fetching booking records...</p>
            </div>
          ) : bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[640px]">
                <thead className="bg-[#fcfaf7] border-b border-gray-100">
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4">Ticket ID</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4">Passenger</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4">Fleet / Service</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4">Route</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4">Date & Time</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4">Amount</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4">Status</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {bookings.map((booking) => {
                    const isCancelled = booking.status === 'Cancelled' || booking.status === 'Refunded';
                    const isBoarded = booking.status === 'Boarded';
                    const ticketId = booking.ticketId || booking._id;

                    return (
                      <tr key={booking._id || ticketId} className="hover:bg-[#fcfaf7]/50 transition">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-mono font-bold text-[#aa8453] text-xs sm:text-sm">
                          #{ticketId}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-800 text-xs sm:text-sm">
                          <div>{booking.userName}</div>
                          <div className="text-[11px] text-gray-400 font-normal font-mono">{booking.passengerPhone}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 font-medium text-xs sm:text-sm">{booking.bus}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 text-xs sm:text-sm">
                          {booking.routeFrom || "Lahore"} <span className="text-[#aa8453]">➔</span> {booking.routeTo || "Islamabad"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-600 text-xs">
                          <div>{formatVoyageDate(booking.date)}</div>
                          <div className="text-gray-400">{booking.departureTime || "08:00 AM"}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 text-xs sm:text-sm">{booking.amount}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                            isCancelled 
                              ? 'bg-red-100 text-red-700 border border-red-200' 
                              : isBoarded
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {booking.status || 'Upcoming'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/verify-ticket?id=${encodeURIComponent(ticketId)}`}
                              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                              title="Verify Ticket QR"
                            >
                              <QrCode size={15} />
                            </Link>
                            <button
                              onClick={() => handleDownload(booking)}
                              className="p-2 text-[#aa8453] hover:bg-[#aa8453]/10 rounded-lg transition"
                              title="Download PDF Ticket"
                            >
                              <Download size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-gray-400">
              <p className="text-lg font-serif text-gray-600 mb-1">No bookings recorded yet.</p>
              <p className="text-xs">Once passengers book seats, their reservations will appear in this manifest.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
