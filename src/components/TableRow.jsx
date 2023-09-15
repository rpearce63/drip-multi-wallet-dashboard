import {
  shortenAddress,
  convertTokenToUSD,
  formatPercent,
  formatNumber,
  calculateDaysToMaxDeposits,
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
        <td
          className={
            wallet.coveredDepth < wallet.teamDepth
              ? "buy-more-br34p inverted"
              : "good-br34p"
          }
        >
          {(wallet.br34pBalance > 0 || wallet.teamDepth > 0) &&
            `${convertTokenToUSD(
              wallet.br34pBalance,
              br34pPrice,
              showDollarValues
            )}
                      / ${wallet.coveredDepth}`}
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
            calculateDaysToMaxDeposits(wallet.deposits, wallet.payouts)}
        </td>
      )}
      {showLastAction && (
        <td
          onClick={fetchLastAction}
          style={{ cursor: "pointer", textAlign: "center" }}
          className={loading ? "dotloading" : ""}
        >
          {lastAction}
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
            {convertTokenToUSD(wallet.payouts - wallet.r, showDollarValues)}
          </td>
        </>
      )}

      <td>
        {convertTokenToUSD(wallet.direct_bonus, dripPrice, showDollarValues)}
        {/* /
                    {convertTokenToUSD(
                      wallet.match_bonus,
                      dripPrice,
                      showDollarValues
                    )} */}
      </td>
      <td>
        {convertTokenToUSD(
          wallet.deposits + wallet.available - (wallet.payouts - wallet.r),
          dripPrice,
          showDollarValues
        )}
      </td>
      <td>
        {wallet.referrals > 0 && (
          <Link to={`/downline/${wallet.address}`}>
            {wallet.referrals} / {wallet.total_structure} / {wallet.teamDepth}
          </Link>
        )}
      </td>
      <td className={wallet.ref_claim_pos === "0" ? "hydrate inverted" : ""}>
        {wallet.ref_claim_pos}
      </td>
    </tr>
  );
};

export default TableRow;
