import React from "react";
import Dashboard from "./Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Upline from "./Upline";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Dashboard />}></Route>
      <Route path="/upline/:buddy" element={<Upline />} />
    </Routes>
  </Router>
);

export default App;
