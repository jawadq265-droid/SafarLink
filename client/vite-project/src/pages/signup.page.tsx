import { Link } from 'react-router-dom';

const SignupPage = () => {
    return (
        <div
            className="min-h-screen flex flex-col bg-cover bg-center relative"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1474487548417-781cb714c22d?w=1920&h=800&fit=crop')" }}
        >
            <div className="absolute inset-0 bg-black/40 z-0"></div>
            <div className="relative z-10 flex flex-col min-h-screen">
                <div className="flex-grow flex items-center justify-center px-6 py-12">
                    <div className="bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Create Account</h2>

                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition" placeholder="••••••••" />
                            </div>

                            <button type="button" className="w-full bg-sky-600 text-white py-3 rounded-lg font-bold hover:bg-sky-700 transition transform hover:scale-[1.02] shadow-md">
                                Sign Up
                            </button>
                        </form>

                        <div className="mt-8 text-center text-gray-600">
                            <p>Already have an account? <Link to="/login" className="text-sky-600 font-bold hover:text-sky-800">Login</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
