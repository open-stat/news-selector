
// chrome.runtime.onInstalled.addListener(() => {
//     chrome.storage.local.set({status: value});
// });

// chrome.runtime.onMessage.addListener(function(message, sender) {
//     if(message.hasOwnProperty('init') &&
//         message.init === true
//     ) {
//         chrome.scripting.executeScript({
//             target: { tabId: tab.id },
//             files: [
//                 'js/jquery-3.6.1.min.js',
//                 'js/app.js'
//             ]
//         });
//     }
// });
//
// chrome.action.onClicked.addListener((tab) => {
//
//     chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         files: [
//             'js/jquery-3.6.1.min.js',
//             'js/app.js'
//         ]
//     });
// });