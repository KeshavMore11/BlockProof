import React, { useState, useEffect } from 'react';

const CertificateList = ({ contract, account }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (contract && account) {
      loadCertificates();
    }
  }, [contract, account]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadCertificates = async () => {
    try {
      setLoading(true);

      const instituteCerts = await contract.getInstituteCertificates(account);
      const studentCerts  = await contract.getStudentCertificates(account);
      const allIds = [...new Set([...instituteCerts, ...studentCerts])];

      const data = await Promise.all(
        allIds.map(async (id) => {
          try {
            const cert = await contract.getCertificate(id);

            return {
              id: id.toString(),
              studentName: cert.studentName,
              instituteName: cert.instituteName,
              courseName: cert.courseName,
              issueDate: cert.issueDate,
              ipfsHash: cert.ipfsHash,
              isValid: cert.isValid,
              issuer: cert.issuer
};
            
          } catch (err) {
            console.error(`Error loading cert ${id}:`, err);
            return null;
          }
        })
      );

      setCertificates(data.filter(Boolean));
    } catch (err) {
      console.error('Error loading certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const revokeCertificate = async (certId) => {
    if (!window.confirm('Are you sure you want to permanently revoke this certificate?')) return;
    setRevoking(certId);
    try {
      const tx = await contract.revokeCertificate(certId);
      await tx.wait();
      await loadCertificates();
      showToast('Certificate revoked successfully.');
    } catch (err) {
      console.error('Error revoking certificate:', err);
      showToast('Failed to revoke certificate. Please try again.');
    } finally {
      setRevoking(null);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner" />
          <h3>Loading Certificates</h3>
          <p>Fetching your on-chain certificates…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>My Certificates</h2>
      <p>Certificates issued by you or assigned to your wallet address.</p>

      {toast && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>{toast}</div>
      )}

      {certificates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Certificates Found</h3>
          <p>You haven't issued or received any certificates yet.</p>
        </div>
      ) : (
        <div className="grid">
          {certificates.map((cert) => (
            <div key={cert.id} className="certificate-card">
              <h3>{cert.studentName}</h3>

              <div className="meta">
                <strong>Institute</strong>
                {cert.instituteName}
              </div>
              <div className="meta">
                <strong>Course</strong>
                {cert.courseName}
              </div>
              <div className="meta">
                <strong>Issued</strong>
                {new Date(Number(cert.issueDate) * 1000).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </div>
              <div className="meta">
                <strong>Cert ID</strong>
                #{cert.id}
              </div>
              <div className="meta" style={{ alignItems: 'center' }}>
                <strong>Status</strong>
                <span className={`status ${cert.isValid ? 'valid' : 'invalid'}`}>
                  {cert.isValid ? '● Valid' : '● Revoked'}
                </span>
              </div>

              <div className="cert-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => window.open(`https://ipfs.io/ipfs/${cert.ipfsHash}`, '_blank')}
                  style={{ fontSize: 12, padding: '9px 14px' }}
                >
                  View File
                </button>

                {cert.isValid && cert.issuer.toLowerCase() === account.toLowerCase() && (
                  <button
                    className="btn btn-danger"
                    onClick={() => revokeCertificate(cert.id)}
                    disabled={revoking === cert.id}
                    style={{ fontSize: 12, padding: '9px 14px' }}
                  >
                    {revoking === cert.id ? (
                      <>
                        <span style={{
                          width: 12, height: 12,
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#fff', borderRadius: '50%',
                          display: 'inline-block', animation: 'spin 0.7s linear infinite'
                        }} />
                        Revoking…
                      </>
                    ) : 'Revoke'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <button className="btn btn-secondary" onClick={loadCertificates}>
          ↻ Refresh
        </button>
      </div>
    </div>
  );
};

export default CertificateList;
