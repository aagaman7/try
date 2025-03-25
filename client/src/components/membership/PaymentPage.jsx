import { useState } from "react";
import { apiService } from "../../services/apiService";

const PaymentPage = () => {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const handlePayment = async () => {
    try {
      const res = await apiService.processPayment({ amount });
      setStatus(res.data.status);
    } catch (error) {
      setStatus("Payment failed!");
    }
  };

  return (
    <div className="p-4">
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
      <button onClick={handlePayment} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
        Pay
      </button>
      <p className="mt-2">{status}</p>
    </div>
  );
};

export default PaymentPage;
