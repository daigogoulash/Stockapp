import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Banner from "./Banner";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "./StockLookup.css"; // Ensure this is the correct path

const StockDataDisplay = () => {
  const [symbol, setSymbol] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [stockData, setStockData] = useState(null);
  const [filteredStockData, setFilteredStockData] = useState(null);
  const [error, setError] = useState("");

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Stock Price",
        data: [],
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 2,
      },
    ],
  });

  useEffect(() => {
    setError("");
    setStockData(null);
    setFilteredStockData(null);
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://capstone-ml1.ew.r.appspot.com/api/portfolio/${symbol}`
        );
        setStockData(response.data.stock_data);
      } catch (err) {
        setError(
          "Failed to fetch stock data. Please make sure the symbol is correct."
        );
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  useEffect(() => {
    if (stockData) {
      const newFilteredData = Object.entries(stockData)
        .filter(([date]) => {
          const currentDate = new Date(date);
          return currentDate >= startDate && currentDate <= endDate;
        })
        .reduce((acc, [date, value]) => {
          acc[date] = value;
          return acc;
        }, {});
      setFilteredStockData(newFilteredData);
    }
  }, [stockData, startDate, endDate]);

  useEffect(() => {
    const updateChartData = () => {
      setChartData({
        labels: Object.keys(filteredStockData),
        datasets: [
          {
            label: "Stock Price",
            data: Object.values(filteredStockData),
            borderColor: "rgba(75,192,192,1)",
            borderWidth: 2,
          },
        ],
      });
    };

    if (filteredStockData) {
      updateChartData();
    }
  }, [filteredStockData]);

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
      </div>

      {error && <p className="error-message">{error}</p>}

      {filteredStockData && (
        <div className="data-container">
          <div className="table-container">
            <table className="stock-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(filteredStockData).map(([date, value]) => (
                  <tr key={date}>
                    <td>{date}</td>
                    <td>${value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="graph-container">
            <h2>Historical Stock Data for {symbol}</h2>
            <Line data={chartData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDataDisplay;
