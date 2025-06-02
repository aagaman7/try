import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Home, Users, Calendar, Package, Dumbbell, Tag, LogOut, ChevronRight, ChevronDown, ChevronLeft, UserCog } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // Import the AuthContext

function GymAdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth(); // Use the same auth context as in Navbar

  // Check if screen is mobile on load and when resized
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        navigate("/login"); // Redirect to login page after successful logout
      }
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const getUserInitials = () => {
    if (currentUser && currentUser.name) {
      return currentUser.name.charAt(0).toUpperCase();
    }
    return "U"; // Default if no name is available
  };

  const navItems = [
    { path: "/admin", name: "Dashboard", icon: <Home size={20} /> },
    { path: "users", name: "Users", icon: <Users size={20} /> },
    { path: "bookings", name: "Bookings", icon: <Calendar size={20} /> },
    { path: "packages", name: "Packages", icon: <Package size={20} /> },
    { path: "services", name: "Services", icon: <Dumbbell size={20} /> },
    { path: "discounts", name: "Discounts", icon: <Tag size={20} /> },
    { path: "trainers", name: "Trainers", icon: <UserCog size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`bg-gray-800 text-white ${
          sidebarOpen ? "w-64" : "w-0 md:w-16"
        } transition-all duration-300 fixed h-full z-10`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold">Gym Admin</h1>
          )}
          <button onClick={toggleSidebar} className="ml-auto text-white">
            {sidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>

        {/* User Profile in Sidebar */}
        {sidebarOpen && currentUser && (
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                {getUserInitials()}
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{currentUser.name || "Admin User"}</span>
                <span className="text-xs text-gray-400">{currentUser.email || ""}</span>
              </div>
            </div>
          </div>
        )}

        <nav className="mt-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-4 hover:bg-gray-700 ${
                    location.pathname === "/admin" + item.path || 
                    (location.pathname === "/admin" && item.path === "/admin") ? 
                    "bg-gray-700" : ""
                  } ${sidebarOpen ? "" : "justify-center"}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className={`flex items-center p-4 hover:bg-gray-700 w-full text-left text-red-400 ${
                  sidebarOpen ? "" : "justify-center"
                }`}
              >
                <span className="mr-3"><LogOut size={20} /></span>
                {sidebarOpen && <span>Logout</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-0 md:ml-16"} transition-all duration-300`}>
        {/* Top Navbar */}
        <header className="bg-white shadow-sm h-16 flex items-center px-4">
          <button
            onClick={toggleSidebar}
            className="mr-4 md:hidden"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-xl font-semibold">
            {navItems.find(item => item.path === location.pathname || 
            "/admin/" + item.path === location.pathname || 
            (location.pathname === "/admin" && item.path === "/admin"))?.name || "Dashboard"}
          </h2>
          
          {/* User Profile in Header */}
          <div className="ml-auto flex items-center gap-4">
            {currentUser ? (
              <div className="relative flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
                  {getUserInitials()}
                </div>
                {!isMobile && (
                  <span className="font-medium hidden md:block">{currentUser.name || "Admin User"}</span>
                )}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium">U</span>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6 overflow-auto h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default GymAdminPanel;