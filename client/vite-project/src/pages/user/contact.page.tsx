import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const ContactPage = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSending, setIsSending] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.email || !formData.subject || !formData.message) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSending(true);
        const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5005/api/v1/";

        fetch(`${baseUrl}auth/contact`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then((res) => {
            if (!res.ok) {
                return res.json().then((err) => { throw new Error(err.message || "Failed to send message"); });
            }
            return res.json();
        })
        .then(() => {
            toast.success("Your message has been sent successfully!");
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                subject: '',
                message: ''
            });
        })
        .catch((err) => {
            console.error(err);
            toast.error(err.message || "Something went wrong. Please try again.");
        })
        .finally(() => {
            setIsSending(false);
        });
    };

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
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.first_name')} *</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 bg-[#fcfbf9] border border-gray-200 rounded-none focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition" placeholder={t('contact.first_name_placeholder')} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.last_name')}</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 bg-[#fcfbf9] border border-gray-200 rounded-none focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition" placeholder={t('contact.last_name_placeholder')} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.email_address')} *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-[#fcfbf9] border border-gray-200 rounded-none focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition" placeholder={t('contact.email_placeholder')} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.subject')} *</label>
                                <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-3 bg-[#fcfbf9] border border-gray-200 rounded-none focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition" placeholder={t('contact.subject_placeholder')} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.message')} *</label>
                                <textarea rows={4} name="message" value={formData.message} onChange={handleChange} className="w-full px-4 py-3 bg-[#fcfbf9] border border-gray-200 rounded-none focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition" placeholder={t('contact.message_placeholder')} required></textarea>
                            </div>
                            <div className="pt-4">
                                <button type="submit" disabled={isSending} className="w-full luxury-button !py-4 disabled:opacity-50">
                                    {isSending ? "SENDING..." : t('contact.send_message')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
