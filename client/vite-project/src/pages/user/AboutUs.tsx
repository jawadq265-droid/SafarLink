import { Star, User, Shield, Bus, Award } from "lucide-react";

const AboutUs = () => {
  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Regular Commuter",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      text: "My journey with SafarLink was nothing short of amazing. The bus was clean, on time, and the seats were incredibly comfortable. It made my 6-hour trip feel like a breeze!",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Adventure Traveler",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      text: "I was impressed by the staff's professionalism. The driver was very careful, and the conductor helped me with my heavy luggage with a smile. Highly recommended!",
      rating: 5
    },
    {
      id: 3,
      name: "Emily Davis",
      role: "Student",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
      text: "Booking was so easy, and the Wi-Fi on board actually worked! I managed to finish my assignment while traveling. Great experience with the SafarLink team.",
      rating: 4
    }
  ];

  const sponsors = [
    { name: "TravelGo", color: "bg-blue-100 text-blue-600" },
    { name: "BusLine Inc", color: "bg-green-100 text-green-600" },
    { name: "SafeJourney", color: "bg-orange-100 text-orange-600" },
    { name: "EcoTravel", color: "bg-teal-100 text-teal-600" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
       {/* Hero Section */}
       <div className="bg-sky-600 text-white py-20 px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90">
                Connecting destinations, creating memories. Discover the story behind SafarLink and the people who make it happen.
            </p>
       </div>

       {/* Our Mission / Staff Experience */}
       <section className="py-16 px-6 container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Experience the SafarLink Difference</h2>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                        At SafarLink, we believe a journey is more than just getting from point A to point B. It's about safety, comfort, and the human connection.
                    </p>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Our staff goes through rigorous training to ensure your safety. From our experienced drivers to our helpful support team, every member is dedicated to making your trip pleasant. We take pride in our punctuality and hospitality.
                    </p>
                    <div className="flex gap-4 flex-wrap">
                        <div className="flex items-center gap-2 text-sky-700 font-semibold">
                            <Shield className="w-6 h-6" /> Safe Travel
                        </div>
                        <div className="flex items-center gap-2 text-sky-700 font-semibold">
                            <User className="w-6 h-6" /> Expert Staff
                        </div>
                        <div className="flex items-center gap-2 text-sky-700 font-semibold">
                            <Bus className="w-6 h-6" /> Modern Fleet
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-xl">
                    <img 
                        src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop" 
                        alt="Bus Staff" 
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
       </section>

       {/* Happy Customer Journeys */}
       <section className="bg-white py-16 px-6">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Happy Customer Journeys</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100">
                            <div className="flex items-center gap-4 mb-6">
                                <img src={review.image} alt={review.name} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                                    <p className="text-sm text-sky-600">{review.role}</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic mb-4">"{review.text}"</p>
                            <div className="flex text-yellow-400">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} size={18} fill="currentColor" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
       </section>

       {/* Top Sponsors */}
       <section className="py-16 px-6 container mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-600 mb-10 uppercase tracking-wide">Proudly Sponsored By</h2>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 grayscale hover:grayscale-0 transition-all duration-500">
                 {sponsors.map((sponsor, index) => (
                    <div key={index} className={`px-8 py-4 rounded-lg font-bold text-xl flex items-center gap-2 shadow-sm ${sponsor.color}`}>
                        <Award size={24} /> {sponsor.name}
                    </div>
                 ))}
            </div>
       </section>
    </div>
  );
};

export default AboutUs;