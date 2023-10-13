import {
  shortenAddress,
  convertTokenToUSD,
  formatPercent,
  formatNumber,
  calculateDaysToMaxDeposits,
  negativeToZero,
} from "../api/utils";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getLastAction, getStartBlock } from "../api/Contract";
//import { useCallback } from "react";
const TableRow = ({
  index,
  wallet,
  expandedTable,
  showDollarValues,
  showLastAction,
  deleteRow,
  addLabel,
  addGroup,
  dripPrice,
  bnbPrice,
  highlightStyleFor,
  editLabels,
  br34pPrice,
  flagLowNdv,
  ndvWarningLevel,
}) => {
  const [lastAction, setLastAction] = useState();
  const [loading, setLoading] = useState(false);

  const fetchLastAction = async () => {
    setLoading(true);
    //setLastAction(" ");
    // await new Promise((resolve) =>
    //   setTimeout(() => {
    //     resolve(true);
    //   }, 5000)
    // );
    const startBlock = await getStartBlock();
    const response = await getLastAction(startBlock - 200000, wallet.address);
    if (response === "error") {
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(true);
        }, 1000)
      );
      await fetchLastAction();
    } else {
      setLastAction(response);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLastAction("-");
  }, [wallet.address]);

  // useEffect(() => {
  //   setLastAction("-");
  //   setTimeout(() => {
  //     fetchLastAction();
  //   }, 500 * index);
  // }, [fetchLastAction, wallet.index]);

  if (!wallet) return <></>;
  // if (wallet.deposits === 0)
  //   return (
  //     <tr>
  //       <td className="rowIndex" onClick={() => deleteRow(wallet.address)}>
  //         <span>{wallet.index + 1}</span>
  //       </td>
  //       <td
  //         className={wallet.valid ? "" : "invalid"}
  //         onClick={(e) => navigator.clipboard.writeText(wallet.address)}
  //       >
  //         {shortenAddress(wallet.address)}
  //       </td>
  //       <td colSpan={3}>No Deposits in Faucet</td>
  //     </tr>
  //   );
  return (
    <tr>
      <td className="rowIndex" onClick={() => deleteRow(wallet.address)}>
        <span>{wallet.index + 1}</span>
      </td>
      <td
        className={wallet.valid ? "" : "invalid"}
        onClick={(e) => navigator.clipboard.writeText(wallet.address)}
      >
        {wallet.deposits > 0 ? (
          <Link to={`/upline/${wallet.address}`}>
            {shortenAddress(wallet.address)}
          </Link>
        ) : (
          shortenAddress(wallet.address)
        )}
      </td>

      <td>
        {editLabels ? (
          <>
            <input
              size={8}
              type="text"
              placeholder="Label"
              value={wallet.label}
              onChange={(e) => addLabel(wallet.index, e.target.value)}
            />
            <input
              type="text"
              size={8}
              placeholder="Group"
              value={wallet.group === "none" ? "" : wallet.group}
              onChange={(e) => addGroup(wallet.index, e.target.value)}
            />
          </>
        ) : (
          wallet.label
        )}
      </td>

      {expandedTable && <td>{shortenAddress(wallet.upline)}</td>}
      {/* {expandedTable && <td>{wallet.uplineCount}</td>} */}
      {expandedTable && (
        <td>{convertTokenToUSD(wallet.busdBalance, 1, showDollarValues)}</td>
      )}
      {expandedTable && (
        <td>
          {wallet.br34pBalance > 0 &&
            convertTokenToUSD(
              wallet.br34pBalance,
              br34pPrice,
              showDollarValues
            )}
        </td>
      )}
      {expandedTable && (
        <td>
          {convertTokenToUSD(wallet.dripBalance, dripPrice, showDollarValues)}
        </td>
      )}

      {expandedTable && (
        <>
          <td className={highlightStyleFor("bnb", wallet)}>
            {convertTokenToUSD(wallet.bnbBalance, bnbPrice, showDollarValues)}
          </td>
        </>
      )}
      {expandedTable && (
        <>
          <td>
            {formatNumber(wallet.dropsBalance)} <br />
            {wallet.dailyBnb > 0 && wallet.dailyBnb}
          </td>
        </>
      )}
      <td className={highlightStyleFor("amt", wallet)}>
        {convertTokenToUSD(
          wallet.available * (showDollarValues ? 0.81 : 1),
          dripPrice,
          showDollarValues
        )}
      </td>

      <td className={highlightStyleFor("pct", wallet)}>
        {wallet.deposits > 0 &&
          formatPercent(
            wallet.available / (1 - wallet.whaleTax / 100) / wallet.deposits
          )}
        %
      </td>

      <td>{convertTokenToUSD(wallet.deposits, dripPrice, showDollarValues)}</td>
      {expandedTable && (
        <td>
          {wallet.deposits > 0 &&
            // calculateDaysToMaxDeposits(wallet.deposits, wallet.payouts)
            Number(
              negativeToZero(wallet.maxClaim) / (wallet.deposits * 0.01)
            ).toFixed(0)}
        </td>
      )}

      <td
        className={
          flagLowNdv &&
          wallet.deposits > 0 &&
          wallet.ndv / wallet.deposits <= ndvWarningLevel / 100
            ? "warning inverted"
            : ""
        }
      >
        {formatNumber(wallet.ndv)}
      </td>
      <td
        className={
          wallet.payouts + wallet.available > 10000 ? "whale" : undefined
        }
      >
        {convertTokenToUSD(wallet.payouts, dripPrice, showDollarValues)}
      </td>
      {expandedTable && <td>{wallet.whaleTax > 0 && wallet.whaleTax + "%"}</td>}

      {expandedTable && (
        <>
          <td>{convertTokenToUSD(wallet.r, dripPrice, showDollarValues)}</td>
          <td>
            {/* Claimed out: Claimed - Hydrates(rolls) */}
            {convertTokenToUSD(
              wallet.payouts - wallet.hydrates,
              showDollarValues
            )}
          </td>
        </>
      )}

      <td>
        {convertTokenToUSD(wallet.direct_bonus, dripPrice, showDollarValues)}
      </td>
      <td>
        {/* max payout */}
        {convertTokenToUSD(wallet.maxPayout, dripPrice, showDollarValues)}
      </td>
      <td>
        {convertTokenToUSD(
          negativeToZero(wallet.maxClaim),
          dripPrice,
          showDollarValues
        )}
      </td>
      <td>
        {wallet.referrals > 0 &&
          `${wallet.referrals} / ${wallet.total_structure}`}
      </td>
    </tr>
  );
};

export default TableRow;
