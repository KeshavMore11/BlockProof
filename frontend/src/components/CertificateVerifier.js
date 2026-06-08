import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const CertificateVerifier = ({ contract }) => {
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [urlIpfsHash, setUrlIpfsHash] = useState('');
  const [error, setError] = useState('');

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
      setError('Contract not initialized. Connect wallet and try again.');
      return;
    }
    const idToUse = idOverride || certificateId;
    if (!idToUse) {
      setError('Please enter a certificate ID.');
      return;
    }
    setError('');
    setLoading(true);
    setVerificationResult(null);
    setQrCodeDataUrl('');

    try {
      const [isValidOnChain, certificateData] = await contract.verifyCertificate(idToUse);
      const onChainHash = certificateData.ipfsHash;
      const expected = expectedHash || urlIpfsHash || '';
      const hashMatches = expected ? onChainHash === expected : true;

      setVerificationResult({
        isValid: isValidOnChain && hashMatches,
        certificate: certificateData,
        comparedHash: expected,
        onChainHash
      });

      const verificationUrl = `${window.location.origin}?verifyId=${idToUse}&hash=${encodeURIComponent(onChainHash)}`;
      const qrCodeUrl = await QRCode.toDataURL(verificationUrl, {
        color: { dark: '#050a12', light: '#ffffff' },
        width: 200,
        margin: 2
      });
      setQrCodeDataUrl(qrCodeUrl);
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setError('Certificate not found. Check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const cert = verificationResult?.certificate;

  return (
    <div className="card">
      <h2>Verify Certificate</h2>
      <p>Enter a certificate ID to verify its authenticity on the blockchain.</p>

      <div className="form-group">
        <label className="form-label">Certificate ID</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            className="form-input"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            placeholder="e.g. 1, 2, 3 …"
            onKeyDown={(e) => e.key === 'Enter' && verifyCertificate()}
            style={{ flex: 1 }}
          />
          <button
            className="btn"
            onClick={() => verifyCertificate()}
            disabled={loading}
            style={{ flexShrink: 0 }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 14, height: 14, border: '2px solid rgba(5,10,18,0.3)',
                  borderTopColor: '#050a12', borderRadius: '50%',
                  display: 'inline-block', animation: 'spin 0.7s linear infinite'
                }} />
                Verifying…
              </>
            ) : (
              <>🔍 Verify</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">⚠️ {error}</div>
      )}

      {verificationResult && (
        <div className="verify-result">
          <div className="verify-result-header">
            <div className={`verify-result-icon ${verificationResult.isValid ? 'valid-icon' : 'invalid-icon'}`}>
              {verificationResult.isValid ? '✅' : '❌'}
            </div>
            <div>
              <div className="verify-result-title">
                {verificationResult.isValid ? 'Certificate is Valid' : 'Certificate is Invalid or Revoked'}
              </div>
              <div className="verify-result-sub">
                {verificationResult.isValid ? 'Verified on-chain · hash matches' : 'Verification failed'}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span className={`status ${verificationResult.isValid ? 'valid' : 'invalid'}`}>
                {verificationResult.isValid ? '● Valid' : '● Invalid'}
              </span>
            </div>
          </div>

          <div className="fields-grid">
            <div className="field-block">
              <div className="field-label">Student Name</div>
              <div className="field-value">{cert.studentName || '—'}</div>
            </div>
            <div className="field-block">
              <div className="field-label">Institute</div>
              <div className="field-value">{cert.instituteName || '—'}</div>
            </div>
            <div className="field-block">
              <div className="field-label">Course</div>
              <div className="field-value">{cert.courseName || '—'}</div>
            </div>
            <div className="field-block">
              <div className="field-label">Issue Date</div>
              <div className="field-value">
                {new Date(Number(cert.issueDate) * 1000).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </div>
            </div>
            <div className="field-block mono full-width">
              <div className="field-label">IPFS Hash (on-chain)</div>
              <div className="field-value">{verificationResult.onChainHash || '—'}</div>
            </div>
          </div>

          <div className="btn-row">
            <button
              className="btn btn-secondary"
              onClick={() => window.open(`https://ipfs.io/ipfs/${verificationResult.onChainHash}`, '_blank')}
            >
              View Original File
            </button>
          </div>

          {qrCodeDataUrl && (
            <div className="qr-code" style={{ marginTop: 20 }}>
              <h4>Shareable Verification QR</h4>
              <img src={qrCodeDataUrl} alt="Verification QR Code" />
              <p>Scan to instantly verify this certificate</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateVerifier;
