import React, { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";

const Footer = () => {
  const [darkMode, setDarkMode] = useState(false);

  const changeMode = useCallback(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
      document.querySelectorAll(".inverted").forEach((result) => {
        result.classList.add("invert");
      });
    } else {
      document.documentElement.classList.remove("dark-mode");
      document.querySelectorAll(".inverted").forEach((result) => {
        result.classList.remove("invert");
      });
    }
  }, [darkMode]);

  useEffect(() => {
    const configs = JSON.parse(localStorage.getItem("darkMode")) ?? {};
    setDarkMode(() => configs.darkMode);
  }, []);

  useEffect(() => {
    const configs = JSON.parse(localStorage.getItem("darkMode")) ?? {};
    configs.darkMode = darkMode;

    localStorage.setItem("darkMode", JSON.stringify(configs));
    changeMode();

    const interval = setInterval(() => {
      changeMode();
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
        <div>{process.env.REACT_APP_VERSION}</div>

        {/* <span className="affiliate">
        <a
          href="https://4dinsingapore.com/amember/aff/go/rpearce63?i=8"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://4dinsingapore.com/amember/file/get/path/banners.61bbbb50b08be/i/31928"
            border={0}
            alt="DRIP Run Automation banner (version 1)"
          />
        </a>
      </span> */}
        <div>
          Dark Mode:{" "}
          <input
            type="checkbox"
            checked={darkMode}
            value={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
