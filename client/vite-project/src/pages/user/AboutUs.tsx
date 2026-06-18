import { Star, User, Shield, Bus, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

const AboutUs = () => {
  const { t } = useTranslation();

  const reviews = [
    {
      id: 1,
      nameKey: "aboutUs.reviews.sarah_name",
      roleKey: "aboutUs.reviews.sarah_role",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      textKey: "aboutUs.reviews.sarah_text",
      rating: 5
    },
    {
      id: 2,
      nameKey: "aboutUs.reviews.michael_name",
      roleKey: "aboutUs.reviews.michael_role",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      textKey: "aboutUs.reviews.michael_text",
      rating: 5
    },
    {
      id: 3,
      nameKey: "aboutUs.reviews.emily_name",
      roleKey: "aboutUs.reviews.emily_role",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
      textKey: "aboutUs.reviews.emily_text",
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
       <section className="relative py-40 bg-[#1b1b1b] text-center px-6 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-serif text-white opacity-[0.02] whitespace-nowrap pointer-events-none">
                SAFARLINK
            </div>
            <div className="relative z-10">
                <p className="text-[10px] text-[#aa8453] tracking-[0.6em] uppercase font-condensed mb-6">{t('aboutUs.our_story')}</p>
                <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">{t('aboutUs.title')}</h1>
                <div className="w-20 h-[1px] bg-[#aa8453] mx-auto mb-8"></div>
                <p className="text-white/70 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                    {t('aboutUs.hero_desc')}
                </p>
            </div>
       </section>

       {/* Our Mission / Staff Experience */}
       <section className="py-16 px-6 container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">{t('aboutUs.difference_title')}</h2>
                    <p className="text-gray-500 mb-4 leading-relaxed text-lg">
                        {t('aboutUs.difference_desc1')}
                    </p>
                    <p className="text-gray-500 mb-8 leading-relaxed text-lg">
                        {t('aboutUs.difference_desc2')}
                    </p>
                    <div className="flex gap-8 flex-wrap">
                        <div className="flex items-center gap-3 text-gray-800 font-serif text-lg">
                            <Shield className="w-6 h-6 text-[#aa8453]" /> {t('aboutUs.safe_travel')}
                        </div>
                        <div className="flex items-center gap-3 text-gray-800 font-serif text-lg">
                            <User className="w-6 h-6 text-[#aa8453]" /> {t('aboutUs.expert_staff')}
                        </div>
                        <div className="flex items-center gap-3 text-gray-800 font-serif text-lg">
                            <Bus className="w-6 h-6 text-[#aa8453]" /> {t('aboutUs.modern_fleet')}
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
                <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed text-center mb-4">{t('aboutUs.testimonials')}</p>
                <h2 className="text-4xl md:text-5xl font-serif text-center text-gray-900 mb-16">{t('aboutUs.happy_customer_journeys')}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <div key={review.id} className="luxury-card p-10 flex flex-col justify-between">
                            <div>
                                <div className="flex text-[#aa8453] mb-6">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="currentColor" />
                                    ))}
                                </div>
                                <p className="text-gray-500 italic mb-8 font-light leading-relaxed">"{t(review.textKey)}"</p>
                            </div>
                            <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                                <img src={review.image} alt={t(review.nameKey)} className="w-12 h-12 rounded-none object-cover" />
                                <div>
                                    <h4 className="font-serif text-gray-900 text-lg">{t(review.nameKey)}</h4>
                                    <p className="text-[10px] text-[#aa8453] tracking-[0.2em] uppercase font-condensed">{t(review.roleKey)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
       </section>

       {/* Top Sponsors */}
       <section className="py-24 bg-[#fcfbf9] px-6">
            <div className="container mx-auto">
                <p className="text-[10px] text-[#aa8453] tracking-[0.5em] uppercase font-condensed text-center mb-12">{t('aboutUs.proudly_sponsored_by')}</p>
                <div className="flex flex-wrap justify-center gap-12 md:gap-24 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                     {sponsors.map((sponsor, index) => (
                        <div key={index} className={`font-serif text-2xl flex items-center gap-3 text-gray-400`}>
                            <Award size={28} /> {sponsor.name}
                        </div>
                     ))}
                </div>
            </div>
       </section>
    </div>
  );
};

export default AboutUs;
