import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
// import Membership from './pages/Membership';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
// Private route component
import ProtectedRoute from './components/auth/ProtectedRoute';
import TrainerBookingPage from './pages/TrainerBookingPage';
// import MembershipPage from './pages/MembershipPage';
// import BookingPage from './pages/BookingPage';
// import BookingConfirmationPage from './components/membership/BookingConfirmationPage';
// import PackageDetailsPage from './components/membership/PackageDetailsPage';



function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="min-h-screen pt-16">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            {/* <Route path="/membership" element={<Membership />} /> */}
            {/* <Route path="/booking" element={<BookingPage/>} /> */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/schedule" element={<TrainerBookingPage/>}/>
            {/* <Route path="/booking-confirmation" element={<BookingConfirmationPage/>}/> */}

           
            {/* Updated route for package details */}
            {/* <Route path="/package/:packageType" element={<PackageDetailsPage/>}/> */}
            {/* Protected Route */}
            <Route element={<ProtectedRoute />}>
            </Route>
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;