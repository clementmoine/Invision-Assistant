// Create the script markup to append in the page on load
const s = document.createElement('script');
s.src = chrome.runtime.getURL('script.js');

s.onload = function() {
    this.remove();
};

(document.head || document.documentElement).appendChild(s);