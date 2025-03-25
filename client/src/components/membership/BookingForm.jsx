import { useState, useEffect } from "react";
import { apiService } from "../../services/apiService";

const BookingForm = () => {
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [timeSlot, setTimeSlot] = useState("");

  useEffect(() => {
    apiService.getPackages().then((res) => setPackages(res.data));
    apiService.getServices().then((res) => setServices(res.data));
  }, []);

  const handleBooking = async () => {
    const bookingData = {
      packageId: selectedPackage,
      customServices: selectedServices,
      timeSlot,
    };

    try {
      const response = await apiService.bookMembership(bookingData);
      alert("Booking successful!");
    } catch (error) {
      alert("Booking failed!");
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded">
      <h2 className="text-lg font-bold mb-4">Book a Membership</h2>
      <select onChange={(e) => setSelectedPackage(e.target.value)}>
        <option value="">Select a Package</option>
        {packages.map((pkg) => (
          <option key={pkg._id} value={pkg._id}>{pkg.name} - ${pkg.price}</option>
        ))}
      </select>
      <button onClick={handleBooking} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        Book Now
      </button>
    </div>
  );
};

export default BookingForm;
