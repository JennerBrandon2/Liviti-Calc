// background.js

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'openFullScreen') {
    chrome.windows.create({
      url: 'popup.html',
      type: 'popup',
      state: 'maximized'
    });
  }
});
