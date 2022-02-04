import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getBr34pPrice,
  getConnection,
  getDripPcsPrice,
  getDripPrice,
} from "./Contract";
import { formatCurrency, convertDrip } from "./utils";
import { calcFarmPrice } from "./tokenPriceApi";
import { DOGSTokenAddress, PIGSTokenAddress } from "./dripconfig";
const Header = () => {
  const [dripPrice, setDripPrice] = useState(0);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [br34pPrice, setBr34pPrice] = useState(0);
  const [dripBnbPrice, setDripBnbPrice] = useState(0);
  const [dripPcsPrice, setDripPcsPrice] = useState(0);
  const [pigPrice, setPigPrice] = useState(0);
  const [dogPrice, setDogPrice] = useState(0);

  const BUY_SPREAD = 1.2;

  useEffect(() => {
    const fetchData = async () => {
      const web3 = await getConnection();
      const [bnbPrice, dripPriceRaw, tokenBalance] = await getDripPrice(web3);
      const currentDripPrice = dripPriceRaw * bnbPrice;
      const br34pPrice = await getBr34pPrice();
      const dripPcsPrice = await getDripPcsPrice();
      const pigPrice = await calcFarmPrice(PIGSTokenAddress);
      const dogPrice = await calcFarmPrice(DOGSTokenAddress);

      setDripPrice(() => currentDripPrice);
      setBnbPrice(() => bnbPrice);
      setTokenBalance(() => tokenBalance);
      setBr34pPrice(() => br34pPrice);
      setDripBnbPrice(() => dripPriceRaw / 10e17);
      setDripPcsPrice(() => dripPcsPrice);
      setPigPrice(() => pigPrice);
      setDogPrice(() => dogPrice);

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
          <Link to={"/drip-mw-dashboard"}>Drip Multi-Wallet Dashboard</Link>
        </div>
        <div className="prices">
          <div className="price">
            <a
              href="https://bscscan.com/token/0x20f663cea80face82acdfa3aae6862d246ce0333"
              target="_blank"
              rel="noreferrer"
            >
              Drip:
            </a>
            <div className="drip-prices">
              <div
                className={
                  dripPcsPrice * BUY_SPREAD >= convertDrip(dripPrice)
                    ? "buy-dex"
                    : ""
                }
              >
                DEX:{formatCurrency(convertDrip(dripPrice))}
              </div>
              &nbsp;
              <div
                className={
                  dripPcsPrice * BUY_SPREAD < convertDrip(dripPrice)
                    ? "buy-pcs"
                    : ""
                }
              >
                PCS:
                {formatCurrency(dripPcsPrice)}
              </div>
            </div>
          </div>
          <div className="price">
            DRIP/BNB: {parseFloat(dripBnbPrice).toFixed(5)}
          </div>
          <div className="price">
            <a
              href="https://bscscan.com/token/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
              target="_blank"
              rel="noreferrer"
            >
              BNB:
            </a>{" "}
            <div className="drip-prices">{formatCurrency(bnbPrice)}</div>
          </div>
          <div className="price">DRIP Supply: {convertDrip(tokenBalance)}</div>
          <div className="price">
            <a
              href="https://bscscan.com/token/0xa86d305a36cdb815af991834b46ad3d7fbb38523"
              target="_blank"
              rel="noreferrer"
            >
              BR34P:
            </a>{" "}
            {formatCurrency(br34pPrice)}
          </div>
          <div className="price stack">
            <div>Pig: {formatCurrency(pigPrice)}</div>
            <div>Dog: {formatCurrency(dogPrice)}</div>
          </div>
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
