
/**
 * Установка расширения
 */
// chrome.runtime.onInstalled.addListener(function () {
//
// });

chrome.runtime.onMessage.addListener(function(rq, sender, sendResponse) {
    return true;
});

// chrome.action.onClicked.addListener((tab) => {
//     console.log(tab);
// });
