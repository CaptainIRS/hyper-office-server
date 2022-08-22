'use strict';

const { Contract } = require('fabric-contract-api')

class DocumentContract extends Contract {

    constructor() {
        super('DocumentContract');

        this.fileId = 0;
    }

    async getFile(ctx, fileId) {
        console.log(`Getting file with fileId: ${fileId}`);
        let detailsAsBytes = await ctx.stub.getState(fileId.toString());
        if (!detailsAsBytes || detailsAsBytes.toString().length <= 0) {
            throw new Error(`File with ID ${fileId} does not exist`);
        }
        let details = JSON.parse(detailsAsBytes.toString());
        return JSON.stringify(details);
    }

    async addFile(ctx, owner, hash) {
        this.fileId++;
        console.log(`Adding file with fileId: ${this.fileId} with owner: ${JSON.stringify(owner)} and hash: ${hash}`);
        let details = {
            owner: owner.email,
            hash,
            states: [],
            currentState: 0,
            transactions: [{"action": "Created", "txId": ctx.stub.getTxID()}],
        };
        const state = await ctx.stub.putState(this.fileId, Buffer.from(JSON.stringify(details)));
        return state;
    }

    async approveFile(ctx, fileId, approver, hash) {
        console.log(`Approving file with fileId: ${fileId} with approver: ${JSON.stringify(approver)} and hash: ${hash}`);
        console.log(JSON.stringify(ctx.stub));
        let detailsAsBytes = await ctx.stub.getState(fileId.toString());
        if (!detailsAsBytes || detailsAsBytes.toString().length <= 0) {
            throw new Error(`File with ID ${fileId} does not exist`);
        }
        let details = JSON.parse(detailsAsBytes.toString());
        if (details.state[details.currentState + 1].designation === approver.role) {
            details.currentState++;
            details.transactions.push({"action": `Approved by ${approver.role}`, "txId": ctx.stub.getTxID()});
            await ctx.stub.putState(fileId, Buffer.from(JSON.stringify(details)));
        } else {
            throw new Error(`File with ID ${fileId} cannot be approved by ${approver}`);
        }
    }

    async queryFilesOfOwner(ctx, owner) {
        console.log(`Querying files of owner: ${JSON.stringify(owner)}`);
        let query = {
            selector: {
                owner: owner.email
            }
        };
        return await ctx.stub.getQueryResultForQueryString(JSON.stringify(query));
    }

    async queryFilesOfApprover(ctx, approver) {
        console.log(`Querying files of approver: ${JSON.stringify(approver)}`);
        let query = {
            selector: {
                "state.designation": approver.role
            }
        };
        return await ctx.stub.getQueryResultForQueryString(JSON.stringify(query));
    }
}

module.exports = DocumentContract;
