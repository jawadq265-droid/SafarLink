import { Outlet } from 'react-router-dom';
import Navbar from '../components/user/common/navbar';
import Footer from '../components/user/common/footer';
import FloatingBotButton from '../components/user/common/floatingButton';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-20">
                <Outlet />
            </main>
            <div className='bottom-20 right-10'><FloatingBotButton/></div>
            <Footer />
        </div>
    );
};

export default MainLayout;
