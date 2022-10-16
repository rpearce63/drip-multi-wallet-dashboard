import React, { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import DarkModeToggle from "react-dark-mode-toggle";
import { getWalletTokens, getTokenInfo } from "../api/Contract";

const Footer = () => {
  const [darkMode, setDarkMode] = useState(false);

  const changeMode = useCallback(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
      document.documentElement.classList.remove("light-mode");
      document.querySelectorAll(".inverted").forEach((result) => {
        result.classList.add("invert");
      });
    } else {
      document.documentElement.classList.remove("dark-mode");
      document.documentElement.classList.add("light-mode");
      document.querySelectorAll(".inverted").forEach((result) => {
        result.classList.remove("invert");
      });
    }
  }, [darkMode]);

  useEffect(() => {
    const configs = JSON.parse(localStorage.getItem("darkMode")) ?? {};
    setDarkMode(configs.darkMode);
  }, []);

  useEffect(() => {
    const configs = JSON.parse(localStorage.getItem("darkMode")) ?? {};
    configs.darkMode = darkMode;

    localStorage.setItem("darkMode", JSON.stringify(configs));
    changeMode();

    //let counter = 10;

    const interval = setInterval(() => {
      changeMode();

      //if (counter-- < 1) {
      // clearInterval(interval);
      //}
    }, 5000);
    return () => clearInterval(interval);
  }, [darkMode, changeMode]);

  const addToken = async () => {
    const walletTokens = await getWalletTokens(null);
    console.log(walletTokens);
    const tokenAddress = "0x20f663CEa80FaCE82ACDFA3aAE6862d246cE0333";
    const { decimals, name, symbol } = await getTokenInfo(tokenAddress);
    console.log(decimals, name, symbol);

    const tokenSymbol = symbol;
    const tokenDecimals = decimals;

    //const tokenImage = "http://placekitten.com/200/300";
    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options: {
            address: tokenAddress, // The address that the token is at.
            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: tokenDecimals, // The number of decimals in the token
            //image: tokenImage, // A string url of the token logo
          },
        },
      });

      if (wasAdded) {
        console.log("Thanks for your interest!");
      } else {
        console.log("Your loss!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <footer id="footer" className="page-footer font-small blue inverted">
      <div className="footer-content text-center py-3">
        <span className="copyright">
          <span>© 2022 - </span>
          <a href="https://t.me/rpearce63" target="_blank no_referrer">
            Rick Pearce
          </a>
        </span>
        <div>
          <a
            href="https://github.com/rpearce63/drip-multi-wallet-dashboard/releases"
            target="_blank"
            rel="noreferrer"
          >
            {process.env.REACT_APP_VERSION}
          </a>
        </div>
        <DarkModeToggle onChange={setDarkMode} checked={darkMode} size={40} />{" "}
      </div>
      <button onClick={addToken}>add token</button>
    </footer>
  );
};

export default Footer;
