import { useState } from "react";
const AdBox = () => {
  const [imageLoaded, setImageLoaded] = useState(true);

  return (
    <div className={`drip-ads card ${imageLoaded || "hide"}`}>
      <div className="card-body">
        <a href="https://t.me/dripreservoir" target="_blank" rel="noreferrer">
          <img
            src="https://cdn.glitch.global/24255909-08cf-404f-ad48-b6fb2de88697/dashboard-ad.jpg"
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
