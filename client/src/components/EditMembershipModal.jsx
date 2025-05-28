import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';

const EditMembershipModal = ({ visible, onClose, currentPackageId, currentServices, onSuccess }) => {
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(currentPackageId);
  const [selectedServices, setSelectedServices] = useState(currentServices || []);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (visible) {
      apiService.getPackages().then(setPackages);
      apiService.getServices().then(setServices);
      setSelectedPackage(currentPackageId);
      setSelectedServices(currentServices || []);
      setResult(null);
    }
  }, [visible, currentPackageId, currentServices]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await apiService.editMembership({
        packageId: selectedPackage,
        customServices: selectedServices,
      });
      setResult({ success: true, ...res });
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setResult({ success: false, message: err.message });
    }
    setLoading(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Edit Membership</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium mb-1">Select Package</label>
            <select
              value={selectedPackage}
              onChange={e => setSelectedPackage(e.target.value)}
              className="w-full border rounded p-2"
              required
            >
              <option value="">Select a package</option>
              {packages.map(pkg => (
                <option key={pkg._id} value={pkg._id}>
                  {pkg.name} (${pkg.basePrice})
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Custom Services</label>
            <div className="grid grid-cols-2 gap-2">
              {services.map(service => (
                <label key={service._id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={service._id}
                    checked={selectedServices.includes(service._id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedServices(prev => [...prev, service._id]);
                      } else {
                        setSelectedServices(prev => prev.filter(id => id !== service._id));
                      }
                    }}
                  />
                  <span className="ml-2">{service.name} (${service.price})</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
        {result && (
          <div className={`mt-4 p-2 rounded ${result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {result.message || (result.success ? 'Membership updated!' : 'Failed to update membership')}
            {result.paymentRequired && (
              <div className="mt-2">
                <strong>Payment required.</strong> Please complete payment in the next step.
              </div>
            )}
            {result.refundDetails && (
              <div className="mt-2">
                <strong>Refund processed.</strong>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditMembershipModal; 