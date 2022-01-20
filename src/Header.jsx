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
    }, 30000);
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
            <a
              href="https://bscscan.com/token/0x20f663cea80face82acdfa3aae6862d246ce0333"
              target="_blank"
              rel="noreferrer"
            >
              Drip:
            </a>
            {formatCurrency(convertDrip(dripPrice))}
          </span>
          <span className="price">
            <a
              href="https://bscscan.com/token/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
              target="_blank"
              rel="noreferrer"
            >
              BNB:
            </a>{" "}
            {formatCurrency(bnbPrice)}
          </span>
          <span className="price">
            DRIP Supply: {convertDrip(tokenBalance)}
          </span>
          <span className="price">
            <a
              href="https://bscscan.com/token/0xa86d305a36cdb815af991834b46ad3d7fbb38523"
              target="_blank"
              rel="noreferrer"
            >
              BR34P:
            </a>{" "}
            {formatCurrency(br34pPrice)}
          </span>
          <span className="price">
            <a
              href="https://bscscan.com/address/0x276B440fdB4C54631C882caC9e4317929e751FF8"
              target="_blank"
              rel="noreferrer"
            >
              REV:
            </a>{" "}
            {formatCurrency(revPrice)}
          </span>
        </div>

        <div className="navbar-text text-white beggar">
          If you find this tool useful, feel free to drop me a little Drip or
          BNB: 0x645Dc8a64046FD877b82caB077BF929c299D5A7a
        </div>
      </div>
    </nav>
  );
};

export default Header;
