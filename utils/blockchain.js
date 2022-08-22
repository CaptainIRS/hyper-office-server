const fabricNetwork = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");

const AppUtil = require("./blockchain/AppUtil");
const CAUtil = require("./blockchain/CAUtil");

const channelName = "documentchannel";
const chaincodeId = "records";

const administrationConnectionProfile = AppUtil.buildCCPAdministration();
const administrationCA = CAUtil.buildCAClient(
  FabricCAServices,
  administrationConnectionProfile,
  "ca.administration.hyper-office.com"
);

const stakeholdersConnectionProfile = AppUtil.buildCCPStakeholders();
const stakeholdersCA = CAUtil.buildCAClient(
  FabricCAServices,
  stakeholdersConnectionProfile,
  "ca.stakeholders.hyper-office.com"
);

module.exports.enrollUser = async (email) => {
  const wallet = await AppUtil.buildWallet(fabricNetwork.Wallets, process.cwd() + '/wallet');
  await CAUtil.enrollAdmin(stakeholdersCA, wallet, "StakeholdersMSP");
  return await CAUtil.registerAndEnrollUser(stakeholdersCA, wallet, "StakeholdersMSP", email, "stakeholders.user");
}

module.exports.enrollAdministrator = async (email) => {
  const wallet = await AppUtil.buildWallet(fabricNetwork.Wallets, process.cwd() + '/wallet');
  await CAUtil.enrollAdmin(administrationCA, wallet, "AdministrationMSP");
  return await CAUtil.registerAndEnrollUser(administrationCA, wallet, "AdministrationMSP", email, "administration.administrator");
}

module.exports.enrollModerator = async (email) => {
  const wallet = await AppUtil.buildWallet(fabricNetwork.Wallets, process.cwd() + '/wallet');
  await CAUtil.enrollAdmin(administrationCA, wallet, "AdministrationMSP");
  return await CAUtil.registerAndEnrollUser(administrationCA, wallet, "AdministrationMSP", email, "administration.moderator");
}

const performTransaction = async (user, transactionName, transactionType, ...args) => {
  if (!["Administrator", "Moderator", "User"].includes(user.role)) {
    throw new Error("Invalid user");
  }
  const wallet = await AppUtil.buildWallet(fabricNetwork.Wallets, process.cwd() + '/wallet');
  if (user.role === "User") {
    await CAUtil.enrollAdmin(stakeholdersCA, wallet, "StakeholdersMSP");
    await CAUtil.registerAndEnrollUser(stakeholdersCA, wallet, "StakeholdersMSP", user.email, "stakeholders.user");
  } else if (user.role === "Administrator" || user.role === "Moderator") {
    let affiliation;
    if (user.role === "Administrator") {
      affiliation = "administration.administrator";
    } else {
      affiliation = "administration.moderator";
    }
    await CAUtil.enrollAdmin(administrationCA, wallet, "AdministrationMSP");
    await CAUtil.registerAndEnrollUser(administrationCA, wallet, "AdministrationMSP", user.email, affiliation);
  }
  const gatewayOptions = {
    identity: user.email,
    wallet,
  };
  const gateway = new fabricNetwork.Gateway();
  if (user.role === "User") {
    await gateway.connect(stakeholdersConnectionProfile, gatewayOptions);
  } else if (user.role === "Administrator" || user.role === "Moderator") {
    await gateway.connect(administrationConnectionProfile, gatewayOptions);
  }
  const network = await gateway.getNetwork(channelName);
  const contract = network.getContract(chaincodeId);
  let result;
  if (transactionType === "submit") {
    result = await contract.submitTransaction(transactionName, ...args);
  } else if (transactionType === "evaluate") {
    result = await contract.evaluateTransaction(transactionName, ...args);
  }
  console.log(
    `Transaction has been evaluated, result is: ${result.toString()}`
  );
  gateway.disconnect();

  return result;
}


module.exports.addFile = async (owner, hash) => {
  return await performTransaction(owner, "addFile", "submit", [owner, hash]);
}

module.exports.getFile = async (fileId) => {
  return await performTransaction(owner, "getFile", "evaluate", [fileId]);
}

module.exports.approveFile = async (fileId, approver, hash) => {
  return await performTransaction(owner, "approveFile", "submit", [fileId, approver, hash]);
}

module.exports.queryFilesOfOwner = async (owner) => {
  return await performTransaction(owner, "queryFilesOfOwner", "evaluate", [owner]);
}

module.exports.queryFilesOfApprover = async (approver) => {
  return await performTransaction(owner, "queryFilesOfApprover", "evaluate", [approver]);
}

module.exports.getBlockchainUser = async (email) => {
  const wallet = await AppUtil.buildWallet(fabricNetwork.Wallets, process.cwd() + '/wallet');
  return await wallet.get(email);
}
