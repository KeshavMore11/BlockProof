// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CertificateVerification
 * @dev A smart contract for storing and verifying certificate hashes on the blockchain
 * @author Keshav
 */
contract CertificateVerification is Ownable, ReentrancyGuard {
    
    // Struct to store certificate information
    struct Certificate {
        string studentName;
        string instituteName;
        string courseName;
        uint256 issueDate;
        string ipfsHash;
        bool isValid;
        address issuer;
    }
    
    // Mapping from certificate ID to certificate data
    mapping(uint256 => Certificate) public certificates;
    
    // Mapping to check if a certificate ID exists
    mapping(uint256 => bool) public certificateExists;
    
    // Mapping to store certificates by student address
    mapping(address => uint256[]) public studentCertificates;
    
    // Mapping to store certificates by institute
    mapping(address => uint256[]) public instituteCertificates;
    
    // Counter for certificate IDs
    uint256 public certificateCounter;
    
    // Events
    event CertificateIssued(
        uint256 indexed certificateId,
        string studentName,
        string instituteName,
        string courseName,
        uint256 issueDate,
        string ipfsHash,
        address indexed issuer
    );
    
    event CertificateRevoked(
        uint256 indexed certificateId,
        address indexed issuer
    );
    
    event CertificateVerified(
        uint256 indexed certificateId,
        bool isValid
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Issue a new certificate
     * @param _studentName Name of the student
     * @param _instituteName Name of the institute
     * @param _courseName Name of the course
     * @param _ipfsHash IPFS hash of the certificate file
     * @param _studentAddress Address of the student (optional)
     */
    function issueCertificate(
        string memory _studentName,
        string memory _instituteName,
        string memory _courseName,
        string memory _ipfsHash,
        address _studentAddress
    ) external onlyOwner nonReentrant returns (uint256) {
        require(bytes(_studentName).length > 0, "Student name cannot be empty");
        require(bytes(_instituteName).length > 0, "Institute name cannot be empty");
        require(bytes(_courseName).length > 0, "Course name cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        certificateCounter++;
        uint256 certificateId = certificateCounter;
        
        certificates[certificateId] = Certificate({
            studentName: _studentName,
            instituteName: _instituteName,
            courseName: _courseName,
            issueDate: block.timestamp,
            ipfsHash: _ipfsHash,
            isValid: true,
            issuer: msg.sender
        });
        
        certificateExists[certificateId] = true;
        
        // Add to student's certificate list if address provided
        if (_studentAddress != address(0)) {
            studentCertificates[_studentAddress].push(certificateId);
        }
        
        // Add to institute's certificate list
        instituteCertificates[msg.sender].push(certificateId);
        
        emit CertificateIssued(
            certificateId,
            _studentName,
            _instituteName,
            _courseName,
            block.timestamp,
            _ipfsHash,
            msg.sender
        );
        
        return certificateId;
    }
    
    /**
     * @dev Revoke a certificate (mark as invalid)
     * @param _certificateId ID of the certificate to revoke
     */
    function revokeCertificate(uint256 _certificateId) external onlyOwner {
        require(certificateExists[_certificateId], "Certificate does not exist");
        require(certificates[_certificateId].isValid, "Certificate already revoked");
        
        certificates[_certificateId].isValid = false;
        
        emit CertificateRevoked(_certificateId, msg.sender);
    }
    
    /**
     * @dev Verify a certificate
     * @param _certificateId ID of the certificate to verify
     * @return isValid Whether the certificate is valid
     * @return certificateData The certificate data
     */
    function verifyCertificate(uint256 _certificateId) 
        external 
        view 
        returns (bool isValid, Certificate memory certificateData) 
    {
        require(certificateExists[_certificateId], "Certificate does not exist");
        
        certificateData = certificates[_certificateId];
        isValid = certificateData.isValid;
        
        return (isValid, certificateData);
    }
    
    /**
     * @dev Get certificate details by ID
     * @param _certificateId ID of the certificate
     * @return Certificate data
     */
    function getCertificate(uint256 _certificateId) 
        external 
        view 
        returns (Certificate memory) 
    {
        require(certificateExists[_certificateId], "Certificate does not exist");
        return certificates[_certificateId];
    }
    
    /**
     * @dev Get all certificates for a student
     * @param _studentAddress Address of the student
     * @return Array of certificate IDs
     */
    function getStudentCertificates(address _studentAddress) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return studentCertificates[_studentAddress];
    }
    
    /**
     * @dev Get all certificates issued by an institute
     * @param _instituteAddress Address of the institute
     * @return Array of certificate IDs
     */
    function getInstituteCertificates(address _instituteAddress) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return instituteCertificates[_instituteAddress];
    }
    
    /**
     * @dev Get total number of certificates
     * @return Total certificate count
     */
    function getTotalCertificates() external view returns (uint256) {
        return certificateCounter;
    }
    
    /**
     * @dev Check if a certificate exists
     * @param _certificateId ID of the certificate
     * @return Whether the certificate exists
     */
    function certificateExistsCheck(uint256 _certificateId) external view returns (bool) {
        return certificateExists[_certificateId];
    }
}

