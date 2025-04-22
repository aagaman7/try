import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import TrainerBookingPage from './pages/TrainerBookingPage';
import MembershipPage from './pages/MembershipPage';
import BookingPage from './pages/BookingPage';
import UserDashboard from './pages/UserDashboard'; // Import the new dashboard component
import { AuthProvider } from './context/AuthContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe
// Load Stripe with a fallback
const stripePromise = loadStripe("pk_test_51R3gpYKyPD1pSXJk7t5Miohxxr1gbEhR7JGKKoNwZbRLfpopi8imTEnZupJklMIXlALRpV947IKg1ymFfHnzbulJ004dcGBMtI"); 

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
              <Route path="/schedule" element={<TrainerBookingPage/>}/>
              
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