module.exports =  getTabs = (role) => {
    let tabs;
    if (role === 'Administrator') {
        tabs = ['formBuilder', 'fileUpload', 'workflow', 'setRole', 'documentsForApproval', 'formViewer'];
    } else if(role === 'Moderator'){
        tabs = ['fileUpload',  'showPdf'];
    } else {
        tabs = ['home', 'listProcessedDocs', 'listDocsToApply', 'listDocsUnderProcess'];
    }
    return tabs;
}