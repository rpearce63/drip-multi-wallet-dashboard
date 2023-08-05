import { useState } from "react";
const AdBox = () => {
  const [imageLoaded, setImageLoaded] = useState(true);

  return (
    <div className={`drip-ads card ${imageLoaded || "hide"}`}>
      <div className="card-body">
        <a href="https://t.me/dripreservoir" target="_blank" rel="noreferrer">
          <img
            src="https://drip-mw-dashboard.s3.amazonaws.com/ads/dashboard-ad1.jpg"
            onError={() => setImageLoaded(false)}
            alt="StuffTheRez"
            width="500px"
          />
        </a>
      </div>
      <div className="card-body">
        <a href="https://t.me/dripreservoir" target="_blank" rel="noreferrer">
          <img
            src="https://drip-mw-dashboard.s3.amazonaws.com/ads/dashboard-ad.jpg"
            onError={() => setImageLoaded(false)}
            alt="StuffTheRez"
            width="500px"
          />
        </a>
      </div>
    </div>
  );
};

export default AdBox;
