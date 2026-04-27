const VT_API_KEY = "7ef203eb7773540e1cb538cb8ea959005b5f848df92efdc1ed9724da746081a9";

// Cache for API responses (24 hour TTL)
const apiCache = new Map();

function getCacheKey(api, identifier) {
    return `${api}_${identifier}`;
}

function isCacheValid(timestamp) {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - timestamp < twentyFourHours;
}

// VirusTotal URL reputation check with caching
async function checkVirusTotal(url) {
    const cacheKey = getCacheKey('vt', url);
    const cached = apiCache.get(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
    }

    try {
        const urlId = btoa(url).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        const response = await fetch(
            `https://www.virustotal.com/api/v3/urls/${urlId}`,
            {
                method: "GET",
                headers: { 
                    "x-apikey": VT_API_KEY,
                    "Accept": "application/json"
                }
            }
        );

        if (response.status === 404) {
            // URL not yet analyzed - submit for analysis
            return await submitUrlForAnalysis(url);
        }

        if (!response.ok) {
            console.warn(`VirusTotal API returned ${response.status}`);
            return null;
        }

        const data = await response.json();
        const stats = data.data.attributes.last_analysis_stats;
        
        // Cache the result
        apiCache.set(cacheKey, {
            data: stats,
            timestamp: Date.now()
        });
        
        return stats;
    } catch (err) {
        console.error("VirusTotal API error:", err);
        return null;
    }
}

// Submit URL for analysis if not found
async function submitUrlForAnalysis(url) {
    try {
        const response = await fetch(
            "https://www.virustotal.com/api/v3/urls",
            {
                method: "POST",
                headers: { 
                    "x-apikey": VT_API_KEY,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `url=${encodeURIComponent(url)}`
            }
        );

        if (response.ok) {
            const data = await response.json();
            return {
                malicious: 0,
                suspicious: 0,
                harmless: 0,
                undetected: 1,
                timeout: 0
            };
        }
        return null;
    } catch (err) {
        console.error("URL submission error:", err);
        return null;
    }
}

// Enhanced Wayback Machine check with snapshot count
async function checkWayback(domain) {
    const cacheKey = getCacheKey('wb', domain);
    const cached = apiCache.get(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
    }

    try {
        const response = await fetch(
            `https://archive.org/wayback/available?url=${domain}`
        );
        const data = await response.json();
        
        const result = {
            hasSnapshot: !!data.archived_snapshots?.closest,
            snapshotDate: data.archived_snapshots?.closest?.timestamp || null,
            snapshotUrl: data.archived_snapshots?.closest?.url || null
        };

        apiCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        return result;
    } catch (err) {
        console.error("Wayback API error:", err);
        return { hasSnapshot: false, snapshotDate: null, snapshotUrl: null };
    }
}

// Google Safe Browsing check
async function checkGoogleSafeBrowsing(url) {
    const API_KEY = 'AIzaSyBdV5LaWTm3SWQV9pHJ5uhl1-OKHVdTyMw'; // Get from Google Cloud Console
    const cacheKey = getCacheKey('gsb', url);
    const cached = apiCache.get(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
    }

    try {
        const response = await fetch(
            `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client: {
                        clientId: "website-reputation-extension",
                        clientVersion: "1.0.0"
                    },
                    threatInfo: {
                        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                        platformTypes: ["ANY_PLATFORM"],
                        threatEntryTypes: ["URL"],
                        threatEntries: [{ url: url }]
                    }
                })
            }
        );

        const data = await response.json();
        const result = {
            isThreat: !!data.matches,
            threats: data.matches ? data.matches.map(m => m.threatType) : []
        };

        apiCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        return result;
    } catch (err) {
        console.error("Google Safe Browsing API error:", err);
        return { isThreat: false, threats: [] };
    }
}