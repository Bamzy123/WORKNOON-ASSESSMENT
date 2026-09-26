import { useState } from "react";
import { Bot, LayoutDashboard } from "lucide-react";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AdminLogin from "./components/AdminLogin.jsx";
import CustomerRequest from "./components/CustomerRequest.jsx";

export default function App() {
  const [activeView, setActiveView] = useState("customer");
  const [adminCredentials, setAdminCredentials] = useState(null);
  const isCustomerView = activeView === "customer";

  return (
    <>
      <header>
        <div className="brand">
          <div className="logo">W</div>
          <div>
            <b>WORKNOON</b>
            <span>AI Refund Support</span>
          </div>
        </div>
        <nav>
          <button
            className={isCustomerView ? "active" : ""}
            onClick={() => setActiveView("customer")}
          >
            <Bot size={17} /> Customer
          </button>
          <button
            className={!isCustomerView ? "active" : ""}
            onClick={() => setActiveView("admin")}
          >
            <LayoutDashboard size={17} /> Admin
          </button>
        </nav>
      </header>
      {isCustomerView ? (
        <CustomerRequest />
      ) : adminCredentials ? (
        <AdminDashboard
          credentials={adminCredentials}
          onSignOut={() => setAdminCredentials(null)}
        />
      ) : (
        <AdminLogin onLogin={setAdminCredentials} />
      )}
    </>
  );
}
