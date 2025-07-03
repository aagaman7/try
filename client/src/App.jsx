import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MembershipPage from "./pages/MembershipPage";
import BookingPage from "./pages/BookingPage";
import UserLayout from "./pages/UserLayout";
import { AuthProvider } from "./context/AuthContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import ProtectedRoute, { AdminRoute, CustomerRoute } from "./ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

// Import trainer components
import TrainerList from "./pages/TrainerList";
import TrainerDetail from "./pages/TrainerDetail";
import UserBookings from "./pages/UserBookings";
import UserDashboard from "./pages/UserDashboard";

// Admin components
import Dashboard from "./pages/admin/Dashboard";
import UsersPanel from "./pages/admin/UsersPanel";
import BookingsPanel from "./pages/admin/BookingsPanel";
import PackagesPanel from "./pages/admin/PackagesPanel";
import ServicesPanel from "./pages/admin/ServicesPanel";
import DiscountPanel from "./pages/admin/DiscountPanel";
import GymAdminPanel from "./pages/admin/GymAdminPanel";
import TrainerPanel from "./pages/admin/TrainerPanel";

// Load Stripe with a fallback
const stripePromise = loadStripe(
  "pk_test_51R3gpYKyPD1pSXJk7t5Miohxxr1gbEhR7JGKKoNwZbRLfpopi8imTEnZupJklMIXlALRpV947IKg1ymFfHnzbulJ004dcGBMtI"
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Elements stripe={stripePromise}>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route element={<UserLayout/>}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Route>

              {/* Customer Routes */}
              <Route element={<CustomerRoute />}>
                <Route element={<UserLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/membership" element={<MembershipPage />} />
                  <Route path="/booking/:packageId" element={<BookingPage />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/trainers" element={<TrainerList />} />
                  <Route path="/trainers/:id" element={<TrainerDetail />} />
                  <Route path="/trainer/bookings" element={<UserBookings />} />
                </Route>
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="admin" element={<GymAdminPanel />}>
                  <Route index element={<Dashboard />} />
                  <Route path="users" element={<UsersPanel />} />
                  <Route path="bookings" element={<BookingsPanel />} />
                  <Route path="packages" element={<PackagesPanel />} />
                  <Route path="services" element={<ServicesPanel />} />
                  <Route path="discounts" element={<DiscountPanel />} />
                  <Route path="trainers" element={<TrainerPanel />} />
                </Route>
              </Route>

              {/* Catch all - 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Elements>
      </Router>
    </AuthProvider>
  );
}

export default App;