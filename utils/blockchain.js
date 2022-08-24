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
  const wallet = await AppUtil.buildWallet(fabricNetwork.Wallets, process.cwd() + '/stakeholders-wallet');
  await CAUtil.enrollAdmin(stakeholdersCA, wallet, "StakeholdersMSP");
  return await CAUtil.registerAndEnrollUser(stakeholdersCA, wallet, "StakeholdersMSP", email, "stakeholders.user");
}

module.exports.enrollAdministrator = async (email) => {
  const wallet = await AppUtil.buildWallet(fabricNetwork.Wallets, process.cwd() + '/administration-wallet');
  await CAUtil.enrollAdmin(administrationCA, wallet, "AdministrationMSP");
  return await CAUtil.registerAndEnrollUser(administrationCA, wallet, "AdministrationMSP", email, "administration.administrator");
}

module.exports.enrollModerator = async (email) => {
  const wallet = await AppUtil.buildWallet(fabricNetwork.Wallets, process.cwd() + '/administration-wallet');
  await CAUtil.enrollAdmin(administrationCA, wallet, "AdministrationMSP");
  return await CAUtil.registerAndEnrollUser(administrationCA, wallet, "AdministrationMSP", email, "administration.moderator");
}

const performTransaction = async (user, transactionName, transactionType, ...args) => {
  if (!["Administrator", "Moderator", "User"].includes(user.role)) {
    throw new Error("Invalid user");
  }
  let wallet;
  if (user.role === "User") {
    wallet = await AppUtil.buildWallet(fabricNetwork.Wallets, process.cwd() + '/stakeholders-wallet');
    await CAUtil.enrollAdmin(stakeholdersCA, wallet, "StakeholdersMSP");
    await CAUtil.registerAndEnrollUser(stakeholdersCA, wallet, "StakeholdersMSP", user.email, "stakeholders.user");
  } else if (user.role === "Administrator" || user.role === "Moderator") {
    wallet = await AppUtil.buildWallet(fabricNetwork.Wallets, process.cwd() + '/administration-wallet');
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


module.exports.addFile = async (owner, states, hash, name) => {
  return await performTransaction(owner, "createDocument", "submit", JSON.stringify(owner), JSON.stringify(states), hash, name);
}

module.exports.getFile = async (owner, fileId) => {
  return await performTransaction(owner, "readDocument", "evaluate", JSON.stringify(fileId));
}

module.exports.approveFile = async (fileId, approver, hash) => {
  return await performTransaction(approver, "approveDocument", "submit", JSON.stringify(fileId), JSON.stringify(approver), hash);
}

module.exports.rejectFile = async (fileId, rejector) => {
  return await performTransaction(rejector, "rejectDocument", "submit", JSON.stringify(fileId), JSON.stringify(rejector));
}

module.exports.queryFilesOfOwner = async (owner) => {
  return await performTransaction(owner, "queryDocumentsOfOwner", "evaluate", JSON.stringify(owner));
}

module.exports.queryFilesOfApprover = async (approver) => {
  return await performTransaction(approver, "queryDocumentsOfApprover", "evaluate", JSON.stringify(approver));
}

module.exports.getBlockchainUser = async (user) => {
  if (user.role === "User") {
    const wallet = await AppUtil.buildWallet(fabricNetwork.Wallets, process.cwd() + '/stakeholders-wallet');
    return await wallet.get(user.email);
  } else if (user.role === "Administrator" || user.role === "Moderator") {
    const wallet = await AppUtil.buildWallet(fabricNetwork.Wallets, process.cwd() + '/administration-wallet');
    return await wallet.get(user.email);
  }
}
