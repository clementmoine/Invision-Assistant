// Create the script markup to append in the page on load
// The loaded script manage the UI changes on InVision page to display our groups
const s = document.createElement('script');
s.src = chrome.runtime.getURL('groups.js');

// Store the groups in the session storage to be accessible from our script
chrome.storage.local.get('groups', function (result) {
    sessionStorage.setItem('groups', JSON.stringify(result.groups));
});

s.onload = function() {
    this.remove();
};

(document.head || document.documentElement).appendChild(s);