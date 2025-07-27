import React, { useContext, useState, useEffect } from "react";
import NavBar from "./Components/NavBar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Create from "./Pages/Create";
import Gallerty from "./Pages/Gallery";
import Footer from "./Components/Footer";
import Login from "./Components/Login";
import Register from "./Pages/Register";
import { GlobalContext } from "./ContextApi/globalVariable";

const App = () => {
  const { mode } = useContext(GlobalContext);

  useEffect(() => {
    if (window.location.hash === "#_=_") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return (
    <>
      <div
        className={`text-white ${
          mode === "Light"
            ? "bg-white"
            : "bg-black"
          
        }`}

      >
        <Router>
          <NavBar />
          <Routes>
            <Route path="/" element={<Create />} />
            <Route path="/gallery" element={<Gallerty />} />
            <Route path="/register" element={<Register />} />
          </Routes>
          <Login />
          <Footer />
        </Router>
      </div>
    </>
  );
};

export default App;
