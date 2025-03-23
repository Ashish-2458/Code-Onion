import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Dashboard.css"; // Import the CSS file

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard (Main Home)", icon: "🏢" },
    { path: "/chatbot", label: "Chatbot (AI Assistant)", icon: "🧠" },
    { path: "/sales", label: "Sales & Inventory", icon: "🛍️" },
    { path: "/invoice", label: "Invoice Generator", icon: "📝" },
    { path: "/finance", label: "Finance & Accounting", icon: "💰" },
    { path: "/hr", label: "HR & Payroll", icon: "👥" },
    { path: "/allbot", label: "AllBot (Advanced AI)", icon: "🧠" },
    { path: "/purchase", label: "Purchase & Orders", icon: "🛍️" },
    { path: "/settings", label: "Settings & Admin", icon: "⚙️" },
  ];

  return (
    <>
      {/* Hamburger Button (Always Visible) */}
      <button 
        className="hamburger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar Navigation */}
      <div className={`dashboard ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar">
          <div className="dashboard-header">
            <h2 className="title">
              <span className="logo">🏢</span>
              Info Electronics
            </h2>
          </div>

          <nav className="nav-buttons">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <button className="nav-btn">
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <p>© 2024 IDMS Enterprise Solutions</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
