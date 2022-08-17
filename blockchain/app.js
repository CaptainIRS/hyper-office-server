const { execSync } = require('child_process');
const express = require("express");
const app = new express();
var sha256File = require('sha256-file');

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const execScript = (script, args = "") => {
    console.log(`scripts/${script}.sh ${args}`);
    try {
        let result = execSync(`scripts/${script}.sh ${args}`, {
            shell: '/bin/sh'
        });
        console.log(result.toString());
        return (result.toString());
    } catch (e) {
        console.log(e.toString())
        return (e.stdout.toString() + e.toString());
    }
}

app.get('/', async (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.get('/node_modules/xterm/css/xterm.css', async (req, res) => {
    res.sendFile(__dirname + '/node_modules/xterm/css/xterm.css');
})

app.get('/node_modules/xterm/lib/xterm.js', async (req, res) => {
    res.sendFile(__dirname + '/node_modules/xterm/lib/xterm.js');
})

const args = {
    setenv: [],
    cleanup: [],
    checkPrereqs: [],
    cleanupOrgs: [],
    createPeerOrg_Admin: ['Administration', 'administration', 'hyper-office.com', 7051, 7054],
    createPeerOrg_Stakeholders: ['Stakeholders', 'stakeholders', 'hyper-office.com', 9051, 8054],
    createOrdererOrg: ['hyper-office.com'],
    createConsortium: ['TwoOrgsOrdererGenesis'],
    networkUp: [],
    createChannel: ['documentchannel', 'Administration', 'administration', 'hyper-office.com', 0, 7051, "TwoOrgsChannel"],
    joinChannel_Admin: ['documentchannel', 'Administration', 'administration', 'hyper-office.com', 0, 7051],
    joinChannel_Stakeholders: ['documentchannel', 'Stakeholders', 'stakeholders', 'hyper-office.com', 0, 9051],
    setAnchorPeer_Admin: ['documentchannel', 'Administration', 'administration', 'hyper-office.com', 0, 7051],
    setAnchorPeer_Stakeholders: ['documentchannel', 'Stakeholders', 'stakeholders', 'hyper-office.com', 0, 9051],
    deployChainCode_Admin: ['documentchannel', 'Administration', 'administration', 'hyper-office.com', 0, 7051, 'records', '../chaincode/records'],
    deployChainCode_Stakeholders: ['documentchannel', 'Stakeholders', 'stakeholders', 'hyper-office.com', 0, 9051, 'records', '../chaincode/records'],
    checkChainCodeCommitReadiness: ['documentchannel', 'Stakeholders', 'stakeholders', 'hyper-office.com', 0, 9051, 'records'],
    approveChainCode_Admin: ['documentchannel', 'Administration', 'administration', 'hyper-office.com', 0, 7051, 'records'],
    approveChainCode_Stakeholders: ['documentchannel', 'Stakeholders', 'stakeholders', 'hyper-office.com', 0, 9051, 'records'],
    commitChainCode: ['documentchannel', 'Stakeholders', 'stakeholders', 'hyper-office.com', 0, 9051, 'records'],
    queryCommitted: ['documentchannel', 'Stakeholders', 'stakeholders', 'hyper-office.com', 0, 9051, 'records'],
    networkDown: []
}

app.get('/scripts/:script', (req, res) => {
    var script = req.params.script;
    var scriptArgs = args[script];
    if (script === 'approveChainCode_Admin' || script === 'approveChainCode_Stakeholders') {
        var sha256 = sha256File(__dirname + '/records.tar.gz');
        console.log(`SHA256: ${sha256}`);
        scriptArgs.push(`records_1.0:${sha256}`);
    }
    let result = execScript(script.split('_')[0], scriptArgs?.join(' ') ?? '');
    res.send(result);
})

app.listen(3000, () => {
	console.log(`App running on port: 3000`);
});
