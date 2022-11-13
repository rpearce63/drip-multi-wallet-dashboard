import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUplineTree } from "../api/Contract";

const Upline = () => {
  let { buddyId } = useParams();

  const [uplineData, setUplineData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUpline = async () => {
      setLoading(true);
      const upline = await getUplineTree(buddyId);
      setUplineData(upline);
      setLoading(false);
    };

    fetchUpline();
  }, [buddyId]);

  return (
    <div className="container main">
      <div className="page-title">
        <h1>Wallet Upline</h1>
        <h3>* - Next for rewards</h3>
      </div>

      <div className="main" style={{ fontSize: "1.5em" }}>
        {loading ? (
          <div className="loading" />
        ) : (
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
                <tr
                  key={upline.address}
                  className={
                    parseInt(uplineData[0].ref_claim_pos) === index - 1
                      ? "next-reward"
                      : ""
                  }
                >
                  <td>
                    {parseInt(uplineData[0].ref_claim_pos) === index - 1 && "*"}
                    {index === 0 ? "Self" : index - 1}
                  </td>
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
        )}
      </div>
    </div>
  );
};

export default Upline;
