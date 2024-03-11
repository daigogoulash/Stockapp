import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./StockLookup.css";
import Banner from "./Banner";

const StockDataDisplay = () => {
  const [symbol, setSymbol] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    setStockData(null);
    try {
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      const response = await axios.get(
        `https://capstone-ml1.ew.r.appspot.com/stock/${symbol}?start=${formattedStartDate}&end=${formattedEndDate}`
      );
      setStockData(response.data.stock_data);
    } catch (err) {
      setError(
        "Failed to fetch stock data. Please make sure the symbol is correct and dates are valid."
      );
    }
  };

  return (
    <div className="stock-data-display">
      <Banner />
      <h1>Stock Data Lookup</h1>
      <div className="search-section">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter stock symbol"
          className="stock-symbol-input"
        />
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          className="date-picker"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          className="date-picker"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {stockData && (
        <div className="stock-data">
          <h2>Historical Stock Data for {symbol}</h2>
          <table className="stock-data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stockData).map(([date, value]) => (
                <tr key={date}>
                  <td>{date}</td>
                  <td>${value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockDataDisplay;
