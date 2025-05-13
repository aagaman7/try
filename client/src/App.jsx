import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TrainerBookingPage from "./pages/TrainerBookingPage";
import MembershipPage from "./pages/MembershipPage";
import BookingPage from "./pages/BookingPage";
import UserDashboard from "./pages/UserDashboard"; // Import the new dashboard component
import { AuthProvider } from "./context/AuthContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import Dashboard from "./pages/admin/Dashboard";
import UsersPanel from "./pages/admin/UsersPanel";
import BookingsPanel from "./pages/admin/BookingsPanel";
import PackagesPanel from "./pages/admin/PackagesPanel";
import ServicesPanel from "./pages/admin/ServicesPanel";
import DiscountPanel from "./pages/admin/DiscountPanel";
import GymAdminPanel from "./pages/admin/GymAdminPanel";
import TrainerPanel from "./pages/admin/TrainerPanel";

// Load Stripe
// Load Stripe with a fallback
const stripePromise = loadStripe(
  "pk_test_51R3gpYKyPD1pSXJk7t5Miohxxr1gbEhR7JGKKoNwZbRLfpopi8imTEnZupJklMIXlALRpV947IKg1ymFfHnzbulJ004dcGBMtI"
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="min-h-screen pt-16">
          <Elements stripe={stripePromise}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/booking/:packageId" element={<BookingPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/schedule" element={<TrainerBookingPage />} />

              <Route path="/admin" element={<GymAdminPanel />}>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<UsersPanel />} />
                <Route path="bookings" element={<BookingsPanel />} />
                <Route path="packages" element={<PackagesPanel />} />
                <Route path="services" element={<ServicesPanel />} />
                <Route path="discounts" element={<DiscountPanel />} />
                <Route path="trainers" element={<TrainerPanel/>}/>
              </Route>

              {/* User Dashboard - New route */}
              <Route path="/dashboard" element={<UserDashboard />} />
            </Routes>
          </Elements>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
