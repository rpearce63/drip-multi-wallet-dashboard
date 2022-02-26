import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import {
  getDownline,
  getUserInfo,
  getContract,
  getConnection,
  getJoinDate,
} from "../api/Contract";

import format from "date-fns/format";
const flatten = require("flat").flatten;

function getObjectDepth(obj) {
  if (typeof obj !== "object" || obj === null) {
    return 0;
  }

  const flat = flatten(obj);
  const keys = Object.keys(flat);
  if (keys.length === 0) {
    return 1;
  }

  const depthOfKeys = keys.map((key) => (key.match(/children/g) || []).length);

  return Math.max(...depthOfKeys);
}

const Downline = () => {
  const [downline, setDownline] = useState();
  const { account } = useParams();
  const [depth, setDepth] = useState(0);
  const [web3, setWeb3] = useState();
  const [contract, setContract] = useState();

  useEffect(() => {
    const getWeb3 = async () => {
      const web3 = await getConnection();
      setWeb3(() => web3);
      const contract = await getContract(web3);
      setContract(() => contract);
    };
    getWeb3();
  }, []);

  useEffect(() => {
    const fetchDownline = async () => {
      const downline = await getDownline(account);
      setDepth(() => getObjectDepth(downline));
      setDownline(() => downline);
    };
    fetchDownline();
  }, [account]);

  const getUserData = async (childId) => {
    navigator.clipboard.writeText(childId);
    //console.log("getUserData for: " + childId);

    const userInfo = await getUserInfo(contract, childId);
    const buddyDate = await getJoinDate(childId);

    //console.log(connection.utils.fromWei(userInfo.deposits));

    setDownline(() => {
      let dStr = JSON.stringify(downline);
      dStr = dStr.replace(
        `"id":"${childId}",`,
        `"id":"${childId}","deposits":"${parseFloat(
          web3.utils.fromWei(userInfo.deposits)
        ).toFixed(2)}","buddyDate":"${format(
          new Date(buddyDate * 1000),
          "yyy-MM-dd"
        )}",`
      );
      const updated = JSON.parse(dStr);
      return updated;
    });
  };

  const OrgItem = ({ child }) => {
    const subChild = (child.children || []).map((child) => {
      return (
        <ul key={child.id}>
          <OrgItem child={child} type="child" />
        </ul>
      );
    });

    return (
      <li key={child.id}>
        <span className="downline-wallet" onClick={() => getUserData(child.id)}>
          {child.text}{" "}
          {child.deposits && `(${child.deposits} - ${child.buddyDate})`}
        </span>
        {subChild}
      </li>
    );
  };

  const OrgList = ({ org }) => (
    <ol>
      {(org.children || []).map((item, index) => (
        <OrgItem key={index} child={item} />
      ))}
    </ol>
  );

  return (
    <div className="container main">
      <div className="page-title">
        <h1>Wallet Downline</h1>
        <h3>for {downline && downline.id}</h3>
        <div>Depth: {depth}</div>
        <hr />
        <div className="alert alert-info">
          Click wallet address to see Deposits and join date
          <div>Click also copies wallet address to clipboard</div>
        </div>
      </div>
      {downline && (
        <div className="container main">
          <OrgList org={downline} />
        </div>
      )}
    </div>
  );
};

export default Downline;
