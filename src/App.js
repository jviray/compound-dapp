import React, { Component } from 'react';

import web3 from './ethereum/web3';

class App extends Component {
  state = {
    accountAddr: '',
  };

  async componentDidMount() {
    const accounts = await web3.eth.getAccounts();

    this.setState({
      accountAddr: accounts[0],
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

  render() {
    return (
      <div>
        <header>
          <h1>Compound Dapp</h1>
          <p>Account: {this.state.accountAddr}</p>
        </header>
      </div>
    );
  }
}

export default App;
