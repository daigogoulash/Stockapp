import React, { useState } from "react";
import axios from "axios";
import Banner from "./Banner";

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
    
    <>
      <div>
        <Banner />
      </div>
      <form onSubmit={handleUpdate}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Stock Symbol"
          required
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
          required
        />
        <button type="submit">Update Portfolio</button>
      </form>
    </>
  );
};

export default UpdatePortfolioForm;
