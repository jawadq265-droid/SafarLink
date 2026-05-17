import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import main from "../../assets/images/mainbg.jpg"

const LoginPage = () => {

    const navigate = useNavigate();

    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

   
    const handleLogin = async () => {
        try {
            const response = await fetch("/api/v1/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password: password.trim()
                })
            });

            const data = await response.json();

            if (!data.success) {
                toast.error(data.message || "Login failed");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.user.role);
            localStorage.setItem("userEmail", data.user.email);
            localStorage.setItem("userName", data.user.name);

            toast.success("Login Successful");
            navigate("/admin");

        } 
catch (err) {
    toast.error("Something went wrong with the connection");
}
    };

    return (
        <div className="min-h-screen flex flex-col bg-cover bg-center relative">

            <div className="absolute inset-0 bg-black/40 z-0">
                <img src={main} alt="Bus Background" className="absolute inset-0 w-full h-full object-cover" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <div className="flex-grow flex items-center lg:px-30 px-6 py-12">

                    <div className="bg-transparent backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">

                        <h2 className="text-4xl font-serif text-center text-white mb-8">
                            Welcome Back
                        </h2>

                        <form className="space-y-6">

                            {/* EMAIL */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="text-white w-full px-4 py-3 border border-white/40 bg-black/20 rounded-lg focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition"
                                    placeholder="john@example.com"
                                />
                            </div>

                            {/* PASSWORD */}
                        <div>
    <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-white">
            Password
        </label>
        <a href="/forget" className="text-sm text-[#aa8453] hover:text-[#8e6d45] font-medium transition">
            Forgot Password?
        </a>
    </div>

    <div className="relative">
        <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-white w-full px-4 py-3 pr-12 border border-white/40 bg-black/20 rounded-lg focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition"
            placeholder="••••••••"
        />

        {/* Eye Icon */}
        <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
        >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
    </div>
</div>
                            {/* BUTTON */}
                            <button
                                type="button"
                                onClick={handleLogin}
                                className="w-full luxury-button !py-4 rounded-lg"
                            >
                                LOGIN
                            </button>

                        </form>

                        <div className="mt-8 text-center text-gray-600">
                            <p className='font-bold text-white'>
                                Don't have an account?
                                <Link to="/signup" className="text-[#aa8453] font-bold hover:text-[#8e6d45] ml-1 transition">
                                    Sign Up
                                </Link>
                            </p>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default LoginPage;