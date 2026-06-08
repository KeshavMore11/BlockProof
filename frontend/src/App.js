import React, { useState, useEffect } from 'react';
import './App.css';
import CertificateIssuer from './components/CertificateIssuer';
import CertificateVerifier from './components/CertificateVerifier';
import CertificateList from './components/CertificateList';
import Web3Connection from './components/Web3Connection';
import contractInfo from './contract-info.json';
import contractABIJson from './contracts/CertificateVerification.json';
import { ensureNetwork, NETWORKS } from './utils/networks';

function App() {
  const [activeTab, setActiveTab] = useState('verify');
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [initError, setInitError] = useState('');

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      checkConnection();

      const handleAccountsChanged = (accounts) => {
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          initializeContract();
        } else {
          setIsConnected(false);
          setAccount(null);
          setContract(null);
        }
      };

      const handleChainChanged = () => {
        initializeContract();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const checkConnection = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await initializeContract();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAccount(accounts[0]);
      setIsConnected(true);
      await initializeContract();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const initializeContract = async () => {
    try {
      const { ethers } = await import('ethers');
      await ensureNetwork(window.ethereum, contractInfo.network);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const code = await provider.getCode(contractInfo.address);
      if (!code || code === '0x') {
        const networkName = NETWORKS[contractInfo.network]?.name || contractInfo.network;
        setInitError(`Contract not found on ${networkName}. Check contract-info.json or redeploy.`);
        setContract(null);
        return;
      }

      const abi = Array.isArray(contractABIJson) ? contractABIJson : contractABIJson.abi;
      if (!abi) throw new Error('Contract ABI not found');
      if (!contractInfo.address) throw new Error('Contract address not configured');

      const contractInstance = new ethers.Contract(contractInfo.address, abi, signer);
      setContract(contractInstance);
      setInitError('');
    } catch (error) {
      console.error('Error initializing contract:', error);
      setContract(null);
      if (!initError) setInitError('Contract init failed. Check network and address.');
    }
  };

  const tabs = [
    { id: 'verify', label: 'Verify', icon: '🔍' },
    { id: 'issue',  label: 'Issue',  icon: '📜' },
    { id: 'list',   label: 'Issued Certificates', icon: '📋' }
  ];

  return (
    <div className="App">
      {/* Ambient orbs */}
      <div style={{
        position: 'fixed', width: 500, height: 500,
        background: 'rgba(56,189,248,0.07)',
        borderRadius: '50%', filter: 'blur(80px)',
        top: -150, left: -100, zIndex: 0, pointerEvents: 'none',
        animation: 'drift 12s ease-in-out infinite'
      }} />
      <div style={{
        position: 'fixed', width: 400, height: 400,
        background: 'rgba(129,140,248,0.07)',
        borderRadius: '50%', filter: 'blur(80px)',
        bottom: -100, right: -80, zIndex: 0, pointerEvents: 'none',
        animation: 'drift 12s ease-in-out infinite',
        animationDelay: '-6s'
      }} />

      {/* Header */}
      <header className="header">
        <div className="header-badge">
          <span className="pulse-dot" />
          On-Chain Verified
        </div>
        <h1>BlockProof</h1>
        <p>Blockchain Certificate Verification System</p>
      </header>

      <div className="container">
        <Web3Connection
          isConnected={isConnected}
          account={account}
          onConnect={connectWallet}
        />

        {isConnected ? (
          <>
            <div className="tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {initError && (
              <div className="alert alert-error" style={{ marginBottom: 20 }}>
                ⚠️ {initError}
              </div>
            )}

            <div className="tab-content active">
              {activeTab === 'verify' && <CertificateVerifier contract={contract} />}
              {activeTab === 'issue'  && <CertificateIssuer  contract={contract} account={account} />}
              {activeTab === 'list'   && <CertificateList    contract={contract} account={account} />}
            </div>
          </>
        ) : (
          <div className="connect-page">
            <div className="connect-card">
              <div className="connect-icon">🔗</div>
              <h3>Connect Your Wallet</h3>
              <p>
                Connect your MetaMask wallet to issue, verify, and manage
                blockchain certificates on-chain.
              </p>
              <button className="btn" onClick={connectWallet}>
                Connect MetaMask
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
