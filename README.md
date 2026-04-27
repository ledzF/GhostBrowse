# 🛡️ Website Reputation Guardian

<div align="center">
  <img src="icons/icon128.png" alt="Website Reputation Guardian Logo" width="128" height="128">
  <h3>Real-Time Website Safety Analysis Browser Extension</h3>
  <p><i>Know the reputation of any website before you trust it</i></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#demo">Demo</a> •
    <a href="#installation">Installation</a> •
    <a href="#how-it-works">How It Works</a> •
    <a href="#api-integration">API Integration</a> •
    <a href="#scoring-algorithm">Scoring Algorithm</a> •
    <a href="#screenshots">Screenshots</a> •
    <a href="#future-roadmap">Roadmap</a> •
    <a href="#contributing">Contributing</a>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version 1.0.0">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License">
    <img src="https://img.shields.io/badge/chrome-extension-brightgreen.svg" alt="Chrome Extension">
    <img src="https://img.shields.io/badge/PRs-welcome-orange.svg" alt="PRs Welcome">
  </p>
</div>

---

## 📋 **Overview**

**Website Reputation Guardian** is a powerful Chrome extension that helps users make informed decisions about the websites they visit. With one click, it analyzes the current website against multiple security databases and provides a clear safety score (0-100) along with detailed explanations.

In a world with over 5 billion websites and increasing cyber threats, this tool acts as your personal security advisor, warning you about potentially dangerous sites before you interact with them.

---

## ✨ **Features**

### 🔍 **One-Click Analysis**
- Instant reputation check for any website
- Clean, modern interface with glass-morphism design
- Works in the background without slowing down your browsing

### 📊 **Visual Safety Score**
- **0-100 scoring system** with color-coded categories:
  - 🟢 **Safe** (70-100) - Trustworthy websites
  - 🔵 **Low Risk** (50-69) - Minor concerns
  - 🟡 **Medium Risk** (30-49) - Exercise caution
  - 🟠 **High Risk** (15-29) - Significant red flags
  - 🔴 **Dangerous** (0-14) - Known malicious sites

### 📋 **Detailed Analysis**
- **VirusTotal Integration** - Check against 70+ security vendors
- **Google Safe Browsing** - Real-time threat intelligence
- **Wayback Machine** - Domain age and historical presence
- **HTTPS validation** - Connection security check
- **URL structure analysis** - Detect suspicious patterns
- **TLD reputation** - Identify risky domain extensions

### 🗂️ **Scan History**
- Automatically saves all your scans
- View timeline of visited sites and their scores
- Statistics dashboard (total scans, average score, safe sites count)
- Export/import functionality for backup

### 📅 **Domain Age Display**
- Shows when a domain was first archived
- Age-based scoring (older = more trustworthy)
- Visual indicators for new vs. established domains

### ⚡ **Performance Optimized**
- Smart caching (24-hour TTL) reduces API calls
- Parallel API requests for faster results
- Minimal memory footprint

---

## 🎥 **Demo**

<div align="center">
  <img src="screenshots/demo.gif" alt="Demo Animation" width="400">
  
  | Safe Website | Suspicious Website |
  |--------------|-------------------|
  | ![Safe Site](screenshots/safe-site.png) | ![Risky Site](screenshots/risky-site.png) |
</div>

---

## 🔧 **Installation**

### **From Source (Developer Mode)**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/website-reputation-guardian.git
   cd website-reputation-guardian
