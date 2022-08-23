/*
 * SPDX-License-Identifier: MIT
 */

import { Context, Contract, Info, Param, Property, Returns, Transaction } from 'fabric-contract-api';
import { Document } from './document';
import './state';
import { State } from './state';
import { TransactionInfo } from './transaction-info';
import './user';
import { User } from './user';

@Info({title: 'DocumentContract', description: 'Contract for HyperOffice' })
export class DocumentContract extends Contract {
    @Property()
    documentId: number;

    constructor() {
        super('DocumentContract');

        this.documentId = 0;
    }

    @Transaction(false)
    @Returns('boolean')
    public async documentExists(ctx: Context, documentId: string): Promise<boolean> {
        console.log(`Checking if document ${documentId} exists`);
        const data: Uint8Array = await ctx.stub.getState(documentId);
        return (!!data && data.length > 0);
    }

    @Transaction()
    @Param('states', 'Array<State>')
    @Returns('number')
    public async createDocument(ctx: Context, owner: User,  states: State[], hash: string): Promise<number> {
        console.log(`Creating document with owner ${JSON.stringify(owner)} and states ${JSON.stringify(states)}`);
        const document: Document = new Document();
        const createdState: State = {status: 'Created', designation: owner.role};
        document.owner = owner;
        document.hash = hash;
        document.pendingStates = states;
        document.completedStates = [createdState];
        document.nextState = document.pendingStates[0] || null;
        const transactions: TransactionInfo[] = [
            {
                txId: ctx.stub.getTxID(),
                timestamp: new Date().toString(),
                message: 'Document created'
            }
        ];
        document.transactions = JSON.stringify(transactions);
        const buffer: Buffer = Buffer.from(JSON.stringify(document));
        await ctx.stub.putState(`${++this.documentId}`, buffer);
        return this.documentId;
    }

    @Transaction(false)
    @Returns('Document')
    public async readDocument(ctx: Context, documentId: string): Promise<Document> {
        console.log(`Reading document ${documentId}`);

        const exists: boolean = await this.documentExists(ctx, documentId);
        if (!exists) {
            throw new Error(`The document ${documentId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(documentId);
        const document: Document = JSON.parse(data.toString()) as Document;
        return document;
    }

    @Transaction()
    @Returns('Document')
    public async approveDocument(ctx: Context, documentId: string, approver: User, newHash: string): Promise<void> {
        console.log(`Approving document ${documentId} by ${JSON.stringify(approver)}`);
        const exists: boolean = await this.documentExists(ctx, documentId);
        if (!exists) {
            throw new Error(`The document ${documentId} does not exist`);
        }
        const document: Document = await this.readDocument(ctx, documentId);
        if (document.nextState === null) {
            throw new Error(`The document ${documentId} is already approved`);
        }
        if (document.nextState.designation !== approver.role) {
            throw new Error(`The user ${approver.email} is not authorized to approve the document ${documentId}`);
        }
        document.completedStates.push(document.nextState);
        document.pendingStates.shift();
        document.nextState = document.pendingStates[0] || null;
        document.hash = newHash;
        const transactions = JSON.parse(document.transactions) as TransactionInfo[];
        transactions.push({
            txId: ctx.stub.getTxID(),
            timestamp: new Date().toString(),
            message: `Document approved by ${approver.email}`
        });
        document.transactions = JSON.stringify(transactions);
        const buffer: Buffer = Buffer.from(JSON.stringify(document));
        await ctx.stub.putState(documentId, buffer);
    }

    @Transaction(false)
    @Returns('string')
    async queryDocumentsOfOwner(ctx: Context, owner: User): Promise<string> {
        console.log(`Querying documents of owner ${JSON.stringify(owner)}`);
        const query = {
            selector: {
                'owner.email': {
                    $eq: owner.email
                }
            }
        };
        const iterator: any = await ctx.stub.getQueryResult(JSON.stringify(query));
        const documents: Document[] = [];
        let result = await iterator.next();
        while (!result.done) {
            if (result.value && result.value.value.toString()) {
                const value = result.value.value.toString('utf8');
                console.log(value);
                const document: Document = JSON.parse(value) as Document;
                documents.push(document);
            }
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(documents);
    }

    @Transaction(false)
    @Returns('string')
    async queryDocumentsOfApprover(ctx: Context, approver: User): Promise<string> {
        console.log(`Querying documents of approver ${JSON.stringify(approver)}`);
        const query = {
            selector: {
                nextState: {
                    designation: approver.role
                }
            }
        };
        const iterator: any = await ctx.stub.getQueryResult(JSON.stringify(query));
        const documents: Document[] = [];
        let result = await iterator.next();
        while (!result.done) {
            if (result.value && result.value.value.toString()) {
                const value = result.value.value.toString('utf8');
                console.log(value);
                const document: Document = JSON.parse(value) as Document;
                documents.push(document);
            }
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(documents);
    }
}
