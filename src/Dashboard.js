import React, { useState, useEffect } from "react";
import {
  getConnection,
  getUserInfo,
  claimsAvailable,
  getContract,
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

  let web3, contract;

  const fetchData = async () => {
    setWallets([]);
    web3 = web3 ?? (await getConnection());
    contract = contract ?? (await getContract(web3));
    const storage = JSON.parse(window.localStorage.getItem("dripAddresses"));

    const myWallets =
      storage?.map((addr) => addr.trim().replace("\n", "")) ?? [];

    myWallets.map(async (wallet, index) => {
      const userInfo = await getUserInfo(contract, wallet);
      const available = await claimsAvailable(contract, wallet);
      setWallets((wallets) => [
        ...wallets,
        { index, ...userInfo, available, address: wallet },
      ]);
    });
  };

  useEffect(() => {
    setTotalDeposits((totalDeposits) =>
      wallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.deposits);
      }, 0)
    );
    setTotalAvailable((totalAvailable) =>
      wallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.available);
      }, 0)
    );
    setTotalClaimed((totalClaimed) =>
      wallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.payouts);
      }, 0)
    );
    setTotalDirectBonus((totalDirectBonus) =>
      wallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.direct_bonus);
      }, 0)
    );
    setTotalMatch((totalMatch) =>
      wallets.reduce((total, wallet) => {
        return total + parseFloat(wallet.match_bonus);
      }, 0)
    );

    setTotalChildren((totalChildren) =>
      wallets.reduce((total, wallet) => {
        return total + parseInt(wallet.referrals);
      }, 0)
    );
    setTotalTeam((totalTeam) =>
      wallets.reduce((total, wallet) => {
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
      .split(addressList.includes(",") ? "," : "\n")
      .filter((addr) => addr.trim().length > 1)
      .map((addr) => addr.replace("\n", ""));

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
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <div className="navbar-brand col-sm-3 col-md-2 mr-0">
          Multi-Wallet Dashboard
        </div>
      </nav>
      <main role="main">
        <table className="table">
          <thead>
            <tr>
              <th>Address</th>
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
                  <td>
                    {wallet.address.substr(0, 5)}...
                    {wallet.address.slice(-4)}
                  </td>
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
      </main>

      <div>Paste a list of addresses:</div>
      <div>
        <textarea
          id="addressList"
          rows={10}
          cols={50}
          value={addressList}
          onChange={(e) => setAddressList(e.target.value)}
        />
        <button onClick={saveAddresses}>
          {addressList.length ? "Save" : "Clear"} List
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
