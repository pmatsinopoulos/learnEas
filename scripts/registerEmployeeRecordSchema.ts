import { EAS, SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

const url = "http://127.0.0.1:8545";

type EasAddresses = {
  eas: string;
  schemaRegistry: string;
};

type Address = {
  url: string;
  addresses: EasAddresses;
};

(async () => {
  const filePath = path.join(__dirname, "../contracts/easContractAddress.json");
  const data = fs.readFileSync(filePath, "utf8");

  const CONTRACT_ADDRESSES = JSON.parse(data).filter(
    (a: Address) => a.url === url
  )[0].addresses;

  const schemaRegistryContractAddress = CONTRACT_ADDRESSES.schemaRegistry;
  console.debug(
    "Schema Registry Contract Address",
    schemaRegistryContractAddress
  );

  const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

  const easContractAddress = CONTRACT_ADDRESSES.eas;
  console.debug("EAS Contract Address", easContractAddress);

  const eas = new EAS(easContractAddress);

  const provider = new ethers.JsonRpcProvider(url);
  console.debug("Provider", provider);

  const signer = await provider.getSigner();

  console.debug("Connecting to EAS contract");
  eas.connect(signer);

  console.debug("Connecting to Schema Registry contract");
  schemaRegistry.connect(signer);

  const schema = "string firstName, string lastName";
  const resolverAddress = "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0";
  const revocable = true;

  const transaction = await schemaRegistry.register({
    schema,
    resolverAddress,
    revocable,
  });

  // Optional: Wait for transaction to be validated
  const receipt = await transaction.wait();
  console.debug("Schema Registration Receipt", receipt);

  const schemaUid = receipt;
  const schemaRecord = await schemaRegistry.getSchema({ uid: schemaUid });
  console.debug("Schema Record", schemaRecord);
})();
