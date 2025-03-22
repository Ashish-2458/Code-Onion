import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Chatbot from "./components/Chatbot";
import Sales from "./components/Sales";
import Purchase from "./components/Purchase";
import Finance from "./components/Finance";
import HR from "./components/HR";
import Settings from "./components/Settings";
import "./App.css";

function App() {
  const ComingSoon = ({ title }) => (
    <div className="coming-soon">
      <h2>{title}</h2>
      <p>This feature is coming soon!</p>
    </div>
  );

  return (
    <Router>
      <div className="app-container">
        <Dashboard />
        <div className="main-content">
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={
                <div className="welcome-section">
                  <h1>Welcome to Dashboard</h1>
                  <p>Your complete business management solution</p>
                  <div className="dashboard-stats">
                    <div className="stat-card">
                      <h3>Total Sales</h3>
                      <p>$48,250</p>
                    </div>
                    <div className="stat-card">
                      <h3>Orders</h3>
                      <p>164</p>
                    </div>
                    <div className="stat-card">
                      <h3>Inventory</h3>
                      <p>1,428</p>
                    </div>
                  </div>
                </div>
              } />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/purchase" element={<Purchase />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/hr" element={<HR />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={
                <div className="not-found">
                  <h2>404 - Page Not Found</h2>
                  <p>The page you're looking for doesn't exist.</p>
                </div>
              } />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
