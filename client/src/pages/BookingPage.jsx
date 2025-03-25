import BookingForm from "../components/membership/BookingForm";
import GymAvailabilityChecker from "../components/membership/GymAvailabilityChecker";

const BookingPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Book a Membership</h1>
      <GymAvailabilityChecker />
      <BookingForm />
    </div>
  );
};

export default BookingPage;
