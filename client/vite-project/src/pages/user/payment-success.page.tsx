import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bus,
  CheckCircle2,
  Share2,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const txnRefNo = params.get("txnRefNo") || params.get("session_id");

    if (status === "success" && txnRefNo) {
      const tempSaved = localStorage.getItem("temp_booking");
      if (tempSaved) {
        try {
          const parsed = JSON.parse(tempSaved);
          const finalizedBooking = {
            ...parsed,
            txnRefNo: txnRefNo
          };
          localStorage.setItem("latest_booking", JSON.stringify(finalizedBooking));
          setBookingData(finalizedBooking);

          const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
          fetch(`${baseUrl}payment/clearance-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ bookingData: finalizedBooking })
          })
          .then(res => res.json())
          .then(data => console.log("Clearance email sent:", data))
          .catch(err => console.error("Error sending clearance email:", err));

          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        } catch (e) {
          console.error(e);
        }
      }
    }

    const saved = localStorage.getItem("latest_booking");
    if (saved) {
      try {
        setBookingData(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleDownloadPDF = () => {
    window.print();
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-white pt-48 pb-32 flex flex-col items-center justify-center space-y-6">
        <h2 className="text-3xl font-serif text-gray-800">No active booking found</h2>
        <button
          onClick={() => navigate("/bus")}
          className="luxury-button !px-16 uppercase text-[10px] tracking-widest"
        >
          Book a Bus
        </button>
      </div>
    );
  }

  const { selectedRoute, selectedSeats, passengerInfo } = bookingData;
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white pt-48 pb-32">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Luxury Progress Header */}
        <div className="bg-[#1b1b1b] p-16 rounded-none mb-24 relative overflow-hidden border-b-4 border-[#aa8453] shadow-2xl no-print">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] font-serif text-white opacity-[0.02] whitespace-nowrap pointer-events-none">
            RESERVATION
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
            <div className="space-y-4">
              <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed">SECURE CONCIERGE</p>
              <h1 className="text-6xl font-serif text-white tracking-tight">Luxury Reservation</h1>
            </div>
            <div className="flex items-center space-x-6 mt-12 md:mt-0">
              {[2, 3, 4, 5].map((i) => (
                <React.Fragment key={i}>
                  <div className={`flex items-center justify-center w-14 h-14 rounded-none border transition-all duration-700 ${5 >= i ? 'bg-[#aa8453] text-white border-[#aa8453] shadow-2xl' : 'bg-transparent text-white/20 border-white/10'
                    }`}>
                    {5 > i ? <CheckCircle2 size={28} /> : <span className="font-serif text-xl">{i - 1}</span>}
                  </div>
                  {i < 5 && <div className={`w-16 h-[1px] ${5 > i ? 'bg-[#aa8453]' : 'bg-white/10'}`}></div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
        >
          <div className="space-y-16">
            <div className="text-center space-y-4 no-print">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-28 h-28 bg-[#aa8453] text-white rounded-none flex items-center justify-center mx-auto mb-10 shadow-2xl"
              >
                <CheckCircle2 size={64} />
              </motion.div>
              <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed">VOYAGE SEALED</p>
              <h2 className="text-5xl md:text-6xl font-serif text-gray-900 leading-tight">Manifest Authenticated</h2>
            </div>

            <div id="ticket" className="max-w-4xl mx-auto bg-white rounded-none shadow-2xl border border-gray-100 relative w-full overflow-hidden">
              <div className="bg-[#1b1b1b] p-6 md:p-16 text-white border-b border-[#aa8453]/30">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-3xl md:text-5xl font-serif tracking-tight">SAFARLINK</h3>
                    <p className="text-[10px] text-[#aa8453] tracking-[0.4em] uppercase font-condensed mt-4">Verified Digital Manifest</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] opacity-80 uppercase font-condensed tracking-[0.3em] mb-2">Issued On</p>
                    <p className="text-xl md:text-2xl font-serif tracking-tighter whitespace-nowrap">{formattedDate}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-8 md:p-20">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-16 gap-6">
                  <div className="text-center flex-1 min-w-0">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 leading-tight break-words">{selectedRoute?.from}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-condensed mt-2">Departure</p>
                  </div>
                  <div className="flex flex-col items-center px-4 md:px-8 shrink-0">
                    <Bus size={24} className="text-[#aa8453] mb-2" />
                    <div className="h-[1px] w-24 md:w-40 bg-gray-200 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[#aa8453] w-1/2 animate-slide-right"></div>
                    </div>
                  </div>
                  <div className="text-center flex-1 min-w-0">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 leading-tight break-words">{selectedRoute?.to}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-condensed mt-2">Final Destination</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 border-y border-gray-100 py-8 md:py-16 mb-8 md:mb-16">
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-3">Passenger</p>
                    <p className="text-base sm:text-lg md:text-2xl font-serif text-gray-900 break-words">{passengerInfo.name}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-3">Allocated Seat</p>
                    <p className="text-base sm:text-lg md:text-2xl font-serif text-gray-900 break-all">{selectedSeats.join(", ")}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-3"> Date</p>
                    <p className="text-base sm:text-lg md:text-xl font-serif text-gray-900">{formattedDate}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-3">Transit Class</p>
                    <p className="text-base sm:text-lg md:text-xl font-serif text-gray-900">Executive</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-[#fcfbf9] p-6 sm:p-8 md:p-12 rounded-none border border-gray-100 gap-6">
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-700 uppercase font-condensed tracking-widest mb-2">Passenger Contact</p>
                    <p className="text-2xl sm:text-3xl font-serif text-gray-900 tracking-tighter whitespace-nowrap">+92 {passengerInfo.phone}</p>
                  </div>
                  <div className="text-left md:text-right min-w-0">
                    <p className="text-[10px] text-gray-700 uppercase font-condensed tracking-widest mb-2">Paid</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#aa8453] tracking-tighter leading-none">Rs. {selectedSeats.length * (selectedRoute?.price || 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pb-32 no-print">
              <button onClick={handleDownloadPDF} className="luxury-button !py-5 !px-16 flex items-center space-x-4 w-full sm:w-auto justify-center">
                <Download size={24} />
                <span>ARCHIVE MANIFEST</span>
              </button>
              <button onClick={() => window.open(`https://wa.me/?text=Manifest Sealed for ${passengerInfo.name}`, '_blank')} className="luxury-button-outline !text-gray-900 !border-gray-200 !py-5 !px-16 flex items-center space-x-4 w-full sm:w-auto justify-center">
                <Share2 size={24} />
                <span>SHARE ON WHATSAPP</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
