import React, { Component } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

import styles from './Header.module.scss';

class Header extends Component {
  render() {
    const { navbar, appName, btn } = styles;
    return (
      <nav className={navbar}>
        <div className="wrap flex space-between align-center">
          <div className={appName}>
            <h1>Compound Dapp</h1>
          </div>
          <div>
            {this.props.isRegistered ? (
              <p>Metamask Balance: {this.props.userDaiBalance} DAI</p>
            ) : (
              <button className={btn} onClick={() => this.props.onStart()}>
                {!this.props.isLoading ? (
                  'Get Started'
                ) : (
                  <ClipLoader
                    size={18}
                    color={'#fff'}
                    loading={this.props.isLoading}
                  />
                )}
              </button>
            )}
          </div>
        </div>
      </nav>
    );
  }
}

export default Header;
