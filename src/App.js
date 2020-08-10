import React, { Component } from 'react';
import web3 from './ethereum/web3';

import dappContract from './ethereum/dapp';
import daiContract, { address as daiAddress } from './ethereum/dai';
import { address as cDaiAddress } from './ethereum/cDai';
import Header from './components/Header';
import Landing from './components/Landing';
import Home from './components/Home';

class App extends Component {
  state = {
    registered: false,
    accountAddr: '',
    userDaiBalance: '',
    isLoading: false,
  };

  async componentDidMount() {
    const accounts = await web3.eth.getAccounts();

    this.setState({ accountAddr: accounts[0] });

    if (this.state.accountAddr) {
      const supplyId = await dappContract.methods
        .supplierToSupply(this.state.accountAddr)
        .call();
      if (supplyId != 0) {
        this.setState({ registered: true });
      }

      const userDaiBalance = await daiContract.methods
        .balanceOf(this.state.accountAddr)
        .call();

      this.setState({ userDaiBalance: web3.utils.fromWei(userDaiBalance) });
    }

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

  onGetStarted = async () => {
    this.setState({ isLoading: true });

    try {
      await dappContract.methods.createSupply(daiAddress, cDaiAddress).send({
        from: this.state.accountAddr,
        gasLimit: web3.utils.toHex(5000000),
        gasPrice: web3.utils.toHex(20000000000),
      });
    } catch (err) {}

    this.setState({ isLoading: false });
    window.location.reload();
  };

  render() {
    return (
      <div>
        <Header
          isRegistered={this.state.registered}
          userDaiBalance={this.state.userDaiBalance}
          onStart={this.onGetStarted}
          isLoading={this.state.isLoading}
        />
        {!this.state.registered ? <Landing /> : <Home />}
      </div>
    );
  }
}

export default App;
