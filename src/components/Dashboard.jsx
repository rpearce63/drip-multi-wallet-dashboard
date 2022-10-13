import React, { useState, useEffect, useCallback } from "react";
import { getDripPriceData, getAllWalletData } from "../api/Contract";

import { CONFIGS_KEY } from "../configs/dripconfig";
import * as MESSAGES from "../configs/messages";

import Info from "./Info";
import PopupHelp from "./PopupHelp";

import {
  convertTokenToUSD,
  formatPercent,
  backupData,
  formatNumber,
  sortBy,
} from "../api/utils";

import TableRow from "./TableRow";

const Dashboard = () => {
  const [wallets, setWallets] = useState([]);
  const [fullList, setFullList] = useState([]);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [totalClaimed, setTotalClaimed] = useState(0);
  const [totalDirectBonus, setTotalDirectBonus] = useState(0);
  const [totalTeam, setTotalTeam] = useState(0);
  const [addressList, setAddressList] = useState("");
  const [totalDripHeld, setTotalDripHeld] = useState(0);
  const [totalBnbBalance, setTotalBnbBalance] = useState(0);
  const [totalBr34p, setTotalBr34p] = useState(0);
  const [totalBusd, setTotalBusd] = useState(0);
  const [totalHydrated, setTotalHydrated] = useState(0);
  const [totalNDV, setTotalNDV] = useState(0);
  const [totalDrops, setTotalDrops] = useState(0);
  const [sortCol, setSortCol] = useState("index");
  const [sortOrder, setSortOrder] = useState("asc");

  //form configs
  const [flagAmount, setFlagAmount] = useState(true);
  const [flagPct, setFlagPct] = useState(true);
  const [flagLowBnb, setFlagLowBnb] = useState(true);
  const [bnbThreshold, setBnbThreshold] = useState(0.05);
  const [flagLowNdv, setFlagLowNdv] = useState(true);
  const [ndvWarningLevel, setNdvWarningLevel] = useState(25);
  const [depositFilter, setDepositFilter] = useState(0);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("*");

  const [editLabels, setEditLabels] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dataCopied, setDataCopied] = useState(false);

  const [expandedTable, setExpandedTable] = useState(false);
  const [hideTableControls, setHideTableControls] = useState(true);
  const [showDollarValues, setShowDollarValues] = useState(false);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [dripPrice, setDripPrice] = useState(0);
  const [br34pPrice, setBr34pPrice] = useState(0);
  const [showLastAction, setShowLastAction] = useState(true);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);

  const TABLE_HEADERS = [
    { label: "#", id: "index" },
    { label: "Address", id: "address" },
    { label: "Label", id: "label" },
    { label: "Buddy", id: "upline" },
    { label: "Uplines", id: "uplineCount" },
    { label: "BUSD", id: "busdBalance" },
    { label: "BR34P / Levels", id: "br34pBalance" },
    { label: "Drip", id: "dripBalance" },
    { label: "BNB", id: "bnbBalance" },
    { label: "DROPS", id: "dropsBalance" },
    { label: "Available", id: "available" },
    { label: "ROI", id: "roi" },
    { label: "Deposits", id: "deposits" },
    { label: "Last Action", id: "lastAction" },
    { label: "NDV", id: "ndv" },
    { label: "Claimed", id: "payouts" },
    { label: "Hydrated", id: "r" },
    { label: "Rewarded", id: "direct_bonus" },
    { label: "Max Payout", id: "maxPayout" },
    { label: "Team", id: "referrals" },
    { label: "Ref Pos", id: "ref_claim_pos" },
  ];
  const BASE_HEADERS = [
    { label: "#", id: "index" },
    { label: "Address", id: "address" },
    { label: "Label", id: "label" },
    { label: "Available", id: "available" },
    { label: "ROI", id: "roi" },
    { label: "Deposits", id: "deposits" },
    { label: "Last Action", id: "lastAction" },
    { label: "NDV", id: "ndv" },
    { label: "Claimed", id: "payouts" },
    { label: "Rewarded", id: "direct_bonus" },
    { label: "Max Payout", id: "maxPayout" },
    { label: "Team", id: "referrals" },
    { label: "Ref Pos", id: "ref_claim_pos" },
  ];

  useEffect(() => {
    const {
      flagAmount = true,
      flagLowBnb = true,
      flagPct = true,
      bnbThreshold = 0.05,
      expandedTable = false,
      hideTableControls = false,
      showLastAction = true,
      ndvWarningLevel = 25,
      selectedGroup = "*",
      depositFilter = 0,
    } = JSON.parse(localStorage.getItem(CONFIGS_KEY)) ?? {};

    setFlagAmount(() => flagAmount);
    setFlagLowBnb(() => flagLowBnb);
    setFlagPct(() => flagPct);
    setBnbThreshold(() => bnbThreshold);
    setExpandedTable(() => expandedTable);
    setHideTableControls(() => hideTableControls);
    setShowLastAction(() => showLastAction);
    setNdvWarningLevel(() => ndvWarningLevel);
    setSelectedGroup(() => selectedGroup);
    setDepositFilter(() => depositFilter);
  }, []);

  useEffect(() => {
    if (!wallets || !wallets.length) {
      console.log(`no wallets to sort`);
      return;
    }
    try {
      if (wallets?.length > 1) {
        wallets?.sort(sortBy(sortCol, sortOrder));
      }
    } catch (err) {
      console.log(`error sorting wallets: ${err.message}`);
    }
  }, [sortCol, sortOrder, wallets]);

  useEffect(() => {
    const filtered = fullList.filter((w) => w.deposits >= depositFilter);
    if (selectedGroup === "*") {
      setWallets(filtered);
      return;
    }
    const filteredByGroup = filtered.filter((w) =>
      w.group.includes(selectedGroup)
    );
    setWallets(filteredByGroup);
  }, [depositFilter, selectedGroup, fullList]);

  // useEffect(() => {
  //   if (selectedGroup === "*") {
  //     setWallets(fullList);
  //     return;
  //   }
  //   const filteredByGroup = fullList.filter((w) => w.group === selectedGroup);
  //   setWallets(filteredByGroup);
  // }, [selectedGroup, fullList]);

  const fetchPrices = useCallback(async () => {
    const { bnbPrice, dripBnbRatio, br34pPrice } = await getDripPriceData();

    setDripPrice(() => (dripBnbRatio * bnbPrice) / 10e17);
    setBnbPrice(() => bnbPrice);
    setBr34pPrice(() => br34pPrice);
  }, []);

  const fetchData = useCallback(async () => {
    setTimer(60);

    let storedWallets = JSON.parse(
      window.localStorage.getItem("dripAddresses")
    );

    const myWallets =
      storedWallets?.map((wallet) => ({
        addr: wallet.addr.trim().replace("\n", ""),
        label: wallet.label,
        group: wallet.group || "none",
      })) ?? [];
    const groups = [
      ...new Set(
        myWallets
          .filter((w) => w.group && w.group !== "none")
          .map((w) => w.group)
          .join(",")
          .split(",")
          .map((g) => g.trim())
          .filter((g) => g.trim().length)
      ),
    ];
    setGroups(groups);

    const walletCache = await getAllWalletData(myWallets);
    setFullList(walletCache);
    setWallets(() => walletCache);

    setDataCopied(false);
    fetchPrices();
    setLoading(false);
  }, [fetchPrices]);

  useEffect(() => {
    if (!wallets || !wallets.length) {
      console.log("no valid wallets");
      return;
    }
    const validWallets = wallets?.filter((wallet) => wallet?.valid);

    setTotalDeposits(() =>
      validWallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.deposits);
      }, 0)
    );
    setTotalDripHeld(() =>
      validWallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.dripBalance);
      }, 0)
    );
    setTotalBnbBalance(() =>
      validWallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.bnbBalance);
      }, 0)
    );
    setTotalAvailable(() =>
      validWallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.available);
      }, 0)
    );
    setTotalClaimed(() =>
      validWallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.payouts);
      }, 0)
    );
    setTotalDirectBonus(() =>
      validWallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.direct_bonus);
      }, 0)
    );

    setTotalBr34p(() =>
      validWallets.reduce(
        (total, wallet) => total + parseFloat(wallet.br34pBalance),
        0
      )
    );
    setTotalTeam(() =>
      validWallets.reduce(
        (total, wallet) => total + parseFloat(wallet.referrals),
        0
      )
    );
    setTotalBusd(() =>
      validWallets.reduce(
        (total, wallet) => total + parseFloat(wallet.busdBalance),
        0
      )
    );
    setTotalHydrated(() =>
      validWallets.reduce((total, wallet) => total + parseFloat(wallet.r), 0)
    );
    setTotalNDV(() =>
      validWallets.reduce((total, wallet) => total + parseFloat(wallet.ndv), 0)
    );
    setTotalDrops(() =>
      validWallets.reduce(
        (total, wallet) => total + parseFloat(wallet.dropsBalance),
        0
      )
    );
  }, [wallets]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      autoRefresh && fetchData();
    }, 60000);
    const timerInterval = setInterval(() => {
      autoRefresh && setTimer((timer) => timer - 1);
    }, 1000);
    return () => {
      clearInterval(timerInterval);
      clearInterval(interval);
    };
  }, [autoRefresh, fetchData]);

  const saveAddresses = (e) => {
    e.preventDefault();
    if (wallets.length) {
      if (!window.confirm("This will clear your current list. Are you sure?"))
        return false;
    }
    const arrayOfAddresses = [
      ...new Set(
        addressList.split(/[\n,]+/).filter((addr) => addr.trim().length === 42)
      ),
    ];

    arrayOfAddresses.length === 0
      ? window.localStorage.clear()
      : window.localStorage.setItem(
          "dripAddresses",

          JSON.stringify(arrayOfAddresses.map((addr) => ({ addr, label: "" })))
        );
    setAddressList("");
    setWallets([]);
    fetchData();
  };

  const updatedAddresses = async (e) => {
    e.preventDefault();
    const arrayOfAddresses = [
      ...new Set(
        addressList.split(/[\n,]+/).filter((addr) => addr.trim().length === 42)
      ),
    ];

    const storedAddresses =
      JSON.parse(window.localStorage.getItem("dripAddresses")) ?? [];

    arrayOfAddresses.forEach((newAddress) => {
      if (!storedAddresses.some((sa) => sa.addr === newAddress)) {
        storedAddresses.push({ addr: newAddress, label: "" });
      }
    });
    window.localStorage.setItem(
      "dripAddresses",
      JSON.stringify(storedAddresses)
    );
    setAddressList("");
    fetchData();
  };

  const highlightStyleFor = (col, wallet) => {
    let amount,
      percent,
      style = "";
    switch (col) {
      case "amt":
        if (flagAmount) {
          amount = parseFloat(convertTokenToUSD(wallet.available));
          style =
            amount >= 1.0
              ? "hydrate inverted"
              : amount >= 0.5
              ? "prepare inverted"
              : "";
        }
        return style;
      case "pct":
        if (flagPct) {
          percent = parseFloat(wallet.available / wallet.deposits);
          style =
            percent >= 0.01
              ? "hydrate inverted"
              : percent >= 0.009
              ? "prepare inverted"
              : "";
        }
        return style;
      case "bnb":
        return flagLowBnb && wallet.bnbBalance < bnbThreshold
          ? "warning inverted"
          : "";
      default:
        return "";
    }
  };

  const addLabel = (index, label) => {
    let walletAddr;
    const newWallets = wallets.map((wallet) => {
      if (parseInt(wallet.index) === index) {
        walletAddr = wallet.address;
        return { ...wallet, label };
      } else {
        return { ...wallet };
      }
    });

    let storedWallets = JSON.parse(
      window.localStorage.getItem("dripAddresses")
    );
    storedWallets = storedWallets.map((wallet, index) => {
      if (walletAddr === wallet.addr) {
        return { addr: wallet.addr, label, group: wallet.group };
      } else {
        return { ...wallet };
      }
    });
    window.localStorage.setItem("dripAddresses", JSON.stringify(storedWallets));
    setWallets(newWallets);
  };

  const addGroup = (index, group) => {
    let walletAddr;
    const newWallets = wallets.map((wallet) => {
      if (parseInt(wallet.index) === index) {
        walletAddr = wallet.address;
        return { ...wallet, group };
      } else {
        return { ...wallet };
      }
    });

    let storedWallets = JSON.parse(
      window.localStorage.getItem("dripAddresses")
    );
    storedWallets = storedWallets.map((wallet, index) => {
      if (walletAddr === wallet.addr) {
        return { addr: wallet.addr, label: wallet.label, group };
      } else {
        return { ...wallet };
      }
    });
    window.localStorage.setItem("dripAddresses", JSON.stringify(storedWallets));
    setWallets(newWallets);
  };

  const changeHandler = (event) => {
    event.target.files[0].text().then((t) => {
      localStorage.setItem("dripAddresses", t);
    });
    window.location.reload(true);
  };

  const copyTableData = () => {
    const tableData = [
      ...wallets.map((w, index) => [
        index + 1,
        w.address,
        w.label,
        w.upline,
        w.uplineCount,
        w.busdBalance,
        formatNumber(w.br34pBalance),
        Math.round(w.dripBalance * 10e16) / 10e16,
        formatNumber(w.bnbBalance),
        w.available,
        formatPercent(w.available / w.deposits),
        w.deposits,
        w.ndv,
        w.payouts,
        `${w.direct_bonus + w.match_bonus}`,
        w.deposits * 3.65,
        `${w.referrals}/${w.total_structure}`,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");
    navigator.clipboard.writeText(tableData);
    setDataCopied(true);
  };

  const incrementBnbFlag = () => {
    setFlagLowBnb(true);
    let val = parseFloat(bnbThreshold);
    if (val < 0.1) {
      setBnbThreshold(
        parseFloat(parseFloat(val) + parseFloat(0.01)).toFixed(2)
      );
    }
  };

  const decrementBnbFlag = () => {
    setFlagLowBnb(true);
    let val = parseFloat(bnbThreshold);
    if (val > 0.01) {
      setBnbThreshold(
        parseFloat(parseFloat(val) - parseFloat(0.01)).toFixed(2)
      );
    }
  };

  const incrementNdvWarning = () => {
    setFlagLowNdv(true);
    let val = ndvWarningLevel;
    if (val < 50) {
      setNdvWarningLevel(val + 5);
    }
  };

  const decrementNdvWarning = () => {
    setFlagLowNdv(true);
    let val = ndvWarningLevel;
    if (val > 5) {
      setNdvWarningLevel(val - 5);
    }
  };
  useEffect(() => {
    const config = {
      flagAmount,
      flagLowBnb,
      flagPct,
      bnbThreshold,
      expandedTable,
      hideTableControls,
      showLastAction,
      ndvWarningLevel,
      selectedGroup,
      depositFilter,
    };

    localStorage.setItem(CONFIGS_KEY, JSON.stringify(config));
  }, [
    flagAmount,
    flagLowBnb,
    flagPct,
    bnbThreshold,
    expandedTable,
    hideTableControls,
    showLastAction,
    ndvWarningLevel,
    selectedGroup,
    depositFilter,
  ]);

  const deleteRow = (addr) => {
    if (!window.confirm("Delete row?")) {
      return false;
    }
    const temp = wallets.filter((wallet) => wallet.address !== addr);
    setWallets(temp);
    const stored = temp.map((t) => ({ addr: t.address, label: t.label }));
    localStorage.setItem("dripAddresses", JSON.stringify(stored));
  };

  const setSortBy = (col, order) => {
    setSortCol(col);
    setSortOrder(order);
  };

  return (
    <div className="container">
      <div className="main">
        {!!wallets.length && (
          <div>
            <div
              style={{
                backgroundColor: "green",
                width: `${timer}rem`,
                height: 2,
                marginBottom: 5,
                transition: `width 1s linear`,
              }}
            ></div>
            <div className="hideControlsBtn">
              <input
                id="hideControls"
                type="checkbox"
                className="btn-check"
                autoComplete="off"
                onChange={() => setHideTableControls(!hideTableControls)}
              ></input>
              <label htmlFor="hideControls" className="btn btn-primary btn-sm">
                {hideTableControls ? "Show" : "Hide"} Form Config
              </label>
            </div>
            <div
              className="controls"
              style={{ display: hideTableControls ? "block" : "flex" }}
            >
              <div className="form-config">
                {hideTableControls || (
                  <div className="alert">
                    <div>Available will highlight to indicate when it is</div>
                    <div>ready to claim or hydrate</div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        id="showLastAction"
                        type="checkbox"
                        checked={showLastAction}
                        onChange={() => setShowLastAction(!showLastAction)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="showLastAction"
                      >
                        Show Last Action
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        id="flagAmountChk"
                        type="checkbox"
                        checked={flagAmount}
                        onChange={() => setFlagAmount(!flagAmount)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="flagAmountChk"
                      >
                        Amount -{" "}
                        <span className="prepare">light green = .5+</span>,{" "}
                        <span className="hydrate">green = 1+</span>
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        id="flagPctChk"
                        type="checkbox"
                        checked={flagPct}
                        onChange={() => setFlagPct(!flagPct)}
                      />
                      <label className="form-check-label" htmlFor="flagPctChk">
                        Percent -{" "}
                        <span className="prepare">light green = .9%</span> ,{" "}
                        <span className="hydrate">green = 1%</span>
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        id="flagLowBnbChk"
                        type="checkbox"
                        checked={flagLowBnb}
                        onChange={() => setFlagLowBnb(!flagLowBnb)}
                      />
                      <label className="form-check-label input-spinner-label">
                        Low BNB:
                        <div className="inputSpinner">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={decrementBnbFlag}
                          >
                            -
                          </button>
                          <input
                            className="inputSpinner-control"
                            type="number"
                            value={bnbThreshold}
                            onChange={() => {}}
                            size={3}
                            disabled={true}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={incrementBnbFlag}
                          >
                            +
                          </button>
                        </div>
                        <span className="warning"> - yellow</span>
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        id="ndvWarningLevel"
                        type="checkbox"
                        checked={flagLowNdv}
                        onChange={() => setFlagLowNdv(!flagLowNdv)}
                      />
                      <label className="form-check-label input-spinner-label">
                        Low NDV %:
                        <div className="inputSpinner">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={decrementNdvWarning}
                          >
                            -
                          </button>
                          <input
                            className="inputSpinner-control"
                            type="number"
                            value={ndvWarningLevel}
                            onChange={() => {}}
                            size={2}
                            disabled={true}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={incrementNdvWarning}
                          >
                            +
                          </button>
                        </div>
                        <span className="warning"> - yellow</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              {hideTableControls || <Info backupData={backupData} />}
            </div>
          </div>
        )}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-options">
            <div className="table-options-ctrl">
              <button
                className="btn-copy btn btn-outline-secondary"
                onClick={copyTableData}
              >
                <i
                  className={`bi bi-clipboard${dataCopied ? "-check" : ""}`}
                ></i>
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
                  const maxDeposit = Math.max(
                    ...wallets.map((w) => w.deposits)
                  );
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
          </div>
        )}
        <table className="table">
          <thead className="table-light">
            <tr>
              {expandedTable
                ? TABLE_HEADERS.filter(
                    (h) =>
                      (h.label === "Last Action" && showLastAction) ||
                      h.label !== "Last Action"
                  ).map((h) => (
                    <th
                      className={`table-sort-${
                        sortCol === h.id ? sortOrder : "none"
                      }`}
                      key={h.id}
                      onClick={() =>
                        setSortBy(h.id, sortOrder === "asc" ? "desc" : "asc")
                      }
                    >
                      {h.label}
                    </th>
                  ))
                : BASE_HEADERS.filter(
                    (h) =>
                      (h.label === "Last Action" && showLastAction) ||
                      h.label !== "Last Action"
                  ).map((h) => (
                    <th
                      className={`table-sort-${
                        sortCol === h.id ? sortOrder : "none"
                      }`}
                      key={h.id}
                      onClick={() =>
                        setSortBy(h.id, sortOrder === "asc" ? "desc" : "asc")
                      }
                    >
                      {h.label}
                    </th>
                  ))}
            </tr>
            <tr className="table-success">
              <th> </th>
              <th>Totals - {wallets.length}</th>
              <th>
                {!!wallets.length && (
                  <div className="form-check form-switch">
                    <label className="form-check-label">Edit</label>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={editLabels}
                      onChange={() => {
                        setEditLabels(!editLabels);
                        setAutoRefresh(!autoRefresh);
                      }}
                    />
                  </div>
                )}
                {editLabels && <small>autorefresh paused</small>}
              </th>
              {expandedTable && <th></th>}
              {expandedTable && <th></th>}
              {expandedTable && (
                <th>{convertTokenToUSD(totalBusd, 1, showDollarValues)}</th>
              )}
              {expandedTable && (
                <th>
                  {convertTokenToUSD(totalBr34p, br34pPrice, showDollarValues)}
                </th>
              )}
              {expandedTable && (
                <th>
                  {convertTokenToUSD(
                    totalDripHeld,
                    dripPrice,
                    showDollarValues
                  )}
                </th>
              )}

              {expandedTable && (
                <th>
                  {convertTokenToUSD(
                    totalBnbBalance,
                    bnbPrice,
                    showDollarValues
                  )}
                </th>
              )}
              {expandedTable && <th>{formatNumber(totalDrops)}</th>}
              <th>
                {convertTokenToUSD(totalAvailable, dripPrice, showDollarValues)}
              </th>

              <th>{formatPercent(totalAvailable / totalDeposits)}%</th>

              <th>
                {convertTokenToUSD(totalDeposits, dripPrice, showDollarValues)}
              </th>

              {showLastAction && <th>Click row</th>}
              <th>{formatNumber(totalNDV)}</th>
              <th>
                {convertTokenToUSD(totalClaimed, dripPrice, showDollarValues)}
              </th>
              {expandedTable && (
                <th>
                  {convertTokenToUSD(
                    totalHydrated,
                    dripPrice,
                    showDollarValues
                  )}
                </th>
              )}
              <th>
                {convertTokenToUSD(
                  totalDirectBonus,
                  dripPrice,
                  showDollarValues
                )}
                {/* /{convertTokenToUSD(totalMatch, dripPrice, showDollarValues)} */}
              </th>
              <th>
                {convertTokenToUSD(
                  totalDeposits * 3.65,
                  dripPrice,
                  showDollarValues
                )}
              </th>
              <th>Directs: {totalTeam}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((wallet, index) => (
              <TableRow
                key={index}
                index={index}
                addLabel={addLabel}
                addGroup={addGroup}
                bnbPrice={bnbPrice}
                deleteRow={deleteRow}
                dripPrice={dripPrice}
                expandedTable={expandedTable}
                highlightStyleFor={highlightStyleFor}
                showDollarValues={showDollarValues}
                showLastAction={showLastAction}
                wallet={wallet}
                br34pPrice={br34pPrice}
                editLabels={editLabels}
                flagLowNdv={flagLowNdv}
                ndvWarningLevel={ndvWarningLevel}
              />
            ))}
          </tbody>
        </table>

        <div className="bottom-controls">
          <button
            type="button"
            className="btn btn-primary"
            onClick={saveAddresses}
            disabled={!addressList.length && !wallets.length}
          >
            {addressList.length ? "Save" : "Clear"} List
          </button>
          {!!wallets.length && (
            <button
              type="button"
              style={{ marginLeft: 10 }}
              className="btn btn-primary"
              onClick={updatedAddresses}
              disabled={!addressList.length}
            >
              Update List
            </button>
          )}
          <div>Paste one or more addresses:</div>
          <div>
            <textarea
              className="form-control inverted"
              id="addressList"
              rows={10}
              cols={50}
              value={addressList}
              onChange={(e) => setAddressList(e.target.value)}
            />
            <div>Or load a saved list of wallets and labels:</div>
            <div className="file-input-wrapper">
              <button type="button" className="btn btn-primary btn-file-input">
                Load backup file
              </button>
              <input
                className="form-control"
                type="file"
                name="file"
                onChange={changeHandler}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
