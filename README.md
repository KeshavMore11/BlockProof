# BlockCerti - Blockchain Certificate Verification System

A decentralized certificate verification system built on Ethereum blockchain with IPFS storage. This system allows institutes to securely issue student certificates and enables anyone to verify their authenticity by scanning a QR code.

## Features

- 🔐 **Blockchain Security**: Certificates are stored on Ethereum blockchain with tamper-proof verification
- 📁 **IPFS Storage**: Certificate files are stored on decentralized IPFS network
- 📱 **QR Code Verification**: Generate QR codes for instant certificate verification
- 🏫 **Institute Management**: Issue and manage certificates as an educational institute
- 👨‍🎓 **Student Portal**: View and manage personal certificates
- 🔍 **Public Verification**: Anyone can verify certificate authenticity without registration

## Tech Stack

- **Smart Contracts**: Solidity with OpenZeppelin libraries
- **Blockchain**: Ethereum (Hardhat development environment)
- **Frontend**: React.js with Ethers.js
- **Storage**: IPFS via Pinata
- **QR Codes**: qrcode npm package
- **Deployment**: GitHub Pages / Vercel

## Prerequisites

Before you begin, ensure you have:

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Pinata account (for IPFS storage)
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd BlockCerti
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your actual values:
   ```
   PINATA_API_KEY=your_pinata_api_key_here
   PINATA_SECRET_KEY=your_pinata_secret_key_here
   PRIVATE_KEY=your_wallet_private_key_here
   GOERLI_URL=https://eth-goerli.g.alchemy.com/v2/your_alchemy_key_here
   ```

4. **Set up frontend environment**
   ```bash
   cd frontend
   cp ../env.example .env
   ```
   
   Edit `frontend/.env` file:
   ```
   REACT_APP_PINATA_API_KEY=your_pinata_api_key_here
   REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key_here
   ```

## Development

### Smart Contract Development

1. **Compile contracts**
   ```bash
   npm run compile
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Start local blockchain**
   ```bash
   npm run node
   ```

4. **Deploy to local network**
   ```bash
   npm run deploy
   ```

### Frontend Development

1. **Start React development server**
   ```bash
   cd frontend
   npm start
   ```

2. **Build for production**
   ```bash
   npm run build
   ```

## Deployment

### Smart Contract Deployment

1. **Deploy to Goerli testnet**
   ```bash
   npm run deploy-testnet
   ```

2. **Deploy to mainnet** (when ready)
   ```bash
   hardhat run scripts/deploy.js --network mainnet
   ```

### Frontend Deployment

#### GitHub Pages
1. Build the project: `npm run build`
2. Push to GitHub repository
3. Enable GitHub Pages in repository settings
4. Deploy from `gh-pages` branch

#### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

## Usage

### For Institutes

1. Connect your MetaMask wallet
2. Switch to "Issue Certificate" tab
3. Fill in student details and upload certificate file
4. Click "Issue Certificate" to store on blockchain
5. Share the certificate ID or QR code with the student

### For Students

1. Connect your MetaMask wallet
2. Switch to "My Certificates" tab
3. View all your certificates
4. Share QR codes for verification

### For Verification

1. Go to "Verify Certificate" tab
2. Enter certificate ID or scan QR code
3. View certificate details and verification status
4. Access original certificate file via IPFS link

## Smart Contract Functions

- `issueCertificate()`: Issue a new certificate
- `verifyCertificate()`: Verify certificate authenticity
- `revokeCertificate()`: Revoke an issued certificate
- `getCertificate()`: Get certificate details
- `getStudentCertificates()`: Get all certificates for a student
- `getInstituteCertificates()`: Get all certificates issued by an institute

## Security Features

- **Ownership Control**: Only contract owner can issue certificates
- **Reentrancy Protection**: Prevents reentrancy attacks
- **Input Validation**: Validates all input parameters
- **Event Logging**: All operations are logged as events
- **Revocation System**: Certificates can be revoked if needed

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: [your-email@example.com]

## Roadmap

- [ ] Multi-signature certificate issuance
- [ ] Certificate templates and customization
- [ ] Batch certificate issuance
- [ ] Mobile app development
- [ ] Integration with existing LMS systems
- [ ] Advanced analytics and reporting

