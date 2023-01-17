import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getDripPriceData } from "../api/Contract";
import { formatCurrency, convertDrip, getLatestVersion } from "../api/utils";
import BigDripBuys from "./BigDripBuys";
import semver from "semver";

const Header = () => {
  const [dripPrice, setDripPrice] = useState(0);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [br34pPrice, setBr34pPrice] = useState(0);
  const [dripBnbPrice, setDripBnbPrice] = useState(0);
  const [dripPcsPrice, setDripPcsPrice] = useState(0);
  const [pigPrice, setPigPrice] = useState(0);
  const [dogsPrice, setDogsPrice] = useState(0);
  const [version, setVersion] = useState();
  const [hidePrices, setHidePrices] = useState(true);
  const [taxVaultBalance, setTaxVaultBalance] = useState(0);
  const [tvDir, setTvDir] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const BUY_SPREAD = 1.1;

  const getVersion = async () => {
    const ver = await getLatestVersion();
    //console.log(ver);
    setVersion(ver);
  };
  const compareVersions = () => {
    const currentVer = process.env.REACT_APP_VERSION;
    if (version) return semver.gt(version, currentVer);
  };

  const fetchData = useCallback(async () => {
    const {
      bnbPrice,
      dripBnbRatio,
      tokenBalance,
      dripPcsPrice,
      br34pPrice,
      afpPrice,
      dogsPrice,
      taxVaultBalance: nTaxVaultBalance,
      totalSupply,
    } = await getDripPriceData();

    const currentDripPrice = dripBnbRatio * bnbPrice;

    currentDripPrice > 0 && setDripPrice(() => currentDripPrice);
    bnbPrice > 0 && setBnbPrice(() => bnbPrice);
    tokenBalance > 0 && setTokenBalance(() => tokenBalance);
    br34pPrice > 0 && setBr34pPrice(() => br34pPrice);
    dripBnbRatio > 0 && setDripBnbPrice(() => dripBnbRatio / 10e17);
    dripPcsPrice > 0 && setDripPcsPrice(() => dripPcsPrice);
    afpPrice > 0 && setPigPrice(() => afpPrice);
    dogsPrice > 0 && setDogsPrice(() => dogsPrice);
    totalSupply > 0 && setTotalSupply(totalSupply);

    setTaxVaultBalance((prevState) => {
      //   console.log(`
      // time: ${new Date().toLocaleTimeString()}
      // taxVaultBalance: ${prevState / 10e17}
      // new value: ${nTaxVaultBalance / 10e17}
      // diff: ${(nTaxVaultBalance - prevState) / 10e17}`);
      setTvDir(nTaxVaultBalance - prevState);
      return nTaxVaultBalance;
    });
    currentDripPrice &&
      (document.title = `${formatCurrency(
        convertDrip(currentDripPrice)
      )} - Drip Multi-Wallet Dashboard`);
  }, []);

  useEffect(() => {
    fetchData();
    getVersion();
    const interval = setInterval(() => {
      fetchData();
      getVersion();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <nav className="navbar navbar-expand-lg nav-wrap fixed-top navbar-dark bg-dark inverted">
      <div className="container-fluid">
        <div className="navbar-brand">
          <Link to={"/"}>Drip Multi-Wallet Dashboard</Link>
          {compareVersions() && (
            <div style={{ marginLeft: 25 }}>
              New version{" "}
              <a
                href="https://github.com/rpearce63/drip-multi-wallet-dashboard/releases"
                target="_blank"
                rel="noreferrer"
              >
                {version}
              </a>{" "}
              available. Please refresh page to get updates.
            </div>
          )}
          <div>
            {/* <span class="reload-icon">&#10227;</span> */}
            <span
              className="toggle-prices"
              onClick={(e) => setHidePrices(!hidePrices)}
              style={{}}
            >
              {hidePrices ? "+" : "-"}
            </span>
          </div>
        </div>
        {hidePrices && (
          <div className="drip-price-small-screen">
            <DripPrices
              dripPcsPrice={dripPcsPrice}
              BUY_SPREAD={BUY_SPREAD}
              dripPrice={dripPrice}
              hidePrices
            />
          </div>
        )}

        <div className={`prices ${hidePrices && "hidePrices"}`}>
          <div className="price-group group-of-3">
            <DripPrices
              dripPcsPrice={dripPcsPrice}
              BUY_SPREAD={BUY_SPREAD}
              dripPrice={dripPrice}
            />
            <div className="price stack">
              <label>BNB/DRIP:</label> {parseFloat(dripBnbPrice).toFixed(5)}
            </div>
            <div className="price stack">
              <a
                href="https://bscscan.com/token/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
                target="_blank"
                rel="noreferrer"
              >
                BNB:
              </a>{" "}
              <div className="">{formatCurrency(bnbPrice)}</div>
            </div>
          </div>
          <div className="price-group">
            <div className="price stack">
              <label>DRIP Supply:</label> {convertDrip(tokenBalance)} /
              <br />
              {convertDrip(totalSupply)}
            </div>

            <div className="price stack">
              <label>
                <a
                  href="https://bscscan.com/token/0x20f663cea80face82acdfa3aae6862d246ce0333?a=0xbff8a1f9b5165b787a00659216d7313354d25472"
                  target="_blank"
                  rel="noreferrer"
                >
                  Tax Vault:
                </a>
              </label>
              <span
                className={`${tvDir !== 0 && tvDir > 0 ? "tv-up" : "tv-down"}`}
              >
                {convertDrip(taxVaultBalance)}
              </span>
            </div>
            <div className="price stack">
              <a
                href="https://v1exchange.pancakeswap.finance/#/swap?inputCurrency=0xa86d305A36cDB815af991834B46aD3d7FbB38523&outputCurrency=0xe9e7cea3dedca5984780bafc599bd69add087d56"
                target="_blank"
                rel="noreferrer"
              >
                BR34P:
              </a>{" "}
              {formatCurrency(br34pPrice)}
            </div>
            <div className="price stack">
              <div>
                <a
                  href="https://poocoin.app/tokens/0x9a3321e1acd3b9f6debee5e042dd2411a1742002"
                  target="_blank"
                  rel="noreferrer"
                >
                  Pigs/AFP:
                </a>{" "}
                {formatCurrency(pigPrice)}
              </div>
              <div>
                <a
                  href="https://poocoin.app/tokens/0x198271b868dae875bfea6e6e4045cdda5d6b9829"
                  target="_blank"
                  rel="noreferrer"
                >
                  Dogs/AFD:
                </a>{" "}
                {formatCurrency(dogsPrice)}
              </div>
            </div>
          </div>
        </div>

        <div className="navbar-text text-white beggar">
          If you find this tool useful, feel free to drop me a little Drip or
          BNB: 0x645Dc8a64046FD877b82caB077BF929c299D5A7a{" "}
          <i
            className="bi bi-clipboard-plus"
            onClick={() =>
              navigator.clipboard.writeText(
                "0x645Dc8a64046FD877b82caB077BF929c299D5A7a"
              )
            }
          ></i>
        </div>
      </div>
      <BigDripBuys />
    </nav>
  );
};

const DripPrices = ({ dripPcsPrice, BUY_SPREAD, dripPrice, hidePrices }) => {
  return (
    <div className="price drip-price">
      <a
        href="https://bscscan.com/token/0x20f663cea80face82acdfa3aae6862d246ce0333"
        target="_blank"
        rel="noreferrer"
      >
        Drip:
      </a>
      <div className={`stack ${hidePrices && "stack-collapsed"}`}>
        <div
          className={`drip-dex ${
            dripPcsPrice * BUY_SPREAD >= convertDrip(dripPrice) ? "buy-dex" : ""
          } ${hidePrices && "drip-dex-collapsed"}`}
        >
          <a
            href="https://drip.community/fountain"
            target="_blank"
            rel="noreferrer"
          >
            DEX:
          </a>
          {formatCurrency(convertDrip(dripPrice))}
        </div>
        <div
          className={`drip-pcs ${
            dripPcsPrice * BUY_SPREAD < convertDrip(dripPrice) ? "buy-pcs" : ""
          }`}
        >
          <a
            href="https://pancakeswap.finance/swap?outputCurrency=0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56&inputCurrency=0x20f663CEa80FaCE82ACDFA3aAE6862d246cE0333"
            target="_blank"
            rel="noreferrer"
          >
            PCS:
          </a>
          {formatCurrency(dripPcsPrice)}
        </div>
      </div>
    </div>
  );
};

export default Header;
