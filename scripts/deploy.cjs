const hre = require("hardhat");

async function main() {
  const CropPricing = await hre.ethers.getContractFactory("CropPricing");
  const cropPricing = await CropPricing.deploy();

  await cropPricing.waitForDeployment();

  const address = await cropPricing.getAddress();

  console.log("CropPricing deployed to:", address);

  // Wait for a few block confirmations to ensure deployment is propagated
  console.log("Waiting for block confirmations...");
  // await cropPricing.deploymentTransaction().wait(5); 

  console.log(`Verify with: npx hardhat verify --network sepolia ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
