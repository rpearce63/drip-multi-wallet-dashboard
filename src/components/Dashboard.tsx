import React, { useState, useEffect, useCallback } from "react";
import {getAllWalletData} from "../api/Contract";

import { CONFIGS_KEY } from "../configs/dripconfig";

import Info from "./Info";

import {
  convertTokenToUSD,
  formatPercent,
  backupData,
  formatNumber,
  sortBy,
} from "../api/utils";

import TableRow from "./TableRow";
import {Wallet} from "../types/types";
import {getDripPriceData, getFurioPriceData} from "../api/pricingAPI";

const Dashboard = () => {
  const [wallets, setWallets] = useState([] as Wallet[]);
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

  const [editLabels, setEditLabels] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dataCopied, setDataCopied] = useState(false);

  const [expandedTable, setExpandedTable] = useState(false);
  const [furioEnabled, enableFurio] = useState(false);
  const [hideTableControls, setHideTableControls] = useState(true);
  const [showDollarValues, setShowDollarValues] = useState(false);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [dripPrice, setDripPrice] = useState(0);
  const [furioPrice, setFurioPrice] = useState(0);
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
  const FURIO_HEADERS = [
    { label: "Furio", id: "furioBalance" },
    { label: "Vault", id: "furioVaultBalance" },
    { label: "Avail", id: "furioAvailable" },
    { label: "Rate", id: "furioRewardRate" },
    { label: "AutoComp Rem/Tot", id: "furioAutoCompound" },
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
      furioEnabled = false,
      hideTableControls = false,
      showLastAction = true,
      ndvWarningLevel = 25,
    } = JSON.parse(localStorage.getItem(CONFIGS_KEY)) ?? {};

    setFlagAmount(() => flagAmount);
    setFlagLowBnb(() => flagLowBnb);
    setFlagPct(() => flagPct);
    setBnbThreshold(() => bnbThreshold);
    setExpandedTable(() => expandedTable);
    enableFurio(() => furioEnabled);
    setHideTableControls(() => hideTableControls);
    setShowLastAction(() => showLastAction);
    setNdvWarningLevel(() => ndvWarningLevel);
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
    setWallets(filtered);
  }, [depositFilter, fullList]);

  const fetchPrices = useCallback(async () => {
    const { bnbPrice, dripBnbRatio, br34pPrice } = await getDripPriceData();
    const { furioBnbRatio } = await getFurioPriceData();

    setDripPrice(() => (dripBnbRatio * bnbPrice) / 10e17);
    setFurioPrice(() => (furioBnbRatio * bnbPrice) / 10e17);
    setBnbPrice(() => bnbPrice);
    setBr34pPrice(() => br34pPrice);
  }, []);

  const getStoredWallets = () => {
    const storedWallets = JSON.parse(
      window.localStorage.getItem("dripAddresses")
    );
    console.log(storedWallets);
    return storedWallets;
  };

  const fetchData = useCallback(async () => {
    setTimer(60);

    let storedWallets = JSON.parse(
      window.localStorage.getItem("dripAddresses")
    );

    const myWallets =
      storedWallets?.map((wallet) => ({
        addr: wallet.addr.trim().replace("\n", ""),
        label: wallet.label,
      })) ?? [];

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
        return total + wallet.deposits;
      }, 0)
    );
    setTotalDripHeld(() =>
      validWallets.reduce((total, wallet) => {
        return total + wallet.dripBalance;
      }, 0)
    );
    setTotalBnbBalance(() =>
      validWallets.reduce((total, wallet) => {
        return total + wallet.bnbBalance;
      }, 0)
    );
    setTotalAvailable(() =>
      validWallets.reduce((total, wallet) => {
        return total + wallet.available;
      }, 0)
    );
    setTotalClaimed(() =>
      validWallets.reduce((total, wallet) => {
        return total + wallet.payouts;
      }, 0)
    );
    setTotalDirectBonus(() =>
      validWallets.reduce((total, wallet) => {
        return total + wallet.direct_bonus;
      }, 0)
    );

    setTotalBr34p(() =>
      validWallets.reduce(
        (total, wallet) => total + wallet.br34pBalance,
        0
      )
    );
    setTotalTeam(() =>
      validWallets.reduce(
        (total, wallet) => total + wallet.referrals,
        0
      )
    );
    setTotalBusd(() =>
      validWallets.reduce(
        (total, wallet) => total + wallet.busdBalance,
        0
      )
    );
    setTotalHydrated(() =>
      validWallets.reduce((total, wallet) => total + wallet.r, 0)
    );
    setTotalNDV(() =>
      validWallets.reduce((total, wallet) => total + wallet.ndv, 0)
    );
    setTotalDrops(() =>
      validWallets.reduce(
        (total, wallet) => total + wallet.dropsBalance,
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

  const highlightStyleFor = (col, wallet: Wallet) => {
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
          percent = parseFloat(`${wallet.available / wallet.deposits}`);
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
      case "furioPct":
        percent = wallet.furioAvailable /(wallet.furioVaultBalance * wallet.furioRewardRate);
        style =
            percent >= 1
                ? "hydrate inverted"
                : percent >= 0.5
                    ? "prepare inverted"
                    : "";
        return style;
      case "furioAutoComp":
        return wallet.furioAutoCompoundEnabled && wallet.furioAutoCompoundsLeft < 2
            ? "warning inverted"
            : "";
      default:
        return "";
    }
  };

  const addLabel = (index, label) => {
    let walletAddr;
    const newWallets = wallets.map((wallet) => {
      if (wallet.index === index) {
        walletAddr = wallet.address;
        return { ...wallet, label };
      } else {
        return { ...wallet };
      }
    });

    let storedWallets = JSON.parse(
      window.localStorage.getItem("dripAddresses")
    );
    storedWallets = storedWallets.map((wallet) => {
      if (walletAddr === wallet.addr) {
        return { addr: wallet.addr, label };
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
    window.location.reload();
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
    let val = parseFloat(`${bnbThreshold}`);
    if (val < 0.1) {
      setBnbThreshold(
        Number(parseFloat(`${parseFloat(`${val}`) + 0.01}`).toFixed(2))
      );
    }
  };

  const decrementBnbFlag = () => {
    setFlagLowBnb(true);
    let val = parseFloat(`${bnbThreshold}`);
    if (val > 0.01) {
      setBnbThreshold(
        Number(parseFloat(`${parseFloat(`${val}`) - 0.01}`).toFixed(2))
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
    };

    localStorage.setItem(CONFIGS_KEY, JSON.stringify(config));
  }, [
    flagAmount,
    flagLowBnb,
    flagPct,
    bnbThreshold,
    expandedTable,
    furioEnabled,
    hideTableControls,
    showLastAction,
    ndvWarningLevel,
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

  const getHeaders = () => {
    let headers = expandedTable ? TABLE_HEADERS : BASE_HEADERS;
    headers = furioEnabled ? [...headers, ...FURIO_HEADERS] : headers;
    return headers;
  }

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
            />
            <div className="hideControlsBtn">
              <input
                id="hideControls"
                type="checkbox"
                className="btn-check"
                autoComplete="off"
                onChange={() => setHideTableControls(!hideTableControls)}
              />
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
                    <div className="formCheck">
                      Filter deposits &gt;{" "}
                      <input
                        type="text"
                        size={10}
                        value={depositFilter}
                        onChange={(e) => {
                          let numeric = parseInt(e.target.value.replace(/\D/g, ""));
                          if (!numeric) numeric = 0;
                          const maxDeposit = Math.max(
                            ...fullList.map((w) => w.deposits)
                          );
                          if (numeric > maxDeposit) {
                            numeric = depositFilter;
                          }

                          setDepositFilter(numeric);
                        }}
                      />
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
            <button
              className="btn-copy btn btn-outline-secondary"
              onClick={copyTableData}
            >
              <i className={`bi bi-clipboard${dataCopied ? "-check" : ""}`}/>
              Copy table
            </button>
            <div className="form-check">
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
            <div className="form-check">
              <input
                  id="furioEnabled"
                  className="form-check-input"
                  type="checkbox"
                  checked={furioEnabled}
                  onChange={() => enableFurio(!furioEnabled)}
              />
              <label htmlFor="furioEnabled" className="form-check-label">
                Furio Enabled
              </label>
            </div>
            <div className="form-check form-switch">
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
          </div>
        )}
        <table className="table">
          <thead className="table-light">
            <tr>
              {
                getHeaders().filter(
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
              {expandedTable && <th/>}
              {expandedTable && <th/>}
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
              <th/>
            </tr>
          </thead>
          <tbody>
            {wallets.map((wallet, index) => (
              <TableRow
                key={index}
                index={index}
                addLabel={addLabel}
                bnbPrice={bnbPrice}
                deleteRow={deleteRow}
                dripPrice={dripPrice}
                furioPrice={furioPrice}
                expandedTable={expandedTable}
                furioEnabled={furioEnabled}
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
