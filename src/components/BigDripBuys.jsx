import React, { useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import { Popover, Slider } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SettingsApplicationsOutlinedIcon from "@mui/icons-material/SettingsApplicationsOutlined";
import { getBigBuysFromGlitch } from "../api/Contract";
//import _ from "lodash";
const BigDripBuys = () => {
  const [bigBuys, setBigBuys] = useState([]);
  const [updateTime, setUpdateTime] = useState("");
  const [speed, setSpeed] = useState(20);
  const [anchorEl, setAnchorEl] = useState(null);

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

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  function valuetext(value) {
    return `${value}`;
  }

  return (
    <div style={{ display: "flex" }}>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        title="Change Speed"
      >
        <SettingsApplicationsOutlinedIcon color="primary" />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div
          style={{
            padding: "1em",
            paddingLeft: "3em",
            height: "200px",
            overflow: "hidden",
          }}
        >
          <Slider
            size="small"
            orientation="vertical"
            value={speed}
            onChange={(e, newValue) => setSpeed(newValue)}
            valueLabelDisplay="auto"
            step={5}
            min={5}
            max={30}
            marks={[
              {
                value: 5,
                label: "5",
              },
              { value: 10, label: "10" },
              { value: 15, label: "15" },
              { value: 20, label: "20" },
              { value: 25, label: "25" },
              { value: 30, label: "30" },
            ]}
            getAriaValueText={valuetext}
          />
        </div>
      </Popover>
      <Marquee
        gradient={false}
        style={{ color: "white" }}
        pauseOnHover={true}
        speed={speed}
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
    </div>
  );
};

export default BigDripBuys;
