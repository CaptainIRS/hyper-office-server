module.exports =  getTabs = (role) => {
    let tabs;
    if (role === 'Administrator') {
        tabs = ['formBuilder', 'fileUpload', 'workflow', 'setRole', 'documentsForApproval'];
    } else if(role === 'Moderator'){
        tabs = ['fileUpload',  'documentsForProcess'];
    } else {
        tabs = ['home', 'listProcessedDocs', 'listDocsToApply', 'listDocsUnderProcess'];
    }
    return tabs;
}