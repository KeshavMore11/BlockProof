import React, { useState } from 'react';
import { uploadToIPFS } from '../utils/ipfs';
import QRCode from 'qrcode';
import contractInfo from '../contract-info.json';

const etherscanBase = {
  localhost: null,
  sepolia: 'https://sepolia.etherscan.io',
  goerli: 'https://goerli.etherscan.io',
}[contractInfo.network];

const CertificateIssuer = ({ contract, account }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    instituteName: '',
    courseName: '',
    studentAddress: ''
  });
  const [certificateFile, setCertificateFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCertificateFile(file);
    setFileName(file ? file.name : '');
  };

  const issueCertificate = async () => {
    setError('');
    if (!contract) {
      setError('Contract not initialized. Connect wallet or refresh the page.');
      return;
    }
    if (!certificateFile) {
      setError('Please select a certificate file.');
      return;
    }
    if (!formData.studentName || !formData.instituteName || !formData.courseName) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const ipfsHash = await uploadToIPFS(certificateFile);

      const tx = await contract.issueCertificate(
        formData.studentName,
        formData.instituteName,
        formData.courseName,
        ipfsHash,
        formData.studentAddress || account
      );

      await tx.wait();
      const certificateId = await contract.getTotalCertificates();

      setResult({
        success: true,
        certificateId: certificateId.toString(),
        ipfsHash,
        transactionHash: tx.hash
      });

      const url = `${window.location.origin}?verifyId=${certificateId.toString()}&hash=${encodeURIComponent(ipfsHash)}`;
      setVerificationUrl(url);
      try {
        const qr = await QRCode.toDataURL(url, {
          color: { dark: '#050a12', light: '#ffffff' },
          width: 200,
          margin: 2
        });
        setQrCodeDataUrl(qr);
      } catch (e) {
        console.error('QR generation failed', e);
      }

      setFormData({ studentName: '', instituteName: '', courseName: '', studentAddress: '' });
      setCertificateFile(null);
      setFileName('');
      const fileInput = document.getElementById('certificateFile');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Error issuing certificate:', err);
      setError(err.message || 'Transaction failed. Please try again.');
      setResult({ success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Issue Certificate</h2>
      <p>Upload a certificate file and issue it permanently on the blockchain.</p>

      <div className="form-group">
        <label className="form-label">Student Name *</label>
        <input
          type="text"
          name="studentName"
          className="form-input"
          value={formData.studentName}
          onChange={handleInputChange}
          placeholder="Enter student's full name"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Institute Name *</label>
        <input
          type="text"
          name="instituteName"
          className="form-input"
          value={formData.instituteName}
          onChange={handleInputChange}
          placeholder="Enter institute name"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Course Name *</label>
        <input
          type="text"
          name="courseName"
          className="form-input"
          value={formData.courseName}
          onChange={handleInputChange}
          placeholder="Enter course name"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Student Wallet Address <span style={{ color: 'var(--muted)' }}>(optional)</span></label>
        <input
          type="text"
          name="studentAddress"
          className="form-input"
          value={formData.studentAddress}
          onChange={handleInputChange}
          placeholder="0x… (leave empty to use your address)"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Certificate File *</label>
        <input
          id="certificateFile"
          type="file"
          className="form-input"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        {fileName && (
          <div className="form-hint" style={{ color: 'var(--accent3)' }}>
            ✓ {fileName}
          </div>
        )}
        <div className="form-hint">Supported: PDF, JPG, PNG, DOC, DOCX</div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <button
        className="btn btn-success"
        onClick={issueCertificate}
        disabled={loading}
      >
        {loading ? (
          <>
            <span style={{
              width: 14, height: 14, border: '2px solid rgba(5,10,18,0.3)',
              borderTopColor: '#050a12', borderRadius: '50%',
              display: 'inline-block', animation: 'spin 0.7s linear infinite'
            }} />
            Issuing…
          </>
        ) : (
          <>📜 Issue Certificate</>
        )}
      </button>

      {result && result.success && (
        <div className="alert alert-success" style={{ marginTop: 20 }}>
          <h3>🎉 Certificate Issued Successfully</h3>
          <div className="fields-grid" style={{ marginTop: 14 }}>
            <div className="field-block">
              <div className="field-label">Certificate ID</div>
              <div className="field-value">#{result.certificateId}</div>
            </div>
            <div className="field-block mono">
              <div className="field-label">Transaction</div>
              <div className="field-value">
                <a
                  href={etherscanBase ? `${etherscanBase}/tx/${result.transactionHash}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Etherscan ↗
                </a>
              </div>
            </div>
            <div className="field-block mono full-width">
              <div className="field-label">IPFS Hash</div>
              <div className="field-value">{result.ipfsHash}</div>
            </div>
          </div>

          {verificationUrl && (
            <div style={{ marginTop: 14 }}>
              <div className="field-block mono" style={{ marginBottom: 0 }}>
                <div className="field-label">Verification URL</div>
                <div className="field-value">
                  <a href={verificationUrl} target="_blank" rel="noopener noreferrer">
                    Open verification link ↗
                  </a>
                </div>
              </div>
            </div>
          )}

          {qrCodeDataUrl && (
            <div className="qr-code" style={{ marginTop: 20 }}>
              <h4>Shareable Verification QR</h4>
              <img src={qrCodeDataUrl} alt="Verification QR" />
              <div style={{ marginTop: 12 }}>
                <a
                  className="btn btn-secondary"
                  href={qrCodeDataUrl}
                  download={`certificate-${result.certificateId}.png`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  ⬇ Download QR
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateIssuer;
