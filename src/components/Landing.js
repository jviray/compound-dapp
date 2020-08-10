import React from 'react';

import styles from './Landing.module.scss';

const Landing = () => {
  const { container, box } = styles;
  return (
    <main className="wrap">
      <div className={container}>
        <h2>Welcome to Compound Dapp</h2>
        <div className={box}>Connect with Metamask and get started!</div>
      </div>
    </main>
  );
};

export default Landing;
