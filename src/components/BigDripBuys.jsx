import React, { useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import { getBigBuysFromAWS } from "../api/Contract";
import _ from "lodash";
const BigDripBuys = () => {
  const [bigBuys, setBigBuys] = useState([]);
  const [updateTime, setUpdateTime] = useState("");

  useEffect(() => {
    const fetchBigBuys = async () => {
      const data = await getBigBuysFromAWS();
      //update display only if data is updated
      (data.length && _.isEqual(data, bigBuys)) || setBigBuys(data);
      setUpdateTime(new Date().toLocaleString());
    };
    fetchBigBuys();
    const interval = setInterval(() => {
      fetchBigBuys();
    }, 10000);
    return () => clearInterval(interval);
  }, [bigBuys]);

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
            marginLeft: "5px",
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
          on {new Date(bb.timestamp).toLocaleString()} -
        </div>
      ))}
      <span style={{ marginRight: "50px" }}>Updated: {updateTime}</span>
    </Marquee>
  );
};

export default BigDripBuys;
