import { Link } from 'react-router-dom';
import SafarLink_Logo from '../../../assets/images/SafariLink_Logo.jpg';

const Navbar = () => {
  return (
    <nav className="fixed backdrop-blur-md bg-white/90 border-b border-white/20 top-0 left-0 right-0 z-40 transition-all">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={SafarLink_Logo} alt="SafarLink Logo" className='w-15 h-12 rounded-2xl'/>
            <span className="text-3xl font-bold text-sky-600">SafarLink</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-800 hover:text-sky-600 font-medium transition">Home</Link>
            <Link to="/Bus" className="text-gray-800 hover:text-sky-600 font-medium transition">Bus</Link>
            <Link to="/train" className="text-gray-800 hover:text-sky-600 font-medium transition">Train</Link>
            {/* <Link to="/admin/bookings" className="text-gray-800 hover:text-sky-600 font-medium transition">My Bookings</Link> */}
            <Link to="/contact" className="text-gray-800 hover:text-sky-600 font-medium transition">Contact</Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-1 md:space-x-4 lg:space-x-4">
            <Link to="/login">
              <button onClick={()=>window.scrollTo(0,0)} className="px-4 py-2 text-sky-600 font-medium hover:text-sky-800 transition">Login</button>
            </Link>
            <Link to="/signup">
              <button onClick={()=>window.scrollTo(0,0)} className="text-md px-3 lg:px-6 py-2 bg-sky-600 text-white rounded-full lg:font-medium hover:bg-sky-700 transition shadow-lg">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
