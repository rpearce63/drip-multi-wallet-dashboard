import React, { useState, useEffect } from "react";
import {
  getConnection,
  getUserInfo,
  claimsAvailable,
  getContract,
  getDripBalance,
  getDripPrice,
} from "./Contract";

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
  const [dripPrice, setDripPrice] = useState(0);

  let web3, contract;

  const fetchData = async () => {
    setWallets([]);
    web3 = web3 ?? (await getConnection());
    contract = contract ?? (await getContract(web3));
    const currentDripPrice = await getDripPrice(web3);
    //console.log("Drip Price: " + dripPrice / Math.pow(10, 18));
    setDripPrice((dripPrice) => currentDripPrice);
    const storage = JSON.parse(window.localStorage.getItem("dripAddresses"));

    const myWallets =
      storage?.map((addr) => addr.trim().replace("\n", "")) ?? [];

    myWallets.map(async (wallet, index) => {
      const userInfo = await getUserInfo(contract, wallet);
      const available = await claimsAvailable(contract, wallet);
      const dripBalance = await getDripBalance(web3, wallet);
      const valid = !!userInfo;
      setWallets((wallets) => [
        ...wallets,
        { index, ...userInfo, available, address: wallet, valid, dripBalance },
      ]);
    });
  };

  useEffect(() => {
    const validWallets = wallets.filter((wallet) => wallet.valid);

    setTotalDeposits((totalDeposits) =>
      validWallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.deposits);
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
      fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const convertDrip = (drip) => {
    return Math.round((drip / Math.pow(10, 18)) * 1000) / 1000;
  };

  const saveAddresses = () => {
    const arrayOfAddresses = addressList
      .split(/[\n,]+/)
      .filter((addr) => addr.trim().length === 42);

    arrayOfAddresses.length === 0
      ? window.localStorage.clear()
      : window.localStorage.setItem(
          "dripAddresses",
          JSON.stringify(arrayOfAddresses)
        );
    setAddressList("");
    fetchData();
  };

  return (
    <div className="container">
      <nav className="navbar navbar-dark fixed-top bg-dark p-0 shadow">
        <div className="navbar-brand col-md-12">
          Drip Multi-Wallet Dashboard - Drip $
          {Math.round(convertDrip(dripPrice) * 100) / 100}
        </div>
        <div className="card-body">
          <h6 className="card-subtitle text-white">
            If you find this tool useful, feel free to drop me a little Drip or
            BNB: 0x645Dc8a64046FD877b82caB077BF929c299D5A7a
          </h6>
        </div>
      </nav>
      <main role="main">
        <table className="table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Drip</th>
              <th>Available</th>
              <th>Deposits</th>
              <th>Claimed</th>
              <th>Rewarded</th>
              <th>Max Payout</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            {wallets
              .sort((a, b) => a.index - b.index)
              .map((wallet) => (
                <tr key={wallet.address}>
                  <td className={wallet.valid ? "" : "invalid"}>
                    {wallet.address.substr(0, 5)}...
                    {wallet.address.slice(-4)}
                  </td>
                  <td>{convertDrip(wallet.dripBalance)}</td>
                  <td>{convertDrip(wallet.available)}</td>
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

            <tr className="table-success">
              <th>Totals - {wallets.length}</th>
              <th></th>
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
            id="addressList"
            rows={10}
            cols={50}
            value={addressList}
            onChange={(e) => setAddressList(e.target.value)}
          />
        </div>
      </main>

      <footer className="page-footer font-small blue">
        <div className="footer-copyright text-center py-3">
          © 2021 Copyright:
          <a href="https://t.me/rpearce63" target="_blank no_referrer">
            Rick Pearce
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
