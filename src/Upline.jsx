import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getConnection, getContract, getUserInfo } from "./Contract";
import Header from "./Header";

const Upline = () => {
  let { buddy: buddyId } = useParams();

  const [buddyInfo, setBuddyInfo] = useState({});
  const [uplineData, setUplineData] = useState([]);

  useEffect(() => {
    const getUplineData = async () => {
      const web3 = await getConnection();
      const contract = await getContract(web3);
      const userInfo = await getUserInfo(contract, buddyId);
      setBuddyInfo(() => ({ ...userInfo, address: buddyId }));
      let atDevWallet = false;
      let uplineAddress = buddyId;
      let index = 1;
      do {
        let uplineInfo = await getUserInfo(contract, uplineAddress);
        const isEligible = await contract.methods
          .isBalanceCovered(uplineAddress, index++)
          .call();

        uplineAddress = uplineInfo.upline;
        if (!uplineInfo.upline.startsWith("0x000")) {
          setUplineData((uplineData) => [
            ...uplineData,
            { ...uplineInfo, address: uplineInfo.upline, isEligible },
          ]);
        } else {
          atDevWallet = true;
        }
      } while (!atDevWallet);
    };
    getUplineData();
  }, [buddyId]);

  return (
    <div>
      <Header />
      <div className="container-fluid main">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Upline for {buddyInfo.address}</th>
              <th>Referral Position</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            {uplineData.map((upline, index) => (
              <tr key={upline.address}>
                <td>{index + 1}</td>
                <td>
                  <a
                    href={`https://bscscan.com/address/${upline.address}`}
                    target="_blank noreferrer"
                  >
                    {upline.address}
                  </a>
                </td>
                <td>
                  {upline.ref_claim_pos} - {upline.isEligible ? "Y" : "N"}
                </td>
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
