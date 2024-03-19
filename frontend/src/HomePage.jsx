import React, { useState, useEffect } from "react";
import axios from "axios";
import Banner from "./Banner";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";

function HomePage({ isLoggedIn, username }) {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // State to track loading status

  useEffect(() => {
    fetchPortfolioData();
  }, [isLoggedIn]);

  const fetchPortfolioData = async () => {
    setIsLoading(true); // Set loading to true before API call
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return; // Exit if no token
    }

    try {
      const response = await axios.get(
        `https://capstone-ml1.ew.r.appspot.com/api/portfolio`,
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
    } finally {
      setIsLoading(false); // Set loading to false after API call
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
        `https://capstone-ml1.ew.r.appspot.com/update_user`,
        { stocks: { [symbol]: 0 } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPortfolioData(); // Refetch the portfolio data to update the UI
    } catch (error) {
      console.error("Error removing stock:", error);
      alert("Failed to remove stock. Please try again.");
    }
  };

  const formatCurrency = (value) => {
    return Number(value).toFixed(2);
  };

  return (
    <div className="home-container">
      {isLoggedIn && (
        <Banner portfolioValue={formatCurrency(totalPortfolioValue)} />
      )}
      <div className="home-header">
        <div className="header-name">
          <h1>Welcome to Your Portfolio, {username}!</h1>
        </div>
        <div className="header-value">
          <p>Total Portfolio Value: ${formatCurrency(totalPortfolioValue)}</p>
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
        {isLoading ? (
          <div className="loading-message">
            <p>Loading portfolio data...</p>
          </div>
        ) : (
          stocks.map((stock) => (
            <div key={stock.symbol} className="stock-item">
              <div className="stock-name">
                <h3>{stock.symbol}</h3>
              </div>
              <div className="stock-details">
                <p>Current Price: ${formatCurrency(stock["current price"])}</p>
                <p>Quantity: {stock.quantity}</p>
                <p>Total Value: ${formatCurrency(stock.value)}</p>
                <button
                  className="remove-stock-button"
                  onClick={() => removeStock(stock.symbol)}
                >
                  Remove Stock
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HomePage;
