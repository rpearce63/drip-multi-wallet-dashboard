import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getConnection, getDripPrice } from "./Contract";
import { formatCurrency, convertDrip } from "./utils";

const Header = () => {
  const [dripPrice, setDripPrice] = useState(0);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const web3 = await getConnection();
      const [bnbPrice, dripPriceRaw, tokenBalance] = await getDripPrice(web3);
      const currentDripPrice = dripPriceRaw * bnbPrice;
      setDripPrice(() => currentDripPrice);
      setBnbPrice(() => bnbPrice);
      setTokenBalance(() => tokenBalance);
    };
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="navbar navbar-dark fixed-top bg-dark p-0 shadow">
      <div className="navbar-brand">
        <Link to={"/"}>Drip Multi-Wallet Dashboard</Link>
        <span className="prices">
          Drip: ${formatCurrency(convertDrip(dripPrice))}
        </span>
        {"  "}
        <span className="prices">BNB: ${formatCurrency(bnbPrice)}</span>
        {"  "}
        <span className="prices">Supply: {convertDrip(tokenBalance)}</span>
        {/* <div>
        <small className="pause">Auto Refresh</small>
        <input
          type="checkbox"
          checked={autoRefresh}
          onClick={() => setAutoRefresh(!autoRefresh)}
        />
      </div> */}
      </div>

      <div className="card-body">
        <h6 className="card-subtitle text-white">
          If you find this tool useful, feel free to drop me a little Drip or
          BNB: 0x645Dc8a64046FD877b82caB077BF929c299D5A7a
        </h6>
      </div>
    </nav>
  );
};

export default Header;
