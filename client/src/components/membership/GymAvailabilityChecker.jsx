import { useState } from "react";
import { apiService } from "../../services/apiService";

const GymAvailabilityChecker = () => {
  const [timeSlot, setTimeSlot] = useState("");
  const [availability, setAvailability] = useState("");

  const checkAvailability = async () => {
    try {
      const res = await apiService.checkAvailability(timeSlot);
      setAvailability(res.data.message);
    } catch (error) {
      setAvailability("Error checking availability");
    }
  };

  return (
    <div className="p-4">
      <input type="datetime-local" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} />
      <button onClick={checkAvailability} className="ml-2 bg-green-500 text-white px-4 py-2 rounded">
        Check
      </button>
      <p className="mt-2">{availability}</p>
    </div>
  );
};

export default GymAvailabilityChecker;
