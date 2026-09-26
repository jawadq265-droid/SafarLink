import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Search,
  Bus,
  Calendar,
  Clock,
  User,
  Phone,
  CreditCard,
  Download,
  Camera,
  ShieldCheck,
  RotateCcw,
  X,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadTicketPDF, formatVoyageDate } from '../../utils/ticket-pdf';

interface BookingDetail {
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
  refundStatus?: string;
  refundAmount?: number;
  refundPercentage?: number;
  boardedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  qrCodeDataUrl?: string;
}

const loadHtml5QrcodeScanner = (): Promise<any> => {
  if (typeof window !== 'undefined' && (window as any).Html5QrcodeScanner) {
    return Promise.resolve((window as any).Html5QrcodeScanner);
  }
  return new Promise((resolve, reject) => {
    const existing = document.getElementById('html5-qrcode-cdn-script');
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).Html5QrcodeScanner));
      return;
    }
    const script = document.createElement('script');
    script.id = 'html5-qrcode-cdn-script';
    script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
    script.async = true;
    script.onload = () => resolve((window as any).Html5QrcodeScanner);
    script.onerror = () => reject(new Error('Failed to load QR scanner library'));
    document.body.appendChild(script);
  });
};

const TicketVerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTicketId = searchParams.get('id') || '';

  const [inputTicketId, setInputTicketId] = useState(initialTicketId);
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<BookingDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [isBoarding, setIsBoarding] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("Change of travel plans");
  const [isCancelling, setIsCancelling] = useState(false);

  const scannerRef = useRef<any>(null);

  const verifyTicketId = async (idToVerify: string) => {
    const cleanId = idToVerify.trim();
    if (!cleanId) {
      toast.error("Please enter a Ticket ID or scan a QR code");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setTicketData(null);

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
      const res = await fetch(`${baseUrl}payment/verify-ticket/${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (data.success && data.booking) {
        setTicketData(data.booking);
        toast.success("Ticket verified successfully!");
      } else {
        setErrorMsg(data.message || "Invalid Ticket: No matching record found in SafarLink database.");
        toast.error("Ticket verification failed");
      }
    } catch (err: any) {
      console.error("Verification network error:", err);
      setErrorMsg("Network error connecting to verification gateway. Please check your connection.");
      toast.error("Failed to connect to verification server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTicketId) {
      verifyTicketId(initialTicketId);
    }
  }, [initialTicketId]);

  // Handle QR Camera Scanner setup
  useEffect(() => {
    let isMounted = true;

    if (scannerActive) {
      loadHtml5QrcodeScanner()
        .then((ScannerClass) => {
          if (!isMounted || !ScannerClass) return;

          const scanner = new ScannerClass(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              rememberLastUsedCamera: true
            },
            false
          );

          scannerRef.current = scanner;

          scanner.render(
            (decodedText: string) => {
              let extractedId = decodedText;
              try {
                if (decodedText.includes('id=')) {
                  const url = new URL(decodedText);
                  const urlId = url.searchParams.get('id');
                  if (urlId) extractedId = urlId;
                }
              } catch (e) {
                // keep raw
              }

              setInputTicketId(extractedId);
              setScannerActive(false);
              try {
                scanner.clear();
              } catch (e) {}
              verifyTicketId(extractedId);
            },
            () => {
              // scanning error ignored
            }
          );
        })
        .catch((err) => {
          console.error("Failed to load QR scanner:", err);
          toast.error("Failed to initialize camera scanner");
          setScannerActive(false);
        });

      return () => {
        isMounted = false;
        if (scannerRef.current) {
          try {
            scannerRef.current.clear();
          } catch (e) {}
        }
      };
    }
  }, [scannerActive]);

  const handleMarkBoarded = async () => {
    if (!ticketData) return;
    setIsBoarding(true);
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
      const res = await fetch(`${baseUrl}payment/board-ticket/${encodeURIComponent(ticketData.ticketId)}`, {
        method: "PATCH"
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Passenger marked as Boarded!");
        setTicketData(prev => prev ? { ...prev, status: "Boarded", boardedAt: new Date().toISOString() } : null);
      } else {
        toast.error(data.message || "Failed to update boarding status");
      }
    } catch (e) {
      toast.error("Failed to connect to server");
    } finally {
      setIsBoarding(false);
    }
  };

  const handleDownload = () => {
    if (!ticketData) return;
    downloadTicketPDF({
      passengerName: ticketData.userName,
      phone: ticketData.passengerPhone,
      cnic: ticketData.passengerCnic,
      email: ticketData.passengerEmail,
      ticketId: ticketData.ticketId,
      busName: ticketData.bus,
      routeFrom: ticketData.routeFrom,
      routeTo: ticketData.routeTo,
      date: ticketData.date,
      time: ticketData.departureTime,
      seats: Array.isArray(ticketData.seats) ? ticketData.seats.join(", ") : String(ticketData.seats),
      amount: ticketData.amount,
      qrDataUrl: ticketData.qrCodeDataUrl
    });
  };

  const getCancellationValidity = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return { canCancel: false, deadlineText: "", isPast: true, diffMinutes: 0, cutoffDiffMinutes: 0, remainingDesc: "" };
    try {
      const time = timeStr || "08:00 AM";
      const timeMatch = time.match(/^(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?/);
      let hours = 8;
      let minutes = 0;
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        const mer = timeMatch[3]?.toUpperCase();
        if (mer === 'PM' && hours < 12) hours += 12;
        if (mer === 'AM' && hours === 12) hours = 0;
      }

      const depParts = dateStr.split(/[-/]/);
      let year = parseInt(depParts[0], 10);
      let month = parseInt(depParts[1], 10) - 1;
      let day = parseInt(depParts[2], 10);

      if (depParts[0].length <= 2 && depParts[2].length === 4) {
        day = parseInt(depParts[0], 10);
        month = parseInt(depParts[1], 10) - 1;
        year = parseInt(depParts[2], 10);
      }

      const departureDateTime = new Date(year, month, day, hours, minutes, 0);
      // Half hour (30 minutes) cutoff strictly before departure
      const cutoffTime = new Date(departureDateTime.getTime() - 30 * 60 * 1000);
      const now = new Date();

      const diffMinutes = Math.floor((departureDateTime.getTime() - now.getTime()) / (1000 * 60));
      const cutoffDiffMinutes = Math.floor((cutoffTime.getTime() - now.getTime()) / (1000 * 60));

      const formatTime = (d: Date) => {
        let h = d.getHours();
        const m = String(d.getMinutes()).padStart(2, '0');
        const mer = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${String(h).padStart(2, '0')}:${m} ${mer}`;
      };

      const deadlineText = `${cutoffTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${formatTime(cutoffTime)}`;

      if (cutoffDiffMinutes > 0) {
        let remainingDesc = "";
        if (cutoffDiffMinutes >= 60) {
          const hrs = Math.floor(cutoffDiffMinutes / 60);
          const remMins = cutoffDiffMinutes % 60;
          remainingDesc = `${hrs}h ${remMins}m remaining`;
        } else {
          remainingDesc = `${cutoffDiffMinutes}m remaining`;
        }
        return {
          canCancel: true,
          deadlineText,
          remainingDesc,
          isPast: false,
          diffMinutes,
          cutoffDiffMinutes
        };
      } else {
        return {
          canCancel: false,
          deadlineText,
          remainingDesc: diffMinutes <= 0 ? "Bus has already departed" : "Within 30m cutoff window",
          isPast: diffMinutes <= 0,
          diffMinutes,
          cutoffDiffMinutes
        };
      }
    } catch (e) {
      return { canCancel: false, deadlineText: "", isPast: true, diffMinutes: 0, cutoffDiffMinutes: 0, remainingDesc: "" };
    }
  };

  const handleUserCancelTicket = async () => {
    if (!ticketData) return;
    setIsCancelling(true);
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
      const loggedInEmail = localStorage.getItem("userEmail") || "";
      const userRole = localStorage.getItem("role") || "user";
      const isSuperAdmin = userRole === "superadmin" || loggedInEmail.toLowerCase() === "superadmin@safarlink.com";

      const cancelledBy = isSuperAdmin
        ? `Superadmin (${loggedInEmail || "superadmin@safarlink.com"})`
        : `User (${loggedInEmail || ticketData.passengerEmail})`;

      const res = await fetch(`${baseUrl}payment/cancel-booking/${encodeURIComponent(ticketData.ticketId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: cancelReason,
          cancelledBy,
          email: loggedInEmail || ticketData.passengerEmail,
          role: userRole
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Ticket cancelled successfully! Your amount will be refunded within 2-3 working days.", {
          duration: 6500
        });
        setTicketData(prev => prev ? {
          ...prev,
          status: "Cancelled",
          cancelledAt: new Date().toISOString(),
          cancelledBy: data.cancelledBy || cancelledBy,
          cancellationReason: cancelReason,
          refundAmount: data.refundAmount,
          refundPercentage: data.refundPercentage,
          refundStatus: "Processed"
        } : null);
        setShowCancelModal(false);
      } else {
        toast.error(data.message || "Failed to cancel ticket");
      }
    } catch (e) {
      toast.error("Network error while connecting to cancellation gateway");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] pt-28 pb-20 font-sans">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#aa8453]/10 text-[#aa8453] rounded-full text-xs font-semibold tracking-widest uppercase mb-3">
            <ShieldCheck size={14} />
            <span>AUTHENTICATION GATEWAY</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 tracking-tight">QR Ticket Verification</h1>
          <p className="text-gray-500 text-sm mt-2 font-light">Scan digital QR manifest or lookup Ticket ID to verify passenger authenticity.</p>
        </div>

        {/* Search & Scan Control Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-[#aa8453]/20 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={inputTicketId}
                onChange={(e) => setInputTicketId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyTicketId(inputTicketId)}
                placeholder="Enter Ticket ID (e.g. SL-172700...)"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#aa8453] text-gray-800 font-mono text-sm tracking-wide transition-all"
              />
            </div>
            
            <button
              onClick={() => verifyTicketId(inputTicketId)}
              disabled={loading}
              className="px-6 py-3 bg-[#aa8453] hover:bg-[#8f6d40] text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Search size={16} />
              <span>{loading ? "Verifying..." : "Verify ID"}</span>
            </button>

            <button
              onClick={() => setScannerActive(!scannerActive)}
              className={`px-5 py-3 border font-semibold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 ${
                scannerActive ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Camera size={16} />
              <span>{scannerActive ? "Close Cam" : "Scan QR"}</span>
            </button>
          </div>

          {/* QR Camera Reader Mount */}
          {scannerActive && (
            <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
              <p className="text-xs text-gray-300 mb-3 uppercase tracking-wider font-semibold">Point camera at digital or printed ticket QR code</p>
              <div id="qr-reader" className="mx-auto overflow-hidden rounded-lg max-w-sm"></div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3 mb-8">
            <XCircle className="mx-auto text-red-500" size={42} />
            <h3 className="text-xl font-serif text-red-800 font-bold">Verification Failed</h3>
            <p className="text-sm text-red-600 max-w-md mx-auto">{errorMsg}</p>
          </div>
        )}

        {ticketData && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
            
            {/* Verification Status Header */}
            <div className={`p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 ${
              ticketData.status === 'Cancelled' || ticketData.status === 'Refunded'
                ? 'bg-rose-900'
                : ticketData.status === 'Boarded'
                  ? 'bg-blue-900'
                  : 'bg-[#1b1b1b]'
            }`}>
              <div className="flex items-center space-x-3">
                {ticketData.status === 'Cancelled' || ticketData.status === 'Refunded' ? (
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                    <XCircle size={28} />
                  </div>
                ) : ticketData.status === 'Boarded' ? (
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <CheckCircle2 size={28} />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={28} />
                  </div>
                )}
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-serif tracking-tight">{ticketData.ticketId}</h2>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                      ticketData.status === 'Cancelled' || ticketData.status === 'Refunded'
                        ? 'bg-red-500 text-white'
                        : ticketData.status === 'Boarded'
                          ? 'bg-blue-500 text-white'
                          : 'bg-emerald-500 text-white'
                    }`}>
                      {ticketData.status === 'Cancelled' ? 'CANCELLED / REFUNDED' : ticketData.status === 'Boarded' ? 'BOARDED' : 'VALID & AUTHENTIC'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 font-light mt-0.5">SafarLink Security Verification System</p>
                </div>
              </div>

              {/* QR Code thumbnail */}
              {ticketData.qrCodeDataUrl && (
                <div className="p-1 bg-white rounded-lg shadow">
                  <img src={ticketData.qrCodeDataUrl} alt="QR Code" className="w-16 h-16 object-contain" />
                </div>
              )}
            </div>

            {/* Passenger Manifest Grid */}
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Route & Bus Banner */}
              <div className="bg-[#fcfaf7] p-5 rounded-xl border border-[#aa8453]/20 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-lg border border-gray-200 text-[#aa8453] shadow-sm">
                    <Bus size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#aa8453] font-bold tracking-widest uppercase font-condensed">FLEET SERVICE</span>
                    <h3 className="text-lg font-serif font-bold text-gray-900">{ticketData.bus}</h3>
                    <p className="text-xs text-gray-600 font-medium">{ticketData.routeFrom} ➔ {ticketData.routeTo}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase font-condensed block">DATE</span>
                    <span className="text-sm font-semibold text-gray-800">{formatVoyageDate(ticketData.date)}</span>
                  </div>
                  <div className="border-l border-gray-200 pl-6">
                    <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase font-condensed block">DEPARTURE</span>
                    <span className="text-sm font-semibold text-[#aa8453]">{ticketData.departureTime}</span>
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase font-condensed block mb-1">PASSENGER NAME</span>
                  <span className="text-base font-serif font-bold text-gray-800 flex items-center">
                    <User size={15} className="mr-1.5 text-gray-400" />
                    {ticketData.userName}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase font-condensed block mb-1">CONTACT NUMBER</span>
                  <span className="text-sm font-mono font-medium text-gray-800 flex items-center">
                    <Phone size={14} className="mr-1.5 text-gray-400" />
                    {ticketData.passengerPhone}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase font-condensed block mb-1">NATIONAL CNIC</span>
                  <span className="text-sm font-mono font-medium text-gray-800 flex items-center">
                    <CreditCard size={14} className="mr-1.5 text-gray-400" />
                    {ticketData.passengerCnic}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase font-condensed block mb-1">ALLOCATED SEAT(S)</span>
                  <span className="text-lg font-serif font-bold text-[#aa8453]">
                    {Array.isArray(ticketData.seats) ? ticketData.seats.join(", ") : ticketData.seats}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase font-condensed block mb-1">TOTAL FARE PAID</span>
                  <span className="text-lg font-serif font-bold text-gray-900">
                    {ticketData.amount}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase font-condensed block mb-1">PASSENGER EMAIL</span>
                  <span className="text-xs text-gray-700 truncate block">
                    {ticketData.passengerEmail || "N/A"}
                  </span>
                </div>
              </div>

              {/* Cancellation notice if cancelled */}
              {(ticketData.status === 'Cancelled' || ticketData.status === 'Refunded') && (
                <div className="p-5 bg-red-50/90 border border-red-200 rounded-2xl text-red-900 space-y-2.5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle size={18} className="text-red-600 shrink-0" />
                      <span className="font-bold text-sm text-red-950 uppercase tracking-wide">Ticket Cancelled</span>
                    </div>
                    {ticketData.cancelledAt && (
                      <span className="text-[11px] font-mono text-red-700 bg-red-100/80 px-2 py-0.5 rounded">
                        {new Date(ticketData.cancelledAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-red-900">
                      Station Status: <span className="font-bold text-red-950">{ticketData.cancelledBy || `Cancelled by User (${ticketData.passengerEmail || "user"})`}</span>
                    </p>
                    {ticketData.cancellationReason && (
                      <p className="text-red-700">Reason: {ticketData.cancellationReason}</p>
                    )}
                    <p className="text-red-800">
                      Refund Processed: <strong className="text-red-950 font-bold">Rs. {ticketData.refundAmount?.toLocaleString() || 0}</strong> ({ticketData.refundPercentage || 25}% policy tier).
                    </p>
                  </div>

                  {/* 2-3 Working days refund notice */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center space-x-2.5">
                    <Info size={16} className="text-emerald-600 shrink-0" />
                    <p className="text-xs font-bold leading-relaxed">
                      Notice: Your amount will be refunded within 2-3 working days!
                    </p>
                  </div>
                </div>
              )}

              {/* Cancellation Validity Info Bar when Upcoming */}
              {ticketData.status === 'Upcoming' && (() => {
                const validity = getCancellationValidity(ticketData.date, ticketData.departureTime);
                return (
                  <div className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    validity.canCancel
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <Clock size={16} className={`shrink-0 mt-0.5 ${validity.canCancel ? 'text-[#aa8453]' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-bold">
                          {validity.canCancel ? 'Cancellation Window Active' : 'Cancellation Window Closed'}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {validity.canCancel
                            ? `Valid until 30 minutes before bus departure (Cutoff: ${validity.deadlineText} • ${validity.remainingDesc})`
                            : `Cancellations can only be made up to 30 minutes before bus departure timing (${validity.remainingDesc})`}
                        </p>
                      </div>
                    </div>
                    {validity.canCancel && (
                      <span className="px-2.5 py-1 bg-[#aa8453]/15 text-[#aa8453] rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                        {validity.remainingDesc}
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                {ticketData.status === 'Upcoming' && (
                  <button
                    onClick={handleMarkBoarded}
                    disabled={isBoarding}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>{isBoarding ? "Updating..." : "Confirm Passenger Boarding"}</span>
                  </button>
                )}

                {/* Cancel Ticket Button (User & Admin Side with 30m cutoff enforcement) */}
                {ticketData.status === 'Upcoming' && (() => {
                  const validity = getCancellationValidity(ticketData.date, ticketData.departureTime);
                  return (
                    <button
                      onClick={() => {
                        if (validity.canCancel) {
                          setShowCancelModal(true);
                        } else {
                          toast.error("Cancellation deadline expired (must be at least 30 minutes before departure).");
                        }
                      }}
                      disabled={!validity.canCancel}
                      className={`py-3.5 px-5 font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 ${
                        validity.canCancel
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 shadow-sm cursor-pointer'
                          : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
                      }`}
                      title={validity.canCancel ? `Cancellation valid until ${validity.deadlineText}` : "Cancellation closed: within 30 minutes of departure"}
                    >
                      <RotateCcw size={15} />
                      <span>{validity.canCancel ? "Cancel Ticket" : "Cancel (Cutoff Reached)"}</span>
                    </button>
                  );
                })()}

                <button
                  onClick={handleDownload}
                  className="py-3.5 px-6 border border-gray-300 hover:border-[#aa8453] bg-white text-gray-800 hover:text-[#aa8453] font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Download size={16} />
                  <span>Download PDF Manifest</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {showCancelModal && ticketData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#aa8453]/20 animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-[#1b1b1b] p-6 text-white relative border-b border-[#aa8453]/30">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="absolute top-6 right-6 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition cursor-pointer"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-[#aa8453] mb-1">
                  <RotateCcw size={13} />
                  <span>Ticket Cancellation</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif">Cancel Ticket #{ticketData.ticketId}</h3>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Refund Notice Highlight */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span className="font-bold text-sm">Refund Guarantee</span>
                  </div>
                  <p className="text-sm font-bold text-emerald-800">
                    Your amount will be refunded within 2-3 working days!
                  </p>
                  <p className="text-xs text-emerald-700">
                    The refund will be returned to your original payment method.
                  </p>
                </div>

                {/* Booking Summary */}
                <div className="bg-[#fcfaf7] p-4 rounded-2xl border border-[#aa8453]/20 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Passenger:</span>
                    <span className="font-bold text-gray-800">{ticketData.userName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Fleet Service:</span>
                    <span className="font-bold text-gray-800">{ticketData.bus}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Route:</span>
                    <span className="font-bold text-gray-800">{ticketData.routeFrom} ➔ {ticketData.routeTo}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Travel Date:</span>
                    <span className="font-bold text-gray-800">{ticketData.date} ({ticketData.departureTime})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Seats:</span>
                    <span className="font-bold text-[#aa8453]">{Array.isArray(ticketData.seats) ? ticketData.seats.join(", ") : ticketData.seats}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Total Paid:</span>
                    <span className="font-bold text-gray-900 text-sm">{ticketData.amount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Refund Policy Tier:</span>
                    <span className="font-bold text-[#aa8453]">25% Refund Tier</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500 font-medium">Refund Payable:</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      Rs. {Math.round(((parseInt(String(ticketData.amount).replace(/[^\d]/g, ''), 10) || 0) * 25) / 100).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Cancellation Reason Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Reason for Cancellation</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-[#aa8453] focus:border-[#aa8453] outline-none"
                  >
                    <option value="Change of travel plans">Change of travel plans</option>
                    <option value="Personal / family emergency">Personal / family emergency</option>
                    <option value="Booked wrong bus or timing">Booked wrong bus or timing</option>
                    <option value="Found alternative transport">Found alternative transport</option>
                    <option value="Other customer reason">Other reason</option>
                  </select>
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                  <strong>Please Note:</strong> Cancellation can only be valid till half hour before the bus departure timing. Confirmation emails will be sent to your email and our admin team.
                </div>

                {/* Modal Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    onClick={handleUserCancelTicket}
                    disabled={isCancelling}
                    className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw size={15} />
                    <span>{isCancelling ? "Processing Cancellation..." : "Confirm Cancellation & Refund"}</span>
                  </button>
                  <button
                    onClick={() => setShowCancelModal(false)}
                    disabled={isCancelling}
                    className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Keep Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center">
          <Link to="/" className="text-xs text-gray-500 hover:text-[#aa8453] tracking-widest uppercase font-semibold transition-colors">
            ← Return to SafarLink Home
          </Link>
        </div>

      </div>
    </div>
  );
};

export default TicketVerifyPage;
