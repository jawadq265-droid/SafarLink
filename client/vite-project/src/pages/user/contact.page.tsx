import { useTranslation } from 'react-i18next';

const ContactPage = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-[#fcfbf9] min-h-screen">
            {/* Header Section */}
            <section className="relative py-40 bg-[#1b1b1b] text-center px-6 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-serif text-white opacity-[0.02] whitespace-nowrap pointer-events-none">
                    SAFARLINK
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] text-[#aa8453] tracking-[0.6em] uppercase font-condensed mb-6">{t('contact.reach_out')}</p>
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">{t('contact.title')}</h1>
                    <div className="w-20 h-[1px] bg-[#aa8453] mx-auto mb-8"></div>
                    <p className="text-white/70 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">{t('contact.desc')}</p>
                </div>
            </section>

            <div className="container mx-auto px-6 -mt-16 pb-24 relative z-20">
                <div className="luxury-card overflow-hidden max-w-4xl mx-auto">
                    {/* Contact Form Side */}
                    <div className="p-12">
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.first_name')}</label>
                                    <input type="text" className="w-full px-4 py-3 bg-[#fcfbf9] border border-gray-200 rounded-none focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition" placeholder={t('contact.first_name_placeholder')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.last_name')}</label>
                                    <input type="text" className="w-full px-4 py-3 bg-[#fcfbf9] border border-gray-200 rounded-none focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition" placeholder={t('contact.last_name_placeholder')} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.email_address')}</label>
                                <input type="email" className="w-full px-4 py-3 bg-[#fcfbf9] border border-gray-200 rounded-none focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition" placeholder={t('contact.email_placeholder')} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.subject')}</label>
                                <input type="text" className="w-full px-4 py-3 bg-[#fcfbf9] border border-gray-200 rounded-none focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition" placeholder={t('contact.subject_placeholder')} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.message')}</label>
                                <textarea rows={4} className="w-full px-4 py-3 bg-[#fcfbf9] border border-gray-200 rounded-none focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition" placeholder={t('contact.message_placeholder')}></textarea>
                            </div>
                            <div className="pt-4">
                                <button type="button" className="w-full luxury-button !py-4">{t('contact.send_message')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
