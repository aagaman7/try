import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2Icon } from 'lucide-react';

const ConfirmationPage = () => {
  const location = useLocation();
  const { booking, totalPrice } = location.state || {};

  if (!booking) {
    return <div>No booking details available</div>;
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <CheckCircle2Icon className="mx-auto h-20 w-20 text-green-600 mb-6" />
        <h2 className="text-3xl font-extrabold mb-4">
          Membership Confirmed!
        </h2>
        <p className="text-gray-600 mb-8">
          Thank you for joining FitLife Gym. Your membership is now active.
        </p>

        <div className="bg-gray-100 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Booking Details</h3>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <span className="text-gray-500">Package:</span>
              <p className="font-semibold">{booking.package.name}</p>
            </div>
            <div>
              <span className="text-gray-500">Time Slot:</span>
              <p className="font-semibold">{booking.timeSlot}</p>
            </div>
            <div>
              <span className="text-gray-500">Workout Days:</span>
              <p className="font-semibold">{booking.workoutDaysPerWeek} days/week</p>
            </div>
            <div>
              <span className="text-gray-500">Total Price:</span>
              <p className="font-semibold">${totalPrice}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Link
            to="/dashboard"
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/"
            className="bg-gray-100 text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-200 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;