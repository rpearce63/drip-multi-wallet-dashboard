import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUplineInfo } from "../api/Contract";

const Upline = () => {
  let { buddy: buddyId } = useParams();

  //const [buddyInfo, setBuddyInfo] = useState({});
  const [uplineData, setUplineData] = useState([]);

  useEffect(() => {
    const getUplineData = async () => {
      let atDevWallet = false;
      let uplineAddress = buddyId;

      do {
        const uplineInfo = await getUplineInfo(uplineAddress);
        const currentAddress = uplineAddress;

        setUplineData((uplineData) => [
          ...uplineData,
          {
            ...uplineInfo,
            address: currentAddress,
          },
        ]);
        uplineAddress = uplineInfo.upline;
        if (uplineInfo.upline.startsWith("0x000")) {
          atDevWallet = true;
        }
      } while (!atDevWallet);
    };
    getUplineData();
  }, [buddyId]);

  return (
    <div className="container main">
      {/* <Header /> */}
      <div className="page-title">
        <h1>Wallet Upline</h1>
      </div>

      <div className="main">
        <table className="table">
          <thead>
            <tr>
              <th>Referral Index</th>
              <th>Address</th>
              <th>Referral Coverage Depth</th>
              <th>Net Positive</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            {uplineData.map((upline, index) => (
              <tr key={upline.address}>
                <td>{index === 0 ? "Self" : index - 1}</td>
                <td>
                  <a
                    href={`https://bscscan.com/address/${upline.address}`}
                    target="_blank noreferrer"
                  >
                    {upline.address}
                  </a>
                </td>
                <td>{upline.balanceLevel}</td>
                <td>{upline.isEligible ? "Y" : "N"}</td>
                <td>
                  {upline.referrals}/{upline.total_structure}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Upline;
