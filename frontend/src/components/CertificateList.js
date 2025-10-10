import React, { useState, useEffect } from 'react';

const CertificateList = ({ contract, account }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contract && account) {
      loadCertificates();
    }
  }, [contract, account]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      
      // Get certificates issued by the current account (institute)
      const instituteCertificates = await contract.getInstituteCertificates(account);
      
      // Get certificates for the current account as student
      const studentCertificates = await contract.getStudentCertificates(account);
      
      // Combine and deduplicate
      const allCertificateIds = [...new Set([...instituteCertificates, ...studentCertificates])];
      
      const certificateData = await Promise.all(
        allCertificateIds.map(async (id) => {
          try {
            const certificate = await contract.getCertificate(id);
            return {
              id: id.toString(),
              ...certificate
            };
          } catch (error) {
            console.error(`Error loading certificate ${id}:`, error);
            return null;
          }
        })
      );
      
      setCertificates(certificateData.filter(cert => cert !== null));
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeCertificate = async (certificateId) => {
    if (!window.confirm('Are you sure you want to revoke this certificate?')) {
      return;
    }

    try {
      const tx = await contract.revokeCertificate(certificateId);
      await tx.wait();
      
      // Reload certificates
      await loadCertificates();
      
      alert('Certificate revoked successfully!');
    } catch (error) {
      console.error('Error revoking certificate:', error);
      alert('Error revoking certificate. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <h3>Loading Certificates...</h3>
          <p>Please wait while we fetch your certificates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>My Certificates</h2>
      <p>View and manage certificates issued by you or certificates you own.</p>
      
      {certificates.length === 0 ? (
        <div className="alert alert-info">
          <h3>No Certificates Found</h3>
          <p>You haven't issued or received any certificates yet.</p>
        </div>
      ) : (
        <div className="grid">
          {certificates.map((certificate) => (
            <div key={certificate.id} className="certificate-card">
              <h3>{certificate.studentName}</h3>
              <div className="meta">
                <strong>Institute:</strong> {certificate.instituteName}
              </div>
              <div className="meta">
                <strong>Course:</strong> {certificate.courseName}
              </div>
              <div className="meta">
                <strong>Issue Date:</strong> {new Date(Number(certificate.issueDate) * 1000).toLocaleDateString()}
              </div>
              <div className="meta">
                <strong>Certificate ID:</strong> {certificate.id}
              </div>
              <div className="meta">
                <strong>Status:</strong> 
                <span className={`status ${certificate.isValid ? 'valid' : 'invalid'}`}>
                  {certificate.isValid ? 'Valid' : 'Revoked'}
                </span>
              </div>
              
              <div style={{ marginTop: '15px' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => window.open(`https://ipfs.io/ipfs/${certificate.ipfsHash}`, '_blank')}
                >
                  View Certificate
                </button>
                
                {certificate.isValid && certificate.issuer.toLowerCase() === account.toLowerCase() && (
                  <button 
                    className="btn btn-danger"
                    onClick={() => revokeCertificate(certificate.id)}
                    style={{ marginLeft: '10px' }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <button className="btn" onClick={loadCertificates}>
          Refresh Certificates
        </button>
      </div>
    </div>
  );
};

export default CertificateList;

