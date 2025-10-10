import React, { useState } from 'react';
import { uploadToIPFS } from '../utils/ipfs';
import QRCode from 'qrcode';

const CertificateIssuer = ({ contract, account }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    instituteName: '',
    courseName: '',
    studentAddress: ''
  });
  const [certificateFile, setCertificateFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setCertificateFile(e.target.files[0]);
  };

  const issueCertificate = async () => {
    if (!contract) {
      alert('Contract not initialized yet. Connect wallet or refresh the page.');
      return;
    }
    if (!certificateFile) {
      alert('Please select a certificate file');
      return;
    }

    if (!formData.studentName || !formData.instituteName || !formData.courseName) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Upload certificate to IPFS
      const ipfsHash = await uploadToIPFS(certificateFile);
      
      // Issue certificate on blockchain
      const tx = await contract.issueCertificate(
        formData.studentName,
        formData.instituteName,
        formData.courseName,
        ipfsHash,
        formData.studentAddress || account
      );

      const receipt = await tx.wait();
      // After successful issuance, get latest total and use it as ID
      const certificateId = await contract.getTotalCertificates();
      
      setResult({
        success: true,
        certificateId: certificateId.toString(),
        ipfsHash: ipfsHash,
        transactionHash: tx.hash
      });

      // Build verification URL and generate QR code
      const url = `${window.location.origin}?verifyId=${certificateId.toString()}&hash=${encodeURIComponent(ipfsHash)}`;
      setVerificationUrl(url);
      try {
        const qr = await QRCode.toDataURL(url);
        setQrCodeDataUrl(qr);
      } catch (e) {
        console.error('QR generation failed', e);
      }

      // Reset form
      setFormData({
        studentName: '',
        instituteName: '',
        courseName: '',
        studentAddress: ''
      });
      setCertificateFile(null);
      document.getElementById('certificateFile').value = '';

    } catch (error) {
      console.error('Error issuing certificate:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Issue Certificate</h2>
      <p>Upload a certificate file and issue it on the blockchain.</p>
      
      <div className="form-group">
        <label className="form-label">Student Name *</label>
        <input
          type="text"
          name="studentName"
          className="form-input"
          value={formData.studentName}
          onChange={handleInputChange}
          placeholder="Enter student's full name"
          required
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
          required
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
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Student Wallet Address (Optional)</label>
        <input
          type="text"
          name="studentAddress"
          className="form-input"
          value={formData.studentAddress}
          onChange={handleInputChange}
          placeholder="Enter student's wallet address (leave empty to use your address)"
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
        <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
          Supported formats: PDF, JPG, PNG, DOC, DOCX
        </small>
      </div>

      <button 
        className="btn btn-success" 
        onClick={issueCertificate}
        disabled={loading}
      >
        {loading ? 'Issuing Certificate...' : 'Issue Certificate'}
      </button>

      {result && (
        <div className={`alert ${result.success ? 'alert-success' : 'alert-error'}`}>
          {result.success ? (
            <div>
              <h3>✅ Certificate Issued Successfully!</h3>
              <p><strong>Certificate ID:</strong> {result.certificateId}</p>
              <p><strong>IPFS Hash:</strong> {result.ipfsHash}</p>
              <p><strong>Transaction Hash:</strong> 
                <a 
                  href={`https://goerli.etherscan.io/tx/${result.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: '5px', color: '#007bff' }}
                >
                  View on Etherscan
                </a>
              </p>
              {verificationUrl && (
                <div style={{ marginTop: '12px' }}>
                  <p><strong>Verification URL:</strong> <a href={verificationUrl} target="_blank" rel="noopener noreferrer">Open</a></p>
                  {qrCodeDataUrl && (
                    <div className="qr-code">
                      <h4>Shareable Verification QR</h4>
                      <img src={qrCodeDataUrl} alt="Verification QR" />
                      <div style={{ marginTop: '10px' }}>
                        <a
                          className="btn btn-secondary"
                          href={qrCodeDataUrl}
                          download={`certificate-${result.certificateId}.png`}
                        >
                          Download QR
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3>❌ Error Issuing Certificate</h3>
              <p>{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateIssuer;

