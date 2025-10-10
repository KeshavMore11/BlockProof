import React, { useState, useEffect } from 'react';
import './App.css';
import CertificateIssuer from './components/CertificateIssuer';
import CertificateVerifier from './components/CertificateVerifier';
import CertificateList from './components/CertificateList';
import Web3Connection from './components/Web3Connection';
import contractInfo from './contract-info.json';
import contractABIJson from './contracts/CertificateVerification.json';

function App() {
  const [activeTab, setActiveTab] = useState('verify');
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [initError, setInitError] = useState("");

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      checkConnection();

      // Re-initialize on account or network change
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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      // If using local contract but wrong network, try to switch
      if (contractInfo.network === 'localhost' && Number(network.chainId) !== 1337) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }], // 1337
          });
        } catch (switchErr) {
          setInitError('Please switch MetaMask to Hardhat Local (chainId 1337).');
          throw switchErr;
        }
      }

      const signer = await provider.getSigner();
      
      // Validate that a contract exists at the address
      const code = await provider.getCode(contractInfo.address);
      if (!code || code === '0x') {
        setInitError('Contract not found at configured address on this network. Deploy locally again.');
        setContract(null);
        return;
      }

      const abi = Array.isArray(contractABIJson) ? contractABIJson : contractABIJson.abi;
      if (!abi) {
        throw new Error('Contract ABI not found');
      }
      if (!contractInfo.address) {
        throw new Error('Contract address not configured');
      }

      const contractInstance = new ethers.Contract(contractInfo.address, abi, signer);
      
      setContract(contractInstance);
      setInitError("");
    } catch (error) {
      console.error('Error initializing contract:', error);
      setContract(null);
      setInitError('Contract init failed. Check network and address.');
    }
  };

  const tabs = [
    { id: 'verify', label: 'Verify Certificate', icon: '🔍' },
    { id: 'issue', label: 'Issue Certificate', icon: '📜' },
    { id: 'list', label: 'My Certificates', icon: '📋' }
  ];

  return (
    <div className="App">
      <div className="header">
        <img src="/logo.png" alt="BlockCertify logo" style={{ height: 280, marginBottom: 12 }} />
        <p>Blockchain Certificate Verification System</p>
      </div>

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
                  className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {initError && (
              <div className="alert alert-error">{initError}</div>
            )}

            <div className="tab-content active">
              {activeTab === 'verify' && (
                <CertificateVerifier contract={contract} />
              )}
              {activeTab === 'issue' && (
                <CertificateIssuer contract={contract} account={account} />
              )}
              {activeTab === 'list' && (
                <CertificateList contract={contract} account={account} />
              )}
            </div>
          </>
        ) : (
          <div className="card">
            <div className="alert alert-info">
              <h3>Connect Your Wallet</h3>
              <p>Please connect your MetaMask wallet to interact with the certificate verification system.</p>
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

