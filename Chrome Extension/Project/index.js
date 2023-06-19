// Create the script markup to append in the page on load
// The loaded script manage the UI changes on InVision page to display our groups
const s = document.createElement("script");
s.src = chrome.runtime.getURL("groups.js");

// Store the groups in the session storage to be accessible from our script
function loadGroups() {
  chrome.storage.local.get("groups", function (result) {
    // const oldValue = sessionStorage.getItem("groups");
    const newValue = JSON.stringify(result.groups);

    sessionStorage.setItem("groups", newValue);

    window.dispatchEvent(new Event("storage"));
  });
}

chrome.storage.local.onChanged.addListener(loadGroups);
loadGroups();

s.onload = function () {
  this.remove();
};

(document.head || document.documentElement).appendChild(s);
