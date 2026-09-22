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
  RotateCcw
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
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs space-y-1">
                  <p className="font-bold flex items-center">
                    <AlertTriangle size={15} className="mr-1 text-red-600" />
                    This ticket was cancelled on {ticketData.cancelledAt ? new Date(ticketData.cancelledAt).toLocaleString() : "record"}.
                  </p>
                  <p>Refund Amount: <strong>Rs. {ticketData.refundAmount?.toLocaleString() || 0}</strong> ({ticketData.refundPercentage || 0}% tier processed).</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                {ticketData.status === 'Upcoming' && (
                  <button
                    onClick={handleMarkBoarded}
                    disabled={isBoarding}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    <span>{isBoarding ? "Updating..." : "Confirm Passenger Boarding"}</span>
                  </button>
                )}

                <button
                  onClick={handleDownload}
                  className="py-3.5 px-6 border border-gray-300 hover:border-[#aa8453] bg-white text-gray-800 hover:text-[#aa8453] font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center justify-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download PDF Manifest</span>
                </button>
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
