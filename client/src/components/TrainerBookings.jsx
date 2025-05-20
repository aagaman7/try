import React from 'react';
import { format } from 'date-fns';

const TrainerBookings = ({ bookings, onCancel }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div 
          key={booking._id} 
          className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold">{booking.trainer.name}</h3>
              <p className="text-gray-600">{booking.trainer.specialization}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{format(new Date(booking.date), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">{booking.time}</p>
            </div>
          </div>

          {booking.notes && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Notes</p>
              <p className="text-gray-700">{booking.notes}</p>
            </div>
          )}

          <div className="mt-4 flex justify-between items-center">
            <p className="font-bold text-blue-600">${booking.totalPrice}</p>
            {booking.status === 'confirmed' && (
              <button
                onClick={() => onCancel(booking._id)}
                className="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      ))}

      {bookings.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No trainer bookings found</p>
        </div>
      )}
    </div>
  );
};

export default TrainerBookings; 