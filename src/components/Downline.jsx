import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { getDownline, getUserInfo, getJoinDate } from "../api/Contract";

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

  return Math.max(...depthOfKeys) - 1;
}

const Downline = () => {
  const [downline, setDownline] = useState({});
  const { account } = useParams();
  const [depth, setDepth] = useState(0);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchDownline = async () => {
      const { downline, error } = await getDownline(account);
      if (error) {
        setIsError(true);
      } else {
        setDepth(getObjectDepth(downline));
        setDownline(downline);
        setIsError(false);
      }
    };

    fetchDownline();
  }, [account]);

  const getUserData = async (childId) => {
    navigator.clipboard.writeText(childId);

    const userInfo = await getUserInfo(childId);
    const buddyDate = await getJoinDate(childId);

    let dStr = JSON.stringify(downline);
    dStr = dStr.replace(
      `"id":"${childId}",`,
      JSON.stringify({
        id: childId,
        originalDeposit: parseFloat(buddyDate.originalDeposit).toFixed(2),
        buddyDate: format(new Date(buddyDate.buddyDate * 1000), "yyy-MM-dd"),
        deposits: parseFloat(userInfo.deposits / 10e17).toFixed(2),
      })
        .replace("{", "")
        .replace("}", ",")
    );
    const updated = JSON.parse(dStr);
    setDownline(updated);
  };

  const OrgItem = ({ child, depth }) => {
    const subChild = (child.children || []).map((child, index) => {
      return (
        <OrgItem key={index} child={child} depth={depth + 1} type="child" />
      );
    });

    return (
      <li key={child.id}>
        <div className="downline-wallet" onClick={() => getUserData(child.id)}>
          {child.text}{" "}
          {child.originalDeposit && (
            <div className="card">
              <div className="card-body">
                <div>Join date: {child.buddyDate}</div>
                <div>Original deposit: {child.originalDeposit}</div>
                <div>Current deposits: {child.deposits}</div>
                <div>Depth: {depth} </div>
              </div>
            </div>
          )}
        </div>
        <ol>{subChild}</ol>
      </li>
    );
  };

  const OrgList = ({ org }) => (
    <>
      <ul>
        <OrgItem child={{ ...downline, children: [] }} depth="self" />
      </ul>
      <ol>
        {(org.children || []).map((item, index) => (
          <OrgItem key={index} child={item} depth={1} />
        ))}
      </ol>
    </>
  );

  return (
    <div className="container main" style={{ fontSize: "1.5em" }}>
      <div className="page-title">
        <h1>Wallet Downline</h1>
        <h3>for {account}</h3>
        <div>Depth: {depth}</div>
        <hr />
        <div className="alert alert-info">
          Click wallet address to see Deposits and join date
          <div>Click also copies wallet address to clipboard</div>
        </div>
        {isError && (
          <div className="alert alert-warning">
            Error getting downline data. Please try again later.
          </div>
        )}
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
