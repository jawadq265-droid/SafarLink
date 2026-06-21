import { createBrowserRouter, RouterProvider } from 'react-router-dom'

//User Side Pages
import HOME from '../pages/user/home.page'
import BusPage from '../pages/user/bus.page';
import ContactPage from '../pages/user/contact.page';
import LoginPage from '../pages/user/login.page';
import AboutUs from '../pages/user/AboutUs';
import SignupPage from '../pages/user/signup.page';
import MainLayout from '../layout/main.layout';
import ForgotPassword from '../pages/user/forget.page';
import ResetPassword from '../pages/user/reset.page';
import BookingPage from '../pages/user/booking.page';
import UserActivityPage from '../pages/user/activity.page';
import PaymentSuccessPage from '../pages/user/payment-success.page';

// Admin Side pages
import MyBookingsPage from '../pages/admin/my-bookings.page';
import AdminDashboard from '../pages/admin/AdminDashboard';



const Router = () => {

    const router = createBrowserRouter([
        {
            path: "/",
            element: <MainLayout />,
            children: [
                {
                    index: true,
                    element: <HOME />
                },
                {
                    path: "bus",
                    element: <BusPage />
                },
                {
                    path: "contact",
                    element: <ContactPage />
                },
                {
                    path: "AboutUs",
                    element: <AboutUs />
                },
                {
                    path: "bookings",
                    element: <UserActivityPage />
                },
                {
                    path: "book-now",
                    element: <BookingPage />
                },
                {
                    path: "payment-success",
                    element: <PaymentSuccessPage />
                },
            ]
        },
        {
            path: "/admin",
            element: <AdminDashboard />
        },
        {
            path: "/admin/bookings",
            element: <MyBookingsPage />
        },
        {
            path: "/login",
            element: <LoginPage />
        },
        {
            path: "/signup",
            element: <SignupPage />
        },
        {
            path: "/forget",
            element: <ForgotPassword />
        },
        {
            path: "/reset-password/:token",
            element: <ResetPassword />
        },
    ])

    return <RouterProvider router={router} />
}
export default Router;
