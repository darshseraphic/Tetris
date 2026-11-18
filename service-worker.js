// The extension's toolbar action opens the native Chrome side panel directly.
// No popup is declared in the manifest, so this never creates a floating UI or tab.
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Block Fall: could not configure side panel", error));
