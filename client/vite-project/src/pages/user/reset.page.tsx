import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import main from "../../assets/images/mainbg.jpg";

const ResetPassword = () => {

  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async () => {

    // ✅ simple validation
    if (!password || !confirmPassword) {
      return toast.error("All fields are required");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      const res = await axios.post(
        `/api/v1/auth/reset-password/${token}`,
        { password }
      );

      toast.success("Password reset successful ✅");

      // redirect after 2 sec
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Reset failed ❌");
      } else {
        toast.error("Something went wrong ❌");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center relative">

      {/* Background */}
      <div className="absolute inset-0 bg-black/40 z-0">
        <img src={main} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-grow flex items-center justify-center px-6 py-12">

          <div className="bg-transparent backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">

            <h2 className="text-4xl font-serif text-center text-white mb-8">
              Reset Password
            </h2>

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleReset();
              }}
            >

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  New Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-white w-full px-4 py-3 pr-12 border border-white/40 bg-black/20 rounded-lg focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition"
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirm Password
                </label>

                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-white w-full px-4 py-3 border border-white/40 bg-black/20 rounded-lg focus:border-[#aa8453] focus:ring-1 focus:ring-[#aa8453] outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                className="w-full luxury-button !py-4 rounded-lg"
              >
                RESET PASSWORD
              </button>

            </form>

            {/* BACK TO LOGIN */}
            <div className="mt-8 text-center">
              <Link to="/login" className="text-[#aa8453] font-bold hover:text-[#8e6d45] transition">
                Back to Login
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;