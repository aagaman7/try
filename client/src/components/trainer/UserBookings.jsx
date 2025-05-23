import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await apiService.getUserTrainerBookings();
      setBookings(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await apiService.cancelTrainerBooking(bookingId);
      fetchBookings(); // Refresh the bookings list
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Trainer Sessions</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center text-gray-500">
          You haven't booked any trainer sessions yet.
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Session with {booking.trainer.name}
                  </h2>
                  <p className="text-gray-600">
                    Day: {booking.day}
                  </p>
                  <p className="text-gray-600">Time: {booking.time}</p>
                  <p className="text-gray-600">
                    Status: <span className={`font-semibold ${
                      booking.status === 'confirmed' ? 'text-green-600' :
                      booking.status === 'cancelled' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </p>
                  {booking.notes && (
                    <p className="text-gray-600 mt-2">
                      Notes: {booking.notes}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 md:mt-0">
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Cancel Session
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookings; 