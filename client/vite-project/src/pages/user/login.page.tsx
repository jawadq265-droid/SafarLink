import { Link } from 'react-router-dom';

const LoginPage = () => {
    return (
        <div
            className="min-h-screen flex flex-col bg-cover bg-center relative"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1474487548417-781cb714c22d?w=1920&h=800&fit=crop')" }}
        >
            <div className="absolute inset-0 bg-black/40 z-0"></div>
            <div className="relative z-10 flex flex-col min-h-screen">
                <div className="flex-grow flex items-center justify-center px-6 py-12">
                    <div className="bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Welcome Back</h2>

                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition" placeholder="john@example.com" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <a href="#" className="text-sm text-sky-600 hover:text-sky-800 font-medium">Forgot Password?</a>
                                </div>
                                <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition" placeholder="••••••••" />
                            </div>

                            <button type="button" className="w-full bg-sky-600 text-white py-3 rounded-lg font-bold hover:bg-sky-700 transition transform hover:scale-[1.02] shadow-md">
                                Login
                            </button>
                        </form>

                        <div className="mt-8 text-center text-gray-600">
                            <p>Don't have an account? <Link to="/signup" className="text-sky-600 font-bold hover:text-sky-800">Sign Up</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
