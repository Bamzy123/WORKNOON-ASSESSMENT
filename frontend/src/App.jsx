import { useState } from "react";
import { LayoutDashboard, ReceiptText } from "lucide-react";
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
          <div>
            <b>WORKNOON</b>
            <span>Refund support</span>
          </div>
        </div>
        <nav>
          <button
            className={isCustomerView ? "active" : ""}
            onClick={() => setActiveView("customer")}
          >
            <ReceiptText size={17} /> Customer
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
