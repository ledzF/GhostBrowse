// Website Reputation Guardian - Background Service Worker with Badge Support

// Cache for scan results (to avoid repeated API calls)
const scanCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache for badge updates

chrome.runtime.onInstalled.addListener(() => {
    console.log("Website Reputation Guardian Installed");
    
    // Initialize storage with default settings
    chrome.storage.local.set({
        settings: {
            enableVirusTotal: true,
            enableWayback: true,
            enableSafeBrowsing: true,
            autoScan: true,
            showBadge: true,
            theme: 'dark'
        },
        scanHistory: []
    });
    
    // Set up periodic badge cleanup
    chrome.alarms.create("cleanBadgeCache", { periodInMinutes: 60 });
});

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "cleanBadgeCache") {
        const now = Date.now();
        for (const [key, value] of scanCache.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
                scanCache.delete(key);
            }
        }
        console.log("Badge cache cleaned, size:", scanCache.size);
    }
});

// Listen for tab updates to auto-scan and update badge
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        chrome.storage.local.get(['settings'], async function(result) {
            if (result.settings?.autoScan !== false) {
                console.log("Auto-scanning:", tab.url);
                await updateBadgeForUrl(tabId, tab.url);
            }
        });
    }
});

// Listen for tab activation (switching tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && tab.url.startsWith('http')) {
        await updateBadgeForTab(activeInfo.tabId);
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_URL") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs && tabs[0]) {
                sendResponse({ url: tabs[0].url });
            } else {
                sendResponse({ error: "No active tab found" });
            }
        });
        return true;
    }
    
    if (message.type === "SAVE_SCAN") {
        chrome.storage.local.get(['scanHistory'], function(result) {
            const history = result.scanHistory || [];
            history.unshift({
                url: message.url,
                score: message.score,
                status: message.status,
                timestamp: Date.now()
            });
            
            // Keep only last 50 scans
            if (history.length > 50) {
                history.pop();
            }
            
            chrome.storage.local.set({ scanHistory: history });
        });
    }
    
    if (message.type === "UPDATE_BADGE") {
        updateBadge(message.tabId, message.score, message.status);
        sendResponse({ success: true });
    }
    
    if (message.type === "GET_BADGE_CACHE") {
        const cacheKey = getCacheKey(message.url);
        const cached = scanCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            sendResponse({ cached: true, score: cached.score, status: cached.status });
        } else {
            sendResponse({ cached: false });
        }
    }
});

// Helper function to get cache key
function getCacheKey(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return url;
    }
}

// Update badge for a specific tab
async function updateBadgeForTab(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        if (tab.url && tab.url.startsWith('http')) {
            await updateBadgeForUrl(tabId, tab.url);
        }
    } catch (error) {
        console.error("Error updating badge for tab:", error);
    }
}

// Update badge for a URL
async function updateBadgeForUrl(tabId, url) {
    try {
        const cacheKey = getCacheKey(url);
        const cached = scanCache.get(cacheKey);
        
        // Check cache first
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            updateBadge(tabId, cached.score, cached.status);
            return;
        }
        
        // Show loading indicator on badge
        chrome.action.setBadgeText({ text: "...", tabId: tabId });
        chrome.action.setBadgeBackgroundColor({ color: "#6c757d", tabId: tabId });
        
        // Perform the scan (this would need to call your reputation API)
        // Since background can't directly access DOM, we'll send a message to content script
        // For now, we'll use a simplified version or fetch from storage
        
        // Alternative: Fetch from popup's cached result
        chrome.storage.local.get([`scan_${cacheKey}`], async function(result) {
            if (result[`scan_${cacheKey}`]) {
                const cachedResult = result[`scan_${cacheKey}`];
                if (Date.now() - cachedResult.timestamp < CACHE_DURATION) {
                    updateBadge(tabId, cachedResult.score, cachedResult.status);
                    scanCache.set(cacheKey, {
                        score: cachedResult.score,
                        status: cachedResult.status,
                        timestamp: cachedResult.timestamp
                    });
                    return;
                }
            }
            
            // If no cached result, set default badge
            updateBadge(tabId, 50, "UNKNOWN");
        });
        
    } catch (error) {
        console.error("Error updating badge for URL:", error);
        updateBadge(tabId, 0, "ERROR");
    }
}

// Update the badge with score and color
function updateBadge(tabId, score, status) {
    let badgeText = "";
    let badgeColor = "";
    
    // Determine badge text (score or symbol)
    if (score >= 70) {
        badgeText = score.toString();
        badgeColor = "#2ecc71"; // Green - Safe
    } else if (score >= 50) {
        badgeText = score.toString();
        badgeColor = "#3498db"; // Blue - Low Risk
    } else if (score >= 30) {
        badgeText = score.toString();
        badgeColor = "#f39c12"; // Orange/Yellow - Medium Risk
    } else if (score >= 15) {
        badgeText = "!";
        badgeColor = "#e67e22"; // Dark Orange - High Risk
    } else {
        badgeText = "⚠";
        badgeColor = "#e74c3c"; // Red - Dangerous
    }
    
    // For very dangerous sites, show warning symbol instead of number
    if (score < 10) {
        badgeText = "⚠";
    }
    
    // Apply badge
    chrome.action.setBadgeText({ text: badgeText, tabId: tabId });
    chrome.action.setBadgeBackgroundColor({ color: badgeColor, tabId: tabId });
    
    // Set tooltip
    let title = "";
    if (score >= 70) title = `Safe (${score}) - Low risk website`;
    else if (score >= 50) title = `Low Risk (${score}) - Exercise standard caution`;
    else if (score >= 30) title = `Medium Risk (${score}) - Be careful`;
    else if (score >= 15) title = `High Risk (${score}) - Suspicious website detected!`;
    else title = `DANGEROUS (${score}) - Known malicious site! Avoid interaction!`;
    
    chrome.action.setTitle({ title: title, tabId: tabId });
}

// Cache a scan result
function cacheScanResult(url, score, status) {
    const cacheKey = getCacheKey(url);
    scanCache.set(cacheKey, {
        score: score,
        status: status,
        timestamp: Date.now()
    });
    
    // Also store in persistent storage
    chrome.storage.local.set({ [`scan_${cacheKey}`]: {
        score: score,
        status: status,
        timestamp: Date.now()
    }});
}

// Export cache function for use by other scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "CACHE_SCAN_RESULT") {
        cacheScanResult(message.url, message.score, message.status);
        
        // Also update badge for current tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                updateBadge(tabs[0].id, message.score, message.status);
            }
        });
        
        sendResponse({ success: true });
    }
});

console.log("Background service worker with badge support loaded");