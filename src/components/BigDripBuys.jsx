import React, { useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import { getBigDripBuys } from "../api/Contract";

const BigDripBuys = () => {
  const [bigBuys, setBigBuys] = useState([]);
  const [updateTime, setUpdateTime] = useState("");

  useEffect(() => {
    fetchBigBuys();
    const interval = setInterval(() => {
      fetchBigBuys();
    }, 600000);
    return () => clearInterval(interval);
  }, []);

  const fetchBigBuys = async () => {
    const data = await getBigDripBuys();
    setBigBuys([...data]);
    setUpdateTime(new Date().toLocaleString());
  };

  return (
    <Marquee
      gradient={true}
      style={{ color: "white" }}
      pauseOnHover={true}
      speed={40}
    >
      <span style={{ marginRight: "5px" }}>Big Buys in the last 24 hrs: </span>
      {bigBuys.map((bb, index) => (
        <div
          key={index}
          style={{ color: "white", marginRight: "5px", marginLeft: "10px" }}
        >
          <a
            href={`https://bscscan.com/tx/${bb.transaction}`}
            target="_blank"
            rel="noreferrer"
          >
            {bb.amount} BNB
          </a>{" "}
          on {bb.date} -{" "}
        </div>
      ))}
      <span style={{ marginRight: "50px" }}>Updated: {updateTime}</span>
    </Marquee>
  );
};

export default BigDripBuys;
