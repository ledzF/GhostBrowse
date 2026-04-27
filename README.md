GhostBrowse

<div align="center">
  <h3>Real-Time Website Safety Analysis Browser Extension</h3>
  <p><i>Know the reputation of any website before you trust it</i></p>
  
  
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version 1.0.0">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License">
    <img src="https://img.shields.io/badge/Chrome-Extension-brightgreen.svg" alt="Chrome Extension">
    <img src="https://img.shields.io/badge/Firefox-Add--on-ff8c00.svg" alt="Firefox Add-on">
    <img src="https://img.shields.io/badge/PRs-welcome-orange.svg" alt="PRs Welcome">
  </p>
</div>

---

## 📋 Overview

**GhostBrowse (Website Reputation Guardian)** is a powerful browser extension that helps users make informed decisions about the websites they visit. With one click, it analyzes the current website against multiple security databases and provides a clear safety score (0-100) along with detailed explanations.

In a world with over 5 billion websites and increasing cyber threats, this tool acts as your personal security advisor, warning you about potentially dangerous sites before you interact with them.

---

## ✨ Features

### 🔍 One-Click Analysis
- Instant reputation check for any website
- Clean, modern interface with dark theme (#131724 color scheme)
- Works in the background without slowing down your browsing

### 📊 Visual Safety Score
- **0-100 scoring system** with color-coded categories:
  - 🟢 **Safe** (70-100) - Trustworthy websites
  - 🔵 **Low Risk** (50-69) - Minor concerns
  - 🟡 **Medium Risk** (30-49) - Exercise caution
  - 🟠 **High Risk** (15-29) - Significant red flags
  - 🔴 **Dangerous** (0-14) - Known malicious sites

### 🔔 Real-time Badge Icon
- Extension badge shows safety score instantly
- Color-coded badge (green/yellow/orange/red)
- Updates automatically when you browse

### 📋 Detailed Analysis
- **VirusTotal Integration** - Check against 70+ security vendors
- **Google Safe Browsing** - Real-time threat intelligence
- **Wayback Machine** - Domain age and historical presence
- **HTTPS validation** - Connection security check
- **URL structure analysis** - Detect suspicious patterns
- **TLD reputation** - Identify risky domain extensions

### 🗂️ Scan History
- Automatically saves all your scans
- View timeline of visited sites and their scores
- Local storage - your privacy is respected

### ⚡ Performance Optimized
- Smart caching (24-hour TTL) reduces API calls
- Parallel API requests for faster results
- Minimal memory footprint

---

## 🔧 Installation

### Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store link (TBD)
2. Click "Add to Chrome"
3. Confirm installation

### Firefox Add-ons (Coming Soon)
1. Visit Firefox Add-ons store (TBD)
2. Click "Add to Firefox"
3. Confirm installation

### Manual Installation (Developer Mode)

#### Chrome / Brave / Edge:
1. Download the latest release from [GitHub Releases](https://github.com/yourusername/ghostbrowse/releases)
2. Extract the ZIP file
3. Go to `chrome://extensions/`
4. Enable "Developer mode" (top right)
5. Click "Load unpacked"
6. Select the extracted folder

#### Firefox:
1. Download the latest release
2. Extract the ZIP file
3. Go to `about:debugging`
4. Click "This Firefox"
5. Click "Load Temporary Add-on"
6. Select the `manifest.json` file

---


## 🔌 API Integration

This extension uses the following third-party APIs:

| API | Purpose | Documentation |
|-----|---------|---------------|
| **VirusTotal** | Malware detection from 70+ vendors | [virustotal.com](https://developers.virustotal.com/) |
| **Wayback Machine** | Domain age and historical presence | [archive.org](https://archive.org/help/wayback_api.php) |
| **Google Safe Browsing** | Real-time threat intelligence | [developers.google.com/safe-browsing](https://developers.google.com/safe-browsing) |

---

## 📊 Scoring Algorithm

The safety score is calculated using the following weighted factors:

| Factor | Weight | Impact |
|--------|--------|--------|
| VirusTotal Detection | ±30-40 points | ⛔ Malicious: -30, Suspicious: -10, Clean: +10 |
| HTTPS Encryption | ±10 points | 🔒 Secure: +10, Insecure: -10 |
| Wayback Archive | ±10-12 points | 📚 Found: +10-12, None: -5-8 |
| Suspicious TLD | -10 points | ⚠️ .tk, .ml, .ga, .cf, .xyz, etc. |
| IP Address Domain | -15 points | 🚫 Direct IP instead of domain name |

**Base Score:** 50 points

---

