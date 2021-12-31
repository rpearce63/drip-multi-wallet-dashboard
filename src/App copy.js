import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
//import { TODO_LIST_ABI, TODO_LIST_ADDRESS } from "./config";
import { DRIP_ABI, DRIP_ADDR } from "./dripconfig";
//import contract from './contract';
import {
  getConnection,
  getContract,
  getAccounts,
  claimsAvailable,
  getUserInfo,
} from "./Contract";
import Dashboard from "./Dashboard";
class App extends Component {
  componentDidMount() {
    this.loadBlockchainData();
  }

  async loadBlockchainData() {
    // const web3 = new Web3(
    //   Web3.givenProvider || "https://bsc-dataseed.binance.org/"
    // );
    const web3 = await getConnection();
    const accounts = await getAccounts(web3);
    this.setState({ account: accounts[0] });
    //console.log(this.state.account);
    const contract = await getContract(web3);
    this.setState({ contract });
    this.getUpline(this.state.account);
    const available = await claimsAvailable(contract, accounts[0]);
    this.setState({ available });
  }

  async getUpline(address) {
    const userInfo = await getUserInfo(this.state.contract, address);
    //console.log(`isBalanceCovered(${address},${this.state.uplineList.length}`)
    const isEligible = await this.state.contract.methods
      .isBalanceCovered(address, this.state.uplineList.length)
      .call();
    //console.log(`isBalanceCovered: ${isEligible}`)
    const uplineInfo = { ...userInfo, userAddr: address, isEligible };
    this.setState({ uplineList: [...this.state.uplineList, uplineInfo] });
    if (userInfo.upline.startsWith("0x000")) {
      return;
    }
    this.getUpline(userInfo.upline);
  }

  refreshUpline() {
    this.setState({ uplineList: [] });
    this.getUpline(this.state.wallet);
  }

  async roll() {
    await this.state.contract.methods.roll().send({ from: this.state.account });
  }

  convertDrip(drip) {
    return Math.round((drip / Math.pow(10, 18)) * 1000) / 1000;
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      loading: true,
      userInfo: {},
      uplineList: [],
      wallet: "",
    };
    this.getUpline = this.getUpline.bind(this);
    this.roll = this.roll.bind(this);
    this.convertDrip = this.convertDrip.bind(this);
    this.refreshUpline = this.refreshUpline.bind(this);
  }

  render() {
    const self = this.state.uplineList?.[0] ?? {};
    const deposits = this.convertDrip(self.deposits);
    const claimed = this.convertDrip(self.payouts);
    const maxPayout = Math.round(deposits * 3.65 * 1000) / 1000;
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <div className="navbar-brand col-sm-3 col-md-2 mr-0">
            {this.state.account}
          </div>
          <div>
            <button onClick={this.roll}>Hydrate</button>
          </div>
        </nav>
        <div className="container-fluid">
          <Dashboard />
          <div>
            Address:{" "}
            <input
              type="text"
              size="50"
              value={this.state.wallet}
              onChange={(e) => this.setState({ wallet: e.target.value })}
            />
            <button onClick={this.refreshUpline} disabled={!this.state.wallet}>
              Get Upline
            </button>
          </div>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              <div>User stats:</div>
              <ul>
                <li>
                  Team: {self.referrals} / {self.total_structure}
                </li>
                <li>Deposits: {deposits}</li>
                <li>Claimed: {claimed}</li>
                <li>Max Payout: {maxPayout}</li>
                <li>Ref claim pos: {self.ref_claim_pos}</li>
                <li>Available: {this.convertDrip(this.state.available)}</li>
              </ul>
            </main>
          </div>
          <hr />
          <div>
            {this.state.uplineList.map((upline, index) => (
              <div key={index}>
                <ul>
                  <li>
                    {upline.userAddr === this.state.account
                      ? "You"
                      : index === 1
                      ? "Your Buddy"
                      : `Upline ${index}`}
                    : {upline.userAddr}
                  </li>
                  <li>
                    Team: {upline.referrals} / {upline.total_structure}
                  </li>
                  <li>Ref claim pos: {upline.ref_claim_pos}</li>
                  <li>Eligible: {JSON.stringify(upline.isEligible)}</li>
                </ul>
                <br />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
