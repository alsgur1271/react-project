import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";  //라우팅
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Header from './pages/Header';

const AppLayout = () => {
  const location = useLocation();
  const noHeaderRoutes = ['/', '/Signup'];

  const showHeader = !noHeaderRoutes.includes(location.pathname);

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};
  export default App;