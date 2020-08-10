import React, { Component } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

import web3 from '../ethereum/web3';
import dappContract, { address as dappAddress } from '../ethereum/dapp';
import daiContract from '../ethereum/dai';
import cDaiContract from '../ethereum/cDai';

import styles from './Home.module.scss';

class Home extends Component {
  state = {
    accountAddr: '',
    userDaiBalance: '',
    daiSupplied: '',
    cDaiBalance: '',
    daiInput: '',
    isLoading: false,
  };

  async componentDidMount() {
    const accounts = await web3.eth.getAccounts();
    const userDaiBalance = await daiContract.methods
      .balanceOf(accounts[0])
      .call();
    const daiSupplied = await cDaiContract.methods
      .balanceOfUnderlying(dappAddress)
      .call();

    const cDaiBalance = await cDaiContract.methods
      .balanceOf(dappAddress)
      .call();

    this.setState({
      accountAddr: accounts[0],
      userDaiBalance: web3.utils.fromWei(userDaiBalance),
      daiSupplied: web3.utils.fromWei(daiSupplied),
      cDaiBalance,
    });

    // Checks for account changes in Metamask and updates accordingly
    setInterval(async () => {
      const accounts = await web3.eth.getAccounts();
      if (this.state.accountAddr !== accounts[0]) {
        window.location.reload();
        this.setState({
          accountAddr: accounts[0],
        });
      }
    }, 1000);
  }

  handleSubmut = async (evt) => {
    evt.preventDefault();

    this.setState({ isLoading: true });

    try {
      await daiContract.methods
        .transfer(dappAddress, web3.utils.toWei(this.state.daiInput))
        .send({
          from: this.state.accountAddr,
          gasLimit: web3.utils.toHex(150000),
          gasPrice: web3.utils.toHex(20000000000),
        });

      await dappContract.methods
        .supplyDaiToCompound(web3.utils.toWei(this.state.daiInput))
        .send({
          from: this.state.accountAddr,
          gasLimit: web3.utils.toHex(5000000),
          gasPrice: web3.utils.toHex(20000000000),
        });
    } catch (err) {}

    this.setState({ isLoading: false });
  };

  render() {
    const { navbar, appName, formContainer, form, formGroup, btn } = styles;

    return (
      <div>
        <nav className={navbar}>
          <div className="wrap flex space-between align-center">
            <div className={appName}>
              <h1>Compound Dapp</h1>
            </div>
            <div>
              <p>Balance: {this.state.userDaiBalance} DAI</p>
            </div>
          </div>
        </nav>

        <main className="wrap">
          <div className={formContainer}>
            <h2>Supply Dai to Compound</h2>
            {/* <p>Amount of DAI Supplied to Compound: {this.state.daiSupplied}</p> */}

            <form className={form} onSubmit={this.handleSubmut}>
              <div className={formGroup}>
                <label>
                  <p>Your cDAI Token Balance: {this.state.cDaiBalance / 1e8}</p>
                </label>
                <input
                  disabled={!this.state.isLoading ? false : true}
                  value={this.state.daiInput}
                  onChange={(evt) =>
                    this.setState({ daiInput: evt.target.value })
                  }
                  placeholder="Enter an amount of DAI"
                />
              </div>
              <button className={btn} type="submit">
                {!this.state.isLoading ? (
                  'Submit'
                ) : (
                  <ClipLoader
                    size={18}
                    color={'#fff'}
                    loading={this.state.loading}
                  />
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }
}

export default Home;
