import React from 'react';

const Web3Connection = ({ isConnected, account, onConnect }) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>
            {isConnected ? '🟢 Wallet Connected' : '🔴 Wallet Not Connected'}
          </h3>
          {isConnected && (
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
              Account: {formatAddress(account)}
            </p>
          )}
        </div>
        
        {!isConnected && (
          <button className="btn" onClick={onConnect}>
            Connect Wallet
          </button>
        )}
      </div>
      
      {isConnected && (
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          <p>✅ Ready to interact with the blockchain</p>
        </div>
      )}
    </div>
  );
};

export default Web3Connection;

