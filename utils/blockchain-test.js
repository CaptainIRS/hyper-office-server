const blockchain = require("./blockchain");

const user = { email: "user@stakeholders.hyper-office.com", role: "User" };
const administrator = { email: "administrator@administration.hyper-office.com", role: "Administrator" };
const moderator = { email: "moderator@administration.hyper-office.com", role: "Moderator" };

const green = "\x1b[32m";
const clear = "\x1b[0m";

const approveTestFlow = async () => {
    console.log(`${green}Adding file to blockchain...${clear}`);
    const fileId = (await blockchain.addFile(
        user,
            [
                { status: "Approval by Administrator", designation: "Administrator" },
                { status: "Approval by Moderator", designation: "Moderator" },
            ],
            "hash1"
        )).toString();
    console.log(`${green}File added to blockchain with id: ${fileId}${clear}`);
    
    console.log(`${green}Getting file from blockchain...${clear}`);
    console.log((await blockchain.getFile(user, parseInt(fileId))).toString());

    console.log(`${green}Querying files of owner...${clear}`);
    console.log((await blockchain.queryFilesOfOwner(user)).toString());

    console.log(`${green}Querying files of approver (administrator) - Should return some files...${clear}`);
    console.log((await blockchain.queryFilesOfApprover(administrator)).toString());
  
    console.log(`${green}Querying files of approver (moderator) - Should return nothing...${clear}`);
    console.log((await blockchain.queryFilesOfApprover(moderator)).toString());

    console.log(`${green}Approving file as moderator (should fail)...${clear}`);
    try {
        await blockchain.approveFile(parseInt(fileId), moderator, "hash2");
    } catch (e) {
        console.log(`${green}File approval failed as expected: ${e.message}${clear}`);
    }

    console.log(`${green}Approving file as administrator (should succeed)...${clear}`);
    await blockchain.approveFile(parseInt(fileId), administrator, "hash2");

    console.log(`${green}Querying files of owner...${clear}`);
    console.log((await blockchain.queryFilesOfOwner(user)).toString());

    console.log(`${green}Querying files of approver (moderator) - Should return some files...${clear}`);
    console.log((await blockchain.queryFilesOfApprover(moderator)).toString());

    console.log(`${green}Approving file as moderator (should succeed)...${clear}`);
    await blockchain.approveFile(parseInt(fileId), moderator, "hash3");

    console.log(`${green}Querying files of owner...${clear}`);
    console.log((await blockchain.queryFilesOfOwner(user)).toString());

    console.log(`${green}Approving file as administrator (should fail as no more approvals pending)...${clear}`);
    try {
        await blockchain.approveFile(parseInt(fileId), administrator, "hash3");
    } catch (e) {
        console.log(`${green}File approval failed as expected: ${e.message}${clear}`);
    }

    console.log(`${green}Rejecting file as moderator (should fail)...${clear}`);
    try {
        await blockchain.rejectFile(parseInt(fileId), moderator);
    } catch (e) {
        console.log(`${green}File rejection failed as expected: ${e.message}${clear}`);
    }    
};

const rejectTestFlow = async () => {
    console.log(`${green}Adding file to blockchain...${clear}`);
    const fileId = (await blockchain.addFile(
        user,
            [
                { status: "Approval by Administrator", designation: "Administrator" },
                { status: "Approval by Moderator", designation: "Moderator" },
            ],
            "hash1"
        )).toString();
    console.log(`${green}File added to blockchain with id: ${fileId}${clear}`);

    console.log(`${green}Getting file from blockchain...${clear}`);
    console.log((await blockchain.getFile(user, parseInt(fileId))).toString());

    console.log(`${green}Querying files of owner...${clear}`);
    console.log((await blockchain.queryFilesOfOwner(user)).toString());

    console.log(`${green}Rejecting file as moderator (should fail)...${clear}`);
    try {
        await blockchain.rejectFile(parseInt(fileId), moderator);
    } catch (e) {
        console.log(`${green}File rejection failed as expected: ${e.message}${clear}`);
    }

    console.log(`${green}Rejecting file as administrator (should succeed)...${clear}`);
    await blockchain.rejectFile(parseInt(fileId), administrator);

    console.log(`${green}Rejecting file as moderator (should fail)...${clear}`);
    try {
        await blockchain.rejectFile(parseInt(fileId), moderator);
    } catch (e) {
        console.log(`${green}File rejection failed as expected: ${e.message}${clear}`);
    }
}

const runTestFlow = async () => {
    console.log(`${green}Running test flow...${clear}`);
    await approveTestFlow();
    console.log(`${green}Approve test flow completed successfully${clear}`);
    await rejectTestFlow();
    console.log(`${green}Reject test flow completed successfully${clear}`);
}

runTestFlow().then(() => {
    console.log(`${green}Test flow completed successfully${clear}`);
});
