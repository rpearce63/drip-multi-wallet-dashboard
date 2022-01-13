import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import {
  getDownline,
  getUserInfo,
  getContract,
  getConnection,
  getDripBalance,
} from "./Contract";
import Header from "./Header";

const Downline = () => {
  const [downline, setDownline] = useState();
  const { account } = useParams();

  useEffect(() => {
    const fetchDownline = async () => {
      const downline = await getDownline(account);
      //console.log(downline);
      setDownline(() => downline);
    };
    fetchDownline();
  }, [account]);

  const getUserData = async (childId) => {
    //console.log("getUserData for: " + childId);
    const connection = await getConnection();
    const contract = await getContract(connection);

    const userInfo = await getUserInfo(contract, childId);
    //console.log(connection.utils.fromWei(userInfo.deposits));

    setDownline(() => {
      let dStr = JSON.stringify(downline);
      dStr = dStr.replace(
        `"id":"${childId}",`,
        `"id":"${childId}","deposits":"${parseFloat(
          connection.utils.fromWei(userInfo.deposits)
        ).toFixed(2)}",`
      );
      const updated = JSON.parse(dStr);
      //console.log(updated);
      //console.log(getObject(updated.children, childId));
      return updated;
      //   return downline.map((d) => {
      //     if (d.id === childId) return { ...d, deposits: userInfo.deposits };
      //     return { ...d };
      //   });
    });
  };

  const OrgItem = ({ child }) => {
    const subChild = (child.children || []).map((child) => (
      <ul key={child.id}>
        <OrgItem child={child} type="child" />
      </ul>
    ));

    return (
      <li key={child.id}>
        <span className="downline-wallet" onClick={() => getUserData(child.id)}>
          {child.text} {child.deposits && `(${child.deposits})`}
        </span>
        {subChild}
      </li>
    );
  };

  const OrgList = ({ org }) => (
    <ul>
      {(org.children || []).map((item, index) => (
        <OrgItem key={index} child={item} />
      ))}
    </ul>
  );

  return (
    <div>
      {/* <Header /> */}
      <div className="page-title">
        <h1>Wallet Downline</h1>
        <h3>for {downline && downline.id}</h3>
        <hr />
        <p>Click wallet address to see Deposits</p>
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
