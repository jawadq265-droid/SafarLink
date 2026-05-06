import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  MapPin,
  Bus,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Share2,
  Download,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [passengerInfo, setPassengerInfo] = useState({
    name: '',
    phone: '',
    cnic: ''
  });
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: ''
  });

  const routes = [
    { id: 1, from: "Lahore", to: "Islamabad", price: 1500, time: "09:00 AM", bus: "Safar Express (Luxury)" },
    { id: 2, from: "Karachi", to: "Lahore", price: 4500, time: "10:30 PM", bus: "Daewoo Gold (Executive)" },
    { id: 3, from: "Multan", to: "Lahore", price: 1200, time: "02:15 PM", bus: "Sania Express (Standard)" },
  ];

  // Fix: Move seats generation into useMemo so status doesn't change on every render
  const seats = React.useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i + 1,
      status: Math.random() > 0.8 ? 'booked' : 'available'
    }));
  }, []);

  // Formatting functions
  const formatCNIC = (val) => {
    const digits = val.replace(/\D/g, '');
    let res = '';
    if (digits.length > 0) res += digits.slice(0, 5);
    if (digits.length > 5) res += '-' + digits.slice(5, 12);
    if (digits.length > 12) res += '-' + digits.slice(12, 13);
    return res;
  };

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '');
    return digits.match(/.{1,4}/g)?.join(' ').slice(0, 19) || digits;
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    return digits;
  };

  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, '');
    return digits.slice(0, 11);
  };

  const nextStep = () => {
    if (step === 1 && !selectedRoute) {
      toast.error("Please select a travel route");
      return;
    }
    if (step === 2 && selectedSeats.length === 0) {
      toast.error("Please select your seats");
      return;
    }
    if (step === 3) {
      if (!passengerInfo.name || passengerInfo.phone.length < 11 || passengerInfo.cnic.length < 15) {
        toast.error("Please provide valid passenger details");
        return;
      }
    }
    if (step === 4) {
      if (cardDetails.number.length < 19 || cardDetails.expiry.length < 5 || cardDetails.cvc.length < 3) {
        toast.error("Please provide valid card details");
        return;
      }
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setStep(5);
        toast.success("Payment successful!");
      }, 2500);
      return;
    }
    setStep(step + 1);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const prevStep = () => setStep(step - 1);

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  const renderRouteSelection = () => (
    <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-16 p-4">
      <div className="text-center space-y-4">
        <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed">CHOOSE YOUR VOYAGE</p>
        <h2 className="text-5xl md:text-6xl font-serif text-gray-900 leading-tight">Luxury Routes & Suites</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {routes.map((route) => (
          <div
            key={route.id}
            onClick={() => setSelectedRoute(route)}
            className={`luxury-card p-10 border transition-all duration-700 cursor-pointer relative overflow-hidden bg-white ${selectedRoute?.id === route.id
              ? 'border-[#aa8453] shadow-2xl scale-105'
              : 'border-gray-100 hover:border-[#aa8453]/30 hover:shadow-xl'
              }`}
          >
            {selectedRoute?.id === route.id && (
              <div className="absolute top-8 right-8 text-[#aa8453]">
                <CheckCircle2 size={32} />
              </div>
            )}
            <div className="flex items-center space-x-6 mb-12">
              <div className="p-5 bg-[#1b1b1b] text-white rounded-none shadow-xl border border-[#aa8453]/30">
                <Bus size={32} />
              </div>
              <div>
                <h3 className="font-serif text-[#1b1b1b] text-2xl tracking-tight leading-tight">{route.bus}</h3>
                <p className="text-[10px] text-[#aa8453] font-condensed uppercase tracking-widest mt-1">Exclusive Line</p>
              </div>
            </div>
            <div className="space-y-10">
              <div className="flex items-center space-x-4 text-[#1b1b1b] bg-[#fcfbf9] p-6 rounded-none border border-gray-100">
                <MapPin size={22} className="text-[#aa8453]" />
                <span className="font-serif text-xl tracking-tight">{route.from} <span className="text-[#aa8453] px-2">→</span> {route.to}</span>
              </div>
              <div className="flex items-center justify-between pt-10 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-condensed uppercase tracking-widest">Scheduled</span>
                  <span className="text-[#1b1b1b] font-serif text-2xl">{route.time}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-condensed uppercase tracking-widest">Investment</span>
                  <p className="text-4xl font-serif text-[#aa8453] tracking-tighter">${route.price} <span className="text-xs">/ TRIP</span></p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center pt-10">
        <button onClick={nextStep} className="luxury-button !px-24 group">
          <span className="relative z-10 flex items-center space-x-4">
            <span>CONTINUE TO SEATS</span>
            <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </span>
        </button>
      </div>
    </motion.div>
  );

  const handleSeatClick = (seatId, status) => {
    if (status === 'booked') return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const renderSeatSelection = () => (
    <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-16 p-4">
      <div className="text-center space-y-4">
        <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed">CONFIGURE YOUR SPACE</p>
        <h2 className="text-5xl md:text-6xl font-serif text-gray-900 leading-tight">Spatial Selection</h2>
      </div>

      <div className="max-w-3xl mx-auto luxury-card p-20 rounded-none relative overflow-hidden">
        <div className="bg-[#fcfbf9] p-16 rounded-none border border-gray-100">
          <div className="grid grid-cols-5 gap-y-10 gap-x-8">
            {seats.map((seat, index) => {
              const seatEl = (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat.id, seat.status)}
                  className={`aspect-square rounded-none flex items-center justify-center font-serif text-xl transition-all duration-500 transform hover:scale-110 ${seat.status === 'booked'
                    ? 'bg-gray-200 text-gray-300 cursor-not-allowed'
                    : selectedSeats.includes(seat.id)
                      ? 'bg-[#aa8453] text-white shadow-2xl ring-4 ring-[#aa8453]/20'
                      : 'bg-white border border-gray-200 text-[#1b1b1b] hover:border-[#aa8453] hover:shadow-xl'
                    }`}
                  disabled={seat.status === 'booked'}
                >
                  {seat.id}
                </button>
              );

              const isEndOfSecondCol = index % 4 === 2;

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

      <div className="flex justify-between mt-16 max-w-3xl mx-auto items-center">
        <button onClick={prevStep} className="luxury-button-outline !text-gray-900 !border-gray-200 !px-12 uppercase text-[10px] tracking-widest">Back</button>
        <div className="flex items-center space-x-12">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-condensed uppercase tracking-widest mb-1">Total Valuation</p>
            <p className="text-4xl font-serif text-[#aa8453] tracking-tighter">${selectedSeats.length * (selectedRoute?.price || 0)} <span className="text-sm">/ PKR</span></p>
          </div>
          <button onClick={nextStep} className="luxury-button !px-16 uppercase text-[10px] tracking-widest">
            PERSONAL DETAILS
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderDetails = () => (
    <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-16 p-4">
      <div className="text-center space-y-4">
        <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed">GUEST INFORMATION</p>
        <h2 className="text-5xl md:text-6xl font-serif text-gray-900 leading-tight">Passenger Profile</h2>
      </div>
      <div className="luxury-card p-16 rounded-none border border-gray-100 max-w-4xl mx-auto relative overflow-hidden group">
        <div className="space-y-12 relative z-10">
          <div className="relative">
            <label className="block text-[10px] text-[#aa8453] tracking-widest uppercase font-condensed mb-4 ml-1">Full Designation</label>
            <input
              type="text"
              value={passengerInfo.name}
              onChange={(e) => setPassengerInfo({ ...passengerInfo, name: e.target.value })}
              placeholder="e.g. Jawad Hussain"
              className="w-full px-10 py-6 bg-gray-50 border-transparent focus:border-[#aa8453] border border-b-2 rounded-none outline-none text-gray-800 text-xl font-serif transition-all"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="relative">
              <label className="block text-[10px] text-[#aa8453] tracking-widest uppercase font-condensed mb-4 ml-1">Contact Link</label>
              <div className="relative">
                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 font-serif text-xl">+92</span>
                <input
                  type="text"
                  value={passengerInfo.phone.startsWith('0') ? passengerInfo.phone.slice(1) : passengerInfo.phone}
                  onChange={(e) => setPassengerInfo({ ...passengerInfo, phone: formatPhone(e.target.value) })}
                  placeholder="300 1234567"
                  className="w-full pl-24 pr-10 py-6 bg-gray-50 border-transparent focus:border-[#aa8453] border border-b-2 rounded-none outline-none text-gray-800 text-xl font-serif transition-all tracking-[0.2em]"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-[10px] text-[#aa8453] tracking-widest uppercase font-condensed mb-4 ml-1">National ID</label>
              <input
                type="text"
                value={passengerInfo.cnic}
                onChange={(e) => setPassengerInfo({ ...passengerInfo, cnic: formatCNIC(e.target.value) })}
                placeholder="35201-XXXXXXX-X"
                className="w-full px-10 py-6 bg-gray-50 border-transparent focus:border-[#aa8453] border border-b-2 rounded-none outline-none text-gray-800 text-xl font-serif transition-all tracking-[0.3em]"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-12 max-w-4xl mx-auto">
        <button onClick={prevStep} className="luxury-button-outline !text-gray-900 !border-gray-200 !px-12 uppercase text-[10px] tracking-widest">Back</button>
        <button onClick={nextStep} className="luxury-button !px-16 uppercase text-[10px] tracking-widest">
          PROCEED TO CHECKOUT
        </button>
      </div>
    </motion.div>
  );

  const renderPaymentSelection = () => (
    <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-16 p-4">
      <div className="text-center space-y-4">
        <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed">SECURE SETTLEMENT</p>
        <h2 className="text-5xl md:text-6xl font-serif text-gray-900 leading-tight">Payment Gateway</h2>
      </div>

      <div className="max-w-2xl mx-auto luxury-card p-16 rounded-none border border-gray-100 relative overflow-hidden group">
        {isProcessing ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-12">
            <div className="w-24 h-24 border-[2px] border-gray-100 border-t-[#aa8453] rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className="text-3xl font-serif text-gray-800">Authorizing Settlement...</h3>
              <p className="text-[#aa8453] mt-4 animate-pulse text-[10px] tracking-[0.4em] uppercase font-condensed">Encrypted connection active</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12 relative z-10">
            <div className="bg-[#fcfbf9] p-10 rounded-none flex items-center justify-between border border-gray-100 mb-10">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-white rounded-none shadow-sm border border-gray-100">
                  <CreditCard className="text-[#aa8453]" size={32} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-condensed">Settlement via</p>
                  <p className="text-xl font-serif text-gray-800">Credit / Debit Card</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-condensed">Authorized Amount</p>
                <p className="text-3xl font-serif text-[#aa8453]">${selectedSeats.length * (selectedRoute?.price || 0)}</p>
              </div>
            </div>

            <div className="space-y-10">
              <div>
                <label className="block text-[10px] text-[#aa8453] tracking-widest uppercase font-condensed mb-4 ml-1">Card Credentials</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                  className="w-full px-10 py-6 bg-gray-50 border-transparent focus:border-[#aa8453] border border-b-2 rounded-none outline-none text-xl font-serif tracking-widest transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <label className="block text-[10px] text-[#aa8453] tracking-widest uppercase font-condensed mb-4 ml-1">Validity</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                    className="w-full px-10 py-6 bg-gray-50 border-transparent focus:border-[#aa8453] border border-b-2 rounded-none outline-none text-xl font-serif tracking-widest transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#aa8453] tracking-widest uppercase font-condensed mb-4 ml-1">Secret Code</label>
                  <input
                    type="text"
                    placeholder="***"
                    maxLength={3}
                    value={cardDetails.cvc}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    className="w-full px-10 py-6 bg-gray-50 border-transparent focus:border-[#aa8453] border border-b-2 rounded-none outline-none text-xl font-serif tracking-widest transition-all"
                  />
                </div>
              </div>
            </div>

            <button onClick={nextStep} className="luxury-button w-full !py-6 !text-sm">
              AUTHORIZE SETTLEMENT
            </button>
            <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-condensed">SSL 256-BIT ENCRYPTED TRANSACTION</p>
          </div>
        )}
      </div>
      {!isProcessing && (
        <div className="flex justify-center mt-10">
          <button onClick={prevStep} className="luxury-button-outline !text-gray-900 !border-gray-200 !px-12 uppercase text-[10px] tracking-widest">Return to Profile</button>
        </div>
      )}
    </motion.div>
  );

  const renderTicket = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-16">
        <div className="text-center space-y-4">
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

        <div id="ticket" className="max-w-4xl mx-auto bg-white rounded-none overflow-hidden shadow-2xl border border-gray-100 relative">
          <div className="bg-[#1b1b1b] p-16 text-white border-b border-[#aa8453]/30">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-5xl font-serif tracking-tight">SAFARLINK</h3>
                <p className="text-[10px] text-[#aa8453] tracking-[0.4em] uppercase font-condensed mt-4">Verified Digital Manifest</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] opacity-40 uppercase font-condensed tracking-[0.3em] mb-2">Issued On</p>
                <p className="text-2xl font-serif tracking-tighter">{formattedDate}</p>
              </div>
            </div>
          </div>

          <div className="p-20">
            <div className="flex items-center justify-between mb-20">
              <div className="text-center flex-1">
                <p className="text-6xl font-serif text-gray-900 leading-none">{selectedRoute?.from}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-condensed mt-6">Port of Origin</p>
              </div>
              <div className="flex flex-col items-center px-16">
                <Bus size={48} className="text-[#aa8453] mb-6" />
                <div className="h-[1px] w-64 bg-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#aa8453] w-1/2 animate-slide-right"></div>
                </div>
              </div>
              <div className="text-center flex-1">
                <p className="text-6xl font-serif text-gray-900 leading-none">{selectedRoute?.to}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-condensed mt-6">Final Destination</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-y border-gray-100 py-16 mb-16">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-3">Passenger</p>
                <p className="text-2xl font-serif text-gray-900">{passengerInfo.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-3">Allocated</p>
                <p className="text-2xl font-serif text-[#aa8453]">{selectedSeats.join(", ")}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-3">Voyage Date</p>
                <p className="text-2xl font-serif text-gray-900">{formattedDate}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-3">Transit Class</p>
                <p className="text-2xl font-serif text-gray-900">Executive</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center bg-[#fcfbf9] p-12 rounded-none border border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-2">Secure Link</p>
                <p className="text-3xl font-serif text-gray-900 tracking-tighter">+92 {passengerInfo.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase font-condensed tracking-widest mb-2">Paid in Full</p>
                <p className="text-6xl font-serif text-[#aa8453] tracking-tighter">${selectedSeats.length * (selectedRoute?.price || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-10 pb-32">
          <button onClick={handleDownloadPDF} className="luxury-button !py-5 !px-16 flex items-center space-x-4">
            <Download size={24} />
            <span>ARCHIVE MANIFEST</span>
          </button>
          <button onClick={() => window.open(`https://wa.me/?text=Manifest Sealed for ${passengerInfo.name}`, '_blank')} className="luxury-button-outline !text-gray-900 !border-gray-200 !py-5 !px-16 flex items-center space-x-4">
            <Share2 size={24} />
            <span>SHARE ON WHATSAPP</span>
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white pt-48 pb-32">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Luxury Progress Header */}
        <div className="bg-[#1b1b1b] p-16 rounded-none mb-24 relative overflow-hidden border-b-4 border-[#aa8453] shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] font-serif text-white opacity-[0.02] whitespace-nowrap pointer-events-none">
            RESERVATION
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
            <div className="space-y-4">
              <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed">SECURE CONCIERGE</p>
              <h1 className="text-6xl font-serif text-white tracking-tight">Luxury Reservation</h1>
            </div>
            <div className="flex items-center space-x-6 mt-12 md:mt-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <React.Fragment key={i}>
                  <div className={`flex items-center justify-center w-14 h-14 rounded-none border transition-all duration-700 ${step >= i ? 'bg-[#aa8453] text-white border-[#aa8453] shadow-2xl' : 'bg-transparent text-white/20 border-white/10'
                    }`}>
                    {step > i ? <CheckCircle2 size={28} /> : <span className="font-serif text-xl">{i}</span>}
                  </div>
                  {i < 5 && <div className={`w-16 h-[1px] ${step > i ? 'bg-[#aa8453]' : 'bg-white/10'}`}></div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: "circOut" }}
          >
            {step === 1 && renderRouteSelection()}
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
