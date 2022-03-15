import { shortenAddress, convertTokenToUSD, formatPercent } from "../api/utils";
import { Link } from "react-router-dom";
const TableRow = ({
  index,
  wallet,
  expandedTable,
  showDollarValues,
  showBabyDrip,
  showLastAction,
  deleteRow,
  addLabel,
  dripPrice,
  bnbPrice,
  highlightStyleFor,
  editLabels,
  br34pPrice,
}) => {
  return (
    <tr>
      <td className="rowIndex" onClick={() => deleteRow(wallet.address)}>
        <span>{index + 1}</span>
      </td>
      <td
        className={wallet.valid ? "" : "invalid"}
        onClick={(e) => navigator.clipboard.writeText(wallet.address)}
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
      <td className={highlightStyleFor("amt", wallet)}>
        {convertTokenToUSD(wallet.available, dripPrice, showDollarValues)}
      </td>

      <td className={highlightStyleFor("pct", wallet)}>
        {formatPercent(wallet.available / wallet.deposits)}%
      </td>

      <td>{convertTokenToUSD(wallet.deposits, dripPrice, showDollarValues)}</td>
      {showLastAction && <td>{wallet.lastAction}</td>}
      <td
        className={
          wallet.ndv / wallet.deposits <= 0.25 ? "warning inverted" : ""
        }
      >
        {wallet.ndv}
      </td>
      <td>{convertTokenToUSD(wallet.payouts, dripPrice, showDollarValues)}</td>
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
        {convertTokenToUSD(wallet.deposits * 3.65, dripPrice, showDollarValues)}
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
      {expandedTable && showBabyDrip && (
        <>
          <td>
            {wallet.babyDripBalance > 0 &&
              convertTokenToUSD(wallet.babyDripBalance, 0, false)}
          </td>

          <td>
            {wallet.babyDripBalance > 0 &&
              convertTokenToUSD(
                wallet.babyDripReflections,
                dripPrice,
                showDollarValues
              )}
          </td>
          <td>
            {wallet.babyDripBalance > 0 &&
              convertTokenToUSD(
                wallet.babyDripUnpaid,
                dripPrice,
                showDollarValues
              )}
          </td>
        </>
      )}
    </tr>
  );
};

export default TableRow;
