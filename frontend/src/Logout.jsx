const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username"); //remove if username is not needed
  setIsLoggedIn(false);
  setUsername(""); //clear if username is not needed
  //redirect to the login page or handle the UI change as needed
};
