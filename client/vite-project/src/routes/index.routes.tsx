import {createBrowserRouter, RouterProvider} from 'react-router-dom'

//User Side Pages
import HOME from '../pages/home.page'

const Router=()=>{

    const router= createBrowserRouter([
        {
            path:"/",
            element:<HOME/>
        }
    ])

    return <RouterProvider router={router}/>
}
export default Router;
