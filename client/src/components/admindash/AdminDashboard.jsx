import React, { useState } from 'react';
import { 
  Package, 
  Users, 
  Settings, 
  Clipboard, 
  BarChart2, 
  DollarSign, 
  Activity 
} from 'lucide-react';

// Main Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch(activeTab) {
      case 'packages':
        return <PackageManagement />;
      case 'services':
        return <ServiceManagement />;
      case 'users':
        return <UserManagement />;
      case 'trainers':
        return <TrainerManagement />;
      case 'discounts':
        return <DiscountManagement />;
      case 'insights':
        return <GymInsights />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-5 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        <nav className="p-4">
          <SidebarItem 
            icon={<BarChart2 />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <SidebarItem 
            icon={<Package />} 
            label="Packages" 
            active={activeTab === 'packages'}
            onClick={() => setActiveTab('packages')}
          />
          <SidebarItem 
            icon={<Clipboard />} 
            label="Services" 
            active={activeTab === 'services'}
            onClick={() => setActiveTab('services')}
          />
          <SidebarItem 
            icon={<Users />} 
            label="Users" 
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
          <SidebarItem 
            icon={<Activity />} 
            label="Trainers" 
            active={activeTab === 'trainers'}
            onClick={() => setActiveTab('trainers')}
          />
          <SidebarItem 
            icon={<DollarSign />} 
            label="Discounts" 
            active={activeTab === 'discounts'}
            onClick={() => setActiveTab('discounts')}
          />
          <SidebarItem 
            icon={<Settings />} 
            label="Gym Insights" 
            active={activeTab === 'insights'}
            onClick={() => setActiveTab('insights')}
          />
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {renderContent()}
      </div>
    </div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ icon, label, active, onClick }) => (
  <div 
    className={`
      flex items-center p-3 mb-2 cursor-pointer rounded-lg 
      ${active 
        ? 'bg-blue-100 text-blue-600' 
        : 'hover:bg-gray-100 text-gray-600'
      }
    `}
    onClick={onClick}
  >
    {React.cloneElement(icon, { className: 'mr-3' })}
    <span className="font-medium">{label}</span>
  </div>
);

// Dashboard Overview Component
const Dashboard = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-3 gap-6">
        <StatCard 
          title="Total Users" 
          value="458" 
          icon={<Users className="text-blue-500" />} 
        />
        <StatCard 
          title="Active Packages" 
          value="12" 
          icon={<Package className="text-green-500" />} 
        />
        <StatCard 
          title="Monthly Revenue" 
          value="$45,678" 
          icon={<DollarSign className="text-purple-500" />} 
        />
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className="mr-4">{icon}</div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </div>
);

// Package Management Component
const PackageManagement = () => {
  const [packages, setPackages] = useState([
    { 
      id: 1, 
      name: 'Basic Fitness', 
      description: 'Entry-level fitness package', 
      basePrice: 49.99,
      active: true
    },
    { 
      id: 2, 
      name: 'Premium Wellness', 
      description: 'Comprehensive wellness program', 
      basePrice: 99.99,
      active: true
    }
  ]);

  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    basePrice: 0
  });

  const handleAddPackage = () => {
    const newPackageObj = {
      ...newPackage,
      id: packages.length + 1,
      active: true
    };
    setPackages([...packages, newPackageObj]);
    setNewPackage({ name: '', description: '', basePrice: 0 });
  };

  const handleDeletePackage = (id) => {
    setPackages(packages.filter(pkg => pkg.id !== id));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Package Management</h2>
      
      {/* Add Package Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Add New Package</h3>
        <div className="grid grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder="Package Name" 
            className="border p-2 rounded"
            value={newPackage.name}
            onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="Description" 
            className="border p-2 rounded"
            value={newPackage.description}
            onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
          />
          <input 
            type="number" 
            placeholder="Base Price" 
            className="border p-2 rounded"
            value={newPackage.basePrice}
            onChange={(e) => setNewPackage({...newPackage, basePrice: parseFloat(e.target.value)})}
          />
          <button 
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            onClick={handleAddPackage}
          >
            Add Package
          </button>
        </div>
      </div>

      {/* Package List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Existing Packages</h3>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => (
              <tr key={pkg.id} className="border-b">
                <td className="p-3">{pkg.name}</td>
                <td className="p-3">{pkg.description}</td>
                <td className="p-3">${pkg.basePrice.toFixed(2)}</td>
                <td className="p-3">
                  <span className={`
                    px-2 py-1 rounded 
                    ${pkg.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  `}>
                    {pkg.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                  <button 
                    className="text-red-500 hover:text-red-700 mr-2"
                    onClick={() => handleDeletePackage(pkg.id)}
                  >
                    Delete
                  </button>
                  <button className="text-blue-500 hover:text-blue-700">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Service Management Component
const ServiceManagement = () => {
  const [services, setServices] = useState([
    { 
      id: 1, 
      name: 'Personal Training', 
      category: 'Fitness', 
      price: 50,
      active: true
    },
    { 
      id: 2, 
      name: 'Nutrition Consultation', 
      category: 'Wellness', 
      price: 75,
      active: true
    }
  ]);

  const [newService, setNewService] = useState({
    name: '',
    category: '',
    price: 0
  });

  const handleAddService = () => {
    const newServiceObj = {
      ...newService,
      id: services.length + 1,
      active: true
    };
    setServices([...services, newServiceObj]);
    setNewService({ name: '', category: '', price: 0 });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Service Management</h2>
      
      {/* Add Service Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Add New Service</h3>
        <div className="grid grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder="Service Name" 
            className="border p-2 rounded"
            value={newService.name}
            onChange={(e) => setNewService({...newService, name: e.target.value})}
          />
          <select 
            className="border p-2 rounded"
            value={newService.category}
            onChange={(e) => setNewService({...newService, category: e.target.value})}
          >
            <option value="">Select Category</option>
            <option value="Fitness">Fitness</option>
            <option value="Wellness">Wellness</option>
          </select>
          <input 
            type="number" 
            placeholder="Price" 
            className="border p-2 rounded"
            value={newService.price}
            onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value)})}
          />
          <button 
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            onClick={handleAddService}
          >
            Add Service
          </button>
        </div>
      </div>

      {/* Service List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Existing Services</h3>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id} className="border-b">
                <td className="p-3">{service.name}</td>
                <td className="p-3">{service.category}</td>
                <td className="p-3">${service.price.toFixed(2)}</td>
                <td className="p-3">
                  <span className={`
                    px-2 py-1 rounded 
                    ${service.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  `}>
                    {service.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                  <button className="text-red-500 hover:text-red-700 mr-2">
                    Delete
                  </button>
                  <button className="text-blue-500 hover:text-blue-700">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};