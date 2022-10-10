import {
  shortenAddress,
  convertTokenToUSD,
  formatPercent,
  formatNumber,
} from "../api/utils";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getLastAction } from "../api/dripAPI";
import { getStartBlock } from "../api/utils.js"
import React from "react";
import {Wallet} from "../types/types";
//import { useCallback } from "react";
export interface TableRowProps {
    wallet:Wallet,
    expandedTable: boolean,
    furioEnabled: boolean,
    showDollarValues: boolean,
    showLastAction: boolean,
    deleteRow: Function,
    addLabel: Function,
    dripPrice?: number,
    furioPrice?: number,
    bnbPrice?: number,
    highlightStyleFor: Function,
    editLabels: boolean,
    br34pPrice?:number,
    flagLowNdv: boolean,
    ndvWarningLevel: number
}
const TableRow = ({
  wallet,
  expandedTable,
  furioEnabled,
  showDollarValues,
  showLastAction,
  deleteRow,
  addLabel,
  dripPrice,
  furioPrice,
  bnbPrice,
  highlightStyleFor,
  editLabels,
  br34pPrice,
  flagLowNdv,
  ndvWarningLevel,
}: TableRowProps) => {
  const [lastAction, setLastAction] = useState("");
  const [loading, setLoading] = useState(false);
  const furioWallet = wallet.furioStatus === 'enabled';
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
  return (
    <tr>
      <td className="rowIndex" onClick={() => deleteRow(wallet.address)}>
        <span>{wallet.index + 1}</span>
      </td>
      <td
        className={wallet.valid ? "" : "invalid"}
        onClick={() => navigator.clipboard.writeText(wallet.address)}
      >
        <Link to={`/upline/${wallet.address}`}>
          {shortenAddress(wallet.address)}
        </Link>
      </td>
      <td>
        {editLabels ? (
          <input
            size={8}
            type="text"
            value={wallet.label}
            onChange={(e) => addLabel(wallet.index, e.target.value)}
          />
        ) : (
          wallet.label
        )}
      </td>
      {expandedTable && <td>{shortenAddress(wallet.upline)}</td>}
      {expandedTable && <td>{wallet.uplineCount}</td>}
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
          <td>{formatNumber(wallet.dropsBalance)}</td>
        </>
      )}
      <td className={highlightStyleFor("amt", wallet)}>
        {convertTokenToUSD(wallet.available, dripPrice, showDollarValues)}
      </td>

      <td className={highlightStyleFor("pct", wallet)}>
        {formatPercent(wallet.available / wallet.deposits)}%
      </td>

      <td>{convertTokenToUSD(wallet.deposits, dripPrice, showDollarValues)}</td>
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
          flagLowNdv && wallet.ndv / wallet.deposits <= ndvWarningLevel / 100
            ? "warning inverted"
            : ""
        }
      >
        {formatNumber(wallet.ndv)}
      </td>
      <td>{convertTokenToUSD(wallet.payouts, dripPrice, showDollarValues)}</td>
      {expandedTable && (
        <>
          <td>{convertTokenToUSD(wallet.r, dripPrice, showDollarValues)}</td>
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
        {convertTokenToUSD(wallet.maxPayout, dripPrice, showDollarValues)}
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
        {furioEnabled && (
            <td>
                {furioWallet ? convertTokenToUSD(wallet.furioBalance, furioPrice, showDollarValues): ''}
            </td>
        )}
        {furioEnabled && (
            <td>
                {furioWallet ? convertTokenToUSD(wallet.furioVaultBalance, furioPrice, showDollarValues): ''}
            </td>
        )}
        {furioEnabled && (
            <td  className={highlightStyleFor("furioPct", wallet)}>
                {furioWallet ? convertTokenToUSD(wallet.furioAvailable, furioPrice, showDollarValues): ''}
            </td>
        )}
        {furioEnabled && (
            <td>
                {furioWallet ? `${formatPercent(wallet.furioRewardRate)}%` : ''}
            </td>
        )}
        {furioEnabled && (
            <td  className={highlightStyleFor("furioAutoComp", wallet)}>
                {furioWallet ? `${wallet.furioAutoCompoundsLeft}/${wallet.furioTotalAutoCompounds}` : ''}
            </td>
        )}
    </tr>
  );
};

export default TableRow;
