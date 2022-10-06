import React, { useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import { getBigBuysFromGlitch } from "../api/Contract";
//import _ from "lodash";
const BigDripBuys = () => {
  const [bigBuys, setBigBuys] = useState([]);
  const [updateTime, setUpdateTime] = useState("");

  useEffect(() => {
    const fetchBigBuys = async () => {
      try {
        const data = await getBigBuysFromGlitch();
        data.sort((a, b) => b.timestamp - a.timestamp);

        //update display only if data is updated
        if (
          (data?.length && !bigBuys.length) || //initial load
          bigBuys.length !== data.length || // number of buys is different
          JSON.stringify(bigBuys[0]) !== JSON.stringify(data[0]) // latest transaction is different
        ) {
          console.log("updating bigBuys");
          setBigBuys(data);
        }
        setUpdateTime(new Date().toLocaleString());
      } catch (err) {
        console.log(`error getting big buys`);
      }
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
      speed={20}
    >
      <span style={{ marginRight: "5px" }}>
        Big Buys in the last 24 hrs: {bigBuys?.length} -
      </span>
      {!!bigBuys &&
        bigBuys.map((bb, index) => (
          <div
            key={index}
            style={{
              color: "white",
              marginRight: "5px",
              marginLeft: "5px",
            }}
          >
            {bb.recent && (
              <span
                className="blink"
                style={{ color: "green", marginRight: 5 }}
              >
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
