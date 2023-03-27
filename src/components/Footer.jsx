import React, { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import DarkModeToggle from "react-dark-mode-toggle";

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
    </footer>
  );
};

export default Footer;
