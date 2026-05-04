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

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerInfo, setPassengerInfo] = useState({
    name: '',
    phone: '',
    cnic: ''
  });

  const routes = [
    { id: 1, from: "Lahore", to: "Islamabad", price: 1500, time: "09:00 AM", bus: "Safar Express" },
    { id: 2, from: "Karachi", to: "Lahore", price: 4500, time: "10:30 PM", bus: "Daewoo Gold" },
    { id: 3, from: "Multan", to: "Lahore", price: 1200, time: "02:15 PM", bus: "Sania Express" },
  ];

  // 1-40 seats
  const seats = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    status: Math.random() > 0.8 ? 'booked' : 'available' // Randomly book some seats for demo
  }));

  const handleSeatClick = (seatId, status) => {
    if (status === 'booked') return;
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const nextStep = () => {
    if (step === 1 && !paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (step === 2 && !selectedRoute) {
      toast.error("Please select a route");
      return;
    }
    if (step === 3 && selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const renderPayment = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Select Payment Method</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'stripe', name: 'Credit Card (Stripe)', icon: CreditCard, color: 'text-indigo-600' },
          { id: 'jazzcash', name: 'JazzCash', icon: Smartphone, color: 'text-red-600' },
          { id: 'easypaisa', name: 'EasyPaisa', icon: Smartphone, color: 'text-emerald-600' },
        ].map((method) => (
          <button
            key={method.id}
            onClick={() => setPaymentMethod(method.id)}
            className={`p-6 rounded-2xl border-2 transition flex flex-col items-center space-y-3 ${
              paymentMethod === method.id ? 'border-sky-600 bg-sky-50 shadow-lg' : 'border-gray-100 bg-white hover:border-sky-200'
            }`}
          >
            <method.icon className={`${method.color}`} size={40} />
            <span className="font-bold text-gray-700">{method.name}</span>
          </button>
        ))}
      </div>

      {paymentMethod === 'stripe' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-8 max-w-md mx-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Card Number</label>
              <input type="text" placeholder="**** **** **** ****" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Expiry Date</label>
                <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">CVC</label>
                <input type="text" placeholder="***" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-10">
        <button onClick={nextStep} className="px-12 py-4 bg-sky-600 text-white rounded-2xl font-bold hover:bg-sky-700 shadow-xl shadow-sky-100 transition flex items-center space-x-2">
          <span>Continue to Route Selection</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderRouteSelection = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Select Your Route</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {routes.map((route) => (
          <div 
            key={route.id}
            onClick={() => setSelectedRoute(route)}
            className={`p-6 rounded-3xl border-2 transition cursor-pointer relative overflow-hidden ${
              selectedRoute?.id === route.id ? 'border-sky-600 bg-sky-50 shadow-xl' : 'border-gray-100 bg-white hover:border-sky-200 shadow-sm'
            }`}
          >
            {selectedRoute?.id === route.id && (
              <div className="absolute top-4 right-4 text-sky-600">
                <CheckCircle2 size={24} />
              </div>
            )}
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-sky-100 text-sky-600 rounded-xl">
                <Bus size={24} />
              </div>
              <h3 className="font-bold text-gray-800">{route.bus}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin size={16} className="text-sky-400" />
                <span className="font-semibold">{route.from} → {route.to}</span>
              </div>
              <div className="flex items-center justify-between mt-6">
                <span className="text-gray-400 font-bold">{route.time}</span>
                <span className="text-xl font-black text-sky-600">{route.price} PKR</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-12">
        <button onClick={prevStep} className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition">Back</button>
        <button onClick={nextStep} className="px-8 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 shadow-lg shadow-sky-100 transition">Select Seats</button>
      </div>
    </div>
  );

  const renderSeatSelection = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Select Seats</h2>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-200 rounded-md"></div>
            <span className="text-xs font-bold text-gray-500">Free</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-orange-200 rounded-md"></div>
            <span className="text-xs font-bold text-gray-500">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-md">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            <span className="text-xs font-bold text-gray-500">Available</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        {/* Bus Layout */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <div className="w-full h-10 border-b-4 border-gray-300 mb-8 flex items-center justify-end pr-4 text-gray-300">
            <div className="w-8 h-8 rounded-full border-4 border-gray-300 flex items-center justify-center font-bold">W</div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {seats.map((seat) => (
              <React.Fragment key={seat.id}>
                <button
                  onClick={() => handleSeatClick(seat.id, seat.status)}
                  className={`aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all transform hover:scale-105 ${
                    seat.status === 'booked' 
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                      : selectedSeats.includes(seat.id)
                      ? 'bg-orange-500 text-white shadow-lg ring-4 ring-orange-100'
                      : 'bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                  }`}
                  disabled={seat.status === 'booked'}
                >
                  {seat.id}
                </button>
                {(seat.id % 4 === 2) && <div className="w-full"></div>} {/* Aisle */}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-12">
        <button onClick={prevStep} className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition">Back</button>
        <div className="flex items-center space-x-4">
            <div className="text-right">
                <p className="text-xs text-gray-400 font-bold uppercase">Total Price</p>
                <p className="text-xl font-black text-sky-600">{selectedSeats.length * (selectedRoute?.price || 0)} PKR</p>
            </div>
            <button onClick={nextStep} className="px-8 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 shadow-lg shadow-sky-100 transition">Passenger Details</button>
        </div>
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Passenger Information</h2>
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-xl mx-auto">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Full Name</label>
            <input 
              type="text" 
              value={passengerInfo.name}
              onChange={(e) => setPassengerInfo({...passengerInfo, name: e.target.value})}
              placeholder="John Doe" 
              className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-sky-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Phone Number</label>
            <input 
              type="text" 
              value={passengerInfo.phone}
              onChange={(e) => setPassengerInfo({...passengerInfo, phone: e.target.value})}
              placeholder="0300 1234567" 
              className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-sky-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">CNIC Number</label>
            <input 
              type="text" 
              value={passengerInfo.cnic}
              onChange={(e) => setPassengerInfo({...passengerInfo, cnic: e.target.value})}
              placeholder="35201-1234567-1" 
              className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-sky-500" 
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-12 max-w-xl mx-auto">
        <button onClick={prevStep} className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition">Back</button>
        <button onClick={() => {
            if(!passengerInfo.name || !passengerInfo.phone || !passengerInfo.cnic) {
                toast.error("Please fill all details");
                return;
            }
            nextStep();
        }} className="px-12 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 shadow-lg shadow-sky-100 transition">Confirm Booking</button>
      </div>
    </div>
  );

  const renderTicket = () => (
    <div className="space-y-8 animate-in zoom-in duration-500">
      <div className="text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black text-gray-800">Booking Confirmed!</h2>
        <p className="text-gray-500 mt-2">Your ticket has been generated successfully.</p>
      </div>

      <div id="ticket" className="max-w-2xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
        <div className="bg-sky-600 p-8 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black">SafarLink</h3>
            <p className="opacity-80 text-sm">Premium Intercity Travel</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70 uppercase font-bold tracking-widest">Ticket ID</p>
            <p className="text-xl font-bold">#SF-{Math.floor(1000 + Math.random() * 9000)}</p>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="text-center flex-1">
              <p className="text-3xl font-black text-gray-800">{selectedRoute?.from}</p>
              <p className="text-gray-400 font-bold uppercase text-xs">Origin</p>
            </div>
            <div className="flex flex-col items-center px-6">
              <Bus size={32} className="text-sky-600 mb-2" />
              <div className="h-0.5 w-32 bg-sky-100 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-sky-600 rounded-full border-4 border-white"></div>
              </div>
            </div>
            <div className="text-center flex-1">
              <p className="text-3xl font-black text-gray-800">{selectedRoute?.to}</p>
              <p className="text-gray-400 font-bold uppercase text-xs">Destination</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-gray-100 py-8 mb-8">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Passenger</p>
              <p className="font-bold text-gray-800">{passengerInfo.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Seats</p>
              <p className="font-bold text-sky-600">{selectedSeats.join(", ")}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Date</p>
              <p className="font-bold text-gray-800">2024-05-15</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Time</p>
              <p className="font-bold text-gray-800">{selectedRoute?.time}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-50 rounded-2xl">
                    <Smartphone size={24} className="text-gray-400" />
                </div>
                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Phone</p>
                    <p className="font-bold text-gray-800">{passengerInfo.phone}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs text-gray-400 font-bold uppercase">Total Fare</p>
                <p className="text-3xl font-black text-sky-600">{selectedSeats.length * (selectedRoute?.price || 0)} PKR</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-dashed border-gray-200">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Please show this digital ticket at the terminal 15 minutes before departure.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
        <button className="w-full md:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-sky-600 text-white rounded-2xl font-bold hover:bg-sky-700 shadow-lg shadow-sky-100 transition">
          <Download size={20} />
          <span>Download PDF</span>
        </button>
        <button 
            onClick={() => {
                const text = `Ticket Confirmation for ${passengerInfo.name}. Route: ${selectedRoute?.from} to ${selectedRoute?.to}. Seats: ${selectedSeats.join(", ")}. Total: ${selectedSeats.length * selectedRoute?.price} PKR.`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="w-full md:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition"
        >
          <Share2 size={20} />
          <span>Share on WhatsApp</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12 overflow-x-auto py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                  step >= i ? 'bg-sky-600 text-white shadow-lg ring-4 ring-sky-100' : 'bg-white text-gray-400 border border-gray-200'
                }`}>
                  {step > i ? <CheckCircle2 size={20} /> : i}
                </div>
              </div>
              {i < 5 && (
                <div className={`w-12 md:w-20 h-1 mx-2 rounded-full transition-all duration-500 ${
                  step > i ? 'bg-sky-600' : 'bg-gray-200'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && renderPayment()}
        {step === 2 && renderRouteSelection()}
        {step === 3 && renderSeatSelection()}
        {step === 4 && renderDetails()}
        {step === 5 && renderTicket()}
      </div>
    </div>
  );
};

export default BookingPage;
