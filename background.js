console.log("Background loaded");

chrome.action.onClicked.addListener((tab) => {

    console.log("Extension clicked");

    chrome.tabs.sendMessage(tab.id, {

        action: "toggleAutofillPanel"

    });

});