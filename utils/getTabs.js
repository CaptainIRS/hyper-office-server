module.exports =  getTabs = (role) => {
    let tabs;
    if (role === 'Administrator') {
        tabs = ['formBuilder', 'workflow', 'documentsForApproval'];
    } else if(role === 'Moderator'){
        tabs = ['documentsForApproval'];
    } else {
        tabs = ['home', 'showApproved', 'showRejected', 'showPending', 'formViewer', 'viewdocs'];
    }
    return tabs;
}