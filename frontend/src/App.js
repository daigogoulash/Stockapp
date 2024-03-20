import { useState, useEffect } from "react";
import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import ContactList from "./Userlist";
import ContactCreate from "./CreateUser";
import HomePage from "./HomePage";
import PortfolioSearch from "./PortfolioSearch";
import StockDataDisplay from "./StockLookup";
import LoginPage from "./Login";
import UpdatePortfolioForm from "./addUpdateStocks";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);

  // check local storage for token and username when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  const handleLogin = async (usernameInput, password) => {
    try { // make a POST request to the login endpoint
      const loginUrl = "https://capstone-ml1.ew.r.appspot.com/login";
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: usernameInput, password }),
      });
        // if the response is successful, set the user as logged in
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsLoggedIn(true);
          setUsername(usernameInput);
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", usernameInput);
        } else {
          alert("Login failed: " + data.message);
        }
      } else {
        alert("Login failed with HTTP status: " + response.status);
      }
    } catch (error) {
      alert("Login request failed: " + error.message);
    }
  };

  return (
    <Router>
      <Routes>
        {!isLoggedIn ? (
          <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        ) : (
          <Route
            path="/"
            element={
              <HomePage
                isLoggedIn={isLoggedIn}
                username={username}
                totalPortfolioValue={totalPortfolioValue}
              />
            }
          />
        )}
        <Route path="/users" element={<ContactList />} />
        <Route path="/create_user" element={<ContactCreate />} />
        <Route
          path="/portfolio"
          element={
            <PortfolioSearch
              username={username}
              setTotalPortfolioValue={setTotalPortfolioValue}
            />
          }
        />
        <Route path="/stock/:symbol" element={<StockDataDisplay />} />
        <Route path="/update_user" element={<UpdatePortfolioForm />} />
      </Routes>
    </Router>
  );
}

export default App;
