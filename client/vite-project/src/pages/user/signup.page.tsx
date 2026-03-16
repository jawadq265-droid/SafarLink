import { Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const SignupPage = () => {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a correct email");
      return;
    }

    // Password match validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {

      const response = await fetch("http://localhost:3000/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Account created successfully 🎉");

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error("Something went wrong");
    }
  };


  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1474487548417-781cb714c22d?w=1920&h=800&fit=crop')"
      }}
    >

      <div className="absolute inset-0 bg-black/40 z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen">

        <div className="flex-grow flex items-center justify-center px-6 py-12">

          <div className="bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">

            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Create Account
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition"
                  placeholder="John Doe"
                  required
                />
              </div>


              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition"
                  placeholder="john@example.com"
                  required
                />
              </div>


              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                  </button>

                </div>
              </div>


              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>

                <div className="relative">

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                  </button>

                </div>
              </div>


              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-sky-600 text-white py-3 rounded-lg font-bold hover:bg-sky-700 transition transform hover:scale-[1.02] shadow-md"
              >
                Sign Up
              </button>

            </form>

            <div className="mt-8 text-center text-gray-600">
              <p>
                Already have an account?{" "}
                <Link
                  to="/login" onClick={()=>window.scrollTo(0,0)}
                  className="text-sky-600 font-bold hover:text-sky-800"
                >
                  Login
                </Link>
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default SignupPage;

