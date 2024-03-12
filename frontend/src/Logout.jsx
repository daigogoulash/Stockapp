const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username"); // Remove if username is not needed
  setIsLoggedIn(false);
  setUsername(""); // Clear if username is not needed
  // Redirect to the login page or handle the UI change as needed
};
