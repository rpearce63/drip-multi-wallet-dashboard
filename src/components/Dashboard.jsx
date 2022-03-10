import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  
  getUserInfo,
  claimsAvailable,
  getContract,
  getUplineCount,
  getBr34pBalance,
  getBnbBalance,
  getDripPrice,
  getBr34pPrice,
  getDownlineDepth,
  getAirdrops,
  getTokenBalance,
  getUnpaidEarnings,
  getStartBlock,
  getLastAction,
  getShares,
  getDownline,
  //getBabyDripPrice,
} from "../api/Contract";

//import {calcBabyDripPrice} from './tokenPriceApi'
import {
  BUSD_TOKEN_ADDRESS,
  DRIP_BUSD_LP_ADDRESS,
  DRIP_TOKEN_ADDR,
  BABYDRIP_TOKEN,
  CONFIGS_KEY,
  adminWallet
} from "../configs/dripconfig";
import Info from "./Info";

import {
  convertTokenToUSD,
  formatPercent,
  shortenAddress,
  backupData,
  findFibIndex,
} from "../api/utils";

import Web3 from "web3";

const Dashboard = () => {
  const [web3, setWeb3] = useState();
  const [contract, setContract] = useState();
  const [wallets, setWallets] = useState([]);
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

  // const [newAddress, setNewAddress] = useState("");
  const [flagAmount, setFlagAmount] = useState(true);
  const [flagPct, setFlagPct] = useState(true);
  const [flagLowBnb, setFlagLowBnb] = useState(true);
  const [editLabels, setEditLabels] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dataCopied, setDataCopied] = useState(false);
  const [bnbThreshold, setBnbThreshold] = useState(0.05);
  const [expandedTable, setExpandedTable] = useState(false);
  const [hideTableControls, setHideTableControls] = useState(false);
  const [showDollarValues, setShowDollarValues] = useState(false);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [dripPrice, setDripPrice] = useState(0);
  const [br34pPrice, setBr34pPrice] = useState(0);
  const [showBabyDrip, setShowBabyDrip] = useState(false);
  //const [babyDripPrice, setBabyDripPrice] = useState(0);
  const [totalBabyDrip, setTotalBabyDrip] = useState(0);
  const [totalReflections, setTotalReflections] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [showLastAction, setShowLastAction] = useState(true);
  const TABLE_HEADERS = [
    "#",
    "Address",
    "Label",
    "Buddy",
    "Uplines",
    "BUSD",
    "BR34P",
    "Drip",
    "BNB",
    "Available",
    "ROI",
    "Deposits",
    "Last Action",
    "NDV",
    "Claimed",
    "Rewarded",
    "Max Payout",
    "Team",
  ];
  const BASE_HEADERS = [
    "#",
    "Address",
    "Label",
    "Available",
    "ROI",
    "Deposits",
    "Last Action",
    "NDV",
    "Claimed",
    "Rewarded",
    "Max Payout",
    "Team",
  ];
  const BABYDRIP_COLS = ["Baby Drip", "Reflections", "Unpaid"];
  // let contract;

  useEffect(() => {
    const {
      flagAmount = true,
      flagLowBnb = true,
      flagPct = true,
      bnbThreshold = 0.05,
      expandedTable = false,
      hideTableControls = false,
      showLastAction = true,
    } = JSON.parse(localStorage.getItem(CONFIGS_KEY)) ?? {};

    setFlagAmount(() => flagAmount);
    setFlagLowBnb(() => flagLowBnb);
    setFlagPct(() => flagPct);
    setBnbThreshold(() => bnbThreshold);
    setExpandedTable(() => expandedTable);
    setHideTableControls(() => hideTableControls);
    setShowBabyDrip(() => false);
    setShowLastAction(() => showLastAction);
  }, []);

  const fetchData = async () => {
    //web3 = web3 ?? (await getConnection());
    //contract = contract ?? (await getContract(web3));
    const startBlock = await getStartBlock();

    const adminDownline = await getDownline(adminWallet.addr)
    let defaultWallets = [adminWallet, ...adminDownline.children.map(d => ({addr: d.id}))];
    let storedWallets = JSON.parse(
      window.localStorage.getItem("dripAddresses")
    ) ?? [];
    if(defaultWallets.length > storedWallets.length) {
      storedWallets = storedWallets.concat(defaultWallets.slice(storedWallets.length))
    }
    localStorage.setItem("dripAddresses", JSON.stringify(storedWallets));

    // if (storedWallets && !storedWallets[0].addr) {
    //   console.log("converting addresses");
    //   const convertedWallets = storedWallets.map((wallet) => ({
    //     addr: wallet,
    //     label: "",
    //   }));
    //   
    //   storedWallets = convertedWallets;
    // }

    const myWallets =
      storedWallets?.map((wallet) => ({
        addr: wallet.addr.trim().replace("\n", ""),
        label: wallet.label,
      })) ?? [adminWallet];

      //localStorage.setItem("dripAddresses", JSON.stringify(myWallets));
    let walletCache = [];
    myWallets.forEach(async (wallet, index) => {
      const userInfo = await getUserInfo(contract, wallet.addr);
      const available = await claimsAvailable(contract, wallet.addr);
      const dripBalance = await getTokenBalance(
        web3,
        wallet.addr,
        DRIP_TOKEN_ADDR
      );
      const uplineCount = await getUplineCount(contract, wallet.addr);
      const br34pBalance = await getBr34pBalance(web3, wallet.addr);
      const bnbBalance = await getBnbBalance(web3, wallet.addr);

      const busdBalance = await getTokenBalance(
        web3,
        wallet.addr,
        BUSD_TOKEN_ADDRESS
      );
      const dripBusdLpBalance = await getTokenBalance(
        web3,
        wallet.addr,
        DRIP_BUSD_LP_ADDRESS
      );

      const coveredDepth = findFibIndex(br34pBalance);
      const teamDepth =
        userInfo.referrals > 0 && (await getDownlineDepth(wallet.addr));

      const { airdrops } = await getAirdrops(contract, wallet.addr);
      const a = parseFloat(web3.utils.fromWei(airdrops));
      const d = parseFloat(web3.utils.fromWei(userInfo.deposits));
      const r = parseFloat(web3.utils.fromWei(userInfo.rolls));
      const c = parseFloat(web3.utils.fromWei(userInfo.payouts));

      const ndv = parseFloat(d + a + r - c).toFixed(3);
      const babyDripBalance =
        showBabyDrip && parseFloat(await getTokenBalance(web3, wallet.addr, BABYDRIP_TOKEN)) *
        10e8;

      const { babyDripReflections } =
        babyDripBalance > 0 && (await getShares(wallet.addr, web3));

      const babyDripUnpaid =
        babyDripBalance > 0 ? await getUnpaidEarnings(wallet.addr, web3) : 0;
      // console.log(`reflections: ${babyDripReflections}
      //   unpaid: ${babyDripBalance}`);
      const valid = !!userInfo;
      const referral_bonus =
        parseFloat(userInfo.direct_bonus) + parseFloat(userInfo.match_bonus);

      const lastAction =
        showLastAction && (await getLastAction(startBlock, wallet.addr));
      walletCache = [
        ...walletCache,
        {
          index,
          ...userInfo,
          deposits: userInfo.deposits / 10e17,
          available: available / 10e17,
          payouts: userInfo.payouts / 10e17,
          direct_bonus: referral_bonus / 10e17,

          address: wallet.addr,
          label: wallet.label,
          valid,
          dripBalance,
          br34pBalance,
          uplineCount,
          bnbBalance,
          coveredDepth,
          teamDepth,
          ndv,
          busdBalance,
          dripBusdLpBalance,
          babyDripBalance,
          babyDripReflections: babyDripReflections ?? 0,
          babyDripUnpaid: babyDripUnpaid ?? 0,
          lastAction,
        },
      ];

      setWallets(() => [...walletCache]);
      setDataCopied(false);

      // setRevPrice(() => revPrice);
    });
    const [bnbPrice, dripPrice] = await getDripPrice(web3);
    const br34pPrice = await getBr34pPrice();
    //const revPrice = await calcREVPrice();
    //const babyDripPrice = await calcBabyDripPrice(web3);
    //setBabyDripPrice(() => babyDripPrice);
    setDripPrice(() => (dripPrice * bnbPrice) / 10e17);
    setBnbPrice(() => bnbPrice);
    setBr34pPrice(() => br34pPrice);
  };

  useEffect(() => {
    const validWallets = wallets.filter((wallet) => wallet.valid);

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
    // setTotalMatch(() =>
    //   validWallets.reduce((total, wallet) => {
    //     return total + parseFloat(wallet.match_bonus);
    //   }, 0)
    // );
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
    setTotalBabyDrip(() =>
      validWallets.reduce(
        (total, wallet) => total + parseFloat(wallet.babyDripBalance),
        0
      )
    );
    setTotalReflections(() =>
      validWallets.reduce(
        (total, wallet) => total + parseFloat(wallet.babyDripReflections),
        0
      )
    );
    setTotalUnpaid(() =>
      validWallets.reduce(
        (total, wallet) => total + parseFloat(wallet.babyDripUnpaid),
        0
      )
    );
  }, [wallets]);

  useEffect(() => {
    const web3 = new Web3(
      "https://bsc-dataseed.binance.org/"
    );
    web3.eth.net.isListening().then(() => {
      setWeb3(web3);
    });
  }, []);

  useEffect(() => {
    if (web3) {
      setContract(getContract(web3));
    }
  }, [web3]);

  useEffect(() => {
    web3 && contract && fetchData();
    const interval = setInterval(() => {
      autoRefresh && fetchData();
    }, 60000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3, contract, autoRefresh]);

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

  // const addNewAddress = async (e) => {
  //   e.preventDefault();
  //   const web3 = await getConnection();
  //   if (!web3.utils.isAddress(newAddress)) {
  //     alert("Invalid Address");
  //     return false;
  //   }
  //   const storedAddresses =
  //     JSON.parse(window.localStorage.getItem("dripAddresses")) ?? [];
  //   if (!storedAddresses.some((sa) => sa.addr === newAddress)) {
  //     storedAddresses.push({ addr: newAddress, label: "" });
  //     window.localStorage.setItem(
  //       "dripAddresses",
  //       JSON.stringify(storedAddresses)
  //     );

  //     setNewAddress("");
  //     fetchData();
  //   }
  // };

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
        return { addr: wallet.addr, label };
      } else {
        return { ...wallet };
      }
    });
    window.localStorage.setItem("dripAddresses", JSON.stringify(storedWallets));
    setWallets(newWallets);
  };

  // const changeHandler = (event) => {
  //   event.target.files[0].text().then((t) => {
  //     localStorage.setItem("dripAddresses", t);
  //   });
  //   window.location.reload(true);
  // };

  const copyTableData = () => {
    const tableData = [
      [
        ...TABLE_HEADERS.filter(
          (th) => !["Baby Drip", "Reflections"].includes(th)
        ),
      ],
      ...wallets.map((w, index) => [
        index + 1,
        w.address,
        w.label,
        w.upline,
        w.uplineCount,
        w.busdBalance,
        parseFloat(w.br34pBalance).toFixed(2),
        Math.round(w.dripBalance * 10e16) / 10e16,
        parseFloat(w.bnbBalance).toFixed(3),
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

  useEffect(() => {
    const config = {
      flagAmount,
      flagLowBnb,
      flagPct,
      bnbThreshold,
      expandedTable,
      hideTableControls,
      showBabyDrip,
      showLastAction,
    };

    localStorage.setItem(CONFIGS_KEY, JSON.stringify(config));
  }, [
    flagAmount,
    flagLowBnb,
    flagPct,
    bnbThreshold,
    expandedTable,
    hideTableControls,
    showBabyDrip,
    showLastAction,
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

  return (
    <div className="container">
      <div className="main">
        {!!wallets.length && (
          <div>
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
                {/* <div className="input-group mb-3 add-address">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={addNewAddress}
                    disabled={!!!newAddress || newAddress.length !== 42}
                  >
                    Add
                  </button>
                  <input
                    className="form-control inverted"
                    id="newAddressTxt"
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Add additional single wallet"
                  />
                </div> */}

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
                    {/* <div className="form-check">
                      <input
                        className="form-check-input"
                        id="flagShowBabyDrip"
                        type="checkbox"
                        checked={showBabyDrip}
                        onChange={() => setShowBabyDrip(!showBabyDrip)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="flagShowBabyDrip"
                      >
                        Show Baby Drip
                      </label>
                    </div> */}
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
                  </div>
                )}
              </div>
              {hideTableControls || <Info backupData={backupData} />}
            </div>
          </div>
        )}
        {!!wallets.length && (
          <div className="table-options">
            <button
              className="btn-copy btn btn-outline-secondary"
              onClick={copyTableData}
            >
              <i className={`bi bi-clipboard${dataCopied ? "-check" : ""}`}></i>
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
              {expandedTable
                ? TABLE_HEADERS.concat(showBabyDrip ? BABYDRIP_COLS : [])
                    .filter(
                      (h) =>
                        (h === "Last Action" && showLastAction) ||
                        h !== "Last Action"
                    )
                    .map((h) => <th key={h}>{h}</th>)
                : BASE_HEADERS.filter(
                    (h) =>
                      (h === "Last Action" && showLastAction) ||
                      h !== "Last Action"
                  ).map((h) => <th key={h}>{h}</th>)}
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

              <th>
                {convertTokenToUSD(totalAvailable, dripPrice, showDollarValues)}
              </th>

              <th>{formatPercent(totalAvailable / totalDeposits)}%</th>

              <th>
                {convertTokenToUSD(totalDeposits, dripPrice, showDollarValues)}
              </th>
              {showLastAction && <th></th>}
              <th></th>
              <th>
                {convertTokenToUSD(totalClaimed, dripPrice, showDollarValues)}
              </th>
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
              {expandedTable && showBabyDrip && (
                <>
                  <th>{convertTokenToUSD(totalBabyDrip, 0, false)}</th>

                  <th>
                    {convertTokenToUSD(
                      totalReflections,
                      dripPrice,
                      showDollarValues
                    )}
                  </th>
                  <th>
                    {convertTokenToUSD(
                      totalUnpaid,
                      dripPrice,
                      showDollarValues
                    )}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {wallets
              .sort((a, b) => a.index - b.index)
              .map((wallet, index) => (
                <tr key={wallet.address}>
                  <td
                    className="rowIndex"
                    onClick={() => deleteRow(wallet.address)}
                  >
                    <span>{index + 1}</span>
                  </td>
                  <td
                    className={wallet.valid ? "" : "invalid"}
                    onClick={(e) =>
                      navigator.clipboard.writeText(wallet.address)
                    }
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
                    <td>
                      {convertTokenToUSD(
                        wallet.busdBalance,
                        1,
                        showDollarValues
                      )}
                    </td>
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
                      {convertTokenToUSD(
                        wallet.dripBalance,
                        dripPrice,
                        showDollarValues
                      )}
                    </td>
                  )}

                  {expandedTable && (
                    <>
                      <td className={highlightStyleFor("bnb", wallet)}>
                        {convertTokenToUSD(
                          wallet.bnbBalance,
                          bnbPrice,
                          showDollarValues
                        )}
                      </td>
                    </>
                  )}
                  <td className={highlightStyleFor("amt", wallet)}>
                    {convertTokenToUSD(
                      wallet.available,
                      dripPrice,
                      showDollarValues
                    )}
                  </td>

                  <td className={highlightStyleFor("pct", wallet)}>
                    {formatPercent(wallet.available / wallet.deposits)}%
                  </td>

                  <td>
                    {convertTokenToUSD(
                      wallet.deposits,
                      dripPrice,
                      showDollarValues
                    )}
                  </td>
                  {showLastAction && <td>{wallet.lastAction}</td>}
                  <td
                    className={
                      wallet.ndv / wallet.deposits <= 0.25
                        ? "warning inverted"
                        : ""
                    }
                  >
                    {wallet.ndv}
                  </td>
                  <td>
                    {convertTokenToUSD(
                      wallet.payouts,
                      dripPrice,
                      showDollarValues
                    )}
                  </td>
                  <td>
                    {convertTokenToUSD(
                      wallet.direct_bonus,
                      dripPrice,
                      showDollarValues
                    )}
                    {/* /
                    {convertTokenToUSD(
                      wallet.match_bonus,
                      dripPrice,
                      showDollarValues
                    )} */}
                  </td>
                  <td>
                    {convertTokenToUSD(
                      wallet.deposits * 3.65,
                      dripPrice,
                      showDollarValues
                    )}
                  </td>
                  <td>
                    {wallet.referrals > 0 && (
                      <Link to={`/downline/${wallet.address}`}>
                        {wallet.referrals} / {wallet.total_structure} /{" "}
                        {wallet.teamDepth}
                      </Link>
                    )}
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
              ))}
          </tbody>
        </table>

        <button
            type="button"
            className="btn btn-primary"
            onClick={saveAddresses}
          >
            Reset List
          </button>
      </div>
    </div>
  );
};

export default Dashboard;
