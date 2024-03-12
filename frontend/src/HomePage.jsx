import React, { useState, useEffect } from "react";
import axios from "axios";
import Banner from "./Banner";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";

function HomePage({ isLoggedIn }) {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);

  useEffect(() => {
    fetchPortfolioData(); // Refactor to call fetchPortfolioData directly
  }, [isLoggedIn]);

  const fetchPortfolioData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return; // Exit if no token

    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/portfolio`, // `https://capstone-ml1.ew.r.appspot.com/portfolio` for deployment
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { portfolio, total_portfolio_value } = response.data;
      setTotalPortfolioValue(total_portfolio_value);

      const stocksArray = Object.entries(portfolio).map(([symbol, data]) => ({
        symbol,
        ...data,
      }));
      setStocks(stocksArray);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      setStocks([]);
      setTotalPortfolioValue(0);
    }
  };

  const removeStock = async (symbol) => {
    const confirmRemoval = window.confirm(
      `Are you sure you want to remove ${symbol}?`
    );
    if (!confirmRemoval) return; // Stop if the user cancels the action

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.put(
        `http://127.0.0.1:5000/update_user`, // `https://capstone-ml1.ew.r.appspot.com/update_user` for deployment
        { stocks: { [symbol]: 0 } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPortfolioData(); // Refetch the portfolio data to update the UI, check if it works
    } catch (error) {
      console.error("Error removing stock:", error);
      alert("Failed to remove stock. Please try again."); // Optionally add an error alert
    }
  };


  return (
    <div className="home-container">
      {isLoggedIn && <Banner portfolioValue={totalPortfolioValue} />}
      <div className="home-header">
        <div className="header-name">
          <h1>Welcome to Your Portfolio!</h1>
        </div>
        <div className="header-value">
          <p>Total Portfolio Value: ${totalPortfolioValue}</p>
        </div>
        {isLoggedIn && (
          <button
            onClick={() => navigate("/update_user")}
            className="edit-portfolio-button"
          >
            Edit Portfolio
          </button>
        )}
      </div>
      <div className="home-content">
        {isLoggedIn &&
          stocks.map((stock) => (
            <div key={stock.symbol} className="stock-item">
              <div className="stock-name">
                <h3>{stock.symbol}</h3>
              </div>
              <div className="stock-details">
                <p>Current Price: {stock["current price"]}</p>
                <p>Quantity: {stock.quantity}</p>
                <p>Total Value: {stock.value}</p>
                <button className="remove-stock-button"
                  onClick={() => removeStock(stock.symbol)}>
                  Remove Stock
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default HomePage;
