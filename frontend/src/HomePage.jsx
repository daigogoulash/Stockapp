import React, { useState, useEffect } from "react";
import axios from "axios";
//import { useNavigate } from "react-router-dom";
import Banner from "./Banner";
import "./HomePage.css";

function HomePage({ isLoggedIn, username }) {
  const [stocks, setStocks] = useState([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  //const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const response = await axios.get(
          `https://capstone-ml1.ew.r.appspot.com/portfolio/${username}`
        );
        const { portfolio, total_portfolio_value } = response.data;
        setTotalPortfolioValue(total_portfolio_value);

        // Convert the portfolio object into an array of objects
        const stocksArray = Object.entries(portfolio).map(([symbol, data]) => ({
          symbol,
          ...data,
        }));
        setStocks(stocksArray);
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
        setStocks([]); // Set stocks to an empty array in case of an error
        setTotalPortfolioValue(0); // Reset total portfolio value
      }
    };

    if (isLoggedIn && username) {
      fetchPortfolioData();
    }
  }, [isLoggedIn, username]);

  return (
    <div className="home-container">
      {isLoggedIn && <Banner portfolioValue={totalPortfolioValue} />}
      <div className="home-header">
        <div className="header-name">
          <h1>Welcome, {username}!</h1>
        </div>
        <div className="header-value">
          <p>Total Portfolio Value: ${totalPortfolioValue}</p>
        </div>
      </div>
      <div className="home-content">
        {/* Display stocks for logged-in user */}
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
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default HomePage;
