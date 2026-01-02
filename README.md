# M-PESEWA

Emergency Micro-Lending in Trusted Circles

## Overview

M-PESEWA is a Progressive Web App (PWA) for emergency micro-lending within trusted social groups across Africa. The platform enables friends, families, and community members to lend to one another for short-term emergency consumption needs.

## Features

- **Country-Locked Lending**: 13 African countries with strict country isolation
- **Trusted Groups**: Unlimited groups per country, 5-1000 members per group
- **Dual Role System**: Users can be both borrowers and lenders
- **Subscription-Based Lending**: Four subscription tiers for lenders
- **Emergency Categories**: 14 specific loan categories for urgent needs
- **Reputation System**: 5-star ratings and blacklist management
- **Ledger Management**: Manual ledger updates by lenders
- **PWA Ready**: Installable, offline-capable, mobile-first design

## Project Structure
/
├── index.html
├── manifest.json
├── service-worker.js
├── README.md
├── .nojekyll
├── assets/
│ ├── css/
│ │ ├── main.css
│ │ ├── components.css
│ │ ├── dashboard.css
│ │ ├── forms.css
│ │ ├── tables.css
│ │ └── animations.css
│ ├── js/
│ │ ├── app.js
│ │ ├── auth.js
│ │ ├── roles.js
│ │ ├── groups.js
│ │ ├── lending.js
│ │ ├── borrowing.js
│ │ ├── ledger.js
│ │ ├── blacklist.js
│ │ ├── subscriptions.js
│ │ ├── countries.js
│ │ ├── collectors.js
│ │ ├── calculator.js
│ │ ├── pwa.js
│ │ └── utils.js
│ └── images/
├── pages/
│ ├── dashboard/
│ │ ├── borrower-dashboard.html
│ │ ├── lender-dashboard.html
│ │ └── admin-dashboard.html
│ ├── lending.html
│ ├── borrowing.html
│ ├── ledger.html
│ ├── groups.html
│ ├── subscriptions.html
│ ├── blacklist.html
│ ├── debt-collectors.html
│ ├── about.html
│ ├── qa.html
│ ├── contact.html
│ └── countries/
│ ├── index.html
│ ├── kenya.html
│ ├── uganda.html
│ ├── tanzania.html
│ ├── rwanda.html
│ ├── burundi.html
│ ├── somalia.html
│ ├── south-sudan.html
│ ├── ethiopia.html
│ ├── congo.html
│ ├── nigeria.html
│ ├── south-africa.html
│ └── ghana.html
└── data/
├── countries.json
├── subscriptions.json
├── categories.json
├── collectors.json
├── demo-groups.json
├── demo-users.json
└── demo-ledgers.json


## Deployment on GitHub Pages

1. Create a new GitHub repository
2. Push all files to the repository
3. Go to repository Settings → Pages
4. Select "Deploy from a branch"
5. Select "main" branch and "/ (root)" folder
6. Click "Save"

The site will be available at: `https://[username].github.io/[repository-name]`

## Local Development

1. Clone the repository
2. Open `index.html` in a browser
3. For PWA testing, use a local server:
   ```bash
   python3 -m http.server 8000