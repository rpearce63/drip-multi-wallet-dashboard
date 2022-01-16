import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBr34pPrice, getConnection, getDripPrice } from "./Contract";
import { formatCurrency, convertDrip } from "./utils";
import { calcREVPrice } from "./tokenPriceApi";
const Header = () => {
  const [dripPrice, setDripPrice] = useState(0);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [revPrice, setRevPrice] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [br34pPrice, setBr34pPrice] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      const web3 = await getConnection();
      const [bnbPrice, dripPriceRaw, tokenBalance] = await getDripPrice(web3);
      const currentDripPrice = dripPriceRaw * bnbPrice;
      const currentRevPrice = await calcREVPrice();
      const br34pPrice = await getBr34pPrice();

      setDripPrice(() => currentDripPrice);
      setBnbPrice(() => bnbPrice);
      setTokenBalance(() => tokenBalance);
      setRevPrice(() => currentRevPrice);
      setBr34pPrice(() => br34pPrice);
      document.title = formatCurrency(convertDrip(currentDripPrice));
    };
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg nav-wrap fixed-top navbar-dark bg-dark">
      <div className="container-fluid">
        <div className="navbar-brand">
          <Link to={"/"}>Drip Multi-Wallet Dashboard</Link>
        </div>
        <div className="prices">
          <span className="price">
            Drip: ${formatCurrency(convertDrip(dripPrice))}
          </span>
          <span className="price">BNB: ${formatCurrency(bnbPrice)}</span>
          <span className="price">
            DRIP Supply: {convertDrip(tokenBalance)}
          </span>
          <span className="price">BR34P: {formatCurrency(br34pPrice)}</span>
          <span className="price">REV: {formatCurrency(revPrice)}</span>
        </div>

        <div className="navbar-text text-white">
          If you find this tool useful, feel free to drop me a little Drip or
          BNB: 0x645Dc8a64046FD877b82caB077BF929c299D5A7a
        </div>
      </div>
    </nav>
  );
};

export default Header;
