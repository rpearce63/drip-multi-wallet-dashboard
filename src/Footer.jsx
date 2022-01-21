const Footer = () => (
  <footer id="footer" className="page-footer font-small blue">
    <div className="footer-content text-center py-3">
      <span className="copyright">
        <span>© 2022 - </span>
        <a href="https://t.me/rpearce63" target="_blank no_referrer">
          Rick Pearce
        </a>
      </span>
      <div>{process.env.REACT_APP_VERSION}</div>
      <span className="affiliate">
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
      </span>
    </div>
  </footer>
);

export default Footer;
