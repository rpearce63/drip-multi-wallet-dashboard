import React from "react";
import Dashboard from "./Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Upline from "./Upline";
import Downline from "./Downline";
import Header from "./Header";
import Footer from "./Footer";

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
