import React from "react";
import Dashboard from "./components/Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Upline from "./components/Upline";
import Downline from "./components/Downline";
import Header from "./components/Header";
import Footer from "./components/Footer";

const App = () => (
  <Router>
    <Header />
    <Routes>
      <Route path="/drip-mw-dashboard" element={<Dashboard />}></Route>
      <Route path="/upline/:buddy" element={<Upline />} />
      <Route path="/downline/:account" element={<Downline />} />
      <Route index element={<Dashboard />}></Route>
    </Routes>
    <Footer />
  </Router>
);

export default App;
