import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getConnection, getContract, getUserInfo } from "../api/Contract";

const Upline = () => {
  let { buddy: buddyId } = useParams();

  //const [buddyInfo, setBuddyInfo] = useState({});
  const [uplineData, setUplineData] = useState([]);

  useEffect(() => {
    const getUplineData = async () => {
      const web3 = await getConnection();
      const contract = await getContract(web3);
      //const userInfo = await getUserInfo(contract, buddyId);
      //setBuddyInfo(() => ({ ...userInfo, address: buddyId }));
      let atDevWallet = false;
      let uplineAddress = buddyId;

      do {
        const uplineInfo = await getUserInfo(contract, uplineAddress);
        const currentAddress = uplineAddress;
        const isEligible = await contract.methods
          .isNetPositive(uplineAddress)
          .call();
        const balanceLevel = await contract.methods
          .balanceLevel(uplineAddress)
          .call();

        setUplineData((uplineData) => [
          ...uplineData,
          {
            ...uplineInfo,
            address: currentAddress,
            isEligible,
            balanceLevel,
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
