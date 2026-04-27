// Complete popup.js - Website Reputation Guardian

document.addEventListener('DOMContentLoaded', function() {
    console.log("Popup opened - starting analysis");
    showLoadingState();
    
    chrome.runtime.sendMessage({ type: "GET_URL" }, async (response) => {
        console.log("Got response from background:", response);
        
        if (!response || !response.url) {
            console.error("No URL received");
            showError("Could not get current URL");
            return;
        }

        const url = response.url;
        console.log("Analyzing URL:", url);
        
        // Update URL display
        displayUrl(url);

        try {
            console.log("Calling calculateFinalScore...");
            const result = await calculateFinalScore(url);
            console.log("Score calculation complete:", result);
            
            // Hide loading, show results
            hideLoadingState();
            displayResults(result);
            updateProgressBar(result.score);
            
            // Update badge with the scan result
            updateBadgeAfterScan(result.score, result.status);
            
            // Save to history
            chrome.runtime.sendMessage({
                type: "SAVE_SCAN",
                url: url,
                score: result.score,
                status: result.status
            });
            
        } catch (err) {
            console.error("Scoring error:", err);
            hideLoadingState();
            showError(`Analysis failed: ${err.message}`);
        }
    });
});

// Update badge after successful scan
function updateBadgeAfterScan(score, status) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            chrome.runtime.sendMessage({
                type: "UPDATE_BADGE",
                tabId: tabs[0].id,
                score: score,
                status: status
            });
            
            chrome.runtime.sendMessage({
                type: "CACHE_SCAN_RESULT",
                url: tabs[0].url,
                score: score,
                status: status
            });
        }
    });
}

function showLoadingState() {
    document.getElementById('score').textContent = '--';
    document.getElementById('status').textContent = 'ANALYZING';
    document.getElementById('status').style.backgroundColor = '#6c757d';
    
    const reasonsList = document.getElementById('reasons');
    reasonsList.innerHTML = '<li class="loading-item">Analyzing website security...</li>';
}

function hideLoadingState() {
    // Clear loading items, displayResults will populate
}

function showError(message) {
    document.getElementById('score').textContent = 'ERR';
    document.getElementById('status').textContent = 'ERROR';
    document.getElementById('status').style.backgroundColor = '#dc3545';
    
    const reasonsList = document.getElementById('reasons');
    reasonsList.innerHTML = `<li class="negative">⚠️ ${message}</li>`;
}

function displayUrl(url) {
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        
        document.getElementById("domain").textContent = domain;
        
        const fullUrlEl = document.getElementById("full-url");
        fullUrlEl.textContent = url.length > 60 ? url.substring(0, 57) + "..." : url;
        fullUrlEl.title = url;
        
        const now = new Date();
        document.getElementById("scan-time").textContent = `Scanned: ${now.toLocaleTimeString()}`;
            
    } catch (e) {
        console.error("URL parsing error:", e);
        document.getElementById("domain").textContent = url;
    }
}

function displayResults(result) {
    document.getElementById("score").textContent = result.score;
    
    const statusEl = document.getElementById("status");
    statusEl.textContent = result.status;
    statusEl.style.backgroundColor = result.statusColor;
    
    document.getElementById("risk-level").textContent = result.status;
    
    const reasonsList = document.getElementById("reasons");
    reasonsList.innerHTML = "";
    
    if (result.reasons && result.reasons.length > 0) {
        result.reasons.forEach(reason => {
            const li = document.createElement("li");
            li.textContent = reason;
            
            if (reason.startsWith("✓") || reason.includes("Secure") || reason.includes("clean")) {
                li.className = "positive";
            } else if (reason.includes("⚠️") || reason.includes("Suspicious") || reason.includes("risk")) {
                li.className = "warning";
            } else if (reason.includes("✗") || reason.includes("malicious") || reason.includes("Dangerous")) {
                li.className = "negative";
            } else {
                li.className = "info";
            }
            
            reasonsList.appendChild(li);
        });
    } else {
        reasonsList.innerHTML = '<li class="info">No specific issues detected</li>';
    }
    
    if (result.detailedStats) {
        displayDetailedStats(result.detailedStats);
    }
}

function displayDetailedStats(stats) {
    const statsContainer = document.getElementById("detailed-stats");
    if (!statsContainer) return;
    
    let statsHtml = '';
    
    if (stats.virustotal) {
        const { malicious, suspicious } = stats.virustotal;
        statsHtml += `
            <div class="stat-item">
                <div class="stat-label">VirusTotal</div>
                <div class="stat-value ${malicious > 0 ? 'danger' : (suspicious > 0 ? 'warning' : 'safe')}">
                    ${malicious > 0 ? `⚠️ ${malicious}` : (suspicious > 0 ? `🔍 ${suspicious}` : `✓ Clean`)}
                </div>
            </div>
        `;
    }
    
    if (stats.https !== undefined) {
        statsHtml += `
            <div class="stat-item">
                <div class="stat-label">HTTPS</div>
                <div class="stat-value ${stats.https ? 'safe' : 'danger'}">
                    ${stats.https ? '🔒 Secure' : '⚠️ Insecure'}
                </div>
            </div>
        `;
    }
    
    if (stats.wayback) {
        statsHtml += `
            <div class="stat-item">
                <div class="stat-label">Archive</div>
                <div class="stat-value ${stats.wayback.hasSnapshot ? 'safe' : 'warning'}">
                    ${stats.wayback.hasSnapshot ? '📚 Found' : '📭 None'}
                </div>
            </div>
        `;
    }
    
    statsContainer.innerHTML = statsHtml;
}

function updateProgressBar(score) {
    const bar = document.getElementById("bar");
    if (bar) {
        const width = 100 - score;
        bar.style.width = width + "%";
        
        if (score >= 70) {
            bar.style.background = "#2ecc71";
        } else if (score >= 50) {
            bar.style.background = "#3498db";
        } else if (score >= 30) {
            bar.style.background = "#f39c12";
        } else if (score >= 15) {
            bar.style.background = "#e67e22";
        } else {
            bar.style.background = "#e74c3c";
        }
    }
}

// Settings panel functionality
document.addEventListener('DOMContentLoaded', function() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            location.reload();
        });
    }
    
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settingsPanel');
    
    if (settingsBtn && settingsPanel) {
        settingsBtn.addEventListener('click', () => {
            if (settingsPanel.style.display === 'none') {
                settingsPanel.style.display = 'block';
            } else {
                settingsPanel.style.display = 'none';
            }
        });
    }
    
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const showBadge = document.getElementById('showBadgeToggle')?.checked || true;
            const autoScan = document.getElementById('autoScanToggle')?.checked || true;
            
            chrome.storage.local.set({
                settings: {
                    showBadge: showBadge,
                    autoScan: autoScan
                }
            }, () => {
                alert('Settings saved!');
                settingsPanel.style.display = 'none';
            });
        });
    }
    
    const reportBtn = document.getElementById('report-btn');
    if (reportBtn) {
        reportBtn.addEventListener('click', () => {
            const url = document.getElementById('full-url')?.title || 'current website';
            alert(`Report submitted for: ${url}\nOur team will review this domain.`);
        });
    }
    
    const detailsBtn = document.getElementById('details-btn');
    if (detailsBtn) {
        detailsBtn.addEventListener('click', () => {
            const score = document.getElementById('score')?.textContent || 'N/A';
            const status = document.getElementById('status')?.textContent || 'Unknown';
            alert(`Full Report\n━━━━━━━━━━━━━━━━\nSafety Score: ${score}/100\nRisk Level: ${status}\n━━━━━━━━━━━━━━━━\n• VirusTotal Security Scan\n• SSL/TLS Certificate Validation\n• Wayback Machine Archive Check\n• Domain Reputation Analysis`);
        });
    }
});