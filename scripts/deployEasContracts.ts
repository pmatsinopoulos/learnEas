import { ethers } from "hardhat";
import { Contracts as EasContracts } from "@ethereum-attestation-service/eas-sdk";
import path from "path";
import fs from "fs/promises";
import { JsonRpcSigner } from "ethers";

const url = "http://127.0.0.1:8545";

async function deploySchemaRegistryContract(
  signer: JsonRpcSigner
): Promise<string> {
  const SchemaRegistryFactory = new EasContracts.SchemaRegistry__factory(
    EasContracts.SchemaRegistry__factory.abi,
    EasContracts.SchemaRegistry__factory.bytecode,
    signer
  );
  const schemaRegistry = await SchemaRegistryFactory.deploy();

  await schemaRegistry.waitForDeployment();

  const schemaRegistryAddress = await schemaRegistry.getAddress();

  console.log("Schema Registry Contract address:", schemaRegistryAddress);

  return schemaRegistryAddress;
}

async function deployEasContract(
  signer: JsonRpcSigner,
  schemaRegistryAddress: string
): Promise<string> {
  const EasFactory = new EasContracts.EAS__factory(
    EasContracts.EAS__factory.abi,
    EasContracts.EAS__factory.bytecode,
    signer
  );
  const eas = await EasFactory.deploy(schemaRegistryAddress);

  await eas.waitForDeployment();

  const easAddress = await eas.getAddress();

  return easAddress;
}

async function main() {
  const provider = new ethers.JsonRpcProvider(url);
  const signer = await provider.getSigner();

  const schemaRegistryAddress = await deploySchemaRegistryContract(signer);

  // let filePath = path.join(__dirname, "../artifacts/schemaRegistryAddress.txt");
  // await fs.writeFile(filePath, schemaRegistryAddress);
  // console.log(`Contract address saved to ${filePath}`);

  const easAddress = await deployEasContract(signer, schemaRegistryAddress);

  const easContractAddress = {
    eas: easAddress,
    schemaRegistry: schemaRegistryAddress,
  };

  const filePath = path.join(__dirname, "../artifacts/easContractAddress.json");
  await fs.writeFile(filePath, JSON.stringify(easContractAddress));
  console.log(`Contract address saved to ${filePath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
