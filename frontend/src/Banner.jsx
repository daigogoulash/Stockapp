import React from "react";
import { useNavigate } from "react-router-dom";
import "./Banner.css";

function Banner() {
  const navigate = useNavigate();

  const goToStockLookup = () => {
    navigate("/stock/:symbol"); // Update with your correct path
  };

  const handleLogout = () => {
    //logout logic
    navigate("/login");
  };

  return (
      <div className="banner">
          <img src="/stonkslogo.svg" alt="Banner" />
      <div className="banner-buttons">
        <button className="banner-button" onClick={goToStockLookup}>
          Lookup a Stock
        </button>
        <button className="banner-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Banner;
