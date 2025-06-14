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
        // className={`text-white ${
        //   mode === "Light"
        //     ? "bg-[rgba(0,128,128,0.2)]"
        //     : mode === "Dark"
        //     ? "bg-black"
        //     : "bg-green-200"
        // }`}
        style={{
          color: "white",
          background:
            mode === "Light"
              ? "repeating-linear-gradient(150deg,rgba(102,51,153,0.1) 0px,rgba(102,51,153,0.2) 40px) ,repeating-linear-gradient(30deg,rgba(102,51,153,0.2) 0px,rgba(102,51,153,0.3) 40px)"
              : mode === "Dark"
              ? "black"
              : "white",
        }}
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
