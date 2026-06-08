import React from 'react';
import contractInfo from '../contract-info.json';
import { NETWORKS } from '../utils/networks';

const Web3Connection = ({ isConnected, account, onConnect }) => {
  const networkLabel = NETWORKS[contractInfo.network]?.name || contractInfo.network;
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-bar">
      <div className="wallet-info">
        <div className={`wallet-status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
        <div>
          <div className="wallet-label">
            {isConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
          </div>
          {isConnected && account && (
            <div className="wallet-address">{formatAddress(account)}</div>
          )}
          {isConnected && (
            <div className="wallet-ready">Connected to {networkLabel}</div>
          )}
        </div>
      </div>

      {!isConnected && (
        <button className="btn btn-secondary" onClick={onConnect}>
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default Web3Connection;
