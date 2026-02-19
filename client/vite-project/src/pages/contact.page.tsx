const ContactPage = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="bg-sky-600 py-16 text-center text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
                <p className="text-xl opacity-90">We'd love to hear from you. Our team is here to help.</p>
            </div>

            <div className="container mx-auto px-6 -mt-10 pb-20">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl mx-auto">



                    {/* Contact Form Side */}
                    <div className="p-12">
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 focus:bg-white outline-none transition" placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 focus:bg-white outline-none transition" placeholder="Doe" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 focus:bg-white outline-none transition" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 focus:bg-white outline-none transition" placeholder="How can we help?" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 focus:bg-white outline-none transition" placeholder="Your message here..."></textarea>
                            </div>
                            <button type="button" className="w-full bg-sky-600 text-white py-4 rounded-lg font-bold hover:bg-sky-700 transition transform hover:scale-[1.02] shadow-lg">Send Message</button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ContactPage;
