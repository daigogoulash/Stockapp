import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const PortfolioSearch = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        // Make sure to use the correct URL for your Flask API
        const response = await axios.get(
          `https://capstone-ml1.ew.r.appspot.com/portfolio/${username}`
        );
        setPortfolio(response.data);
      } catch (err) {
        setError(
          err.response ? err.response.data.message : "An error occurred"
        );
      }
    };

    if (username) {
      fetchPortfolio();
    }
  }, [username]);

  // Helper function to format the value
  const formatValue = (value) => {
    // Check if the value is a number before applying toFixed
    return typeof value === "number" ? value.toFixed(2) : value;
  };

  return (
    <div>
      {error && <p>Error: {error}</p>}
      {portfolio && (
        <div>
          <h2>{portfolio.username}'s Portfolio</h2>
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
