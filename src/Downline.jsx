import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { getDownline } from "./Contract";
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

  const OrgItem = ({ child }) => {
    const subChild = (child.children || []).map((child) => (
      <ul key={child.id}>
        <OrgItem child={child} type="child" />
      </ul>
    ));

    return (
      <li key={child.id}>
        <span>{child.text}</span>
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
      <Header />
      <div className="page-title">
        <h1>Wallet Downline</h1>
        <hr />
      </div>
      {downline && (
        <div className="container main">
          <OrgItem child={{ id: downline.id, text: downline.text }} />

          <OrgList org={downline} />
        </div>
      )}
    </div>
  );
};

export default Downline;
