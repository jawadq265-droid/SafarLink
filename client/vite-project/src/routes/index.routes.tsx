import { createBrowserRouter, RouterProvider } from 'react-router-dom'

//User Side Pages
import HOME from '../pages/user/home.page'
import BusPage from '../pages/user/bus.page';
import TrainPage from '../pages/user/train.page';
import ContactPage from '../pages/user/contact.page';
import LoginPage from '../pages/user/login.page';
import SignupPage from '../pages/user/signup.page';
import MainLayout from '../layout/main.layout';
import ForgotPassword from '../pages/user/forget.page';
import ResetPassword from '../pages/user/reset.page';

// Admin Side pages
import MyBookingsPage from '../pages/admin/my-bookings.page';



const Router = () => {

    const router = createBrowserRouter([
        {
            element: <MainLayout />,
            children: [
                {
                    path: "/",
                    element: <HOME />
                },
                {
                    path: "/bus",
                    element: <BusPage />
                },
                {
                    path: "/train",
                    element: <TrainPage />
                },
                {
                    path: "/contact",
                    element: <ContactPage />
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
            ]
           
        },
         {
                    path: "/admin/bookings",
                    element: <MyBookingsPage />
                },

    ])

    return <RouterProvider router={router} />
}
export default Router;
