import { useState } from "react";
const AdBox = () => {
  const [imageLoaded, setImageLoaded] = useState(true);

  return (
    <div className={`drip-ads card ${imageLoaded || "hide"}`}>
      <div className="card-body">
        <a href="https://t.me/ProjectAqueduct" target="_blank" rel="noreferrer">
          <img
            src="https://drip-mw-dashboard.s3.amazonaws.com/ads/ProjectAqueduct.jpg"
            onError={() => setImageLoaded(false)}
            alt="DDD"
            width="300px"
          />
        </a>
        <hr />
        <div>
          For donations, please transfer AFP tokens to
          0x33123D459aa044e114BF31ca528d89246BBB8908
        </div>
      </div>
    </div>
  );
};

export default AdBox;
