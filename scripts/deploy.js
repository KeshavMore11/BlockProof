const hre = require("hardhat");

async function main() {
  console.log("Deploying CertificateVerification contract...");

  // Get the contract factory
  const CertificateVerification = await hre.ethers.getContractFactory("CertificateVerification");

  // Deploy the contract
  const certificateVerification = await CertificateVerification.deploy();

  // Wait for deployment to complete
  await certificateVerification.waitForDeployment();

  const contractAddress = await certificateVerification.getAddress();

  console.log("CertificateVerification deployed to:", contractAddress);
  console.log("Contract owner:", await certificateVerification.owner());

  // Save contract address to a file for frontend use
  const fs = require('fs');
  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    './frontend/src/contract-info.json',
    JSON.stringify(contractInfo, null, 2)
  );

  console.log("Contract info saved to frontend/src/contract-info.json");

  // Verify contract on Etherscan if not on localhost
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await certificateVerification.deploymentTransaction().wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

