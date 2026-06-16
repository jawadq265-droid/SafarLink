import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import main from "../../assets/images/mainbg.jpg";
import { Link } from "react-router-dom";

const BASE_URL = (import.meta.env.VITE_BASE_URL || "/api/v1/").replace(/['"]/g, "").replace(/\/?$/, "/");

const ForgotPassword = () => {

  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}auth/forgot-password`,
        { email }
      );

      toast.success(res.data.message);

    }
    catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err.response);
        toast.error(err.response?.data?.message || "Login failed ");
      } else {
        toast.error("Something went wrong ");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center relative">

      <div className="absolute inset-0 bg-black/40 z-0">
        <img src={main} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-grow flex items-center justify-center px-6 py-12">

          <div className="bg-transparent backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">

            <h2 className="text-4xl font-serif text-center text-white mb-8">
              Forgot Password
            </h2>

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >

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

              <button
                type="submit"
                className="w-full luxury-button !py-4 rounded-lg mb-4"
              >
                SEND RESET LINK
              </button>
              <Link to="/login"
                className="block w-full luxury-button-outline !py-4 rounded-lg font-bold transition text-center"
              >
                BACK TO LOGIN
              </Link>

            </form>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;