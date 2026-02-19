import { createBrowserRouter, RouterProvider } from 'react-router-dom'

//User Side Pages
import HOME from '../pages/home.page'
import BusPage from '../pages/bus.page';
import TrainPage from '../pages/train.page';
import MyBookingsPage from '../pages/my-bookings.page';
import ContactPage from '../pages/contact.page';
import LoginPage from '../pages/login.page';
import SignupPage from '../pages/signup.page';
import MainLayout from '../components/layout/main.layout';

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
                    path: "/bookings",
                    element: <MyBookingsPage />
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
                }
            ]
        }
    ])

    return <RouterProvider router={router} />
}
export default Router;
