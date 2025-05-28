import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MembershipPage from "./pages/MembershipPage";
import BookingPage from "./pages/BookingPage";
// import UserDashboard from "./pages/UserDashboard";
import UserLayout from "./pages/UserLayout";

import { AuthProvider } from "./context/AuthContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Import trainer components
import TrainerList from "./pages/TrainerList";
import TrainerDetail from "./pages/TrainerDetail";
import UserBookings from "./pages/UserBookings";

import Dashboard from "./pages/admin/Dashboard";
import UsersPanel from "./pages/admin/UsersPanel";
import BookingsPanel from "./pages/admin/BookingsPanel";
import PackagesPanel from "./pages/admin/PackagesPanel";
import ServicesPanel from "./pages/admin/ServicesPanel";
import DiscountPanel from "./pages/admin/DiscountPanel";
import GymAdminPanel from "./pages/admin/GymAdminPanel";
import TrainerPanel from "./pages/admin/TrainerPanel";
import UserDashboard from "./pages/UserDashboard";

// Load Stripe with a fallback
const stripePromise = loadStripe(
  "pk_test_51R3gpYKyPD1pSXJk7t5Miohxxr1gbEhR7JGKKoNwZbRLfpopi8imTEnZupJklMIXlALRpV947IKg1ymFfHnzbulJ004dcGBMtI"
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Elements stripe={stripePromise}>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes with UserLayout */}
              <Route element={<UserLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/membership" element={<MembershipPage />} />
                <Route path="/booking/:packageId" element={<BookingPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<UserDashboard/>} />
                {/* Trainer routes */}
                <Route path="/trainers" element={<TrainerList/>} />
                <Route path="/trainers/:id" element={<TrainerDetail />} />
                <Route path="/trainer/bookings" element={<UserBookings />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={<GymAdminPanel />}>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<UsersPanel />} />
                <Route path="bookings" element={<BookingsPanel />} />
                <Route path="packages" element={<PackagesPanel />} />
                <Route path="services" element={<ServicesPanel />} />
                <Route path="discounts" element={<DiscountPanel />} />
                <Route path="trainers" element={<TrainerPanel />} />
              </Route>
            </Routes>
          </div>
        </Elements>
      </Router>
    </AuthProvider>
  );
}

export default App;