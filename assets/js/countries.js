// Countries Management Module
'use strict';

class CountriesManager {
    constructor() {
        this.countries = [];
        this.currentCountry = null;
        this.countryData = {};
        this.groupsByCountry = {};
        this.lendersByCountry = {};
        this.borrowersByCountry = {};
        this.init();
    }

    async init() {
        await this.loadCountries();
        await this.loadCountryData();
        this.detectCurrentCountry();
        this.setupEventListeners();
        this.renderCountryOverview();
        this.renderCountryStats();
        this.renderCountryGroups();
    }

    async loadCountries() {
        try {
            const response = await fetch('../data/countries.json');
            this.countries = await response.json();
        } catch (error) {
            console.error('Error loading countries:', error);
            this.countries = this.getDefaultCountries();
        }
    }

    getDefaultCountries() {
        return [
            {
                id: 'kenya',
                name: 'Kenya',
                code: 'KE',
                flag: '🇰🇪',
                currency: 'KSh',
                currencySymbol: 'KSh',
                language: 'English',
                phoneCode: '+254',
                capital: 'Nairobi',
                population: '54M',
                gdp: '$110B',
                timezone: 'EAT (UTC+3)',
                contactEmail: 'kenya@m-pesewa.com',
                supportPhone: '+254 700 000 000',
                totalGroups: 2500,
                totalLenders: 15000,
                totalBorrowers: 75000,
                totalLent: 'KSh 450M',
                repaymentRate: '99.2%',
                activeSince: '2020'
            },
            {
                id: 'uganda',
                name: 'Uganda',
                code: 'UG',
                flag: '🇺🇬',
                currency: 'UGX',
                currencySymbol: 'UGX',
                language: 'English',
                phoneCode: '+256',
                capital: 'Kampala',
                population: '45M',
                gdp: '$40B',
                timezone: 'EAT (UTC+3)',
                contactEmail: 'uganda@m-pesewa.com',
                supportPhone: '+256 700 000 000',
                totalGroups: 1800,
                totalLenders: 12000,
                totalBorrowers: 60000,
                totalLent: 'UGX 320B',
                repaymentRate: '98.8%',
                activeSince: '2021'
            },
            {
                id: 'tanzania',
                name: 'Tanzania',
                code: 'TZ',
                flag: '🇹🇿',
                currency: 'TZS',
                currencySymbol: 'TZS',
                language: 'Swahili',
                phoneCode: '+255',
                capital: 'Dodoma',
                population: '61M',
                gdp: '$75B',
                timezone: 'EAT (UTC+3)',
                contactEmail: 'tanzania@m-pesewa.com',
                supportPhone: '+255 700 000 000',
                totalGroups: 1200,
                totalLenders: 9000,
                totalBorrowers: 45000,
                totalLent: 'TZS 850B',
                repaymentRate: '99.1%',
                activeSince: '2021'
            },
            {
                id: 'rwanda',
                name: 'Rwanda',
                code: 'RW',
                flag: '🇷🇼',
                currency: 'RWF',
                currencySymbol: 'FRw',
                language: 'Kinyarwanda',
                phoneCode: '+250',
                capital: 'Kigali',
                population: '13M',
                gdp: '$11B',
                timezone: 'CAT (UTC+2)',
                contactEmail: 'rwanda@m-pesewa.com',
                supportPhone: '+250 700 000 000',
                totalGroups: 900,
                totalLenders: 6000,
                totalBorrowers: 30000,
                totalLent: 'RWF 95B',
                repaymentRate: '99.5%',
                activeSince: '2022'
            },
            {
                id: 'burundi',
                name: 'Burundi',
                code: 'BI',
                flag: '🇧🇮',
                currency: 'BIF',
                currencySymbol: 'FBu',
                language: 'French',
                phoneCode: '+257',
                capital: 'Gitega',
                population: '12M',
                gdp: '$3B',
                timezone: 'CAT (UTC+2)',
                contactEmail: 'burundi@m-pesewa.com',
                supportPhone: '+257 700 000 000',
                totalGroups: 600,
                totalLenders: 4000,
                totalBorrowers: 20000,
                totalLent: 'BIF 650B',
                repaymentRate: '98.5%',
                activeSince: '2022'
            },
            {
                id: 'somalia',
                name: 'Somalia',
                code: 'SO',
                flag: '🇸🇴',
                currency: 'SOS',
                currencySymbol: 'SOS',
                language: 'Somali',
                phoneCode: '+252',
                capital: 'Mogadishu',
                population: '16M',
                gdp: '$8B',
                timezone: 'EAT (UTC+3)',
                contactEmail: 'somalia@m-pesewa.com',
                supportPhone: '+252 700 000 000',
                totalGroups: 500,
                totalLenders: 3500,
                totalBorrowers: 18000,
                totalLent: 'SOS 1.2T',
                repaymentRate: '97.9%',
                activeSince: '2023'
            },
            {
                id: 'south-sudan',
                name: 'South Sudan',
                code: 'SS',
                flag: '🇸🇸',
                currency: 'SSP',
                currencySymbol: 'SSP',
                language: 'English',
                phoneCode: '+211',
                capital: 'Juba',
                population: '11M',
                gdp: '$4B',
                timezone: 'EAT (UTC+3)',
                contactEmail: 'southsudan@m-pesewa.com',
                supportPhone: '+211 700 000 000',
                totalGroups: 400,
                totalLenders: 3000,
                totalBorrowers: 15000,
                totalLent: 'SSP 850M',
                repaymentRate: '98.2%',
                activeSince: '2023'
            },
            {
                id: 'ethiopia',
                name: 'Ethiopia',
                code: 'ET',
                flag: '🇪🇹',
                currency: 'ETB',
                currencySymbol: 'Br',
                language: 'Amharic',
                phoneCode: '+251',
                capital: 'Addis Ababa',
                population: '120M',
                gdp: '$126B',
                timezone: 'EAT (UTC+3)',
                contactEmail: 'ethiopia@m-pesewa.com',
                supportPhone: '+251 700 000 000',
                totalGroups: 800,
                totalLenders: 5000,
                totalBorrowers: 25000,
                totalLent: 'ETB 4.5B',
                repaymentRate: '99.0%',
                activeSince: '2023'
            },
            {
                id: 'congo',
                name: 'Congo (DRC)',
                code: 'CD',
                flag: '🇨🇩',
                currency: 'CDF',
                currencySymbol: 'FC',
                language: 'French',
                phoneCode: '+243',
                capital: 'Kinshasa',
                population: '95M',
                gdp: '$55B',
                timezone: 'WAT (UTC+1)',
                contactEmail: 'congo@m-pesewa.com',
                supportPhone: '+243 700 000 000',
                totalGroups: 700,
                totalLenders: 4500,
                totalBorrowers: 22000,
                totalLent: 'CDF 2.8T',
                repaymentRate: '98.7%',
                activeSince: '2023'
            },
            {
                id: 'nigeria',
                name: 'Nigeria',
                code: 'NG',
                flag: '🇳🇬',
                currency: 'NGN',
                currencySymbol: '₦',
                language: 'English',
                phoneCode: '+234',
                capital: 'Abuja',
                population: '213M',
                gdp: '$514B',
                timezone: 'WAT (UTC+1)',
                contactEmail: 'nigeria@m-pesewa.com',
                supportPhone: '+234 700 000 000',
                totalGroups: 3000,
                totalLenders: 20000,
                totalBorrowers: 100000,
                totalLent: 'NGN 85B',
                repaymentRate: '99.3%',
                activeSince: '2021'
            },
            {
                id: 'south-africa',
                name: 'South Africa',
                code: 'ZA',
                flag: '🇿🇦',
                currency: 'ZAR',
                currencySymbol: 'R',
                language: 'English',
                phoneCode: '+27',
                capital: 'Pretoria',
                population: '60M',
                gdp: '$419B',
                timezone: 'SAST (UTC+2)',
                contactEmail: 'southafrica@m-pesewa.com',
                supportPhone: '+27 700 000 000',
                totalGroups: 1500,
                totalLenders: 10000,
                totalBorrowers: 50000,
                totalLent: 'ZAR 1.2B',
                repaymentRate: '99.4%',
                activeSince: '2022'
            },
            {
                id: 'ghana',
                name: 'Ghana',
                code: 'GH',
                flag: '🇬🇭',
                currency: 'GHS',
                currencySymbol: 'GH₵',
                language: 'English',
                phoneCode: '+233',
                capital: 'Accra',
                population: '32M',
                gdp: '$78B',
                timezone: 'GMT (UTC+0)',
                contactEmail: 'ghana@m-pesewa.com',
                supportPhone: '+233 700 000 000',
                totalGroups: 1500,
                totalLenders: 9000,
                totalBorrowers: 45000,
                totalLent: 'GH₵ 950M',
                repaymentRate: '99.1%',
                activeSince: '2021'
            }
        ];
    }

    async loadCountryData() {
        try {
            // Load groups data
            const groupsResponse = await fetch('../data/demo-groups.json');
            const groupsData = await groupsResponse.json();
            this.groupsByCountry = this.groupByCountry(groupsData);

            // Load users data
            const usersResponse = await fetch('../data/demo-users.json');
            const usersData = await usersResponse.json();
            
            this.lendersByCountry = this.groupByCountry(
                usersData.filter(user => user.role === 'lender')
            );
            
            this.borrowersByCountry = this.groupByCountry(
                usersData.filter(user => user.role === 'borrower')
            );

        } catch (error) {
            console.error('Error loading country data:', error);
            // Initialize empty structures
            this.groupsByCountry = {};
            this.lendersByCountry = {};
            this.borrowersByCountry = {};
        }
    }

    groupByCountry(data) {
        return data.reduce((acc, item) => {
            const country = item.country || 'kenya';
            if (!acc[country]) {
                acc[country] = [];
            }
            acc[country].push(item);
            return acc;
        }, {});
    }

    detectCurrentCountry() {
        // Try to get from URL
        const path = window.location.pathname;
        const countryMatch = path.match(/\/countries\/([^\/]+)\.html/);
        
        if (countryMatch) {
            const countryId = countryMatch[1];
            this.currentCountry = this.countries.find(c => c.id === countryId);
        }

        // If not found in URL, try localStorage
        if (!this.currentCountry) {
            const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
            if (userData.country) {
                this.currentCountry = this.countries.find(c => c.id === userData.country);
            }
        }

        // Default to Kenya
        if (!this.currentCountry) {
            this.currentCountry = this.countries.find(c => c.id === 'kenya') || this.countries[0];
        }
    }

    setupEventListeners() {
        // Country selector
        const countrySelect = document.getElementById('countrySelect');
        if (countrySelect) {
            // Populate options
            this.countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.id;
                option.textContent = `${country.flag} ${country.name}`;
                if (country.id === this.currentCountry.id) {
                    option.selected = true;
                }
                countrySelect.appendChild(option);
            });

            // Handle change
            countrySelect.addEventListener('change', (e) => {
                const countryId = e.target.value;
                this.switchCountry(countryId);
            });
        }

        // Quick country navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quick-country-link')) {
                e.preventDefault();
                const countryId = e.target.closest('.quick-country-link').dataset.country;
                this.switchCountry(countryId);
            }
        });

        // Join group buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.join-group-btn')) {
                const groupId = e.target.closest('.join-group-btn').dataset.groupId;
                this.joinGroup(groupId);
            }
        });

        // View group details
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-group-btn')) {
                const groupId = e.target.closest('.view-group-btn').dataset.groupId;
                this.viewGroupDetails(groupId);
            }
        });

        // Contact country support
        const contactBtn = document.getElementById('contactCountrySupport');
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                this.contactSupport();
            });
        }

        // Language toggle (if available)
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }
    }

    switchCountry(countryId) {
        // Update current country
        this.currentCountry = this.countries.find(c => c.id === countryId);
        if (!this.currentCountry) return;

        // Update URL if we're on a country page
        if (window.location.pathname.includes('/countries/')) {
            window.location.href = `../countries/${countryId}.html`;
        } else {
            // Otherwise just update the display
            this.renderCountryOverview();
            this.renderCountryStats();
            this.renderCountryGroups();
            
            // Show notification
            window.showToast(`Switched to ${this.currentCountry.name}`, 'info');
        }

        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
        userData.country = countryId;
        localStorage.setItem('m-pesewa-user', JSON.stringify(userData));
    }

    renderCountryOverview() {
        const container = document.getElementById('countryOverview');
        if (!container || !this.currentCountry) return;

        container.innerHTML = `
            <div class="country-header">
                <div class="country-flag-large">${this.currentCountry.flag}</div>
                <div class="country-info">
                    <h1 class="country-name">${this.currentCountry.name}</h1>
                    <div class="country-meta">
                        <span class="meta-item">${this.currentCountry.currency}</span>
                        <span class="meta-item">${this.currentCountry.language}</span>
                        <span class="meta-item">${this.currentCountry.timezone}</span>
                    </div>
                    <div class="country-stats-quick">
                        <span>${this.currentCountry.totalGroups.toLocaleString()} Groups</span>
                        <span>•</span>
                        <span>${this.currentCountry.totalLenders.toLocaleString()} Lenders</span>
                        <span>•</span>
                        <span>${this.currentCountry.totalBorrowers.toLocaleString()} Borrowers</span>
                    </div>
                </div>
            </div>

            <div class="country-actions">
                <a href="../groups.html" class="btn btn-primary">
                    Browse Groups
                </a>
                <a href="../lending.html" class="btn btn-outline">
                    Start Lending
                </a>
                <a href="../borrowing.html" class="btn btn-outline">
                    Request Loan
                </a>
                <button class="btn btn-text" id="contactCountrySupport">
                    Contact Support
                </button>
            </div>
        `;
    }

    renderCountryStats() {
        const container = document.getElementById('countryStats');
        if (!container || !this.currentCountry) return;

        const groups = this.groupsByCountry[this.currentCountry.id] || [];
        const lenders = this.lendersByCountry[this.currentCountry.id] || [];
        const borrowers = this.borrowersByCountry[this.currentCountry.id] || [];

        // Calculate some stats
        const activeGroups = groups.filter(g => g.status === 'active').length;
        const avgGroupSize = groups.length > 0 ? 
            Math.round(groups.reduce((sum, g) => sum + (g.memberCount || 0), 0) / groups.length) : 0;
        
        const topCategories = this.getTopLoanCategories(groups);

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-icon">👥</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${groups.length}</div>
                        <div class="stat-card-label">Total Groups</div>
                        <div class="stat-card-subtext">${activeGroups} active</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-icon">💰</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${lenders.length}</div>
                        <div class="stat-card-label">Active Lenders</div>
                        <div class="stat-card-subtext">${this.getSubscriptionBreakdown(lenders)}</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-icon">🤝</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${borrowers.length}</div>
                        <div class="stat-card-label">Active Borrowers</div>
                        <div class="stat-card-subtext">Avg rating: ${this.getAverageBorrowerRating(borrowers)}</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-icon">📈</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${this.currentCountry.repaymentRate}</div>
                        <div class="stat-card-label">Repayment Rate</div>
                        <div class="stat-card-subtext">Best in ${this.getCountryRanking()}</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-icon">🏆</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${avgGroupSize}</div>
                        <div class="stat-card-label">Avg Group Size</div>
                        <div class="stat-card-subtext">Min 5, Max 1000</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-icon">🎯</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${topCategories.length}</div>
                        <div class="stat-card-label">Top Categories</div>
                        <div class="stat-card-subtext">${topCategories.slice(0, 2).join(', ')}</div>
                    </div>
                </div>
            </div>

            <div class="country-details">
                <h3>About ${this.currentCountry.name}</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Capital:</span>
                        <span class="detail-value">${this.currentCountry.capital}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Population:</span>
                        <span class="detail-value">${this.currentCountry.population}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">GDP:</span>
                        <span class="detail-value">${this.currentCountry.gdp}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Phone Code:</span>
                        <span class="detail-value">${this.currentCountry.phoneCode}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Active Since:</span>
                        <span class="detail-value">${this.currentCountry.activeSince}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Total Lent:</span>
                        <span class="detail-value">${this.currentCountry.totalLent}</span>
                    </div>
                </div>
            </div>
        `;
    }

    getTopLoanCategories(groups) {
        const categoryCount = {};
        
        groups.forEach(group => {
            if (group.categories) {
                group.categories.forEach(category => {
                    categoryCount[category] = (categoryCount[category] || 0) + 1;
                });
            }
        });

        return Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => this.getCategoryName(category));
    }

    getSubscriptionBreakdown(lenders) {
        const tiers = { basic: 0, premium: 0, super: 0, 'lender-of-lenders': 0 };
        
        lenders.forEach(lender => {
            const tier = lender.subscription || 'basic';
            tiers[tier] = (tiers[tier] || 0) + 1;
        });

        const total = lenders.length;
        if (total === 0) return 'No data';
        
        const topTier = Object.entries(tiers).sort((a, b) => b[1] - a[1])[0];
        return `${Math.round((topTier[1] / total) * 100)}% ${topTier[0]}`;
    }

    getAverageBorrowerRating(borrowers) {
        if (borrowers.length === 0) return 'N/A';
        
        const totalRating = borrowers.reduce((sum, borrower) => {
            return sum + (borrower.rating || 3);
        }, 0);
        
        return (totalRating / borrowers.length).toFixed(1) + '/5.0';
    }

    getCountryRanking() {
        // Mock ranking based on repayment rate
        const rates = this.countries.map(c => parseFloat(c.repaymentRate));
        const currentRate = parseFloat(this.currentCountry.repaymentRate);
        const higherRates = rates.filter(rate => rate > currentRate).length;
        
        const positions = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
        return positions[higherRates] || '12th';
    }

    renderCountryGroups() {
        const container = document.getElementById('countryGroups');
        if (!container || !this.currentCountry) return;

        const groups = this.groupsByCountry[this.currentCountry.id] || [];
        
        if (groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <h3 class="empty-state-title">No Groups Found</h3>
                    <p class="empty-state-description">
                        There are no active groups in ${this.currentCountry.name} yet.
                        Be the first to create a group!
                    </p>
                    <a href="../groups.html" class="btn btn-primary">
                        Create Group
                    </a>
                </div>
            `;
            return;
        }

        // Filter to show only active groups
        const activeGroups = groups.filter(g => g.status === 'active').slice(0, 6);

        container.innerHTML = `
            <div class="section-header">
                <h3>Popular Groups in ${this.currentCountry.name}</h3>
                <a href="../groups.html" class="btn btn-text">
                    View All Groups →
                </a>
            </div>
            
            <div class="groups-grid">
                ${activeGroups.map(group => `
                    <div class="group-card">
                        <div class="group-card-header">
                            <div class="group-icon">${this.getGroupIcon(group.type)}</div>
                            <div class="group-info">
                                <h4 class="group-name">${group.name}</h4>
                                <div class="group-type">${this.getGroupTypeName(group.type)}</div>
                            </div>
                            <div class="group-members">
                                <span class="member-count">${group.memberCount || 0} members</span>
                            </div>
                        </div>
                        
                        <div class="group-card-body">
                            <div class="group-stats">
                                <div class="stat">
                                    <span class="stat-label">Lenders</span>
                                    <span class="stat-value">${group.lenderCount || 0}</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Borrowers</span>
                                    <span class="stat-value">${group.borrowerCount || 0}</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Repayment</span>
                                    <span class="stat-value">${group.repaymentRate || '95%'}</span>
                                </div>
                            </div>
                            
                            <div class="group-categories">
                                ${(group.categories || []).slice(0, 3).map(category => `
                                    <span class="category-tag">${this.getCategoryName(category)}</span>
                                `).join('')}
                            </div>
                            
                            <div class="group-description">
                                ${group.description || 'Trusted group for emergency lending and borrowing.'}
                            </div>
                        </div>
                        
                        <div class="group-card-footer">
                            <button class="btn btn-outline view-group-btn" data-group-id="${group.id}">
                                View Details
                            </button>
                            <button class="btn btn-primary join-group-btn" data-group-id="${group.id}">
                                Join Group
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    joinGroup(groupId) {
        // Check if user is logged in
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
        if (!userData.id) {
            window.showToast('Please log in to join a group', 'error');
            window.location.href = '../index.html#registration';
            return;
        }

        // Find the group
        const allGroups = Object.values(this.groupsByCountry).flat();
        const group = allGroups.find(g => g.id === groupId);
        
        if (!group) {
            window.showToast('Group not found', 'error');
            return;
        }

        // Check if user is already a member
        if (group.members && group.members.includes(userData.id)) {
            window.showToast('You are already a member of this group', 'info');
            return;
        }

        // Check if user has reached group limit (max 4 groups)
        const userGroups = JSON.parse(localStorage.getItem('m-pesewa-user-groups') || '[]');
        if (userGroups.length >= 4) {
            window.showToast('You can only join up to 4 groups', 'error');
            return;
        }

        // Check borrower rating if joining as borrower
        if (userData.role === 'borrower' && (userData.rating || 0) < 3) {
            window.showToast('You need a rating of 3.0 or higher to join new groups', 'error');
            return;
        }

        // Show join request modal
        this.showJoinRequestModal(group);
    }

    showJoinRequestModal(group) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title">Join Group Request</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="group-info-summary">
                        <h4>${group.name}</h4>
                        <p>${group.description || 'Trusted group for emergency lending and borrowing'}</p>
                        <div class="group-details">
                            <span>Type: ${this.getGroupTypeName(group.type)}</span>
                            <span>•</span>
                            <span>Members: ${group.memberCount || 0}</span>
                            <span>•</span>
                            <span>Country: ${this.getCountryName(group.country)}</span>
                        </div>
                    </div>
                    
                    <form id="joinGroupForm">
                        <div class="form-group">
                            <label for="joinRole">Join as *</label>
                            <select id="joinRole" name="role" class="form-control" required>
                                <option value="">Select role</option>
                                <option value="lender">Lender</option>
                                <option value="borrower">Borrower</option>
                                <option value="both">Both (Lender & Borrower)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="joinMessage">Message to Group Admin (Optional)</label>
                            <textarea id="joinMessage" name="message" class="form-control" rows="3" 
                                      placeholder="Introduce yourself and explain why you want to join..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="referralCode">Referral Code (If applicable)</label>
                            <input type="text" id="referralCode" name="referralCode" class="form-control" 
                                   placeholder="Enter referral code if you have one">
                        </div>
                        
                        <div class="terms-agreement">
                            <label class="checkbox-label">
                                <input type="checkbox" id="agreeGroupTerms" required>
                                <span>
                                    I agree to follow the group rules and maintain trust within the community.
                                    I understand that my membership may be revoked for violations.
                                </span>
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="submitJoinRequestBtn">
                        Submit Request
                    </button>
                    <button class="btn btn-outline close-modal">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Submit join request
        modal.querySelector('#submitJoinRequestBtn').addEventListener('click', () => {
            this.submitJoinRequest(modal, group);
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    submitJoinRequest(modal, group) {
        const form = modal.querySelector('#joinGroupForm');
        const role = form.querySelector('#joinRole').value;
        const message = form.querySelector('#joinMessage').value;
        const referralCode = form.querySelector('#referralCode').value;
        const agreed = form.querySelector('#agreeGroupTerms').checked;

        if (!role || !agreed) {
            window.showToast('Please select a role and agree to terms', 'error');
            return;
        }

        // Get user data
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');

        // Create join request
        const request = {
            id: 'join-' + Date.now(),
            groupId: group.id,
            groupName: group.name,
            userId: userData.id,
            userName: userData.fullName || userData.brandName,
            userPhone: userData.phone,
            role: role,
            message: message,
            referralCode: referralCode,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            country: group.country
        };

        // Save to localStorage
        const joinRequests = JSON.parse(localStorage.getItem('m-pesewa-join-requests') || '[]');
        joinRequests.push(request);
        localStorage.setItem('m-pesewa-join-requests', JSON.stringify(joinRequests));

        this.closeModal(modal);
        window.showToast('Join request submitted! Group admin will review.', 'success');

        // Simulate admin approval after delay (for demo)
        if (Math.random() > 0.3) { // 70% chance of approval for demo
            setTimeout(() => {
                this.simulateJoinApproval(request, group);
            }, 5000);
        }
    }

    simulateJoinApproval(request, group) {
        // Update request status
        const joinRequests = JSON.parse(localStorage.getItem('m-pesewa-join-requests') || '[]');
        const requestIndex = joinRequests.findIndex(r => r.id === request.id);
        if (requestIndex !== -1) {
            joinRequests[requestIndex].status = 'approved';
            joinRequests[requestIndex].approvedAt = new Date().toISOString();
            localStorage.setItem('m-pesewa-join-requests', JSON.stringify(joinRequests));
        }

        // Add user to group members
        const userGroups = JSON.parse(localStorage.getItem('m-pesewa-user-groups') || '[]');
        if (!userGroups.find(g => g.id === group.id)) {
            userGroups.push({
                id: group.id,
                name: group.name,
                type: group.type,
                country: group.country,
                joinedAt: new Date().toISOString(),
                role: request.role,
                status: 'active'
            });
            localStorage.setItem('m-pesewa-user-groups', JSON.stringify(userGroups));
        }

        // Show notification
        window.showToast(
            `Your join request for ${group.name} has been approved!`,
            'success'
        );
    }

    viewGroupDetails(groupId) {
        const allGroups = Object.values(this.groupsByCountry).flat();
        const group = allGroups.find(g => g.id === groupId);
        
        if (!group) {
            window.showToast('Group not found', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3 class="modal-title">${group.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="group-details-view">
                        <div class="group-header">
                            <div class="group-icon-large">${this.getGroupIcon(group.type)}</div>
                            <div class="group-header-info">
                                <div class="group-type-badge">${this.getGroupTypeName(group.type)}</div>
                                <div class="group-location">
                                    <span class="country-flag">${this.getCountryFlag(group.country)}</span>
                                    ${this.getCountryName(group.country)}
                                </div>
                            </div>
                        </div>
                        
                        <div class="group-description-full">
                            <h4>Description</h4>
                            <p>${group.description || 'No description available.'}</p>
                        </div>
                        
                        <div class="group-stats-detailed">
                            <h4>Statistics</h4>
                            <div class="stats-grid-detailed">
                                <div class="stat-item">
                                    <span class="stat-label">Total Members</span>
                                    <span class="stat-value">${group.memberCount || 0}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Active Lenders</span>
                                    <span class="stat-value">${group.lenderCount || 0}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Active Borrowers</span>
                                    <span class="stat-value">${group.borrowerCount || 0}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Repayment Rate</span>
                                    <span class="stat-value">${group.repaymentRate || '95%'}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Lent</span>
                                    <span class="stat-value">${this.formatCurrency(group.totalLent || 0)}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Avg Loan Size</span>
                                    <span class="stat-value">${this.formatCurrency(group.avgLoanSize || 0)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="group-categories-detailed">
                            <h4>Loan Categories</h4>
                            <div class="categories-list">
                                ${(group.categories || []).map(category => `
                                    <div class="category-item">
                                        <span class="category-icon">${this.getCategoryIcon(category)}</span>
                                        <span class="category-name">${this.getCategoryName(category)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="group-rules">
                            <h4>Group Rules</h4>
                            <div class="rules-list">
                                ${(group.rules || [
                                    'All loans must be repaid within 7 days',
                                    'Maximum 10% interest per week',
                                    'Daily partial repayments allowed',
                                    'Borrowers must maintain good rating',
                                    'Lenders must have active subscription',
                                    'No cross-group lending',
                                    'Referral-only membership'
                                ]).map(rule => `
                                    <div class="rule-item">• ${rule}</div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="group-admin">
                            <h4>Group Admin</h4>
                            <div class="admin-info">
                                <div class="admin-avatar">👑</div>
                                <div class="admin-details">
                                    <div class="admin-name">${group.adminName || 'Group Founder'}</div>
                                    <div class="admin-contact">Contact via group chat</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary join-group-btn" data-group-id="${group.id}">
                        Join Group
                    </button>
                    <button class="btn btn-outline close-modal">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Join button
        const joinBtn = modal.querySelector('.join-group-btn');
        joinBtn.addEventListener('click', () => {
            this.closeModal(modal);
            this.joinGroup(group.id);
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    contactSupport() {
        if (!this.currentCountry) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title">Contact ${this.currentCountry.name} Support</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="contact-info">
                        <div class="contact-method">
                            <div class="method-icon">📧</div>
                            <div class="method-details">
                                <h5>Email</h5>
                                <p>${this.currentCountry.contactEmail}</p>
                                <button class="btn-text copy-email-btn" data-email="${this.currentCountry.contactEmail}">
                                    Copy Email
                                </button>
                            </div>
                        </div>
                        
                        <div class="contact-method">
                            <div class="method-icon">📞</div>
                            <div class="method-details">
                                <h5>Phone</h5>
                                <p>${this.currentCountry.supportPhone}</p>
                                <button class="btn-text copy-phone-btn" data-phone="${this.currentCountry.supportPhone}">
                                    Copy Phone
                                </button>
                            </div>
                        </div>
                        
                        <div class="contact-method">
                            <div class="method-icon">🏢</div>
                            <div class="method-details">
                                <h5>Office Hours</h5>
                                <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                                <p>Saturday: 9:00 AM - 1:00 PM</p>
                                <p>Closed on Sundays and public holidays</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="contact-form">
                        <h4>Send Message</h4>
                        <form id="supportContactForm">
                            <div class="form-group">
                                <label for="supportName">Your Name *</label>
                                <input type="text" id="supportName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="supportEmail">Your Email *</label>
                                <input type="email" id="supportEmail" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="supportPhone">Phone Number</label>
                                <input type="tel" id="supportPhone" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="supportSubject">Subject *</label>
                                <select id="supportSubject" class="form-control" required>
                                    <option value="">Select subject</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="technical">Technical Support</option>
                                    <option value="billing">Billing Issue</option>
                                    <option value="group">Group Management</option>
                                    <option value="loan">Loan Issue</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="supportMessage">Message *</label>
                                <textarea id="supportMessage" class="form-control" rows="5" required></textarea>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="sendSupportMessageBtn">
                        Send Message
                    </button>
                    <button class="btn btn-outline close-modal">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Copy buttons
        modal.querySelector('.copy-email-btn').addEventListener('click', (e) => {
            const email = e.target.dataset.email;
            navigator.clipboard.writeText(email);
            window.showToast('Email copied to clipboard', 'success');
        });

        modal.querySelector('.copy-phone-btn').addEventListener('click', (e) => {
            const phone = e.target.dataset.phone;
            navigator.clipboard.writeText(phone);
            window.showToast('Phone number copied to clipboard', 'success');
        });

        // Send message
        modal.querySelector('#sendSupportMessageBtn').addEventListener('click', () => {
            const form = modal.querySelector('#supportContactForm');
            const name = form.querySelector('#supportName').value;
            const email = form.querySelector('#supportEmail').value;
            const subject = form.querySelector('#supportSubject').value;
            const message = form.querySelector('#supportMessage').value;

            if (!name || !email || !subject || !message) {
                window.showToast('Please fill in all required fields', 'error');
                return;
            }

            // Simulate sending message
            console.log('Support message:', { name, email, subject, message, country: this.currentCountry.name });
            
            this.closeModal(modal);
            window.showToast('Message sent successfully! We\'ll respond within 24 hours.', 'success');
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    toggleLanguage() {
        // Toggle between English and French
        const currentLang = document.documentElement.lang || 'en';
        const newLang = currentLang === 'en' ? 'fr' : 'en';
        
        document.documentElement.lang = newLang;
        
        // Show notification
        window.showToast(
            `Language switched to ${newLang === 'en' ? 'English' : 'French'}`,
            'info'
        );
        
        // In a real app, you would update all text content here
        // For this demo, we'll just toggle some example text
        const langToggle = document.getElementById('languageToggle');
        if (langToggle) {
            langToggle.textContent = newLang === 'en' ? 'FR' : 'EN';
        }
    }

    getGroupIcon(type) {
        const icons = {
            'family': '👨‍👩‍👧‍👦',
            'professional': '💼',
            'church': '⛪',
            'community': '🏘️',
            'social': '🎉',
            'business': '🏢',
            'education': '🎓',
            'health': '🏥',
            'transport': '🚌',
            'agriculture': '🌾',
            'default': '👥'
        };
        return icons[type] || icons.default;
    }

    getGroupTypeName(type) {
        const names = {
            'family': 'Family Group',
            'professional': 'Professional Group',
            'church': 'Church Group',
            'community': 'Community Group',
            'social': 'Social Group',
            'business': 'Business Group',
            'education': 'Education Group',
            'health': 'Health Group',
            'transport': 'Transport Group',
            'agriculture': 'Agriculture Group',
            'default': 'General Group'
        };
        return names[type] || type;
    }

    getCategoryName(category) {
        const names = {
            'transport': 'Transport (Fare)',
            'airtime': 'Airtime/Credit',
            'internet': 'Wi-Fi/Internet',
            'cooking': 'Cooking Gas',
            'food': 'Food',
            'advance': 'Advance Loan',
            'credo': 'Credo (Repairs/Tools)',
            'water': 'Water Bill',
            'fuel': 'Bike/Car/Tuktuk Fuel',
            'repair': 'Bike/Car/Tuktuk Repair',
            'medicine': 'Medicine',
            'electricity': 'Electricity Tokens',
            'school': 'School Fees',
            'tv': 'TV Subscription'
        };
        return names[category] || category;
    }

    getCategoryIcon(category) {
        const icons = {
            'transport': '🚌',
            'airtime': '📱',
            'internet': '🌐',
            'cooking': '🔥',
            'food': '🍲',
            'advance': '💼',
            'credo': '🛠️',
            'water': '💧',
            'fuel': '⛽',
            'repair': '🔧',
            'medicine': '💊',
            'electricity': '💡',
            'school': '🎓',
            'tv': '📺'
        };
        return icons[category] || '💰';
    }

    getCountryFlag(countryCode) {
        const flags = {
            'kenya': '🇰🇪',
            'uganda': '🇺🇬',
            'tanzania': '🇹🇿',
            'rwanda': '🇷🇼',
            'burundi': '🇧🇮',
            'somalia': '🇸🇴',
            'south-sudan': '🇸🇸',
            'ethiopia': '🇪🇹',
            'congo': '🇨🇩',
            'nigeria': '🇳🇬',
            'south-africa': '🇿🇦',
            'ghana': '🇬🇭'
        };
        return flags[countryCode] || '🌍';
    }

    getCountryName(countryCode) {
        const names = {
            'kenya': 'Kenya',
            'uganda': 'Uganda',
            'tanzania': 'Tanzania',
            'rwanda': 'Rwanda',
            'burundi': 'Burundi',
            'somalia': 'Somalia',
            'south-sudan': 'South Sudan',
            'ethiopia': 'Ethiopia',
            'congo': 'Congo',
            'nigeria': 'Nigeria',
            'south-africa': 'South Africa',
            'ghana': 'Ghana'
        };
        return names[countryCode] || 'Unknown Country';
    }

    formatCurrency(amount) {
        const currency = this.currentCountry?.currencySymbol || '₵';
        if (typeof amount === 'string') return amount;
        return `${currency} ${amount.toLocaleString()}`;
    }

    closeModal(modal) {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    }
}

// Initialize countries manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.countries-page') || 
        document.querySelector('#countries-section') ||
        window.location.pathname.includes('/countries/')) {
        window.countriesManager = new CountriesManager();
    }
});