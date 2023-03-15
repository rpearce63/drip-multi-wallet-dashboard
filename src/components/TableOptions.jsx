import PopupHelp from "./PopupHelp";
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
        <button
          className="btn-copy btn btn-outline-secondary"
          onClick={copyTableData}
        >
          <i className={`bi bi-clipboard${dataCopied ? "-check" : ""}`}></i>
          Copy table
        </button>
      </div>
      <div className="form-check table-options-ctrl">
        <input
          id="expandedTable"
          className="form-check-input"
          type="checkbox"
          checked={expandedTable}
          onChange={() => setExpandedTable(!expandedTable)}
        />
        <label htmlFor="expandedTable" className="form-check-label">
          Expanded Table
        </label>
      </div>
      <div className="form-check form-switch table-options-ctrl">
        <input
          id="showDollarValues"
          className="form-check-input"
          type="checkbox"
          checked={showDollarValues}
          onChange={() => setShowDollarValues(!showDollarValues)}
        />
        <label htmlFor="showDollarValues" className="form-check-label">
          $
        </label>
      </div>
      <div className="table-options-ctrl">
        Filter deposits &gt;{" "}
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
      <div className="table-options-ctrl">
        Group:{" "}
        <select
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
        <PopupHelp message={MESSAGES.GROUP_FILTER_MESSAGE} />
      </div>
      <button className="btn btn-secondary" onClick={backupData}>
        Back Up
      </button>
    </div>
  );
};

export default TableOptions;
