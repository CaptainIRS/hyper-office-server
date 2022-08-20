const { Contract } = require('fabric-contract-api')

class fileContract extends Contract {

    async queryFile(ctx, fileId) {
        console.log(fileId)
        let detailsAsBytes = await ctx.stub.getState(fileId.toString());
        if (!detailsAsBytes || detailsAsBytes.toString().length <= 0) {
            throw new Error('File with this Id does not exist: ');
        }
        let details = JSON.parse(detailsAsBytes.toString());
        return JSON.stringify(details);
    }

    async addFile(ctx, fileId, owner, hash, type) {
        console.log(fileId,typeof fileId,owner,hash,type)
        let details = {
            owner,
            hash,
            with: 'Admin',
            type,
            verified:false
        };
        const k = await ctx.stub.putState(fileId, Buffer.from(JSON.stringify(details)));
        return k;
    }

    async changeFile(ctx, oldhash, newhash) {
        let detailsAsBytes = await ctx.stub.getState(oldhash);
        if (!detailsAsBytes || detailsAsBytes.toString().length <= 0) {
            throw new Error('File with this Id does not exist: ');
        }
        let fileDetails = JSON.parse(detailsAsBytes.toString());
        let details = {
            ...fileDetails,
            hash: newhash,
            verified:true
        };
        const k = await ctx.stub.putState(fileId, Buffer.from(JSON.stringify(details)));
        return k;
    }

    async returnFile(ctx, hash) {
        let detailsAsBytes = await ctx.stub.getState(hash);
        if (!detailsAsBytes || detailsAsBytes.toString().length <= 0) {
            throw new Error('File with this Id does not exist: ');
        }
        let fileDetails = JSON.parse(detailsAsBytes.toString());
        let details = {
            ...fileDetails,
            with: fileDetails.owner
        };
        const k = await ctx.stub.putState(fileId, Buffer.from(JSON.stringify(details)));
        return k;
    }

    async queryAllWithAdminVerified(ctx) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.with = 'Admin';
        queryString.selector.verified = true;

        let iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));
                jsonRes.Key = res.value.key;
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.log(allResults)
                return allResults;
            }
        }
    }

    async queryAllWithAdminNotVerified(ctx) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.with = 'Admin';
        queryString.selector.verified = false;

        let iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));
                jsonRes.Key = res.value.key;
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.log(allResults)
                return allResults;
            }
        }
    }

    async queryAllWithUserVerified(ctx,user) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.owner = user;
        queryString.selector.verified = true;

        let iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));
                jsonRes.Key = res.value.key;
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.log(allResults)
                return allResults;
            }
        }
    }
    
    async queryAllWithUserNotVerified(ctx,user) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.owner = user;
        queryString.selector.verified = false;
        console.log(user);
        let iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value &&  res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));
                jsonRes.Key = res.value.key;
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.log(allResults)
                return allResults;
            }
        }
    }
}

module.exports = fileContract