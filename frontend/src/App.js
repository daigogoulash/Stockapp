import { useState } from "react";
import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import ContactList from "./Userlist";
import ContactCreate from "./CreateUser";
import HomePage from "./HomePage";
import PortfolioSearch from "./PortfolioSearch";
import StockDataDisplay from "./StockLookup";
import LoginPage from "./Login";
import Banner from "./Banner";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);

  const handleLogin = async (usernameInput, password) => { 
    const loginUrl = "https://capstone-ml1.ew.r.appspot.com/login";
    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: usernameInput, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsLoggedIn(true);
          setUsername(usernameInput);
          // save the token and username in local storage, gotta check this in the backend
          localStorage.setItem("token", data.token); // Assuming the token is in data.token
          localStorage.setItem("username", usernameInput);

        } else {
          // Handle login failure (e.g., wrong credentials)
          alert("Login failed: " + data.message);
        }
      } else {
        // Handle HTTP errors
        alert("Login failed with HTTP status: " + response.status);
      }
    } catch (error) {
      // Handle network errors
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
        {/* ... other routes ... */}
      </Routes>
    </Router>
  );
}

export default App;
