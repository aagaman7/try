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
// import ConfirmationPage from './pages/ConfirmationPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
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
              <Route path="/booking/:packageID" element={<BookingPage />} />
              {/* <Route path="/confirmation" element={<ConfirmationPage />} /> */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/schedule" element={<TrainerBookingPage/>}/>
              
              {/* Protected Route */}
              <Route element={<ProtectedRoute />}>
                {/* Add protected routes here */}
              </Route>
            </Routes>
          </Elements>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;