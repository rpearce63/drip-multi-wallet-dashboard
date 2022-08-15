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
    setBigBuys(data);
    setUpdateTime(new Date().toLocaleString());
  };

  // const recentBuy = (date) => {
  //   const txDate = Date.parse(date);
  //   const now = new Date();
  //   const recent = now - txDate <= 1 * 60 * 60 * 1000;
  //   recent && console.log(`${date} is recent`);
  //   return recent;
  // };

  return (
    <Marquee
      gradient={false}
      style={{ color: "white" }}
      pauseOnHover={true}
      speed={40}
    >
      <span style={{ marginRight: "5px" }}>
        Big Buys in the last 24 hrs: {bigBuys.length} -
      </span>
      {bigBuys.map((bb, index) => (
        <div
          key={index}
          style={{
            color: "white",
            marginRight: "5px",
            marginLeft: "10px",
          }}
        >
          {bb.recent && (
            <span className="blink" style={{ color: "green", marginRight: 5 }}>
              NEW
            </span>
          )}
          <a
            href={`https://bscscan.com/tx/${bb.transaction}`}
            target="_blank"
            rel="noreferrer"
          >
            {bb.amount} BNB {bb.dripAmt && <span>({bb.dripAmt} Drip)</span>}
          </a>{" "}
          on {bb.date} -{" "}
        </div>
      ))}
      <span style={{ marginRight: "50px" }}>Updated: {updateTime}</span>
    </Marquee>
  );
};

export default BigDripBuys;
