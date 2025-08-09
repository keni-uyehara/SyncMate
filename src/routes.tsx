import { createBrowserRouter, Navigate, redirect } from "react-router-dom";
import { getAuth } from "firebase/auth";

// Public pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Error from "./pages/Error";

// Authenticated/Shared pages
import Profile from "./pages/Profile";

import ProtectedRoutes from "./components/ProtectedRoutes";

// SALES REP PAGES
import { SalesHomepage } from "./pages/salesRep/Homepage";
import { Inventory } from "./pages/salesRep/Inventory";
import { NewOrder } from "./pages/salesRep/NewOrder";
import SalesLayout from "./pages/salesRep/Layout"; // ✅ default import

//CEO OR ADMIN PAGES
import { AdminHomepage } from "./pages/admin/Homepage";
import ManageUsers from "./pages/admin/ManageUsers";
import AdminLayout from "./pages/admin/Layout";



export const router = createBrowserRouter([
  // Default redirect to login
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  // Public routes

  {
    path: "/login",
    element: <Login />,
    errorElement: <Error />,
  },
  {
    path: "/signup",
    element: <Signup />,
    errorElement: <Error />,
  },

  // Protected routes (require login)
  {
    element: <ProtectedRoutes />,
    children: [
      {
        path: "/profile",
        element: <Profile />,
        errorElement: <Error />,
      },
      

      // CEO/Admin Layout + Nested Routes
      {
        path: "/admin",
        element: <AdminLayout />,
        errorElement: <Error />,
        children: [
          { path: "homepage", element: <AdminHomepage /> },
          { path: "manage-users", element: <ManageUsers /> },
        ],
      },

      // Sales Representative Layout + Nested Routes
      {
        path: "/sales",
        element: <SalesLayout />,
        errorElement: <Error />,
        children: [
          { path: "homepage", element: <SalesHomepage /> },
          { path: "inventory", element: <Inventory /> },
          { path: "new-order", element: <NewOrder /> },
        ],
      },


   
    ],
  },

  // Catch-all fallback
  {
    path: "*",
    element: <Error />,
  },
]);

export default router;
