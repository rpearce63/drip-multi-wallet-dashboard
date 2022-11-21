import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getUplineTree,
  getPlayerStats,
  getIndividualStats,
} from "../api/Contract";

const getMainStats = (detail) => [
  {
    label: "Join date",
    value: detail.firstDepositDate,
    //formatter: value => highlightNumberPart(value),
  },
  {
    label: "Available",
    value: detail.claimsAvailable,
    //formatter: value => highlightNumberPart(value),
  },
  {
    label: "Deposits",
    value: detail.deposits,
    //formatter: value => highlightNumberPart(value),
  },
  {
    label: "Direct Deposits",
    value: detail.actualDeposit,
    labelTooltip: "Discards Deposits from Hydrates",
    //formatter: value => highlightNumberPart(`${value}`),
  },
  {
    label: "Hydrates",
    value: detail.rolls,
    //formatter: value => highlightNumberPart(value),
  },
  {
    label: "Claimed",
    value: detail.payouts,
    //formatter: value => highlightNumberPart(value),
  },
  {
    label: "Claimed (Not hydrated)",
    value: detail.actualClaim,
    labelTooltip: "Discards Claims from Hydrates",
    //formatter: value => highlightNumberPart(`${value}`),
  },

  {
    label: "Net Deposits",
    value: detail.net_deposits,
    //formatter: value => highlightNumberPart(value),
  },
  {
    label: "Max Payout",
    value: detail.max_payouts,
    //formatter: value => highlightNumberPart(value),
  },
  {
    label: "Claims Remaining",
    value: parseFloat(detail.max_payouts - detail.payouts).toFixed(2),
    //formatter: value => highlightNumberPart(value),
  },
  {
    label: "Days until Max Payout",
    labelTooltip: "If Claiming Only",
    value: (
      (parseFloat(detail.max_payouts) - parseFloat(detail.payouts)) /
      (parseFloat(detail.deposits) * 0.01)
    ).toFixed(2),
    //formatter: value => `${formatDays(value)}`,
  },
  {
    label: "Airdrop Received",
    value: detail.airdrops_received,
    //formatter: value => highlightNumberPart(`${value}`),
  },
  {
    label: "BR34P Balance",
    value: detail.br34pBalance,
    //formatter: value => highlightNumberPart(`${value}`),
  },
  {
    label: "BNB Balance",
    value: detail.bnbBalance,
    //formatter: value => highlightNumberPart(`${value}`),
  },

  {
    label: "Team",
    value: `${detail.referrals}/${detail.total_structure}`,
  },
  {
    label: "Team Rewards",
    value: detail.rewards,
    //formatter: value => highlightNumberPart(value),
  },
  {
    label: "Airdrops Sent",
    value: detail.airdrops_total,
    //formatter: value => highlightNumberPart(`${value}`),
  },
  {
    label: "Airdrops Sent (no kickbacks)",
    value: detail.actualAirdrop,
    labelTooltip: "Discards Airdrops Sent from Team rewards Kick-Back",
    //formatter: value => highlightNumberPart(`${value}`),
  },
  {
    label: "Airdrops to Team",
    value: detail.actualAirdropToDownline,
    labelTooltip: "Only account Airdrops sent to downline team members",
    //formatter: value => highlightNumberPart(`${value}`),
  },
];

const calculateNextRewarded = (uplineData) => {
  let refPos = Number(uplineData[0].ref_claim_pos);
  //console.log("refPos: ", refPos);
  const justUpline = uplineData.slice(1);
  //console.log(justUpline.length, justUpline[refPos]);
  const nextEligibleUpline = loopUpline(refPos, justUpline);
  return nextEligibleUpline;
};
const loopUpline = (refPos, justUpline) => {
  for (let u = 0; u < 15; u++) {
    if (u === refPos) {
      //console.log("looking at ", u);
      if (justUpline[u].isEligible && justUpline[u].balanceLevel >= u) {
        //console.log("eligible: ", justUpline[u]);
        return justUpline[u].address;
      }
      refPos += 1;
      if (refPos === justUpline.length) {
        refPos = 0;
        return loopUpline(refPos, justUpline);
      }
    }
  }
};

const Upline = () => {
  let { buddyId } = useParams();

  const [uplineData, setUplineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState([]);
  const [nextRewarded, setNextRewarded] = useState(null);
  useEffect(() => {
    const fetchUpline = async () => {
      setLoading(true);
      const upline = await getUplineTree(buddyId);
      setUplineData(upline);
      setLoading(false);
      const baseStats = await getPlayerStats(buddyId);
      const extendedStats = await getIndividualStats(buddyId);
      const stats = { ...baseStats, ...extendedStats };
      //console.log(stats);
      setUserStats(getMainStats(stats));

      setNextRewarded(calculateNextRewarded(upline));
    };

    fetchUpline();
  }, [buddyId]);

  return (
    <div className="container main">
      <div className="page-title">
        <h1>Wallet Stats & Upline</h1>
        <h3>* - Next for rewards</h3>
        <h4>
          <p>
            If scheduled upline is not eligible because of negative NDV or br34p
            level coverage, reward will skip to the next eligible wallet.
          </p>
          <p>Click on an upline wallet address to see stats on that wallet.</p>
          <p>Click external link to view the address on bscscan.</p>
        </h4>
      </div>
      <div className="wallet-stats">
        {userStats.map(({ label, value }, index) => {
          return (
            <div className="card" key={index}>
              <div className="card-body">
                {label}: {value}
              </div>
            </div>
          );
        })}
      </div>
      <div className="upline-table">
        {loading ? (
          <div className="loading" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>
                  Referral
                  <br />
                  Index
                </th>
                <th>Address</th>
                <th>
                  Referral
                  <br />
                  Coverage Depth
                </th>
                <th>
                  NDV/Depth
                  <br />
                  Eligible
                </th>
                <th>Team</th>
              </tr>
            </thead>
            <tbody>
              {uplineData.map((upline, index) => (
                <tr
                  key={upline.address}
                  className={
                    upline.address === nextRewarded ? "next-reward" : ""
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
                      <i class="bi bi-box-arrow-up-right"></i>
                    </a>
                    &nbsp;
                    <a href={`/upline/${upline.address}`}>{upline.address}</a>
                  </td>
                  <td>{upline.balanceLevel}</td>
                  <td>
                    {upline.isEligible && upline.balanceLevel > index
                      ? "Y"
                      : "N"}
                  </td>
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
