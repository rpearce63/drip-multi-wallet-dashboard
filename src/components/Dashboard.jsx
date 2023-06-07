import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  getDripPriceData,
  getAllWalletData,
  fetchWalletData,
  chunk,
} from "../api/Contract";
import { NumberPicker } from "react-widgets/cjs";
import { CONFIGS_KEY } from "../configs/dripconfig";
import * as MESSAGES from "../configs/messages";

import Info from "./Info";

import {
  convertTokenToUSD,
  formatPercent,
  backupData,
  formatNumber,
  sortBy,
} from "../api/utils";

import TableRow from "./TableRow";
import AdBox from "./AdBox";
import Web3 from "web3";
import TableOptions from "./TableOptions";
import { isUndefined } from "lodash";

const web3 = new Web3(Web3.givenProvider);

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
  const [totalMax, setTotalMax] = useState(0);
  const [totalDrops, setTotalDrops] = useState(0);
  const [sortCol, setSortCol] = useState("index");
  const [sortOrder, setSortOrder] = useState("asc");
  const [badAddresses, setBadAddresses] = useState([]);

  //form configs
  const [flagAmount, setFlagAmount] = useState(true);
  //const [amtWarningLevel, setAmtWarningLevel] = useState(0.5);
  const [amtReadyLevel, setAmtReadyLevel] = useState(1.0);
  const [flagPct, setFlagPct] = useState(true);
  const [pctWarningLevel] = useState(0.009);
  const [pctReadyLevel] = useState(0.01);
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

  const [expandedTable, setExpandedTable] = useState(true);
  const [hideTableControls, setHideTableControls] = useState(false);
  const [showDollarValues, setShowDollarValues] = useState(false);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [dripPrice, setDripPrice] = useState(0);
  const [br34pPrice, setBr34pPrice] = useState(0);
  const [showLastAction, setShowLastAction] = useState(true);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(isUndefined);

  const loadingRef = useRef(loading);
  const timeoutRef = useRef();

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
    { label: "DROPS / Daily BNB", id: "dropsBalance" },
    {
      label: `Available`,
      id: "available",
    },
    { label: "ROI", id: "roi" },
    { label: "Deposits", id: "deposits" },
    { label: "Last Action", id: "lastAction" },
    { label: "NDV", id: "ndv" },
    { label: "Claimed", id: "payouts" },
    { label: "Whale Tax", id: "whaleTax" },
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

  const REFRESH_INTERVAL = 120000;

  useEffect(() => {
    const {
      flagAmount = true,
      amtReadyLevel = 1.0,
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
    setAmtReadyLevel(amtReadyLevel);
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

  const fetchPrices = useCallback(async () => {
    const { bnbPrice, dripBnbRatio, br34pPrice } = await getDripPriceData();

    setDripPrice(() => (dripBnbRatio * bnbPrice) / 10e17);
    setBnbPrice(() => bnbPrice);
    setBr34pPrice(() => br34pPrice);
  }, []);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      loadingError !== "retry" && setLoadingError(undefined);
    } else {
      timeoutRef.current = setTimeout(() => {
        if (loadingRef.current) {
          //setLoadingError("timeout");
          window.scrollTo({ top: 0 });
        }
        // setLoading(false);
      }, 10000);
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [loading, loadingError]);

  const fetchWalletsIndv = useCallback(async (validWallets) => {
    console.log("loading wallets one at a time");

    window.scrollTo({ top: 0 });
    let index = 0;
    try {
      setLoadingError("individual");
      for (const wallet of validWallets) {
        //console.log("fetching data for ", wallet.addr);
        const data = await fetchWalletData(wallet, index++);
        setWallets((current) =>
          current.map((c) => (c.address === data.address ? data : c))
        );
        setFullList((current) =>
          current.map((c) => (c.address === data.address ? data : c))
        );
      }
    } catch (error) {
      console.log("failed to get wallets individually. Retry on next cycle.");
      setLoadingError("retry");
      return true;
    }
    console.log("resetting loading error value.");
    setLoadingError(undefined);
    return true;
  }, []);

  useEffect(() => {
    wallets.length &&
      localStorage.setItem(
        "dripWalletCache",
        JSON.stringify({ data: wallets, lastSaved: new Date().getTime() })
      );
  }, [wallets]);

  const fetchData = useCallback(
    async (refresh = false) => {
      console.log("fetching data");
      setLoading(true);
      setTimer(REFRESH_INTERVAL / 1000);

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
      const validWallets = myWallets.filter((w) =>
        web3.utils.isAddress(w.addr)
      );

      let walletCache;
      const storedWalletCache = JSON.parse(
        localStorage.getItem("dripWalletCache")
      );
      if (
        !refresh &&
        storedWalletCache?.data?.length &&
        storedWalletCache.lastSaved > new Date().getTime() - REFRESH_INTERVAL
      ) {
        console.log("got stored wallet cache.");
        walletCache = storedWalletCache.data;
        setFullList(walletCache);
        setWallets(walletCache);
      } else {
        try {
          const start = new Date();
          console.log("trying to get all wallet data.");
          const chunks = chunk(validWallets, 10);
          //setWallets([]);
          //setFullList([]);
          let index = 0;
          for (const chunk of chunks) {
            const chunkData = await getAllWalletData(chunk, index);
            //await fetchWalletsIndv(validWallets);

            setFullList((current) => [
              ...current.filter(
                (c) => !chunkData.find((w) => w.address === c.address)
              ),
              ...chunkData,
            ]);
            setWallets((current) => [
              ...current.filter(
                (c) => !chunkData.find((w) => w.address === c.address)
              ),
              ...chunkData,
            ]);
            index += 10;
          }
          const end = new Date();
          console.log(`got wallet data in ${(end - start) / 1000} seconds`);
          setLoadingError(undefined);
        } catch (err) {
          console.log("Error getting all wallet data: ", err.message);
          await fetchWalletsIndv(validWallets);
        }
      }

      setDataCopied(false);
      setLoading(false);
      fetchPrices();
      // localStorage.setItem(
      //   "dripWalletCache",
      //   JSON.stringify({ data: walletCache, lastSaved: new Date().getTime() })
      // );
    },
    [fetchPrices, fetchWalletsIndv]
  );

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
    setTotalMax(() =>
      validWallets.reduce(
        (total, wallet) => total + parseFloat(wallet.maxPayout),
        0
      )
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
      localStorage.removeItem("dripWalletCache");
      autoRefresh && !loadingRef.current && fetchData();
    }, REFRESH_INTERVAL);
    const timerInterval = setInterval(() => {
      autoRefresh && !loadingRef.current && setTimer((timer) => timer - 1);
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
    localStorage.removeItem("dripWalletCache");
    checkValidAddresses(addressList);

    const arrayOfAddresses = [
      ...new Set(
        addressList
          .split(/[\n, ]+/)
          .filter((addr) => web3.utils.isAddress(addr.trim()))
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

    checkValidAddresses(addressList);

    const arrayOfAddresses = [
      ...new Set(
        addressList
          .split(/[\n, ]+/)
          .filter((addr) => web3.utils.isAddress(addr.trim()))
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
    localStorage.removeItem("dripWalletCache");
    setAddressList("");
    fetchData();
  };

  const checkValidAddresses = (listOfAddresses) => {
    const invalidAddresses = listOfAddresses
      .split(/[\n, ]+/)
      .filter((addr) => !web3.utils.isAddress(addr.trim()))
      .filter((a) => a.length);
    if (invalidAddresses.length) setBadAddresses([...invalidAddresses]);
  };

  const highlightStyleFor = (col, wallet) => {
    let amount,
      percent,
      style = "";
    switch (col) {
      case "amt":
        if (flagAmount) {
          amount = Number(wallet.available);
          //console.log(`amount: ${amount}, amtReadyLevel: ${amtReadyLevel}, ${amount >= amtReadyLevel}`);
          style =
            amount >= amtReadyLevel
              ? "hydrate inverted"
              : amount >= amtReadyLevel * 0.9
              ? "prepare inverted"
              : "";
        }
        return style;
      case "pct":
        if (flagPct) {
          percent = parseFloat(wallet.available / wallet.deposits);
          style =
            percent >= pctReadyLevel
              ? "hydrate inverted"
              : percent >= pctWarningLevel
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
    localStorage.removeItem("dripWalletCache");
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
    localStorage.removeItem("dripWalletCache");
    setWallets(newWallets);
  };

  const changeHandler = (event) => {
    event.target.files[0].text().then((t) => {
      localStorage.setItem("dripAddresses", t);
      localStorage.removeItem("dripWalletCache");
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

  useEffect(() => {
    const config = {
      flagAmount,
      amtReadyLevel,
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
    amtReadyLevel,
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
    const stored = temp.map((t) => ({
      addr: t.address,
      label: t.label,
      group: t.group,
    }));
    localStorage.setItem("dripAddresses", JSON.stringify(stored));
    localStorage.setItem(
      "dripWalletCache",
      JSON.stringify({ data: temp, lastSaved: new Date().getTime() })
    );
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
                width: `${(timer / (REFRESH_INTERVAL / 1000) / 2) * 100}vw`,
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
                      Amount:
                      <NumberPicker
                        containerClassName="config-control"
                        precision={1}
                        defaultValue={0.5}
                        step={0.1}
                        min={0.1}
                        max={1000}
                        value={amtReadyLevel}
                        onChange={(value) => setAmtReadyLevel(value)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="flagAmountChk"
                      >
                        <span className="prepare">
                          light green ={" "}
                          {parseFloat(amtReadyLevel * 0.9).toFixed(1)}+
                        </span>
                        ,{" "}
                        <span className="hydrate">
                          green = {amtReadyLevel}+
                        </span>
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
                        <span>Percent: </span>
                        <span className="prepare">
                          light green = .9%
                        </span> , <span className="hydrate">green = 1%</span>
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
                      Low BNB:
                      <NumberPicker
                        containerClassName="config-control"
                        defaultValue={bnbThreshold}
                        step={0.01}
                        min={0.01}
                        max={0.1}
                        value={parseFloat(bnbThreshold)}
                        onChange={(value) => setBnbThreshold(value)}
                      />
                      <label className="form-check-label input-spinner-label">
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
                      <span>Low NDV %:</span>
                      <NumberPicker
                        containerClassName="config-control"
                        defaultValue={ndvWarningLevel}
                        step={1}
                        min={1}
                        max={100}
                        value={parseInt(ndvWarningLevel)}
                        onChange={(value) => setNdvWarningLevel(value)}
                      />
                      <label className="form-check-label input-spinner-label">
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
        {loading && !wallets.length && <div className="loading" />}
        {/* {loadingError === "timeout" && !wallets.length && (
          <div className="alert alert-danger">
            It's taking longer to load than normal. Please be patient.
          </div>
        )} */}
        {loadingError === "individual" && (
          <div className="alert alert-warning">
            The network is not cooperating. Getting the wallet data one at a
            time. Please be patient.
          </div>
        )}
        {loadingError === "retry" && (
          <div className="alert alert-warning">
            I wasn't able to load the data this time. I'll try again in a few
            minutes.
          </div>
        )}
        <TableOptions
          copyTableData={copyTableData}
          dataCopied={dataCopied}
          expandedTable={expandedTable}
          setExpandedTable={setExpandedTable}
          showDollarValues={showDollarValues}
          setShowDollarValues={setShowDollarValues}
          depositFilter={depositFilter}
          setDepositFilter={setDepositFilter}
          wallets={wallets}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          groups={groups}
          MESSAGES={MESSAGES}
          backupData={backupData}
          fetchData={fetchData}
        />

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
              <th className="red">X</th>
              <th>Totals - {wallets.length}</th>
              <th>
                {!!wallets.length && (
                  <div
                    className="form-check form-switch"
                    style={{ display: "table-cell" }}
                  >
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
                {showDollarValues && (
                  <span style={{ display: "table" }}>(after tax)</span>
                )}
                {convertTokenToUSD(
                  totalAvailable * (showDollarValues ? 0.81 : 1),
                  dripPrice,
                  showDollarValues
                )}
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
              {expandedTable && <th></th>}
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
                {convertTokenToUSD(totalMax, dripPrice, showDollarValues)}
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
        <div className="bottom-section">
          <div className="bottom-controls">
            {badAddresses.length ? (
              <div className="alert alert-warning">
                The following addresses are invalid. Please check them for
                errors. Common issues are spaces in the middle of the address,
                which will show as two short lines below, and the letter 'O' at
                the beginning instead of the number 0 (zero)
                <ul>
                  {badAddresses.map((ba) => (
                    <li key={ba}>{ba}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <></>
            )}
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
                placeholder={`Paste addresses one per line or separated by commas. 
No quotes or other characters. 
Ex:
0x1232DeFD265F86452AE72c9411a607BB73CCEe00
0x123620F3B7f80cEF56e17a307168B17bE7ece914
0x123461dE02069caa63b367255d39D393a8F2Ee1b
                `}
                className="form-control inverted"
                id="addressList"
                rows={10}
                cols={50}
                value={addressList}
                onChange={(e) => setAddressList(e.target.value)}
              />
              <div>Or load a saved list of wallets and labels:</div>
              <div className="file-input-wrapper">
                <button
                  type="button"
                  className="btn btn-primary btn-file-input"
                >
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
          <AdBox />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
