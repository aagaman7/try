import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BookingForm = ({ 
  selectedPackage, 
  customServices, 
  onSubmit 
}) => {
  const [goals, setGoals] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [workoutDays, setWorkoutDays] = useState(3);
  const [paymentInterval, setPaymentInterval] = useState('Monthly');

  const handleSubmit = () => {
    const bookingData = {
      packageId: selectedPackage._id,
      customServices,
      timeSlot,
      workoutDaysPerWeek: workoutDays,
      goals: goals.split(',').map(goal => goal.trim()),
      paymentInterval
    };

    onSubmit(bookingData);
  };

  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Your Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block mb-2">Fitness Goals (comma-separated)</label>
            <Input 
              placeholder="E.g. Weight Loss, Muscle Gain, Endurance"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2">Preferred Time Slot</label>
            <Select onValueChange={setTimeSlot} value={timeSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Select Time Slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning (6-9 AM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12-3 PM)</SelectItem>
                <SelectItem value="evening">Evening (5-8 PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2">Workout Days per Week</label>
            <Select 
              onValueChange={(value) => setWorkoutDays(Number(value))} 
              value={workoutDays.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Workout Days" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7].map(days => (
                  <SelectItem key={days} value={days.toString()}>
                    {days} Day{days !== 1 ? 's' : ''} per Week
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2">Payment Interval</label>
            <Select 
              onValueChange={setPaymentInterval} 
              value={paymentInterval}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Payment Interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="3 Months">3 Months</SelectItem>
                <SelectItem value="Yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!timeSlot || !goals}
            className="w-full"
          >
            Proceed to Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingForm;