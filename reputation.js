async function calculateFinalScore(url) {
    console.log("Starting score calculation for:", url);
    
    let score = 50;
    let reasons = [];
    let detailedStats = {};
    
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        console.log("Domain extracted:", domain);
        
        // HTTPS check
        detailedStats.https = url.startsWith("https://");
        if (detailedStats.https) {
            score += 10;
            reasons.push("✓ Secure HTTPS connection");
        } else {
            score -= 10;
            reasons.push("✗ No HTTPS encryption");
        }
        
        // VirusTotal with timeout
        console.log("Calling VirusTotal API...");
        try {
            detailedStats.virustotal = await Promise.race([
                checkVirusTotal(url),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("VirusTotal timeout")), 5000)
                )
            ]);
            
            if (detailedStats.virustotal) {
                const { malicious, suspicious } = detailedStats.virustotal;
                if (malicious > 0) {
                    score -= 30;
                    reasons.push(`⚠️ Flagged malicious by ${malicious} vendors`);
                } else if (suspicious > 0) {
                    score -= 10;
                    reasons.push(`⚠️ Flagged suspicious by ${suspicious} vendors`);
                } else {
                    score += 10;
                    reasons.push("✓ Clean on VirusTotal");
                }
            }
        } catch (vtError) {
            console.warn("VirusTotal check failed:", vtError);
            reasons.push("ℹ️ VirusTotal check timed out");
        }
        
        // Wayback Machine with timeout
        console.log("Calling Wayback Machine API...");
        try {
            detailedStats.wayback = await Promise.race([
                checkWayback(domain),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Wayback timeout")), 3000)
                )
            ]);
            
            if (detailedStats.wayback && detailedStats.wayback.hasSnapshot) {
                score += 10;
                reasons.push("✓ Found in web archives");
            } else {
                score -= 5;
                reasons.push("ℹ️ No archive records");
            }
        } catch (wbError) {
            console.warn("Wayback check failed:", wbError);
            reasons.push("ℹ️ Archive check timed out");
        }
        
        // Basic URL checks
        const suspiciousTLDs = ['tk', 'ml', 'ga', 'cf', 'xyz', 'top', 'club'];
        const tld = domain.split('.').pop();
        if (suspiciousTLDs.includes(tld)) {
            score -= 10;
            reasons.push("⚠️ Suspicious domain extension");
        }
        
        // Check for IP address
        const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
        if (ipPattern.test(domain)) {
            score -= 15;
            reasons.push("⚠️ IP address instead of domain name");
        }
        
    } catch (err) {
        console.error("Error in calculateFinalScore:", err);
        reasons.push("Error analyzing URL");
    }
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, Math.round(score)));
    
    // Determine status
    let status = "SAFE";
    let statusColor = "#2ecc71";
    
    if (score < 80) {
        status = "LOW RISK";
        statusColor = "#3498db";
    }
    if (score < 60) {
        status = "MEDIUM RISK";
        statusColor = "#f39c12";
    }
    if (score < 40) {
        status = "HIGH RISK";
        statusColor = "#e67e22";
    }
    if (score < 20) {
        status = "DANGEROUS";
        statusColor = "#e74c3c";
    }
    
    console.log("Final score:", score, "Status:", status);
    
    return {
        score,
        status,
        statusColor,
        reasons,
        detailedStats
    };
}