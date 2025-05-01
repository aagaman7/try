import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Home, Users, Calendar, Package, Dumbbell, Tag, LogOut, ChevronRight, ChevronDown, ChevronLeft } from "lucide-react";

function GymAdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    // Implement your logout logic here
    console.log("Logging out...");
    // Example: clear local storage, cookies, etc.
    localStorage.removeItem("auth-token");
    // Redirect to login page
    navigate("/login");
  };

  const navItems = [
    { path: "/", name: "Dashboard", icon: <Home size={20} /> },
    { path: "/users", name: "Users", icon: <Users size={20} /> },
    { path: "/bookings", name: "Bookings", icon: <Calendar size={20} /> },
    { path: "/packages", name: "Packages", icon: <Package size={20} /> },
    { path: "/services", name: "Services", icon: <Dumbbell size={20} /> },
    { path: "/discounts", name: "Discounts", icon: <Tag size={20} /> },
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

        <nav className="mt-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-4 hover:bg-gray-700 ${
                    location.pathname === item.path ? "bg-gray-700" : ""
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
            {navItems.find(item => item.path === location.pathname)?.name || "Dashboard"}
          </h2>
          <div className="ml-auto flex items-center gap-4">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium">JD</span>
              </div>
            </div>
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