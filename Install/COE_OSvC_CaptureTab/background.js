var buiUrl = 'https://example.custhelp.com/AgentWeb/';


chrome.tabs.onCreated.addListener(function(incomingTab) {
    try {
        if (incomingTab.pendingUrl.startsWith(buiUrl)) {

            chrome.tabs.query({ url: buiUrl + '*' }, function(newTabs) {
                console.log('Total BUI tabs: ' + newTabs.length);
                //List of tabs matching BUI URL, incluiding the incomingTab
                if (newTabs.length > 1) {
                    //There are more than one Tab
                    //Get parameters from incoming Url
                    var incomingUrl = new URL(incomingTab.pendingUrl);
                    var incomingParams = incomingUrl.searchParams;
                    //And close the incomingTab
                    chrome.tabs.remove(incomingTab.id);
                    //list of tabs excluding the incomingTab that now is closed
                    chrome.tabs.query({ url: buiUrl + '*' }, function(previousTabs) {
                        //Get the first BUI tab and activate/focus it
                        var updateProperties = { 'active': true };
                        chrome.tabs.update(previousTabs[0].id, updateProperties, (tab) => {});

                        chrome.scripting.executeScript({
                                target: { tabId: previousTabs[0].id },
                                func: remoteJS,
                                args: incomingParams.getAll('phone')
                            },
                            () => { console.log('BUI script fired!'); });
                    });
                }
            });
        }
    } catch (error) {
        console.log('Error', error);
    }
});

function remoteJS(args) {
    console.log(args);
    if (!document.querySelector('#coeCtiInput')) {
        var input = document.createElement('input');
        input.type = 'text';
        input.id = 'coeCtiInput'
        input.style.display = 'none';
        (document.body || document.documentElement).appendChild(input);
    }
    document.querySelector('#coeCtiInput').innerText = args;

}