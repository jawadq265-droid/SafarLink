import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Bus,
  CheckCircle2,
  Share2,
  Download,
  Smartphone,
  Wallet,
  Tag,
  Percent,
  X,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadTicketPDF, shareTicketPDF, formatVoyageDate } from '../../utils/ticket-pdf';

interface AppliedPromoType {
  code: string;
  title: string;
  message?: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
}

const BookingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(2);
  const [selectedRoute] = useState(() => {
    const saved = localStorage.getItem("booking_bus");
    if (saved) {
      try {
        const busObj = JSON.parse(saved);
        return {
          id: busObj.id,
          from: busObj.from,
          to: busObj.to,
          price: parseInt(String(busObj.price || 0).replace(/[^\d]/g, '')) || 1500,
          time: busObj.time,
          bus: busObj.name || busObj.bus || "Safar Express",
          date: busObj.date,
        };
      } catch (e) {
        // ignore
      }
    }
    return { id: 1, from: "Lahore", to: "Islamabad", price: 1500, time: "09:00 AM", bus: "Safar Express", date: "" };
  });

  const voyageDate = formatVoyageDate(selectedRoute?.date);

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [seatGenders, setSeatGenders] = useState<Record<number, 'Male' | 'Female'>>({});
  const [pendingGenderSeat, setPendingGenderSeat] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [passengerInfo, setPassengerInfo] = useState(() => ({
    name: localStorage.getItem("userName") || '',
    phone: '',
    cnic: '',
    email: localStorage.getItem("userEmail") || ''
  }));

  // Promo Code States
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromoType | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');

  const rawTotalAmount = selectedSeats.length * (selectedRoute?.price || 0);
  const discountAmount = appliedPromo?.discountAmount || 0;
  const finalPayableAmount = Math.max(0, rawTotalAmount - discountAmount);

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    if (rawTotalAmount <= 0) {
      toast.error("Please select at least one seat first.");
      return;
    }

    setIsApplyingPromo(true);
    setPromoError('');

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
      const res = await fetch(`${baseUrl}promotions/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: promoCodeInput.trim().toUpperCase(),
          amount: rawTotalAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid promo code");
      }

      setAppliedPromo(data.discountDetails);
      setPromoError('');
      toast.success(data.message || `Promo code "${data.discountDetails.code}" applied!`);
    } catch (err: any) {
      setPromoError(err.message || "Failed to apply promo code");
      toast.error(err.message || "Failed to apply promo code");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
    toast.success("Promo code removed");
  };


  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first to reserve tickets.");
      navigate("/login");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const message = params.get("message");
    if (status === "error") {
      toast.error(message || "Payment failed or was cancelled.");
      setStep(4);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [bookedSeatGenders, setBookedSeatGenders] = useState<Record<string, string>>({});

  React.useEffect(() => {
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
    const busName = selectedRoute?.bus || "";
    const dateStr = selectedRoute?.date || "";
    if (busName && dateStr) {
      fetch(`${baseUrl}payment/booked-seats?bus=${encodeURIComponent(busName)}&date=${encodeURIComponent(dateStr)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.bookedSeats)) {
            setBookedSeats(data.bookedSeats);
            if (data.seatGenderMap) {
              setBookedSeatGenders(data.seatGenderMap);
            }
          }
        })
        .catch(err => console.error("Error fetching booked seats:", err));
    }
  }, [selectedRoute]);

  const seats = React.useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const seatIdStr = String(i + 1);
      const isBooked = bookedSeats.includes(seatIdStr);
      const bookedGender = isBooked
        ? (bookedSeatGenders[seatIdStr] || bookedSeatGenders[String(i + 1)] || bookedSeatGenders[i + 1] || 'Male')
        : undefined;
      return {
        id: i + 1,
        status: isBooked ? 'booked' : 'available',
        bookedGender
      };
    });
  }, [bookedSeats, bookedSeatGenders]);

  // Formatting functions
  const formatCNIC = (val: string) => {
    const digits = val.replace(/\D/g, '');
    let res = '';
    if (digits.length > 0) res += digits.slice(0, 5);
    if (digits.length > 5) res += '-' + digits.slice(5, 12);
    if (digits.length > 12) res += '-' + digits.slice(12, 13);
    return res;
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '');
    return digits.match(/.{1,4}/g)?.join(' ').slice(0, 19) || digits;
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    return digits;
  };

  const formatPhone = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    return digits.slice(0, 10);
  };

  const nextStep = () => {
    if (step === 2 && selectedSeats.length === 0) {
      toast.error("Please select your seats");
      return;
    }
    if (step === 2) {
      const missingGender = selectedSeats.some(s => !seatGenders[s]);
      if (missingGender) {
        toast.error("Please select gender (Male/Female) for each selected seat");
        return;
      }
    }
    if (step === 3) {
      if (!passengerInfo.name || passengerInfo.phone.length < 10 || passengerInfo.cnic.length < 15 || !passengerInfo.email) {
        toast.error("Please provide valid passenger details including email");
        return;
      }
    }
    if (step === 4) {
      setIsProcessing(true);

      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";
      const ticketId = `SL-${Date.now()}`;

      // Save temporary booking details to localStorage before leaving the site
      const tempBooking = {
        selectedRoute,
        selectedSeats,
        seatGenders,
        passengerInfo,
        userEmail: localStorage.getItem("userEmail") || passengerInfo.email,
        ticketId,
        promoCode: appliedPromo?.code || null,
        discountAmount: discountAmount,
        originalAmount: `Rs. ${rawTotalAmount}`,
        amount: `Rs. ${finalPayableAmount}`
      };
      localStorage.setItem("temp_booking", JSON.stringify(tempBooking));

      fetch(`${baseUrl}payment/stripe/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: finalPayableAmount,
          rawAmount: rawTotalAmount,
          promoCode: appliedPromo?.code || null,
          description: `Booking for ${selectedRoute?.from} to ${selectedRoute?.to}`,
          ticketId: ticketId
        })
      })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => { throw new Error(err.message || "Payment initiation failed"); });
        }
        return res.json();
      })
      .then((data) => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error("Stripe checkout URL missing");
        }
      })
      .catch((err) => {
        setIsProcessing(false);
        toast.error(err.message || "Stripe payment failed. Please try again.");
      });
      return;
    }
    setStep(step + 1);
  };

  const handleDownloadPDF = () => {
    downloadTicketPDF({
      passengerName: passengerInfo?.name,
      phone: passengerInfo?.phone,
      cnic: passengerInfo?.cnic,
      email: passengerInfo?.email,
      busName: selectedRoute?.bus,
      routeFrom: selectedRoute?.from,
      routeTo: selectedRoute?.to,
      date: selectedRoute?.date,
      time: selectedRoute?.time,
      seats: selectedSeats?.join(", "),
      amount: `Rs. ${finalPayableAmount}`
    });
  };

  const handleShareTicket = async () => {
    await shareTicketPDF({
      passengerName: passengerInfo?.name,
      phone: passengerInfo?.phone,
      cnic: passengerInfo?.cnic,
      email: passengerInfo?.email,
      busName: selectedRoute?.bus,
      routeFrom: selectedRoute?.from,
      routeTo: selectedRoute?.to,
      date: selectedRoute?.date,
      time: selectedRoute?.time,
      seats: selectedSeats?.join(", "),
      amount: `Rs. ${finalPayableAmount}`
    });
  };

  const prevStep = () => {
    if (step > 2) {
      setStep(step - 1);
    } else {
      navigate("/bus");
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };



  const handleSeatClick = (seatId: number, status: string) => {
    if (status === 'booked') return;
    if (selectedSeats.includes(seatId)) {
      // Deselect: remove seat and its gender
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
      setSeatGenders(prev => {
        const updated = { ...prev };
        delete updated[seatId];
        return updated;
      });
    } else {
      // Open gender picker for this seat
      setPendingGenderSeat(seatId);
    }
  };

  const handleGenderSelect = (gender: 'Male' | 'Female') => {
    if (pendingGenderSeat === null) return;
    setSelectedSeats(prev => [...prev, pendingGenderSeat]);
    setSeatGenders(prev => ({ ...prev, [pendingGenderSeat]: gender }));
    setPendingGenderSeat(null);
  };

  const renderSeatSelection = () => (
    <motion.div variants={stepVariants as any} initial="hidden" animate="visible" exit="exit" className="space-y-4 p-2 max-w-4xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-serif text-gray-900 leading-none">Select your Seats</h2>
        <p className="text-xs text-[#aa8453] tracking-[0.2em] uppercase font-condensed font-semibold">Tap a seat to select and specify gender</p>
      </div>

      {/* Gender Picker Modal */}
      {pendingGenderSeat !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#aa8453]/30 p-6 max-w-xs w-full text-center space-y-4">
            <h3 className="text-lg font-serif font-bold text-gray-900">Seat {pendingGenderSeat}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-condensed font-semibold">Select Passenger Gender</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleGenderSelect('Male')}
                className="flex-1 py-4 rounded-xl bg-blue-50 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-100 text-blue-800 font-bold text-sm uppercase tracking-wider transition-all"
              >
                ♂ Male
              </button>
              <button
                onClick={() => handleGenderSelect('Female')}
                className="flex-1 py-4 rounded-xl bg-pink-50 border-2 border-pink-200 hover:border-pink-500 hover:bg-pink-100 text-pink-800 font-bold text-sm uppercase tracking-wider transition-all"
              >
                ♀ Female
              </button>
            </div>
            <button
              onClick={() => setPendingGenderSeat(null)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto luxury-card p-6 rounded-none relative overflow-hidden">
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-4 text-xs font-condensed">
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-sm border border-gray-300 bg-white inline-block"></span> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-sm bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center inline-block">♂</span> Selected (Male)</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-sm bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center inline-block">♀</span> Selected (Female)</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-sm bg-blue-100 border border-blue-300 text-blue-800 text-[9px] font-bold flex items-center justify-center inline-block">♂</span> Booked (Male)</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-sm bg-pink-100 border border-pink-300 text-pink-800 text-[9px] font-bold flex items-center justify-center inline-block">♀</span> Booked (Female)</span>
        </div>
        <div className="bg-[#fcfbf9] p-6 rounded-none border border-gray-100">
          <div className="grid grid-cols-5 gap-y-4 gap-x-4">
            {seats.map((seat, index) => {
              const mySelectedGender = seatGenders[seat.id];
              const isSelected = selectedSeats.includes(seat.id);
              const isBooked = seat.status === 'booked';
              const bookedGender = (seat as any).bookedGender;

              let buttonClass = 'bg-white border border-gray-200 text-[#1b1b1b] hover:border-[#aa8453] hover:shadow-xl';
              let badge = null;

              if (isBooked) {
                if (bookedGender === 'Female') {
                  buttonClass = 'bg-pink-100 border-2 border-pink-400 text-pink-900 cursor-not-allowed shadow-sm';
                  badge = <span className="text-[10px] font-bold text-pink-700 leading-none mt-0.5">♀ Female</span>;
                } else {
                  buttonClass = 'bg-blue-100 border-2 border-blue-400 text-blue-900 cursor-not-allowed shadow-sm';
                  badge = <span className="text-[10px] font-bold text-blue-700 leading-none mt-0.5">♂ Male</span>;
                }
              } else if (isSelected) {
                if (mySelectedGender === 'Female') {
                  buttonClass = 'bg-pink-600 text-white shadow-2xl ring-4 ring-pink-300/50';
                  badge = <span className="text-[10px] font-bold text-white leading-none mt-0.5">♀ Female</span>;
                } else {
                  buttonClass = 'bg-blue-600 text-white shadow-2xl ring-4 ring-blue-300/50';
                  badge = <span className="text-[10px] font-bold text-white leading-none mt-0.5">♂ Male</span>;
                }
              }

              const seatEl = (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat.id, seat.status)}
                  className={`aspect-square rounded-none flex flex-col items-center justify-center font-serif text-sm transition-all duration-300 transform ${!isBooked ? 'hover:scale-105' : ''} ${buttonClass}`}
                  disabled={isBooked}
                  title={isBooked ? `Seat ${seat.id} is already booked (${bookedGender ? `Booked by ${bookedGender}` : 'Reserved'})` : `Seat ${seat.id}`}
                >
                  <span className="font-bold">{seat.id}</span>
                  {badge}
                </button>
              );

              const isEndOfSecondCol = index % 4 === 1;

              return (
                <React.Fragment key={seat.id}>
                  {seatEl}
                  {isEndOfSecondCol && <div className="w-full flex items-center justify-center"><div className="w-[1px] h-full bg-gray-200"></div></div>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <div className="max-w-xl mx-auto bg-[#fcfbf9] border border-[#aa8453]/20 p-3 rounded-none">
          <p className="text-xs font-condensed uppercase tracking-wider text-gray-500 mb-2 font-semibold">Selected Seats</p>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(s => (
              <span key={s} className={`text-xs font-bold px-2.5 py-1 rounded-md ${seatGenders[s] === 'Female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'}`}>
                Seat {s} — {seatGenders[s] || '⚠ No gender'}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6 max-w-xl mx-auto items-center">
        <button onClick={prevStep} className="luxury-button-outline !text-gray-900 !border-gray-300 !px-10 !py-3 uppercase text-xs font-bold tracking-wider hover:bg-gray-100">Back</button>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-xs text-gray-500 font-condensed uppercase tracking-wider mb-0.5">Total Valuation</p>
            <p className="text-2xl font-serif text-[#aa8453] tracking-tight">Rs. {selectedSeats.length * (selectedRoute?.price || 0)}</p>
          </div>
          <button onClick={nextStep} className="luxury-button !px-12 !py-3.5 uppercase text-xs font-bold tracking-wider">
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderDetails = () => (
    <motion.div variants={stepVariants as any} initial="hidden" animate="visible" exit="exit" className="space-y-4 p-2 max-w-4xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-serif text-gray-900 leading-none">Passenger Profile</h2>
        <p className="text-xs text-[#aa8453] tracking-[0.25em] uppercase font-condensed font-semibold">GUEST INFORMATION</p>
      </div>
      <div className="max-w-xl mx-auto luxury-card p-6 rounded-none border border-gray-100 relative overflow-hidden group">
        <div className="space-y-4 relative z-10">
          <div className="relative">
            <label className="block text-xs font-semibold text-[#aa8453] tracking-wider uppercase font-condensed mb-1 ml-0.5">Full Name</label>
            <input
              type="text"
              value={passengerInfo.name}
              onChange={(e) => setPassengerInfo({ ...passengerInfo, name: e.target.value })}
              placeholder="e.g. Muhammad Jawad"
              className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:border-[#aa8453] border border-b-2 rounded-none outline-none text-gray-800 text-base font-serif transition-all"
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-semibold text-[#aa8453] tracking-wider uppercase font-condensed mb-1 ml-0.5">Email Address</label>
            <input
              type="email"
              value={passengerInfo.email}
              onChange={(e) => setPassengerInfo({ ...passengerInfo, email: e.target.value })}
              placeholder="e.g. jawad@example.com"
              className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:border-[#aa8453] border border-b-2 rounded-none outline-none text-gray-800 text-base font-serif transition-all"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-[#aa8453] tracking-wider uppercase font-condensed mb-1 ml-0.5">Contact Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-serif text-base">+92</span>
                <input
                  type="text"
                  value={passengerInfo.phone}
                  onChange={(e) => setPassengerInfo({ ...passengerInfo, phone: formatPhone(e.target.value) })}
                  placeholder="3001234567"
                  className="w-full pl-14 pr-4 py-2.5 bg-gray-50 border-transparent focus:border-[#aa8453] border border-b-2 rounded-none outline-none text-gray-800 text-base font-serif transition-all tracking-wider"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-[#aa8453] tracking-wider uppercase font-condensed mb-1 ml-0.5">National ID (CNIC)</label>
              <input
                type="text"
                value={passengerInfo.cnic}
                onChange={(e) => setPassengerInfo({ ...passengerInfo, cnic: formatCNIC(e.target.value) })}
                placeholder="35201-XXXXXXX-X"
                className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:border-[#aa8453] border border-b-2 rounded-none outline-none text-gray-800 text-base font-serif transition-all tracking-widest"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-6 max-w-xl mx-auto items-center">
        <button onClick={prevStep} className="luxury-button-outline !text-gray-900 !border-gray-300 !px-10 !py-3 uppercase text-xs font-bold tracking-wider hover:bg-gray-100">Back</button>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-xs text-gray-500 font-condensed uppercase tracking-wider mb-0.5">Total Valuation</p>
            <p className="text-2xl font-serif text-[#aa8453] tracking-tight">Rs. {rawTotalAmount}</p>
          </div>
          <button onClick={nextStep} className="luxury-button !px-12 !py-3.5 uppercase text-xs font-bold tracking-wider">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderPaymentSelection = () => (
    <motion.div variants={stepVariants as any} initial="hidden" animate="visible" exit="exit" className="space-y-4 p-2 max-w-4xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-serif text-gray-900 leading-none">Payment & Summary</h2>
        <p className="text-xs text-[#aa8453] tracking-[0.25em] uppercase font-condensed font-semibold">SECURE SETTLEMENT & PROMOTIONS</p>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        {/* Promo Code Voucher Card */}
        <div className="luxury-card p-5 rounded-none border border-[#aa8453]/30 bg-gradient-to-r from-[#fcfaf7] to-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Tag size={18} className="text-[#aa8453]" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-800 font-condensed">Apply Promo Code / Voucher</span>
            </div>
            {appliedPromo && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                <Sparkles size={12} className="mr-1" />
                Promo Applied
              </span>
            )}
          </div>

          {!appliedPromo ? (
            <div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => {
                      setPromoCodeInput(e.target.value.toUpperCase());
                      setPromoError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyPromoCode();
                      }
                    }}
                    placeholder="ENTER PROMO CODE (e.g. SUMMER20)"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 focus:border-[#aa8453] uppercase tracking-wider font-serif text-sm outline-none text-gray-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyPromoCode}
                  disabled={isApplyingPromo || !promoCodeInput.trim()}
                  className="luxury-button !px-6 !py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isApplyingPromo ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
              {promoError && (
                <p className="text-xs text-red-600 mt-2 font-medium">{promoError}</p>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50/80 border border-emerald-300 p-3.5 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm tracking-wider text-emerald-900 uppercase font-serif">{appliedPromo.code}</span>
                  <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
                    {appliedPromo.discountType === 'percentage' ? `${appliedPromo.discountValue}% OFF` : `Rs. ${appliedPromo.discountValue} OFF`}
                  </span>
                </div>
                <p className="text-xs text-emerald-700 mt-0.5">
                  You save <strong className="font-bold">Rs. {appliedPromo.discountAmount}</strong> on this booking!
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemovePromoCode}
                className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                title="Remove promo code"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Payment & Valuation Summary Card */}
        <div className="luxury-card p-6 rounded-none border border-gray-100 relative overflow-hidden group">
          {isProcessing ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 border-[2px] border-gray-100 border-t-[#aa8453] rounded-full animate-spin"></div>
              <div className="text-center">
                <h3 className="text-xl font-serif text-gray-800">Redirecting to Stripe...</h3>
                <p className="text-[#aa8453] mt-2 animate-pulse text-xs tracking-[0.2em] uppercase font-condensed font-semibold">Connecting to Stripe Secure Gateway</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 relative z-10">
              <div className="bg-[#fcfbf9] p-4 rounded-none border border-gray-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-condensed uppercase tracking-wider font-semibold">Standard Fare ({selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'})</span>
                  <span className="font-serif font-bold text-gray-800">Rs. {rawTotalAmount}</span>
                </div>

                {discountAmount > 0 && appliedPromo && (
                  <div className="flex items-center justify-between text-sm text-emerald-700 border-t border-dashed border-gray-200 pt-2">
                    <span className="font-condensed uppercase tracking-wider font-semibold flex items-center gap-1">
                      <Percent size={14} />
                      Promo Discount ({appliedPromo.code})
                    </span>
                    <span className="font-serif font-bold text-emerald-700">- Rs. {discountAmount}</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-none shadow-sm border border-gray-100">
                      <Wallet className="text-[#aa8453]" size={22} />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-condensed font-semibold">Settlement via</p>
                      <p className="text-xs font-serif font-bold text-gray-800">Stripe Gateway</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-condensed font-semibold">Authorized Amount</p>
                    <p className="text-2xl font-serif text-[#aa8453] font-bold">Rs. {finalPayableAmount}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 bg-[#fcfbf9] p-3 border border-gray-100 font-sans text-gray-700 text-xs leading-relaxed">
                <p className="font-medium text-gray-800">You will be redirected to the secure <span className="text-[#aa8453] font-semibold">Stripe Payment Gateway</span>.</p>
                <p className="text-gray-500">Pay securely using Debit/Credit cards. Upon authorization, your verified digital ticket will be issued.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isProcessing && (
        <div className="flex justify-between mt-6 max-w-xl mx-auto items-center">
          <button onClick={prevStep} className="luxury-button-outline !text-gray-900 !border-gray-300 !px-10 !py-3 uppercase text-xs font-bold tracking-wider hover:bg-gray-100">Return to Profile</button>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-xs text-gray-500 font-condensed uppercase tracking-wider mb-0.5">Total Valuation</p>
              <p className="text-2xl font-serif text-[#aa8453] tracking-tight font-bold">Rs. {finalPayableAmount}</p>
            </div>
            <button onClick={nextStep} className="luxury-button !px-12 !py-3.5 uppercase text-xs font-bold tracking-wider">
              Proceed to Stripe
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderTicket = () => {
    const today = new Date();
    const issuedDate = today.toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });
    const voyageDate = formatVoyageDate(selectedRoute?.date);

    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-16">
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
                <p className="text-[10px] opacity-40 uppercase font-condensed tracking-[0.3em] mb-2">Issued On</p>
                <p className="text-xl md:text-2xl font-serif tracking-tighter whitespace-nowrap">{issuedDate}</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-8 md:p-20">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-16 gap-6">
              <div className="text-center flex-1 min-w-0">
                <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 leading-tight break-words">{selectedRoute?.from}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-condensed mt-2">Port of Origin</p>
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
                <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-3">Allocated</p>
                <p className="text-base sm:text-lg md:text-2xl font-serif text-[#aa8453] break-all">{selectedSeats.join(", ")}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-3">Voyage Date</p>
                <p className="text-base sm:text-lg md:text-2xl font-serif text-gray-900">{voyageDate}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-3">Transit Class</p>
                <p className="text-base sm:text-lg md:text-2xl font-serif text-gray-900">Executive</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-[#fcfbf9] p-6 sm:p-8 md:p-12 rounded-none border border-gray-100 gap-6">
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-2">Secure Link</p>
                <p className="text-2xl sm:text-3xl font-serif text-gray-900 tracking-tighter whitespace-nowrap">+92 {passengerInfo.phone}</p>
              </div>
              <div className="text-left md:text-right min-w-0">
                <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-2">Paid in Full</p>
                <p className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#aa8453] tracking-tighter leading-none">Rs. {finalPayableAmount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pb-32 no-print">
          <button onClick={handleDownloadPDF} className="luxury-button !py-5 !px-16 flex items-center space-x-4 w-full sm:w-auto justify-center">
            <Download size={24} />
            <span>DOWNLOAD TICKET (PDF)</span>
          </button>
          <button onClick={handleShareTicket} className="luxury-button-outline !text-gray-900 !border-gray-200 !py-5 !px-16 flex items-center space-x-4 w-full sm:w-auto justify-center">
            <Share2 size={24} />
            <span>SHARE TICKET (PDF)</span>
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Luxury Progress Header */}
        <div className="bg-[#1b1b1b] p-6 rounded-none mb-8 relative overflow-hidden border-b-4 border-[#aa8453] shadow-2xl no-print">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[5rem] font-serif text-white opacity-[0.02] whitespace-nowrap pointer-events-none">
            RESERVATION
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-xs text-[#aa8453] tracking-[0.3em] uppercase font-condensed font-semibold">SECURE CONCIERGE</p>
              <h1 className="text-3xl font-serif text-white tracking-tight">Luxury Reservation</h1>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {[2, 3, 4, 5].map((i) => (
                <React.Fragment key={i}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-none border transition-all duration-700 ${step >= i ? 'bg-[#aa8453] text-white border-[#aa8453] shadow-2xl' : 'bg-transparent text-white/20 border-white/10'
                    }`}>
                    {step > i ? <CheckCircle2 size={20} /> : <span className="font-serif text-base">{i - 1}</span>}
                  </div>
                  {i < 5 && <div className={`w-10 h-[1px] ${step > i ? 'bg-[#aa8453]' : 'bg-white/10'}`}></div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmed Voyage Summary Strip */}
        {step < 5 && selectedRoute && (
          <div className="bg-[#fcfbf9] border border-[#aa8453]/30 p-4 mb-8 flex flex-wrap items-center justify-between gap-4 no-print shadow-sm">
            <div className="flex items-center space-x-3">
              <Bus size={20} className="text-[#aa8453]" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-condensed tracking-wider font-semibold">Fleet Service</p>
                <p className="text-base font-serif font-bold text-gray-900">{selectedRoute?.bus}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-center sm:text-right">
                <p className="text-xs text-[#aa8453] uppercase font-condensed tracking-wider font-semibold">Departure</p>
                <p className="text-lg font-serif font-bold text-gray-900">{selectedRoute?.from}</p>
              </div>
              <span className="text-[#aa8453] font-bold text-xl px-1">➔</span>
              <div className="text-center sm:text-left">
                <p className="text-xs text-[#aa8453] uppercase font-condensed tracking-wider font-semibold">Arrival</p>
                <p className="text-lg font-serif font-bold text-gray-900">{selectedRoute?.to}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-condensed tracking-wider font-semibold">Voyage Schedule</p>
              <p className="text-base font-serif text-gray-900">{voyageDate} &bull; {selectedRoute?.time}</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: "circOut" }}
          >
            {step === 2 && renderSeatSelection()}
            {step === 3 && renderDetails()}
            {step === 4 && renderPaymentSelection()}
            {step === 5 && renderTicket()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingPage;
