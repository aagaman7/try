import React, { useState } from 'react';
import { format } from 'date-fns';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const TrainerDetails = ({ trainer, onBook, isProcessing }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    onBook({
      date: selectedDate,
      time: selectedTime,
      notes,
      stripe,
      elements
    });
  };

  const getAvailableTimeSlots = (date) => {
    const dayAvailability = trainer.availability.find(a => a.day === format(new Date(date), 'EEEE'));
    if (!dayAvailability) return [];

    // Generate time slots between start and end time
    const slots = [];
    let currentTime = new Date(`2000-01-01T${dayAvailability.startTime}`);
    const endTime = new Date(`2000-01-01T${dayAvailability.endTime}`);

    while (currentTime < endTime) {
      slots.push(format(currentTime, 'HH:mm'));
      currentTime.setMinutes(currentTime.getMinutes() + 60); // 1-hour slots
    }

    return slots;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/3">
          <img 
            src={trainer.image} 
            alt={trainer.name} 
            className="w-full h-64 object-cover"
          />
        </div>
        <div className="md:w-2/3 p-6">
          <h2 className="text-3xl font-bold mb-4">{trainer.name}</h2>
          <p className="text-xl text-blue-600 mb-2">{trainer.specialization}</p>
          <p className="text-gray-600 mb-4">{trainer.experience} Experience</p>
          <p className="mb-4">{trainer.bio}</p>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Qualifications</h3>
            <ul className="list-disc list-inside">
              {trainer.qualifications.map((qual, index) => (
                <li key={index}>{qual}</li>
              ))}
            </ul>
          </div>
          <p className="text-2xl font-bold text-blue-600">${trainer.price}/session</p>
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t">
        <h3 className="text-2xl font-bold mb-4">Book a Session</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Time
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
              disabled={!selectedDate}
            >
              <option value="">Select a time slot</option>
              {getAvailableTimeSlots(selectedDate).map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Details
            </label>
            <div className="p-3 border border-gray-300 rounded bg-white">
              <CardElement options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={isProcessing || !stripe}
          >
            {isProcessing ? 'Processing...' : `Book Session - $${trainer.price}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrainerDetails; 