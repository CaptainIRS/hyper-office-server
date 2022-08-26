const { enrollUser, enrollAdministrator, enrollModerator, addFile } = require('./utils/blockchain');
const models = require('./utils/cassandra');
const ipfs = require('./utils/ipfs');
const bcrypt = require('bcrypt');

let workflow, form, user_email;
const base64Pdf = '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RGV2aWNlUkdCCiAgL1NNYXNrIDEwIDAgUgogIC9GaWx0ZXIgWyAvRmxhdGVEZWNvZGUgXQogIC9MZW5ndGggNDEKPj4gc3RyZWFtCnic7cExAQAAAMKg9U9tCy+gAAAAAAAAAAAAAAAAAAAAAAAA4GdLAAABCmVuZHN0cmVhbSBlbmRvYmoKCjEyIDAgb2JqIDw8CiAgL1R5cGUgL1hPYmplY3QKICAvU3VidHlwZSAvSW1hZ2UKICAvV2lkdGggODAKICAvSGVpZ2h0IDgwCiAgL0JpdHNQZXJDb21wb25lbnQgOAogIC9Db2xvclNwYWNlIC9EZXZpY2VHcmF5CiAgL0ZpbHRlciBbIC9GbGF0ZURlY29kZSBdCiAgL0xlbmd0aCAxMjgKPj4gc3RyZWFtCnic7dOxDYAgEEZh1mYcx7GgdgA2oCQkaOJpjByJIo36Xnl/+DqMUQp5zWqjlTFoo97HvfFckie+WJa8jKlYdi93Ce9n3rAV5eAGJSdj3C9Vr+1/vN+bJN3b1uvevfDw8PDw8PDw8PDw8PDw8Hp6jdW8h+H9xetU23egYzM9W9SDCmVuZHN0cmVhbSBlbmRvYmoKCjEzIDAgb2JqIDw8CiAgL1R5cGUgL1hPYmplY3QKICAvU3VidHlwZSAvSW1hZ2UKICAvV2lkdGggODAKICAvSGVpZ2h0IDgwCiAgL0JpdHNQZXJDb21wb25lbnQgOAogIC9Db2xvclNwYWNlIC9EZXZpY2VSR0IKICAvU01hc2sgMTIgMCBSCiAgL0ZpbHRlciBbIC9GbGF0ZURlY29kZSBdCiAgL0xlbmd0aCA0MQo+PiBzdHJlYW0KeJztwTEBAAAAwqD1T20LL6AAAAAAAAAAAAAAAAAAAAAAAADgZ0sAAAEKZW5kc3RyZWFtIGVuZG9iagoKeHJlZgowIDE0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNyAwMDAwMCBuIAowMDAwMDAwMDcxIDAwMDAwIG4gCjAwMDAwMDAxNDMgMDAwMDAgbiAKMDAwMDAwMDQyNCAwMDAwMCBuIAowMDAwMDAzODE0IDAwMDAwIG4gCjAwMDAwMDQxMjMgMDAwMDAgbiAKMDAwMDAwNDIwNSAwMDAwMCBuIAowMDAwMDA0MjgyIDAwMDAwIG4gCjAwMDAwMDcyMzkgMDAwMDAgbiAKMDAwMDAwNzU3MSAwMDAwMCBuIAowMDAwMDA3OTkxIDAwMDAwIG4gCjAwMDAwMDgyMzYgMDAwMDAgbiAKMDAwMDAwODU1NCAwMDAwMCBuIAoKdHJhaWxlcgo8PAogIC9TaXplIDE0CiAgL1Jvb3QgMSAwIFIKICAvSW5mbyAzIDAgUgo+PgoKc3RhcnR4cmVmCjg3OTkKJSVFT0YK';

const register = async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Passw0rd!', salt);

    const randomInt = Math.floor(Math.random() * 1000);
    const user_email = `user${randomInt}@user.com`;
    const mod_email = `mod${randomInt}@mod.com`;
    const admin_email = `admin${randomInt}@admin.com`
    await enrollUser(user_email);
    const user =  new models.instance.User({
        email: user_email,
        name: 'User\'s Name',
        password: hash,
        role: 'User',
    })
    await user.saveAsync();

    await enrollModerator(mod_email);
    const moderator =  new models.instance.User({
        email: mod_email,
        name: 'Mod',
        password: hash,
        role: 'Moderator',
    });
    await moderator.saveAsync();

    await enrollAdministrator(admin_email);
    const admin =  new models.instance.User({
        email: admin_email,
        name: 'Admin',
        password: hash,
        role: 'Administrator',
    });
    await admin.saveAsync();
}

const createWorkflow = async () => {
    workflow = new models.instance.Workflow({
        name: 'Scholarship approval flow',
        state: [
            {
                status: 'Mod Approval',
                designation: 'Moderator',
            },
            {
                status: 'Admin Approval',
                designation: 'Administrator',
            },
        ],
        id: models.uuid(),
    });
    await workflow.saveAsync();
}

const createForms = async () => {
    form = new models.instance.Form({
        name: 'ICCR Scholarship Application Form',
        data: '[{"id":"80e1a776-580f-496d-9a46-f373ece7452b","element":"Header","label":{"blocks":[{"key":"an4qe","text":"APPLICATION FORM","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}},{"id":"15c51501-541c-45dc-9ad4-666c916e8c02","element":"TextInput","required":false,"label":{"blocks":[{"key":"bgj2","text":"Full Name","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}},"value":""},{"id":"16e20bf7-59c7-4c41-9f09-967d0ccbbabd","element":"RadioButtons","required":false,"label":{"blocks":[{"key":"4kk1c","text":"Gender","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}},"options":[{"id":"a4ffb8ef-f7c6-458c-884a-b6327f5f2d24","label":"Male","value":"Male","checked":false},{"id":"8686aff2-c78b-4ca6-8cc2-cf60416ae3d5","label":"Female","value":"Female","checked":false},{"id":"990deae0-28c7-4a52-9e14-4828b82fd36d","label":"Other","value":"Other","checked":false}]},{"id":"889ec9ca-90e4-447c-aa14-ec52e3182fb0","element":"NumberInput","required":true,"label":{"blocks":[{"key":"bnt6k","text":"Contact No.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}},"value":0},{"id":"901f52be-52e6-4704-a8cd-cc7cc904ebe5","element":"Email","required":true,"label":{"blocks":[{"key":"85i4p","text":"Email","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}},"value":""},{"id":"2e7a9434-82f6-4767-9be4-4dd0d031f007","element":"TextInput","required":false,"label":{"blocks":[{"key":"dmqsa","text":"Address","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}},"value":""},{"id":"b9f36df6-a3fa-4f57-a760-9cd21399ff5c","element":"Date","required":true,"label":{"blocks":[{"key":"a761b","text":"Date of birth","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}},"value":"2022-08-25T18:07:30.568Z","maxDate":null,"minDate":"1900-12-31T18:38:50.000Z"},{"id":"82233522-14e7-4a8c-bb7a-3264f56265c1","element":"TextInput","required":false,"label":{"blocks":[{"key":"a8r7d","text":"Nationality","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}},"value":""},{"id":"64db93f2-2caf-4403-885c-38e8b6607ba3","element":"RadioButtons","required":false,"label":{"blocks":[{"key":"4ae1k","text":"Knowledge of proficiency in English","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}},"options":[{"id":"5250a42d-0001-4077-907e-26835b326992","label":"Good","value":"Good","checked":false},{"id":"a3c9e2f9-d3bd-4f28-a4ac-a38a2317ce22","label":"Fair","value":"Fair","checked":false},{"id":"e1b9ada4-207f-4234-be6a-93d824874135","label":"Poor","value":"Poor","checked":false}]},{"id":"58165b49-bd9f-4b3e-b1b3-a00a38ea788b","element":"TextArea","required":false,"label":{"blocks":[{"key":"8qi47","text":"Have you travelled or lived in India in the past? If so, mention places visited and dates of such visits.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}},"value":""},{"id":"b815e709-3a6d-451f-a2a1-b50e75c4a827","element":"TextArea","required":false,"label":{"blocks":[{"key":"3fh6c","text":"Any general remarks which you would like to offer","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}},"value":""}]',
        workflow: workflow.id,
        depends_on: [],
        id: models.uuid(),
    });
    await form.saveAsync();
}

const savePdf = async () => {
    const fileBuffer = Buffer.from(base64Pdf, 'base64');
    const ipfsFile = await ipfs.add(fileBuffer);
    const hash = ipfsFile.cid.toString();
    const owner = {
        email: user_email,
        role: 'User'
    }
    await addFile(owner, workflow.state, hash, 'Scholarship form response by User');
}

const seed = async () => {
    await register();
    await createWorkflow();
    await createForms();
    await savePdf();
    console.log('Generated Users: ', user_email, mod_email, admin_email);
}

seed().then(() => console.log('Seeding complete')).catch(err => console.log(err)).finally(() => process.exit());
