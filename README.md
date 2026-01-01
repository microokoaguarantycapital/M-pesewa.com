# M-PESEWA - Emergency Micro-Lending in Trusted Circles

A Progressive Web App (PWA) for emergency micro-lending built on trusted social circles across Africa.

## 🌍 Platform Overview

M-PESEWA enables individuals within verified social groups to lend and borrow short-term emergency consumption loans. All monetary transactions occur outside the platform via M-Pesa, Till Numbers, Paybill, or bank accounts. The platform manages trust, reputation, visibility, and structure.

### Core Hierarchy (Strict)
- Country → Groups → Lenders → Borrowers → Ledgers

### Key Features
- **14 Emergency Loan Categories**: Transport, Airtime, Wi-Fi, Cooking Gas, Food, Repairs, etc.
- **Country-Locked Groups**: No cross-country lending/borrowing
- **Referral-Only Entry**: Groups are invitation-based
- **Dual Role System**: Users can be both borrowers and lenders
- **Tiered Subscription**: Basic, Premium, Super, and Lender of Lenders tiers
- **Trust-Based Reputation**: 5-star rating system and blacklist management
- **Automatic Ledgers**: Generated for each loan approval
- **Offline-First PWA**: Works without internet connection

## 🚀 Deployment on GitHub Pages

### Prerequisites
- GitHub account
- Basic understanding of Git

### Deployment Steps

1. **Create a GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: M-PESEWA PWA"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/m-pesewa.git
   git push -u origin main

   /
├── index.html                    # Main landing page
├── manifest.json                 # PWA manifest
├── service-worker.js             # Service worker for offline support
├── README.md                     # This file
├── .nojekyll                     # Disable Jekyll processing
│
├── assets/
│   ├── css/
│   │   ├── main.css             # Global styles
│   │   ├── components.css       # UI components
│   │   ├── dashboard.css        # Dashboard styles
│   │   ├── forms.css            # Form styles
│   │   ├── tables.css           # Table styles
│   │   └── animations.css       # Animations
│   │
│   ├── js/
│   │   ├── app.js               # Main application logic
│   │   ├── auth.js              # Authentication simulation
│   │   ├── roles.js             # Role management
│   │   ├── groups.js            # Groups functionality
│   │   ├── lending.js           # Lending operations
│   │   ├── borrowing.js         # Borrowing operations
│   │   ├── ledger.js            # Ledger management
│   │   ├── blacklist.js         # Blacklist system
│   │   ├── subscriptions.js     # Subscription handling
│   │   ├── countries.js         # Country-specific logic
│   │   ├── collectors.js        # Debt collectors
│   │   ├── calculator.js        # Loan calculator
│   │   ├── pwa.js               # PWA installation
│   │   └── utils.js             # Utility functions
│   │
│   └── images/                  # Images and icons
│
├── pages/
│   ├── dashboard/
│   │   ├── borrower-dashboard.html
│   │   ├── lender-dashboard.html
│   │   └── admin-dashboard.html
│   │
│   ├── lending.html
│   ├── borrowing.html
│   ├── ledger.html
│   ├── groups.html
│   ├── subscriptions.html
│   ├── blacklist.html
│   ├── debt-collectors.html
│   ├── about.html
│   ├── qa.html
│   ├── contact.html
│   │
│   └── countries/
│       ├── index.html
│       ├── kenya.html
│       ├── uganda.html
│       ├── tanzania.html
│       ├── rwanda.html
│       ├── burundi.html
│       ├── somalia.html
│       ├── south-sudan.html
│       ├── ethiopia.html
│       ├── congo.html
│       ├── nigeria.html
│       ├── south-africa.html
│       └── ghana.html
│
└── data/
    ├── countries.json
    ├── subscriptions.json
    ├── categories.json
    ├── collectors.json
    ├── demo-groups.json
    ├── demo-users.json
    └── demo-ledgers.json