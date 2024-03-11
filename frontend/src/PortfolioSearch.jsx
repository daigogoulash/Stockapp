import React, { useState, useEffect } from "react";
import axios from "axios";

const PortfolioSearch = ({ username, setTotalPortfolioValue }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!username) return; // Make sure username is present
      try {
        const response = await axios.get(
          `https://capstone-ml1.ew.r.appspot.com/portfolio/${username}`
        );
        setPortfolio(response.data);
        setTotalPortfolioValue(response.data.total_portfolio_value); // Update total portfolio value
      } catch (err) {
        setError(
          err.response ? err.response.data.message : "An error occurred"
        );
      }
    };

    fetchPortfolio();
  }, [username, setTotalPortfolioValue]); // Update dependency array

  const formatValue = (value) => {
    return typeof value === "number" ? value.toFixed(2) : value;
  };

  return (
    <div>
      {error && <p>Error: {error}</p>}
      {portfolio && (
        <div>
          <h2>{username}'s Portfolio</h2>
          <p>Total Value: ${formatValue(portfolio.total_portfolio_value)}</p>
          <ul>
            {Object.entries(portfolio.portfolio).map(([symbol, data]) => (
              <li key={symbol}>
                {symbol}: {data.quantity} shares at{" "}
                {formatValue(data["current price"])} each. Total:{" "}
                {formatValue(data.value)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PortfolioSearch;
