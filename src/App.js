import React, { Component } from 'react';
import web3 from './ethereum/web3';

import Landing from './components/Landing';
import Home from './components/Home';

class App extends Component {
  state = {
    connectedToMetaMask: false,
    accountAddr: '',
  };

  async componentDidMount() {
    if (
      typeof window.ethereum !== 'undefined' ||
      typeof window.web3 !== 'undefined'
    ) {
      const accounts = await web3.eth.getAccounts();
      this.setState({ connectedToMetaMask: true, accountAddr: accounts[0] });
    }

    // Checks for account changes in Metamask and updates accordingly
    setInterval(async () => {
      if (
        typeof window.ethereum === 'undefined' &&
        typeof window.web3 === 'undefined'
      ) {
        this.setState({ connectedToMetaMask: false });
      } else {
        const accounts = await web3.eth.getAccounts();
        if (this.state.accountAddr !== accounts[0]) {
          window.location.reload();
          this.setState({
            accountAddr: accounts[0],
          });
        }
      }
    }, 1000);
  }

  render() {
    return (
      <div>
        {this.state.connectedToMetaMask == true ? <Home /> : <Landing />}
      </div>
    );
  }
}

export default App;
