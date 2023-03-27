import PopupHelp from "./PopupHelp";
import { Checkbox } from "semantic-ui-react";
const TableOptions = ({
  copyTableData,
  dataCopied,
  expandedTable,
  setExpandedTable,
  showDollarValues,
  setShowDollarValues,
  depositFilter,
  setDepositFilter,
  wallets,
  selectedGroup,
  setSelectedGroup,
  groups,
  MESSAGES,
  backupData,
}) => {
  return (
    <div className="table-options">
      <div className="table-options-ctrl">
        <button onClick={copyTableData} className="ui button">
          <i className={`bi bi-clipboard${dataCopied ? "-check" : ""}`}></i>
          Copy table
        </button>
      </div>
      <div className="table-options-ctrl ui checkbox">
        <input
          id="expandedTable"
          type="checkbox"
          checked={expandedTable}
          onChange={() => setExpandedTable(!expandedTable)}
        />
        <label htmlFor="expandedTable">Expanded Table</label>
      </div>
      <div className="table-options-ctrl ui toggle checkbox">
        <input
          id="showDollarValues"
          type="checkbox"
          checked={showDollarValues}
          onChange={() => setShowDollarValues(!showDollarValues)}
        />
        <label style={{ fontSize: "larger" }} htmlFor="showDollarValues">
          $
        </label>
      </div>

      <div className="table-options-ctrl ui labeled input">
        <label className="ui label">Filter deposits &gt; </label>
        <input
          type="text"
          size={10}
          value={depositFilter}
          onChange={(e) => {
            let numeric = e.target.value.replace(/\D/g, "");
            if (!numeric) numeric = 0;
            const maxDeposit = Math.max(...wallets.map((w) => w.deposits));
            if (numeric > maxDeposit) {
              numeric = depositFilter;
            }

            setDepositFilter(parseInt(numeric));
          }}
        />
      </div>
      <div className="table-options-ctrl ui labeled input">
        <label className="ui label">Group</label>
        <select
          className="ui dropdown"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="*">All</option>
          <option value="none">None</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        {/* <div
          className="ui icon button"
          data-tooltip={MESSAGES.GROUP_FILTER_MESSAGE}
          data-variation="basic"
        >
          <i className="question circle outline icon"></i>
        </div> */}
        <PopupHelp message={MESSAGES.GROUP_FILTER_MESSAGE} />
      </div>
      <button className="ui button" onClick={backupData}>
        Back Up
      </button>
    </div>
  );
};

export default TableOptions;
