import React, { useState } from "react";
import axios from "axios";
import Banner from "./Banner";
import "./addUpdateStocks.css";


const UpdatePortfolioForm = () => {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        "https://capstone-ml1.ew.r.appspot.com/update_user", // "https://capstone-ml1.ew.r.appspot.com/update_user" for deploying
        { stocks: { [symbol]: parseInt(quantity, 10) } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Portfolio updated successfully");
      // Additional logic to refresh or update the UI
    } catch (error) {
      console.error("Error updating portfolio:", error);
      alert("Error updating portfolio");
    }
  };

  return (
    <div className="update-portfolio-container">
      <Banner />
      <form onSubmit={handleUpdate} className="update-portfolio-form">
        <label className="form-label">Stock Symbol</label>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Stock Symbol"
          required
          className="update-portfolio-input"
        />
        <label className="form-label">Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
          required
          className="update-portfolio-input"
        />
        <button type="submit" className="update-portfolio-button">
          Update Portfolio
        </button>
      </form>
    </div>
  );
};

export default UpdatePortfolioForm;