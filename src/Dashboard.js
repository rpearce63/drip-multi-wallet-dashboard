import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getConnection,
  getUserInfo,
  claimsAvailable,
  getContract,
  getDripBalance,
  getUplineCount,
  getBr34pBalance,
  getBnbBalance,
} from "./Contract";
import Header from "./Header";

import {
  convertDrip,
  formatPercent,
  shortenAddress,
  backupData,
} from "./utils";

const Dashboard = () => {
  const [wallets, setWallets] = useState([]);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [totalClaimed, setTotalClaimed] = useState(0);
  const [totalDirectBonus, setTotalDirectBonus] = useState(0);
  const [totalMatch, setTotalMatch] = useState(0);
  //const [totalChildren, setTotalChildren] = useState(0);
  //const [totalTeam, setTotalTeam] = useState(0);
  const [addressList, setAddressList] = useState("");
  const [totalDripHeld, setTotalDripHeld] = useState(0);
  const [totalBnbBalance, setTotalBnbBalance] = useState(0);
  const [newAddress, setNewAddress] = useState("");
  //const [triggerType, setTriggerType] = useState("percent");
  const [editLabels, setEditLabels] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dataCopied, setDataCopied] = useState(false);
  const TABLE_HEADERS = [
    "#",
    "Address",
    "Label",
    "Buddy",
    "Upline Depth",
    "Drip Balance",
    "BNB Balance",
    "Available Amt",
    "Pct",
    "Deposits",
    "Claimed",
    "Rewarded",
    "Max Payout",
    "Team",
  ];
  let web3, contract;

  const fetchData = async () => {
    web3 = web3 ?? (await getConnection());
    contract = contract ?? (await getContract(web3));

    let storedWallets = JSON.parse(
      window.localStorage.getItem("dripAddresses")
    );
    if (storedWallets && !storedWallets[0].addr) {
      console.log("converting addresses");
      const convertedWallets = storedWallets.map((wallet) => ({
        addr: wallet,
        label: "",
      }));
      localStorage.setItem("dripAddresses", JSON.stringify(convertedWallets));
      storedWallets = convertedWallets;
    }
    const myWallets =
      storedWallets?.map((wallet) => ({
        addr: wallet.addr.trim().replace("\n", ""),
        label: wallet.label,
      })) ?? [];
    let walletCache = [];
    myWallets.forEach(async (wallet, index) => {
      const userInfo = await getUserInfo(contract, wallet.addr);
      const available = await claimsAvailable(contract, wallet.addr);
      const dripBalance = await getDripBalance(web3, wallet.addr);
      const uplineCount = await getUplineCount(contract, wallet.addr);
      const br34pBalance = await getBr34pBalance(web3, wallet.addr);
      const bnbBalance = await getBnbBalance(web3, wallet.addr);
      const valid = !!userInfo;
      walletCache = [
        ...walletCache,
        {
          index,
          ...userInfo,
          available,
          address: wallet.addr,
          label: wallet.label,
          valid,
          dripBalance,
          br34pBalance,
          uplineCount,
          bnbBalance,
        },
      ];

      setWallets(() => [...walletCache]);
      setDataCopied(false);
    });
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
    setTotalMatch(() =>
      validWallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.match_bonus);
      }, 0)
    );

    // setTotalChildren((totalChildren) =>
    //   validWallets.reduce((total, wallet) => {
    //     return total + parseInt(wallet.referrals);
    //   }, 0)
    // );
    // setTotalTeam((totalTeam) =>
    //   validWallets.reduce((total, wallet) => {
    //     return total + parseInt(wallet.total_structure);
    //   }, 0)
    // );
  }, [wallets]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      autoRefresh && fetchData();
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

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

  const addNewAddress = async (e) => {
    e.preventDefault();
    const web3 = await getConnection();
    if (!web3.utils.isAddress(newAddress)) {
      alert("Invalid Address");
      return false;
    }
    const storedAddresses =
      JSON.parse(window.localStorage.getItem("dripAddresses")) ?? [];
    if (!storedAddresses.some((sa) => sa.addr === newAddress)) {
      storedAddresses.push({ addr: newAddress, label: "" });
      window.localStorage.setItem(
        "dripAddresses",
        JSON.stringify(storedAddresses)
      );

      setNewAddress("");
      fetchData();
    }
  };

  // const highlightStyle = (wallet) => {
  //   let style;
  //   const pct = wallet.available / wallet.deposits;
  //   const amount = convertDrip(wallet.available);

  //   switch (triggerType) {
  //     case "percent":
  //       //const pct = wallet.available / wallet.deposits;
  //       style = pct >= 0.01 ? "hydrate" : pct >= 0.009 ? "prepare" : "";
  //       return style;

  //     case "amount":
  //       //const amount = convertDrip(wallet.available);
  //       style = amount >= 1 ? "hydrate" : amount >= 0.5 ? "prepare" : "";
  //       return style;
  //     case "both":
  //       style =
  //         pct >= 0.01 && amount >= 1
  //           ? "hydrate"
  //           : pct >= 0.01 && amount >= 0.5
  //           ? "hydrate"
  //           : "";
  //       return style;
  //     default:
  //       return "";
  //   }
  // };

  const highlightStyleFor = (col, wallet) => {
    let amount, percent, style;
    switch (col) {
      case "amt":
        amount = parseFloat(convertDrip(wallet.available));
        style = amount >= 1.0 ? "hydrate" : amount >= 0.5 ? "prepare" : "";
        return style;
      case "pct":
        percent = parseFloat(wallet.available / wallet.deposits);
        style = percent >= 0.01 ? "hydrate" : percent >= 0.009 ? "prepare" : "";
        return style;
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

  const changeHandler = (event) => {
    event.target.files[0].text().then((t) => {
      localStorage.setItem("dripAddresses", t);
    });
    window.location.reload(true);
  };

  const copyTableData = () => {
    const tableData = [
      [...TABLE_HEADERS],
      ...wallets.map((w, index) => [
        index + 1,
        shortenAddress(w.address),
        w.label,
        shortenAddress(w.upline),
        w.uplineCount,
        convertDrip(w.dripBalance),
        parseFloat(w.bnbBalance).toFixed(3),
        convertDrip(w.available),
        formatPercent(w.available / w.deposits),
        convertDrip(w.deposits),
        convertDrip(w.payouts),
        `${convertDrip(w.direct_bonus)}/${convertDrip(w.match_bonus)}`,
        convertDrip(w.deposits * 3.65),
        `${w.referrals}/${w.total_structure}`,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");
    navigator.clipboard.writeText(tableData);
    setDataCopied(true);
  };

  return (
    <div className="container">
      <Header />
      <div className="main">
        {!!wallets.length && (
          <div className="controls">
            <form className="row g-3">
              <div className="col">
                <input
                  className="form-control"
                  id="newAddressTxt"
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Add additional single wallet"
                />
              </div>
              <div className="col">
                <button
                  type="submit"
                  className="btn btn-outline-secondary"
                  onClick={addNewAddress}
                  disabled={!!!newAddress || newAddress.length !== 42}
                >
                  Add
                </button>
              </div>
              <div className="alert">
                <div>Available will highlight to indicate when it is</div>
                <div>ready to claim or hydrate</div>

                <div>
                  Amount - <span className="prepare">light green = .5+</span>,{" "}
                  <span className="hydrate">green = 1+</span>
                </div>
                <div>
                  Percent - <span className="prepare">light green = .9%</span> ,{" "}
                  <span className="hydrate">green = 1%</span>
                </div>
                <div>
                  BNB balance low -{" "}
                  <span className="warning">yellow = &lt; 0.05 bnb</span>
                </div>
              </div>
            </form>
            <div className="alert alert-info">
              <p>Click on a wallet to see upline detail</p>
              <div>
                <div>Back up addresses and labels to a file.</div>
                <div>
                  You can then reload the data from the back up file if you
                  clear the list or clear cache.
                </div>
                <p></p>
                <button className="btn btn-secondary" onClick={backupData}>
                  Back Up
                </button>
              </div>
            </div>
          </div>
        )}
        {!!wallets.length && (
          <div>
            <button
              className="btn-copy btn btn-outline-secondary"
              onClick={copyTableData}
            >
              <i className={`bi bi-clipboard${dataCopied ? "-check" : ""}`}></i>
              Copy table
            </button>
          </div>
        )}
        <table className="table">
          <thead>
            <tr>
              {TABLE_HEADERS.map((h) => (
                <th key={h}>{h}</th>
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
              <th> </th>
              <th> </th>
              <th>{convertDrip(totalDripHeld)}</th>
              <th>{parseFloat(totalBnbBalance).toFixed(3)}</th>
              <th>{convertDrip(totalAvailable)}</th>
              <th></th>
              <th>{convertDrip(totalDeposits)}</th>
              <th>{convertDrip(totalClaimed)}</th>
              <th>
                {convertDrip(totalDirectBonus)}/{convertDrip(totalMatch)}
              </th>
              <th>{convertDrip(totalDeposits * 3.65)}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {wallets
              .sort((a, b) => a.index - b.index)
              .map((wallet, index) => (
                <tr key={wallet.address}>
                  <td>{index + 1}</td>
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
                  <td>{shortenAddress(wallet.upline)}</td>
                  <td>{wallet.uplineCount}</td>
                  <td>{convertDrip(wallet.dripBalance)}</td>
                  <td
                    className={`${wallet.bnbBalance < 0.05 ? "warning" : ""}`}
                  >
                    {parseFloat(wallet.bnbBalance).toFixed(3)}
                  </td>
                  <td className={highlightStyleFor("amt", wallet)}>
                    {convertDrip(wallet.available)}
                  </td>
                  <td className={highlightStyleFor("pct", wallet)}>
                    {formatPercent(wallet.available / wallet.deposits)}%
                  </td>
                  <td>{convertDrip(wallet.deposits)}</td>
                  <td>{convertDrip(wallet.payouts)}</td>
                  <td>
                    {convertDrip(wallet.direct_bonus)}/
                    {convertDrip(wallet.match_bonus)}
                  </td>
                  <td>{convertDrip(wallet.deposits * 3.65)}</td>
                  <td>
                    {wallet.referrals} / {wallet.total_structure}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <button
          type="button"
          className="btn btn-primary"
          onClick={saveAddresses}
          disabled={!addressList.length && !wallets.length}
        >
          {addressList.length ? "Save" : "Clear"} List
        </button>
        <div>Paste a list of addresses:</div>
        <div>
          <textarea
            className="form-control"
            id="addressList"
            rows={10}
            cols={50}
            value={addressList}
            onChange={(e) => setAddressList(e.target.value)}
          />

          <input
            className="form-control"
            type="file"
            name="file"
            onChange={changeHandler}
            placeholder="Load from Backup"
          />
        </div>
      </div>

      <footer id="footer" className="page-footer font-small blue">
        <div className="footer-content text-center py-3">
          <span className="copyright">
            <span>© 2022 - </span>
            <a href="https://t.me/rpearce63" target="_blank no_referrer">
              Rick Pearce
            </a>
          </span>
          <span className="affiliate">
            <a
              href="https://4dinsingapore.com/amember/aff/go/rpearce63?i=8"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://4dinsingapore.com/amember/file/get/path/banners.61bbbb50b08be/i/31928"
                border={0}
                alt="DRIP Run Automation banner (version 1)"
              />
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
