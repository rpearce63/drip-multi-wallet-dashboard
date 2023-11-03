import React, { useState } from "react";
import { useEffect } from "react";
import DarkModeToggle from "react-dark-mode-toggle";
import TelegramIcon from "@mui/icons-material/Telegram";

const Footer = () => {
  const [theme, setTheme] = useState("light");

  const setDark = () => {
    setTheme("dark");
    localStorage.setItem("theme", "dark");

    document.documentElement.setAttribute("data-theme", "dark");
  };

  const setLight = () => {
    setTheme("light");
    localStorage.setItem("theme", "light");
    document.documentElement.setAttribute("data-theme", "light");
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setDark();
    } else {
      setLight();
    }
  };

  useEffect(() => {
    let storedTheme = localStorage.getItem("theme");
    const darkMode = JSON.parse(localStorage.getItem("darkMode"));
    if (!storedTheme && darkMode)
      storedTheme = darkMode.darkMode ? "dark" : "light";
    localStorage.removeItem("darkMode");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const defaultDark =
      storedTheme === "dark" || (storedTheme === null && prefersDark);
    defaultDark && setDark();
  }, []);

  return (
    <footer id="footer" className="page-footer font-small blue inverted">
      <div className="footer-content text-center py-3">
        <span className="copyright">
          <span>© 2023 - </span>
          <span>@rpearce63</span>
          &nbsp;
          <a href="https://t.me/drip_mw_dashboard" target="_blank no_referrer">
            <TelegramIcon fontSize="large" />
          </a>
        </span>
        <div className="footer-links">
          Check out my other dashboards for
          <a
            href="https://elephant-mw-dashboard.glitch.me"
            target="_blank"
            rel="noreferrer"
          >
            Elephant Money
          </a>
          <a
            href="https://arkfi-mw-dashboard.glitch.me"
            target="_blank"
            rel="noreferrer"
          >
            ArkFi
          </a>
          <a
            href="https://furio-mw-dashboard.glitch.me"
            target="_blank"
            rel="noreferrer"
          >
            Furio
          </a>
          <a
            href="https://ddd-mw-dashboard.glitch.me"
            target="_blank"
            rel="noreferrer"
          >
            DripDropDraw
          </a>
        </div>
        <div>
          <a
            href="https://github.com/rpearce63/drip-multi-wallet-dashboard/releases"
            target="_blank"
            rel="noreferrer"
          >
            {process.env.REACT_APP_VERSION}
          </a>
        </div>
        <DarkModeToggle
          onChange={toggleTheme}
          checked={theme === "dark"}
          size={40}
        />{" "}
      </div>
    </footer>
  );
};

export default Footer;
