// FlixBypass - Background Script (Chrome Service Worker)
// Injects the content script on all Netflix pages.

const CONTENT_SCRIPT_FILE = 'content.js';
const STORAGE_KEY = 'extensionEnabled';

let isExtensionEnabled = true;

async function updateEnabledState() {
    try {
        const data = await chrome.storage.local.get(STORAGE_KEY);
        isExtensionEnabled = data[STORAGE_KEY] !== false;
        console.log(`[FlixBypass] Extension enabled: ${isExtensionEnabled}`);
        if (isExtensionEnabled) checkAllTabs();
    } catch (error) {
        console.error("[FlixBypass] State error:", error);
        isExtensionEnabled = true;
    }
}

async function injectContentScript(tabId) {
    if (!isExtensionEnabled) return;
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: [CONTENT_SCRIPT_FILE]
        });
    } catch (error) {
        const msg = error.message || '';
        if (!msg.includes('already been injected') &&
            !msg.includes('Invalid tab ID') &&
            !msg.includes('Cannot access') &&
            !msg.includes('Missing host permission')) {
            console.error(`[FlixBypass] Inject error for tab ${tabId}:`, msg);
        }
    }
}

function handleNavigation(tabId, url) {
    if (!isExtensionEnabled) return;
    if (!url || !url.includes('netflix.com')) return;
    injectContentScript(tabId);
}

// --- Navigation Listeners ---

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0 && details.url?.includes('netflix.com')) {
        handleNavigation(details.tabId, details.url);
    }
});

chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId === 0 && details.url?.includes('netflix.com')) {
        handleNavigation(details.tabId, details.url);
    }
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.frameId === 0 && details.url?.includes('netflix.com')) {
        handleNavigation(details.tabId, details.url);
    }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab?.url) handleNavigation(activeInfo.tabId, tab.url);
    } catch (e) { /* ignore */ }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes[STORAGE_KEY]) {
        updateEnabledState();
    }
});

// --- Tab Check ---

async function checkAllTabs() {
    if (!isExtensionEnabled) return;
    try {
        const tabs = await chrome.tabs.query({ url: "*://*.netflix.com/*" });
        tabs.forEach(tab => handleNavigation(tab.id, tab.url));
    } catch (e) { console.error("[FlixBypass] checkAllTabs error:", e); }
}

// --- Init ---

chrome.runtime.onInstalled.addListener(async () => { await updateEnabledState(); });
chrome.runtime.onStartup.addListener(async () => { await updateEnabledState(); });
updateEnabledState();
console.log("FlixBypass background service worker loaded (Chrome).");
