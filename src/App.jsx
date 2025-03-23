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
                  <h1>Welcome to IDMS ERP System</h1>
                  <p>Integrated Digital Management Solutions for Your Enterprise</p>
                  <div className="dashboard-stats">
                    <div className="stat-card">
                      <h3>Active Users</h3>
                      <p>248</p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Transactions</h3>
                      <p>15,647</p>
                    </div>
                    <div className="stat-card">
                      <h3>System Uptime</h3>
                      <p>99.9%</p>
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
