const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateVerification", function () {
  let certificateVerification;
  let owner;
  let student;
  let institute;

  beforeEach(async function () {
    [owner, student, institute] = await ethers.getSigners();
    
    const CertificateVerification = await ethers.getContractFactory("CertificateVerification");
    certificateVerification = await CertificateVerification.deploy();
    await certificateVerification.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await certificateVerification.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero certificates", async function () {
      expect(await certificateVerification.getTotalCertificates()).to.equal(0);
    });
  });

  describe("Certificate Issuance", function () {
    it("Should issue a certificate successfully", async function () {
      const studentName = "John Doe";
      const instituteName = "Tech University";
      const courseName = "Computer Science";
      const ipfsHash = "QmTestHash123";

      const tx = await certificateVerification.issueCertificate(
        studentName,
        instituteName,
        courseName,
        ipfsHash,
        student.address
      );

      await expect(tx)
        .to.emit(certificateVerification, "CertificateIssued")
        .withArgs(1, studentName, instituteName, courseName, await tx.getBlock().then(b => b.timestamp), ipfsHash, owner.address);

      expect(await certificateVerification.getTotalCertificates()).to.equal(1);
      expect(await certificateVerification.certificateExistsCheck(1)).to.be.true;
    });

    it("Should fail to issue certificate with empty student name", async function () {
      await expect(
        certificateVerification.issueCertificate(
          "",
          "Tech University",
          "Computer Science",
          "QmTestHash123",
          student.address
        )
      ).to.be.revertedWith("Student name cannot be empty");
    });

    it("Should fail to issue certificate with empty IPFS hash", async function () {
      await expect(
        certificateVerification.issueCertificate(
          "John Doe",
          "Tech University",
          "Computer Science",
          "",
          student.address
        )
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });
  });

  describe("Certificate Verification", function () {
    beforeEach(async function () {
      await certificateVerification.issueCertificate(
        "John Doe",
        "Tech University",
        "Computer Science",
        "QmTestHash123",
        student.address
      );
    });

    it("Should verify a valid certificate", async function () {
      const [isValid, certificateData] = await certificateVerification.verifyCertificate(1);
      
      expect(isValid).to.be.true;
      expect(certificateData.studentName).to.equal("John Doe");
      expect(certificateData.instituteName).to.equal("Tech University");
      expect(certificateData.courseName).to.equal("Computer Science");
      expect(certificateData.ipfsHash).to.equal("QmTestHash123");
    });

    it("Should fail to verify non-existent certificate", async function () {
      await expect(
        certificateVerification.verifyCertificate(999)
      ).to.be.revertedWith("Certificate does not exist");
    });
  });

  describe("Certificate Revocation", function () {
    beforeEach(async function () {
      await certificateVerification.issueCertificate(
        "John Doe",
        "Tech University",
        "Computer Science",
        "QmTestHash123",
        student.address
      );
    });

    it("Should revoke a certificate successfully", async function () {
      const tx = await certificateVerification.revokeCertificate(1);
      
      await expect(tx)
        .to.emit(certificateVerification, "CertificateRevoked")
        .withArgs(1, owner.address);

      const [isValid] = await certificateVerification.verifyCertificate(1);
      expect(isValid).to.be.false;
    });

    it("Should fail to revoke non-existent certificate", async function () {
      await expect(
        certificateVerification.revokeCertificate(999)
      ).to.be.revertedWith("Certificate does not exist");
    });
  });

  describe("Access Control", function () {
    it("Should fail to issue certificate from non-owner", async function () {
      await expect(
        certificateVerification.connect(student).issueCertificate(
          "John Doe",
          "Tech University",
          "Computer Science",
          "QmTestHash123",
          student.address
        )
      ).to.be.revertedWithCustomError(certificateVerification, "OwnableUnauthorizedAccount");
    });
  });
});

