module.exports =  getTabs = (role) => {
    let tabs;
    if (role === 'Administrator') {
        tabs = ['formBuilder', 'fileUpload', 'workflow', 'documentsForApproval'];
    } else if(role === 'Moderator'){
        tabs = ['fileUpload',  'showPdf', 'documentsForApproval'];
    } else {
        tabs = ['home', 'showApproved', 'showRejected', 'showPending', 'formViewer', 'viewdocs'];
    }
    return tabs;
}