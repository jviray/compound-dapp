import React, { Component } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

import web3 from '../ethereum/web3';
import dappContract from '../ethereum/dapp';
import Supply from '../ethereum/supply';
import daiContract from '../ethereum/dai';
import cDaiContract from '../ethereum/cDai';
import styles from './Home.module.scss';

class Home extends Component {
  state = {
    accountAddr: '',
    supplyContractAddr: '',
    cDaiBalance: '',
    daiInput: '',
    isLoading: false,
  };

  async componentDidMount() {
    const accounts = await web3.eth.getAccounts();

    const supplyContractAddr = await dappContract.methods
      .getDeployedSupply(accounts[0])
      .call();

    const cDaiBalance = await cDaiContract.methods
      .balanceOf(supplyContractAddr)
      .call();

    this.setState({
      accountAddr: accounts[0],
      supplyContractAddr,
      cDaiBalance,
    });
  }

  handleSubmut = async (evt) => {
    evt.preventDefault();

    this.setState({ isLoading: true });

    try {
      await daiContract.methods
        .transfer(
          this.state.supplyContractAddr,
          web3.utils.toWei(this.state.daiInput)
        )
        .send({
          from: this.state.accountAddr,
          gasLimit: web3.utils.toHex(150000),
          gasPrice: web3.utils.toHex(20000000000),
        });

      const supplyContract = Supply(this.state.supplyContractAddr);

      await supplyContract.methods
        .supplyDaiToCompound(web3.utils.toWei(this.state.daiInput))
        .send({
          from: this.state.accountAddr,
          gasLimit: web3.utils.toHex(5000000),
          gasPrice: web3.utils.toHex(20000000000),
        });
    } catch (err) {}

    this.setState({ daiInput: '', isLoading: false });
    window.location.reload();
  };

  render() {
    const { formContainer, form, formGroup, btn } = styles;

    return (
      <main className="wrap">
        <div className={formContainer}>
          <h2>Supply Dai to Compound</h2>

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
    );
  }
}

export default Home;
