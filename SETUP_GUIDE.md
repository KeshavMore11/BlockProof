# Quick Setup Guide - BlockCerti

## 🎉 Your Blockchain Certificate Verification System is Ready!

### What's Been Set Up

✅ **Smart Contract**: CertificateVerification.sol deployed at `0x5FbDB2315678afecb367f032d93F642f64180aa3`  
✅ **Frontend**: React app with all components ready  
✅ **IPFS Integration**: Pinata integration configured  
✅ **QR Code Generation**: Ready for certificate verification  
✅ **All Dependencies**: Installed and tested  

### Next Steps to Get Started

#### 1. Configure Your Pinata API Keys

Since you already have a Pinata account, you need to:

1. **Get your API keys from Pinata:**
   - Go to [Pinata Dashboard](https://app.pinata.cloud/)
   - Navigate to API Keys section
   - Create a new API key
   - Copy your API Key and Secret Key

2. **Create environment files:**
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit .env with your actual values
   PINATA_API_KEY=your_actual_api_key_here
   PINATA_SECRET_KEY=your_actual_secret_key_here
   PRIVATE_KEY=your_wallet_private_key_here
   ```

3. **Set up frontend environment:**
   ```bash
   cd frontend
   cp ../env.example .env
   
   # Edit frontend/.env
   REACT_APP_PINATA_API_KEY=your_actual_api_key_here
   REACT_APP_PINATA_SECRET_KEY=your_actual_secret_key_here
   ```

#### 2. Start the Development Environment

1. **Start the local blockchain** (in one terminal):
   ```bash
   npm run node
   ```

2. **Start the React frontend** (in another terminal):
   ```bash
   cd frontend
   npm start
   ```

3. **Open your browser** and go to `http://localhost:3000`

#### 3. Connect MetaMask

1. **Install MetaMask** if you haven't already
2. **Add the local network**:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

3. **Import the test account** (for testing):
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This account has 10,000 ETH for testing

#### 4. Test the System

1. **Issue a Certificate:**
   - Connect your wallet
   - Go to "Issue Certificate" tab
   - Fill in student details
   - Upload a certificate file (PDF, JPG, etc.)
   - Click "Issue Certificate"

2. **Verify a Certificate:**
   - Go to "Verify Certificate" tab
   - Enter the certificate ID
   - Click "Verify Certificate"
   - Generate QR code for sharing

3. **View Certificates:**
   - Go to "My Certificates" tab
   - See all certificates you've issued or received

### 🚀 Ready for Production?

#### Deploy to Testnet (Goerli/Sepolia)

1. **Get testnet ETH:**
   - Goerli Faucet: https://goerlifaucet.com/
   - Sepolia Faucet: https://sepoliafaucet.com/

2. **Deploy contract:**
   ```bash
   npm run deploy-testnet
   ```

3. **Update frontend contract address** in `frontend/src/contract-info.json`

#### Deploy Frontend

1. **Build for production:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel:**
   - Connect your GitHub repo to Vercel
   - Set environment variables
   - Deploy automatically

3. **Deploy to GitHub Pages:**
   - Push to GitHub
   - Enable GitHub Pages
   - Deploy from `gh-pages` branch

### 📱 Mobile Testing

- The QR codes work on mobile devices
- Test certificate verification by scanning QR codes
- The system is responsive and mobile-friendly

### 🔧 Troubleshooting

**Common Issues:**

1. **"Wallet not connected"**: Make sure MetaMask is installed and connected
2. **"Transaction failed"**: Check if you have enough ETH for gas fees
3. **"IPFS upload failed"**: Verify your Pinata API keys are correct
4. **"Contract not found"**: Make sure the local blockchain is running

**Need Help?**
- Check the console for error messages
- Verify all environment variables are set
- Make sure all dependencies are installed

### 🎯 What You Can Do Now

- ✅ Issue certificates as an institute
- ✅ Verify certificate authenticity
- ✅ Generate QR codes for sharing
- ✅ View certificate history
- ✅ Revoke certificates if needed
- ✅ Deploy to testnet/mainnet
- ✅ Share certificates via QR codes

Your blockchain certificate verification system is now fully functional! 🎉
