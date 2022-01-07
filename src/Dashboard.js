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
  const [totalChildren, setTotalChildren] = useState(0);
  const [totalTeam, setTotalTeam] = useState(0);
  const [addressList, setAddressList] = useState("");
  const [totalDripHeld, setTotalDripHeld] = useState(0);
  const [newAddress, setNewAddress] = useState("");
  const [triggerType, setTriggerType] = useState("percent");
  const [editLabels, setEditLabels] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

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
    myWallets.map(async (wallet, index) => {
      const userInfo = await getUserInfo(contract, wallet.addr);
      const available = await claimsAvailable(contract, wallet.addr);
      const dripBalance = await getDripBalance(web3, wallet.addr);
      const uplineCount = await getUplineCount(contract, wallet.addr);
      const br34pBalance = await getBr34pBalance(web3, wallet.addr);
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
        },
      ];

      setWallets(() => [...walletCache]);
    });
  };

  useEffect(() => {
    const validWallets = wallets.filter((wallet) => wallet.valid);

    setTotalDeposits((totalDeposits) =>
      validWallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.deposits);
      }, 0)
    );
    setTotalDripHeld((totalDripHeld) =>
      validWallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.dripBalance);
      }, 0)
    );
    setTotalAvailable((totalAvailable) =>
      validWallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.available);
      }, 0)
    );
    setTotalClaimed((totalClaimed) =>
      validWallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.payouts);
      }, 0)
    );
    setTotalDirectBonus((totalDirectBonus) =>
      validWallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.direct_bonus);
      }, 0)
    );
    setTotalMatch((totalMatch) =>
      validWallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.match_bonus);
      }, 0)
    );

    setTotalChildren((totalChildren) =>
      validWallets.reduce((total, wallet) => {
        return total + parseInt(wallet.referrals);
      }, 0)
    );
    setTotalTeam((totalTeam) =>
      validWallets.reduce((total, wallet) => {
        return total + parseInt(wallet.total_structure);
      }, 0)
    );
  }, [wallets]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      autoRefresh && fetchData();
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const saveAddresses = () => {
    const arrayOfAddresses = addressList
      .split(/[\n,]+/)
      .filter((addr) => addr.trim().length === 42);

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

  const addNewAddress = (e) => {
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

  const highlightStyle = (wallet) => {
    let style;
    switch (triggerType) {
      case "percent":
        const pct = wallet.available / wallet.deposits;
        style =
          pct >= 0.009 && pct < 0.01 ? "prepare" : pct >= 0.01 ? "hydrate" : "";
        return style;

      case "amount":
        const amount = convertDrip(wallet.available);
        style =
          amount >= 0.5 && amount < 1.0
            ? "prepare"
            : amount >= 1.0
            ? "hydrate"
            : "";
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

  return (
    <div className="container-fluid">
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
                >
                  Add
                </button>
              </div>
              <div className="alert alert-light">
                <div>Highlight available when at 1% or 1 Drip</div>
                <div className="form-check">
                  <label className="form-check-label">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="percent"
                      checked={triggerType === "percent"}
                      onChange={() => setTriggerType("percent")}
                    />
                    Percent - light green = .9%, green = 1%
                  </label>
                </div>
                <div className="form-check">
                  <label className="form-check-label">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="amount"
                      checked={triggerType === "amount"}
                      onChange={() => setTriggerType("amount")}
                    />
                    Amount - light green = .5+, green = 1+
                  </label>
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

        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Address</th>
              <th>Label</th>
              <th>Buddy</th>
              <th>
                Upline
                <br />
                Depth
              </th>
              <th>Drip Held</th>
              <th>Available</th>
              <th>Deposits</th>
              <th>Claimed</th>
              <th>Rewarded</th>
              <th>Max Payout</th>
              <th>Team</th>
            </tr>
            <tr className="table-success">
              <th></th>
              <th>Totals - {wallets.length}</th>
              <th>
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
                {editLabels && <small>autorefresh paused</small>}
              </th>
              <th></th>
              <th></th>
              <th>{convertDrip(totalDripHeld)}</th>
              <th>{convertDrip(totalAvailable)}</th>
              <th>{convertDrip(totalDeposits)}</th>
              <th>{convertDrip(totalClaimed)}</th>
              <th>
                {convertDrip(totalDirectBonus)}/{convertDrip(totalMatch)}
              </th>
              <th>{convertDrip(totalDeposits * 3.65)}</th>
              <th>
                {totalChildren}/{totalTeam}
              </th>
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
                  <td className={highlightStyle(wallet)}>
                    {convertDrip(wallet.available)} -{" "}
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
