import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const CertificateVerifier = ({ contract }) => {
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [urlIpfsHash, setUrlIpfsHash] = useState('');

  // Auto-verify if URL contains params like ?verifyId=1&hash=Qm...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('verifyId');
    const hashFromUrl = params.get('hash');
    if (idFromUrl) {
      setCertificateId(idFromUrl);
      if (hashFromUrl) setUrlIpfsHash(hashFromUrl);
      if (contract) {
        setTimeout(() => verifyCertificate(idFromUrl, hashFromUrl), 0);
      }
    }
  }, [contract]);

  const verifyCertificate = async (idOverride, expectedHash) => {
    if (!contract) {
      alert('Contract not initialized yet. Please connect wallet and try again.');
      return;
    }
    const idToUse = idOverride || certificateId;
    if (!idToUse) {
      alert('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    try {
      const [isValidOnChain, certificateData] = await contract.verifyCertificate(idToUse);
      const onChainHash = certificateData.ipfsHash;
      const expected = expectedHash || urlIpfsHash || '';
      const hashMatches = expected ? (onChainHash === expected) : true;
      
      setVerificationResult({
        isValid: isValidOnChain && hashMatches,
        certificate: certificateData,
        comparedHash: expected,
        onChainHash
      });

      // Generate QR code for verification URL
      const verificationUrl = `${window.location.origin}?verifyId=${idToUse}&hash=${encodeURIComponent(onChainHash)}`;
      const qrCodeUrl = await QRCode.toDataURL(verificationUrl);
      setQrCodeDataUrl(qrCodeUrl);
    } catch (error) {
      console.error('Error verifying certificate:', error);
      alert('Error verifying certificate. Please check the certificate ID.');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!certificateId) {
      alert('Please enter a certificate ID first');
      return;
    }

    try {
      let ipfsHashForQr = '';
      try {
        if (contract) {
          const data = await contract.getCertificate(certificateId);
          ipfsHashForQr = data.ipfsHash;
        }
      } catch {}
      const verificationUrl = ipfsHashForQr
        ? `${window.location.origin}?verifyId=${certificateId}&hash=${encodeURIComponent(ipfsHashForQr)}`
        : `${window.location.origin}?verifyId=${certificateId}`;
      const qrCodeUrl = await QRCode.toDataURL(verificationUrl);
      setQrCodeDataUrl(qrCodeUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  return (
    <div className="card">
      <h2>Verify Certificate</h2>
      <p>Enter a certificate ID to verify its authenticity on the blockchain.</p>
      
      <div className="form-group">
        <label className="form-label">Certificate ID</label>
        <input
          type="text"
          className="form-input"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
          placeholder="Enter certificate ID (e.g., 1, 2, 3...)"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          className="btn" 
          onClick={() => verifyCertificate()}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify Certificate'}
        </button>
        
        {/* Generate QR button removed as QR is provided at issuance */}
      </div>

      {qrCodeDataUrl && (
        <div className="qr-code">
          <h3>Verification QR Code</h3>
          <img src={qrCodeDataUrl} alt="QR Code" />
          <p>Scan this QR code to verify the certificate</p>
        </div>
      )}

      {verificationResult && (
        <div className={`alert ${verificationResult.isValid ? 'alert-success' : 'alert-error'}`}>
          <h3>
            {verificationResult.isValid ? '✅ Certificate is Valid' : '❌ Certificate is Invalid'}
          </h3>
          
          <div className="certificate-card">
            <h3>{verificationResult.certificate.studentName}</h3>
            <div className="meta">
              <strong>Institute:</strong> {verificationResult.certificate.instituteName}
            </div>
            <div className="meta">
              <strong>Course:</strong> {verificationResult.certificate.courseName}
            </div>
            <div className="meta">
              <strong>Issue Date:</strong> {new Date(Number(verificationResult.certificate.issueDate) * 1000).toLocaleDateString()}
            </div>
            <div className="meta">
              <strong>IPFS Hash (on-chain):</strong> {verificationResult.onChainHash}
            </div>
            {verificationResult.comparedHash && (
              <div className="meta">
                <strong>Hash from URL:</strong> {verificationResult.comparedHash}
              </div>
            )}
            <div className="meta">
              <strong>Status:</strong> 
              <span className={`status ${verificationResult.isValid ? 'valid' : 'invalid'}`}>
                {verificationResult.isValid ? 'Valid' : 'Invalid'}
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => window.open(`https://ipfs.io/ipfs/${verificationResult.onChainHash}`, '_blank')}
              >
                View Original File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateVerifier;

