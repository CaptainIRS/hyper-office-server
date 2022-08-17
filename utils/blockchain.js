const fabricNetwork = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");

const AppUtil = require("./blockchain/AppUtil");
const CAUtil = require("./blockchain/CAUtil");

AppUtil.buildWallet(fabricNetwork.Wallets, "../wallet")
  .then(async (wallet) => {
    const administrationConnectionProfile = AppUtil.buildCCPAdministration();
    const administrationCA = CAUtil.buildCAClient(
      FabricCAServices,
      administrationConnectionProfile,
      "ca.administration.hyper-office.com"
    );
    await CAUtil.enrollAdmin(administrationCA, wallet, "AdministrationMSP");
    const gatewayOptions = {
      identity: "admin",
      wallet,
    };
    const gateway = new fabricNetwork.Gateway();
    gateway
      .connect(administrationConnectionProfile, gatewayOptions)
      .then(async () => {
        const channelName = "documentchannel";
        const chaincodeId = "records";

        try {
          // Obtain the smart contract with which our application wants to interact
          const network = await gateway.getNetwork(channelName);
          const contract = network.getContract(chaincodeId);

          // Submit transactions for the smart contract
          // const args = [arg1, arg2];
          // const submitResult = await contract.submitTransaction('queryAllWithUserVerified', ...args);

          // Evaluate queries for the smart contract
          // const evalResult = await contract.evaluateTransaction(
          //   "queryAllWithAdminNotVerified",
          // );

          // console.log(
          //   `Transaction has been evaluated, result is: ${evalResult.toString()}`
          // );

          const fileId = 1;
          const owner = "admin";
          const hash = "hash";
          const type = "document";
          const args = [fileId, owner, hash, type];
          const submitResult = await contract.submitTransaction(
            "addFile",
            ...args
          );
            console.log(
                `Transaction has been evaluated, result is: ${submitResult.toString()}`
            );
        } finally {
          // Disconnect from the gateway peer when all work for this client identity is complete
          gateway.disconnect();
        }
      })
      .catch((err) => {
        console.error(err);
      });
  })
  .catch((err) => {
    console.error(err);
  });
