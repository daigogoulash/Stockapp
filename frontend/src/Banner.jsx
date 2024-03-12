import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./Banner.css";

function Banner() {
  const navigate = useNavigate();

  const goToStockLookup = () => {
    navigate("/stock/:symbol"); // Update with your correct path
  };

  const goToHomePage = () => {
    navigate("/"); // Navigate to the homepage
  };

  const handleLogout = () => {
    // Clear user information from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    // Navigate to the login page
    navigate("/");
    // Optional: Reload the page
    // setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div className="banner">
      <img src="/stonkslogo.svg" alt="Banner" />
      <div className="banner-buttons">
        <button className="banner-button" onClick={goToStockLookup}>
          Lookup a Stock
        </button>
        <button className="banner-button" onClick={goToHomePage}>
          Home
        </button>
        <button className="banner-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Banner;
