// Subscriptions Management Module
'use strict';

class SubscriptionManager {
    constructor() {
        this.currentLender = null;
        this.subscription = null;
        this.subscriptionHistory = [];
        this.paymentHistory = [];
        this.init();
    }

    init() {
        this.loadLenderData();
        this.loadSubscriptionData();
        this.loadPaymentHistory();
        this.setupEventListeners();
        this.renderSubscriptionInfo();
        this.renderPaymentHistory();
        this.updateSubscriptionStatus();
    }

    loadLenderData() {
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
        this.currentLender = {
            id: userData.id,
            name: userData.fullName || userData.brandName || 'Anonymous Lender',
            role: userData.role,
            subscription: userData.subscription || 'basic',
            subscriptionExpiry: userData.subscriptionExpiry || this.calculateExpiryDate(),
            subscriptionStart: userData.subscriptionStart || new Date().toISOString().split('T')[0],
            country: userData.country || 'kenya',
            phone: userData.phone,
            email: userData.email
        };
    }

    calculateExpiryDate() {
        const today = new Date();
        // Set to 28th of current month or next month if past 28th
        let expiry = new Date(today.getFullYear(), today.getMonth(), 28);
        if (today.getDate() > 28) {
            expiry = new Date(today.getFullYear(), today.getMonth() + 1, 28);
        }
        return expiry.toISOString().split('T')[0];
    }

    loadSubscriptionData() {
        const subscriptionData = JSON.parse(localStorage.getItem('m-pesewa-subscription') || '{}');
        
        if (Object.keys(subscriptionData).length === 0) {
            this.subscription = this.getDefaultSubscription();
        } else {
            this.subscription = subscriptionData;
        }

        // Load subscription history
        const history = JSON.parse(localStorage.getItem('m-pesewa-subscription-history') || '[]');
        this.subscriptionHistory = history;
    }

    getDefaultSubscription() {
        return {
            id: 'sub-' + Date.now(),
            lenderId: this.currentLender.id,
            tier: 'basic',
            period: 'monthly',
            amount: 50,
            currency: 'KSh',
            startDate: this.currentLender.subscriptionStart,
            expiryDate: this.currentLender.subscriptionExpiry,
            status: 'active',
            autoRenew: false,
            paymentMethod: 'mpesa',
            lastPaymentDate: this.currentLender.subscriptionStart,
            nextPaymentDate: this.currentLender.subscriptionExpiry,
            maxLoanAmount: 1500,
            features: ['No CRB check', 'Basic borrower verification', 'Max ₵1,500 per loan']
        };
    }

    loadPaymentHistory() {
        const payments = JSON.parse(localStorage.getItem('m-pesewa-payments') || '[]');
        this.paymentHistory = payments.filter(payment => 
            payment.type === 'subscription' || 
            payment.lenderId === this.currentLender.id
        );

        if (this.paymentHistory.length === 0) {
            this.paymentHistory = this.getDefaultPaymentHistory();
        }
    }

    getDefaultPaymentHistory() {
        return [
            {
                id: 'pay-1',
                date: '2024-01-01',
                amount: 50,
                currency: 'KSh',
                tier: 'basic',
                period: 'monthly',
                status: 'completed',
                method: 'mpesa',
                transactionId: 'MPESA001',
                invoiceNumber: 'INV-2024-001'
            },
            {
                id: 'pay-2',
                date: '2023-12-01',
                amount: 50,
                currency: 'KSh',
                tier: 'basic',
                period: 'monthly',
                status: 'completed',
                method: 'mpesa',
                transactionId: 'MPESA002',
                invoiceNumber: 'INV-2023-012'
            }
        ];
    }

    setupEventListeners() {
        // Upgrade subscription button
        const upgradeBtn = document.getElementById('upgradeSubscriptionBtn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                this.showUpgradeModal();
            });
        }

        // Renew subscription button
        const renewBtn = document.getElementById('renewSubscriptionBtn');
        if (renewBtn) {
            renewBtn.addEventListener('click', () => {
                this.renewSubscription();
            });
        }

        // Cancel subscription button
        const cancelBtn = document.getElementById('cancelSubscriptionBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelSubscription();
            });
        }

        // Change payment method button
        const changeMethodBtn = document.getElementById('changePaymentMethodBtn');
        if (changeMethodBtn) {
            changeMethodBtn.addEventListener('click', () => {
                this.changePaymentMethod();
            });
        }

        // Download invoice buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.download-invoice-btn')) {
                const paymentId = e.target.closest('.download-invoice-btn').dataset.paymentId;
                this.downloadInvoice(paymentId);
            }
        });

        // Auto-renew toggle
        const autoRenewToggle = document.getElementById('autoRenewToggle');
        if (autoRenewToggle) {
            autoRenewToggle.addEventListener('change', (e) => {
                this.toggleAutoRenew(e.target.checked);
            });
        }

        // View tier details buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-tier-details')) {
                const tier = e.target.closest('.view-tier-details').dataset.tier;
                this.showTierDetails(tier);
            }
        });

        // Make payment button
        const makePaymentBtn = document.getElementById('makePaymentBtn');
        if (makePaymentBtn) {
            makePaymentBtn.addEventListener('click', () => {
                this.makePayment();
            });
        }
    }

    renderSubscriptionInfo() {
        this.renderCurrentSubscription();
        this.renderSubscriptionTiers();
        this.renderUpcomingPayment();
    }

    renderCurrentSubscription() {
        const container = document.getElementById('currentSubscription');
        if (!container) return;

        const tierInfo = this.getTierInfo(this.subscription.tier);
        const daysRemaining = this.getDaysRemaining(this.subscription.expiryDate);
        const statusClass = this.subscription.status === 'active' ? 'active' : 
                          this.subscription.status === 'expired' ? 'expired' : 'cancelled';

        container.innerHTML = `
            <div class="subscription-card ${statusClass}">
                <div class="subscription-card-header">
                    <div class="subscription-tier-badge">${tierInfo.name}</div>
                    <div class="subscription-status-badge ${statusClass}">
                        ${this.subscription.status.toUpperCase()}
                    </div>
                </div>
                
                <div class="subscription-card-body">
                    <div class="subscription-details">
                        <div class="detail-row">
                            <span class="detail-label">Subscription ID:</span>
                            <span class="detail-value">${this.subscription.id}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Period:</span>
                            <span class="detail-value">${this.subscription.period}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Amount:</span>
                            <span class="detail-value">${this.formatCurrency(this.subscription.amount)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Start Date:</span>
                            <span class="detail-value">${this.formatDate(this.subscription.startDate)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Expiry Date:</span>
                            <span class="detail-value">${this.formatDate(this.subscription.expiryDate)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Days Remaining:</span>
                            <span class="detail-value ${daysRemaining <= 7 ? 'text-warning' : ''}">
                                ${daysRemaining} days
                                ${daysRemaining <= 7 ? '(Expiring soon!)' : ''}
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Max Loan Amount:</span>
                            <span class="detail-value">${this.formatCurrency(this.subscription.maxLoanAmount)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Payment Method:</span>
                            <span class="detail-value">${this.getPaymentMethodName(this.subscription.paymentMethod)}</span>
                        </div>
                    </div>

                    <div class="subscription-features">
                        <h5>Features:</h5>
                        <ul>
                            ${this.subscription.features.map(feature => `
                                <li>✓ ${feature}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="subscription-card-footer">
                    <div class="auto-renew-section">
                        <label class="checkbox-label">
                            <input type="checkbox" id="autoRenewToggle" 
                                   ${this.subscription.autoRenew ? 'checked' : ''}>
                            <span>Auto-renew on expiry</span>
                        </label>
                    </div>
                    
                    <div class="subscription-actions">
                        ${this.subscription.status === 'active' ? `
                            <button class="btn btn-outline" id="upgradeSubscriptionBtn">
                                Upgrade Tier
                            </button>
                            <button class="btn btn-outline" id="renewSubscriptionBtn">
                                Renew Early
                            </button>
                            <button class="btn btn-danger" id="cancelSubscriptionBtn">
                                Cancel
                            </button>
                        ` : `
                            <button class="btn btn-primary" id="renewSubscriptionBtn">
                                Renew Subscription
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;

        // Re-attach event listeners
        const autoRenewToggle = document.getElementById('autoRenewToggle');
        if (autoRenewToggle) {
            autoRenewToggle.addEventListener('change', (e) => {
                this.toggleAutoRenew(e.target.checked);
            });
        }
    }

    renderSubscriptionTiers() {
        const container = document.getElementById('subscriptionTiers');
        if (!container) return;

        const tiers = [
            {
                id: 'basic',
                name: 'Basic Tier',
                weeklyLimit: 1500,
                monthlyPrice: 50,
                biAnnualPrice: 250,
                annualPrice: 500,
                features: [
                    'No CRB check required',
                    'Basic borrower verification',
                    'Max ₵1,500 per loan',
                    'Access to all groups',
                    'Basic support'
                ],
                recommended: false
            },
            {
                id: 'premium',
                name: 'Premium Tier',
                weeklyLimit: 5000,
                monthlyPrice: 250,
                biAnnualPrice: 1500,
                annualPrice: 2500,
                features: [
                    'No CRB check required',
                    'Enhanced borrower verification',
                    'Max ₵5,000 per loan',
                    'Priority support',
                    'Advanced analytics',
                    'Custom lending categories'
                ],
                recommended: true
            },
            {
                id: 'super',
                name: 'Super Tier',
                weeklyLimit: 20000,
                monthlyPrice: 1000,
                biAnnualPrice: 5000,
                annualPrice: 8500,
                features: [
                    'CRB check required',
                    'Full borrower verification',
                    'Max ₵20,000 per loan',
                    '24/7 priority support',
                    'Advanced risk assessment',
                    'Dedicated account manager',
                    'Bulk lending tools'
                ],
                recommended: false
            },
            {
                id: 'lender-of-lenders',
                name: 'Lender of Lenders',
                monthlyLimit: 50000,
                monthlyPrice: 500,
                biAnnualPrice: 3500,
                annualPrice: 6500,
                features: [
                    'Lend to other lenders',
                    'Set your own interest rates',
                    'Max ₵50,000 per lender',
                    'Minimum 1 month repayment',
                    'Exclusive lender network',
                    'Advanced portfolio management',
                    'Custom agreements'
                ],
                recommended: false
            }
        ];

        container.innerHTML = tiers.map(tier => `
            <div class="tier-card ${tier.id === this.subscription.tier ? 'current-tier' : ''} ${tier.recommended ? 'recommended' : ''}">
                ${tier.recommended ? '<div class="recommended-badge">RECOMMENDED</div>' : ''}
                
                <div class="tier-header">
                    <h4 class="tier-name">${tier.name}</h4>
                    ${tier.id === this.subscription.tier ? 
                        '<div class="current-badge">CURRENT</div>' : ''}
                </div>
                
                <div class="tier-limit">
                    ${tier.id === 'lender-of-lenders' ? 
                        `≤ ${this.formatCurrency(tier.monthlyLimit)}/month` : 
                        `≤ ${this.formatCurrency(tier.weeklyLimit)}/week`}
                </div>
                
                <div class="tier-pricing">
                    <div class="price-option">
                        <span class="price">${this.formatCurrency(tier.monthlyPrice)}</span>
                        <span class="period">Monthly</span>
                    </div>
                    <div class="price-option">
                        <span class="price">${this.formatCurrency(tier.biAnnualPrice)}</span>
                        <span class="period">Bi-Annual</span>
                        <span class="discount">Save ${Math.round((1 - tier.biAnnualPrice/(tier.monthlyPrice*6)) * 100)}%</span>
                    </div>
                    <div class="price-option">
                        <span class="price">${this.formatCurrency(tier.annualPrice)}</span>
                        <span class="period">Annual</span>
                        <span class="discount">Save ${Math.round((1 - tier.annualPrice/(tier.monthlyPrice*12)) * 100)}%</span>
                    </div>
                </div>
                
                <ul class="tier-features">
                    ${tier.features.map(feature => `
                        <li>${feature}</li>
                    `).join('')}
                </ul>
                
                <div class="tier-actions">
                    ${tier.id === this.subscription.tier ? `
                        <button class="btn btn-outline btn-block" disabled>
                            Current Plan
                        </button>
                    ` : `
                        <button class="btn ${tier.recommended ? 'btn-primary' : 'btn-outline'} btn-block upgrade-tier-btn" data-tier="${tier.id}">
                            ${this.subscription.tier === 'none' ? 'Subscribe' : 'Upgrade'}
                        </button>
                    `}
                    <button class="btn btn-text btn-block view-tier-details" data-tier="${tier.id}">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');

        // Attach upgrade event listeners
        document.querySelectorAll('.upgrade-tier-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tier = e.target.dataset.tier;
                this.showUpgradeModal(tier);
            });
        });
    }

    renderUpcomingPayment() {
        const container = document.getElementById('upcomingPayment');
        if (!container) return;

        const nextPaymentDate = this.subscription.nextPaymentDate;
        const daysUntilPayment = this.getDaysRemaining(nextPaymentDate);
        const amount = this.subscription.amount;

        container.innerHTML = `
            <div class="upcoming-payment-card">
                <h4>Upcoming Payment</h4>
                
                <div class="payment-summary">
                    <div class="summary-row">
                        <span>Amount:</span>
                        <span class="amount">${this.formatCurrency(amount)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Due Date:</span>
                        <span>${this.formatDate(nextPaymentDate)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Days Until Due:</span>
                        <span class="${daysUntilPayment <= 7 ? 'text-warning' : ''}">
                            ${daysUntilPayment} days
                        </span>
                    </div>
                    <div class="summary-row">
                        <span>Payment Method:</span>
                        <span>${this.getPaymentMethodName(this.subscription.paymentMethod)}</span>
                    </div>
                </div>
                
                ${daysUntilPayment <= 14 ? `
                    <div class="payment-alert ${daysUntilPayment <= 7 ? 'alert-warning' : 'alert-info'}">
                        <div class="alert-icon">${daysUntilPayment <= 7 ? '⚠️' : 'ℹ️'}</div>
                        <div class="alert-content">
                            <strong>Payment due in ${daysUntilPayment} days</strong>
                            <p>${daysUntilPayment <= 7 ? 
                                'Your subscription will expire soon. Renew now to avoid interruption.' : 
                                'Consider renewing early to avoid last-minute rush.'}</p>
                        </div>
                    </div>
                ` : ''}
                
                <div class="payment-actions">
                    <button class="btn btn-primary" id="makePaymentBtn">
                        Pay Now
                    </button>
                    <button class="btn btn-outline" id="changePaymentMethodBtn">
                        Change Method
                    </button>
                </div>
            </div>
        `;
    }

    renderPaymentHistory() {
        const container = document.getElementById('paymentHistoryContainer');
        if (!container) return;

        if (this.paymentHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💰</div>
                    <h3 class="empty-state-title">No Payment History</h3>
                    <p class="empty-state-description">
                        Your payment history will appear here after making your first subscription payment.
                    </p>
                </div>
            `;
            return;
        }

        const table = document.createElement('table');
        table.className = 'data-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Tier</th>
                    <th>Period</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Invoice</th>
                </tr>
            </thead>
            <tbody>
                ${this.paymentHistory.map(payment => `
                    <tr>
                        <td>${this.formatDate(payment.date)}</td>
                        <td>${this.formatCurrency(payment.amount)}</td>
                        <td>
                            <span class="tier-badge tier-${payment.tier}">
                                ${payment.tier}
                            </span>
                        </td>
                        <td>${payment.period}</td>
                        <td>${this.getPaymentMethodName(payment.method)}</td>
                        <td>
                            <span class="table-status table-status-${payment.status}">
                                ${payment.status}
                            </span>
                        </td>
                        <td>
                            ${payment.invoiceNumber ? `
                                <button class="btn-text download-invoice-btn" data-payment-id="${payment.id}">
                                    Download
                                </button>
                            ` : 'N/A'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        container.innerHTML = '';
        container.appendChild(table);
    }

    updateSubscriptionStatus() {
        const today = new Date();
        const expiryDate = new Date(this.subscription.expiryDate);

        if (today > expiryDate && this.subscription.status === 'active') {
            this.subscription.status = 'expired';
            
            // Save updated status
            localStorage.setItem('m-pesewa-subscription', JSON.stringify(this.subscription));
            
            // Show expired notification
            this.showExpiredNotification();
        }

        // Update UI if expired
        if (this.subscription.status === 'expired') {
            this.renderSubscriptionInfo();
        }
    }

    showExpiredNotification() {
        const notification = document.createElement('div');
        notification.className = 'global-notification notification-warning';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">⚠️</div>
                <div class="notification-text">
                    <strong>Your subscription has expired!</strong>
                    <p>Renew now to continue lending on M-PESEWA.</p>
                </div>
                <button class="btn btn-primary btn-small" id="renewNowBtn">Renew Now</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Renew button
        notification.querySelector('#renewNowBtn').addEventListener('click', () => {
            this.renewSubscription();
            notification.remove();
        });

        // Auto-remove after 10 seconds
        setTimeout(() => {
            notification.remove();
        }, 10000);
    }

    showUpgradeModal(preSelectedTier = null) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        const currentTier = this.subscription.tier;
        const tiers = ['basic', 'premium', 'super', 'lender-of-lenders'];
        const currentIndex = tiers.indexOf(currentTier);
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3 class="modal-title">Upgrade Subscription</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="upgrade-info">
                        <p>Upgrade your subscription to access higher lending limits and additional features.</p>
                        <div class="current-tier-display">
                            Current: <strong>${this.getTierInfo(currentTier).name}</strong>
                        </div>
                    </div>
                    
                    <div class="tier-selection">
                        <h4>Select New Tier</h4>
                        <div class="tier-options-grid">
                            ${this.createTierOptions(currentIndex, preSelectedTier)}
                        </div>
                    </div>
                    
                    <div class="period-selection">
                        <h4>Select Payment Period</h4>
                        <div class="period-options" id="periodOptions">
                            ${this.createPeriodOptions()}
                        </div>
                    </div>
                    
                    <div class="payment-summary" id="paymentSummary">
                        <!-- Dynamic content will be inserted here -->
                    </div>
                    
                    <div class="payment-method">
                        <h4>Payment Method</h4>
                        <div class="method-options">
                            ${this.createPaymentMethodOptions()}
                        </div>
                    </div>
                    
                    <div class="terms-agreement">
                        <label class="checkbox-label">
                            <input type="checkbox" id="agreeTerms" required>
                            <span>
                                I agree to the subscription terms and authorize M-PESEWA to charge my selected payment method.
                                The subscription will auto-renew unless cancelled before the renewal date.
                            </span>
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="confirmUpgradeBtn" disabled>
                        Confirm Upgrade
                    </button>
                    <button class="btn btn-outline close-modal">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Initialize with default selection
        const defaultTier = preSelectedTier || (currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : currentTier);
        this.updateTierSelection(modal, defaultTier, 'monthly');

        // Tier selection
        modal.querySelectorAll('.tier-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const selectedTier = e.currentTarget.dataset.tier;
                this.updateTierSelection(modal, selectedTier);
            });
        });

        // Period selection
        modal.querySelectorAll('.period-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const selectedPeriod = e.currentTarget.dataset.period;
                this.updatePeriodSelection(modal, selectedPeriod);
            });
        });

        // Payment method selection
        modal.querySelectorAll('.method-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const selectedMethod = e.currentTarget.dataset.method;
                this.updatePaymentMethodSelection(modal, selectedMethod);
            });
        });

        // Terms agreement
        const termsCheckbox = modal.querySelector('#agreeTerms');
        termsCheckbox.addEventListener('change', () => {
            const confirmBtn = modal.querySelector('#confirmUpgradeBtn');
            confirmBtn.disabled = !termsCheckbox.checked;
        });

        // Confirm upgrade
        modal.querySelector('#confirmUpgradeBtn').addEventListener('click', () => {
            this.processUpgrade(modal);
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    createTierOptions(currentIndex, preSelectedTier) {
        const tiers = [
            { id: 'basic', name: 'Basic', limit: '₵1,500/week', price: 50 },
            { id: 'premium', name: 'Premium', limit: '₵5,000/week', price: 250 },
            { id: 'super', name: 'Super', limit: '₵20,000/week', price: 1000 },
            { id: 'lender-of-lenders', name: 'Lender of Lenders', limit: '₵50,000/month', price: 500 }
        ];

        return tiers.map((tier, index) => {
            const isCurrent = tier.id === this.subscription.tier;
            const isSelectable = index > currentIndex;
            const isPreselected = tier.id === preSelectedTier;
            
            return `
                <div class="tier-option ${isCurrent ? 'current' : ''} ${isSelectable ? 'selectable' : 'disabled'} ${isPreselected ? 'selected' : ''}" 
                     data-tier="${tier.id}" ${isSelectable ? '' : 'style="opacity: 0.6; cursor: not-allowed;"'}>
                    ${isCurrent ? '<div class="current-badge">Current</div>' : ''}
                    <h5>${tier.name}</h5>
                    <div class="tier-limit">${tier.limit}</div>
                    <div class="tier-price">${this.formatCurrency(tier.price)}/month</div>
                    ${isSelectable ? '<div class="select-indicator">✓</div>' : ''}
                </div>
            `;
        }).join('');
    }

    createPeriodOptions() {
        const periods = [
            { id: 'monthly', name: 'Monthly', discount: '' },
            { id: 'bi-annual', name: 'Bi-Annual (6 months)', discount: 'Save 16%' },
            { id: 'annual', name: 'Annual', discount: 'Save 17%' }
        ];

        return periods.map(period => `
            <div class="period-option" data-period="${period.id}">
                <div class="period-name">${period.name}</div>
                ${period.discount ? `<div class="period-discount">${period.discount}</div>` : ''}
            </div>
        `).join('');
    }

    createPaymentMethodOptions() {
        const methods = [
            { id: 'mpesa', name: 'M-Pesa', icon: '📱' },
            { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
            { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
            { id: 'mobile_money', name: 'Mobile Money', icon: '💰' }
        ];

        return methods.map(method => `
            <div class="method-option ${method.id === this.subscription.paymentMethod ? 'selected' : ''}" 
                 data-method="${method.id}">
                <div class="method-icon">${method.icon}</div>
                <div class="method-name">${method.name}</div>
            </div>
        `).join('');
    }

    updateTierSelection(modal, tierId, period = 'monthly') {
        // Update tier selection
        modal.querySelectorAll('.tier-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.tier === tierId && option.classList.contains('selectable')) {
                option.classList.add('selected');
            }
        });

        // Update period selection
        this.updatePeriodSelection(modal, period);

        // Update payment summary
        this.updatePaymentSummary(modal, tierId, period);
    }

    updatePeriodSelection(modal, period) {
        // Update period selection
        modal.querySelectorAll('.period-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.period === period) {
                option.classList.add('selected');
            }
        });
    }

    updatePaymentMethodSelection(modal, method) {
        // Update method selection
        modal.querySelectorAll('.method-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.method === method) {
                option.classList.add('selected');
            }
        });
    }

    updatePaymentSummary(modal, tierId, period) {
        const tierInfo = this.getTierInfo(tierId);
        const price = this.getPriceForPeriod(tierId, period);
        const container = modal.querySelector('#paymentSummary');

        if (!container) return;

        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        const expiryDate = this.calculateExpiryDateForPeriod(period);

        container.innerHTML = `
            <h4>Payment Summary</h4>
            <div class="summary-details">
                <div class="summary-row">
                    <span>New Tier:</span>
                    <span>${tierInfo.name}</span>
                </div>
                <div class="summary-row">
                    <span>Payment Period:</span>
                    <span>${period.charAt(0).toUpperCase() + period.slice(1)}</span>
                </div>
                <div class="summary-row">
                    <span>Amount:</span>
                    <span class="amount">${this.formatCurrency(price)}</span>
                </div>
                <div class="summary-row">
                    <span>Start Date:</span>
                    <span>${this.formatDate(startDate)}</span>
                </div>
                <div class="summary-row">
                    <span>Expiry Date:</span>
                    <span>${this.formatDate(expiryDate)}</span>
                </div>
                ${this.subscription.tier !== 'none' ? `
                    <div class="summary-row">
                        <span>Prorated Credit:</span>
                        <span class="text-success">${this.formatCurrency(this.calculateProratedCredit())}</span>
                    </div>
                    <div class="summary-row total-row">
                        <span>Total to Pay:</span>
                        <span class="total-amount">
                            ${this.formatCurrency(Math.max(0, price - this.calculateProratedCredit()))}
                        </span>
                    </div>
                ` : `
                    <div class="summary-row total-row">
                        <span>Total to Pay:</span>
                        <span class="total-amount">${this.formatCurrency(price)}</span>
                    </div>
                `}
            </div>
        `;
    }

    getPriceForPeriod(tierId, period) {
        const prices = {
            'basic': { monthly: 50, 'bi-annual': 250, annual: 500 },
            'premium': { monthly: 250, 'bi-annual': 1500, annual: 2500 },
            'super': { monthly: 1000, 'bi-annual': 5000, annual: 8500 },
            'lender-of-lenders': { monthly: 500, 'bi-annual': 3500, annual: 6500 }
        };
        
        return prices[tierId]?.[period] || prices[tierId]?.monthly || 0;
    }

    calculateExpiryDateForPeriod(period) {
        const today = new Date();
        let expiry = new Date(today);
        
        switch (period) {
            case 'monthly':
                expiry.setMonth(today.getMonth() + 1);
                break;
            case 'bi-annual':
                expiry.setMonth(today.getMonth() + 6);
                break;
            case 'annual':
                expiry.setFullYear(today.getFullYear() + 1);
                break;
        }
        
        // Set to 28th of the month
        expiry.setDate(28);
        return expiry.toISOString().split('T')[0];
    }

    calculateProratedCredit() {
        if (this.subscription.tier === 'none') return 0;
        
        const today = new Date();
        const expiry = new Date(this.subscription.expiryDate);
        const daysRemaining = Math.max(0, Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)));
        const totalDays = Math.ceil((expiry - new Date(this.subscription.startDate)) / (1000 * 60 * 60 * 24));
        
        if (totalDays === 0) return 0;
        
        const dailyRate = this.subscription.amount / totalDays;
        return Math.round(dailyRate * daysRemaining);
    }

    processUpgrade(modal) {
        const selectedTier = modal.querySelector('.tier-option.selected')?.dataset.tier;
        const selectedPeriod = modal.querySelector('.period-option.selected')?.dataset.period;
        const selectedMethod = modal.querySelector('.method-option.selected')?.dataset.method;
        
        if (!selectedTier || !selectedPeriod || !selectedMethod) {
            window.showToast('Please select tier, period and payment method', 'error');
            return;
        }

        // Calculate new subscription details
        const newSubscription = {
            ...this.subscription,
            tier: selectedTier,
            period: selectedPeriod,
            amount: this.getPriceForPeriod(selectedTier, selectedPeriod),
            maxLoanAmount: this.getTierInfo(selectedTier).weeklyLimit || this.getTierInfo(selectedTier).monthlyLimit,
            startDate: new Date().toISOString().split('T')[0],
            expiryDate: this.calculateExpiryDateForPeriod(selectedPeriod),
            paymentMethod: selectedMethod,
            status: 'active',
            autoRenew: true,
            features: this.getTierInfo(selectedTier).features
        };

        // Record payment
        const payment = {
            id: 'pay-' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            amount: newSubscription.amount,
            currency: newSubscription.currency,
            tier: selectedTier,
            period: selectedPeriod,
            status: 'pending',
            method: selectedMethod,
            type: 'subscription',
            invoiceNumber: 'INV-' + Date.now()
        };

        // Show payment processing modal
        this.showPaymentProcessingModal(newSubscription, payment, modal);
    }

    showPaymentProcessingModal(subscription, payment, previousModal) {
        this.closeModal(previousModal);
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">Complete Payment</h3>
                </div>
                <div class="modal-body">
                    <div class="payment-processing">
                        <div class="processing-icon">💳</div>
                        <h4>Complete Your Payment</h4>
                        <p>Amount: <strong>${this.formatCurrency(payment.amount)}</strong></p>
                        <p>Tier: <strong>${this.getTierInfo(subscription.tier).name}</strong></p>
                        <p>Period: <strong>${subscription.period}</strong></p>
                        
                        <div class="payment-instructions" id="paymentInstructions">
                            <!-- Dynamic instructions based on payment method -->
                        </div>
                        
                        <div class="transaction-input" style="margin-top: 2rem;">
                            <label for="transactionCode">Transaction Code *</label>
                            <input type="text" id="transactionCode" class="form-control" 
                                   placeholder="Enter transaction code from payment">
                            <div class="form-help">
                                Required to verify your payment
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="confirmPaymentBtn">
                        Confirm Payment
                    </button>
                    <button class="btn btn-outline" id="cancelPaymentBtn">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Show payment method specific instructions
        this.showPaymentInstructions(modal, subscription.paymentMethod, payment.amount);

        // Confirm payment
        modal.querySelector('#confirmPaymentBtn').addEventListener('click', () => {
            const transactionCode = modal.querySelector('#transactionCode').value;
            if (!transactionCode) {
                window.showToast('Please enter transaction code', 'error');
                return;
            }

            payment.transactionId = transactionCode;
            payment.status = 'completed';
            
            this.completeSubscriptionUpgrade(subscription, payment, modal);
        });

        // Cancel payment
        modal.querySelector('#cancelPaymentBtn').addEventListener('click', () => {
            this.closeModal(modal);
            window.showToast('Payment cancelled', 'info');
        });
    }

    showPaymentInstructions(modal, method, amount) {
        const container = modal.querySelector('#paymentInstructions');
        if (!container) return;

        const instructions = {
            'mpesa': `
                <div class="method-instructions mpesa-instructions">
                    <h5>M-Pesa Payment Instructions:</h5>
                    <ol>
                        <li>Go to M-Pesa on your phone</li>
                        <li>Select <strong>Lipa na M-Pesa</strong></li>
                        <li>Select <strong>Pay Bill</strong></li>
                        <li>Enter Business Number: <strong>888888</strong></li>
                        <li>Enter Account Number: <strong>M-PESEWA</strong></li>
                        <li>Enter Amount: <strong>${amount}</strong></li>
                        <li>Enter your M-Pesa PIN</li>
                        <li>Submit and wait for confirmation</li>
                    </ol>
                </div>
            `,
            'bank': `
                <div class="method-instructions bank-instructions">
                    <h5>Bank Transfer Instructions:</h5>
                    <ol>
                        <li>Transfer <strong>${amount}</strong> to:</li>
                        <li>Bank: <strong>Equity Bank</strong></li>
                        <li>Account Name: <strong>M-PESEWA LTD</strong></li>
                        <li>Account Number: <strong>1234567890</strong></li>
                        <li>Branch: <strong>Nairobi Main</strong></li>
                        <li>Reference: <strong>M-PESEWA-SUB</strong></li>
                    </ol>
                </div>
            `,
            'card': `
                <div class="method-instructions card-instructions">
                    <h5>Card Payment:</h5>
                    <p>Card payments are processed securely via our payment partner.</p>
                    <div class="card-logos">
                        <span>Visa</span>
                        <span>MasterCard</span>
                        <span>American Express</span>
                    </div>
                </div>
            `,
            'mobile_money': `
                <div class="method-instructions mobile-money-instructions">
                    <h5>Mobile Money Instructions:</h5>
                    <p>Use your mobile money provider (Airtel Money, Tigo Pesa, etc.) to send <strong>${amount}</strong> to:</p>
                    <p>Provider: <strong>Various</strong></p>
                    <p>Number: <strong>+254 700 000 000</strong></p>
                    <p>Reference: <strong>M-PESEWA</strong></p>
                </div>
            `
        };

        container.innerHTML = instructions[method] || instructions.mpesa;
    }

    completeSubscriptionUpgrade(subscription, payment, modal) {
        // Update subscription
        this.subscription = subscription;
        localStorage.setItem('m-pesewa-subscription', JSON.stringify(subscription));

        // Update user data
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
        userData.subscription = subscription.tier;
        userData.subscriptionExpiry = subscription.expiryDate;
        localStorage.setItem('m-pesewa-user', JSON.stringify(userData));

        // Add to payment history
        this.paymentHistory.unshift(payment);
        const allPayments = JSON.parse(localStorage.getItem('m-pesewa-payments') || '[]');
        allPayments.push(payment);
        localStorage.setItem('m-pesewa-payments', JSON.stringify(allPayments));

        // Add to subscription history
        const historyItem = {
            date: new Date().toISOString().split('T')[0],
            fromTier: this.currentLender.subscription,
            toTier: subscription.tier,
            amount: payment.amount,
            period: subscription.period
        };
        this.subscriptionHistory.unshift(historyItem);
        const allHistory = JSON.parse(localStorage.getItem('m-pesewa-subscription-history') || '[]');
        allHistory.push(historyItem);
        localStorage.setItem('m-pesewa-subscription-history', JSON.stringify(allHistory));

        this.closeModal(modal);
        window.showToast('Subscription upgraded successfully!', 'success');

        // Update UI
        setTimeout(() => {
            this.renderSubscriptionInfo();
            this.renderPaymentHistory();
        }, 500);
    }

    renewSubscription() {
        const currentTier = this.subscription.tier;
        const currentPeriod = this.subscription.period;
        const amount = this.getPriceForPeriod(currentTier, currentPeriod);

        const confirmed = confirm(
            `Renew your ${currentTier} subscription?\n\n` +
            `Amount: ${this.formatCurrency(amount)}\n` +
            `Period: ${currentPeriod}\n` +
            `New expiry date: ${this.formatDate(this.calculateExpiryDateForPeriod(currentPeriod))}`
        );

        if (!confirmed) return;

        // Process renewal payment
        const payment = {
            id: 'pay-' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            amount: amount,
            currency: this.subscription.currency,
            tier: currentTier,
            period: currentPeriod,
            status: 'completed',
            method: this.subscription.paymentMethod,
            type: 'subscription',
            transactionId: 'RENEW-' + Date.now(),
            invoiceNumber: 'INV-RENEW-' + Date.now()
        };

        // Update subscription
        this.subscription.expiryDate = this.calculateExpiryDateForPeriod(currentPeriod);
        this.subscription.nextPaymentDate = this.subscription.expiryDate;
        this.subscription.status = 'active';

        // Save updates
        localStorage.setItem('m-pesewa-subscription', JSON.stringify(this.subscription));
        
        // Update payment history
        this.paymentHistory.unshift(payment);
        const allPayments = JSON.parse(localStorage.getItem('m-pesewa-payments') || '[]');
        allPayments.push(payment);
        localStorage.setItem('m-pesewa-payments', JSON.stringify(allPayments));

        window.showToast('Subscription renewed successfully!', 'success');

        // Update UI
        setTimeout(() => {
            this.renderSubscriptionInfo();
            this.renderPaymentHistory();
        }, 500);
    }

    cancelSubscription() {
        const confirmed = confirm(
            `Cancel your ${this.subscription.tier} subscription?\n\n` +
            `Your subscription will remain active until ${this.formatDate(this.subscription.expiryDate)}.\n` +
            `You will not be charged again, but you cannot lend after expiry.\n\n` +
            `Note: Prorated refunds are not available for cancelled subscriptions.`
        );

        if (!confirmed) return;

        this.subscription.autoRenew = false;
        this.subscription.status = 'cancelled';
        
        localStorage.setItem('m-pesewa-subscription', JSON.stringify(this.subscription));
        
        window.showToast('Subscription cancelled successfully', 'info');
        
        setTimeout(() => {
            this.renderSubscriptionInfo();
        }, 500);
    }

    changePaymentMethod() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">Change Payment Method</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="current-method">
                        <h5>Current Method:</h5>
                        <div class="method-display">
                            ${this.getPaymentMethodIcon(this.subscription.paymentMethod)}
                            <span>${this.getPaymentMethodName(this.subscription.paymentMethod)}</span>
                        </div>
                    </div>
                    
                    <div class="new-method-selection">
                        <h5>Select New Method:</h5>
                        <div class="method-options">
                            ${this.createPaymentMethodOptions()}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="savePaymentMethodBtn">
                        Save Changes
                    </button>
                    <button class="btn btn-outline close-modal">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Update method selection
        modal.querySelectorAll('.method-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const selectedMethod = e.currentTarget.dataset.method;
                modal.querySelectorAll('.method-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.currentTarget.classList.add('selected');
            });
        });

        // Save changes
        modal.querySelector('#savePaymentMethodBtn').addEventListener('click', () => {
            const selectedOption = modal.querySelector('.method-option.selected');
            if (!selectedOption) {
                window.showToast('Please select a payment method', 'error');
                return;
            }

            const newMethod = selectedOption.dataset.method;
            this.subscription.paymentMethod = newMethod;
            
            localStorage.setItem('m-pesewa-subscription', JSON.stringify(this.subscription));
            
            this.closeModal(modal);
            window.showToast('Payment method updated successfully!', 'success');
            
            setTimeout(() => {
                this.renderSubscriptionInfo();
            }, 500);
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    makePayment() {
        const amount = this.subscription.amount;
        const method = this.subscription.paymentMethod;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">Make Payment</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="payment-details">
                        <div class="payment-amount">
                            <h4>${this.formatCurrency(amount)}</h4>
                            <p>Subscription payment for ${this.getTierInfo(this.subscription.tier).name} tier</p>
                        </div>
                        
                        <div class="payment-instructions" id="paymentInstructions">
                            <!-- Instructions will be inserted here -->
                        </div>
                        
                        <div class="transaction-input">
                            <label for="paymentTransactionCode">Transaction Code *</label>
                            <input type="text" id="paymentTransactionCode" class="form-control" 
                                   placeholder="Enter transaction code">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="submitPaymentBtn">
                        Submit Payment
                    </button>
                    <button class="btn btn-outline close-modal">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Show payment instructions
        this.showPaymentInstructions(modal, method, amount);

        // Submit payment
        modal.querySelector('#submitPaymentBtn').addEventListener('click', () => {
            const transactionCode = modal.querySelector('#paymentTransactionCode').value;
            if (!transactionCode) {
                window.showToast('Please enter transaction code', 'error');
                return;
            }

            // Record payment
            const payment = {
                id: 'pay-' + Date.now(),
                date: new Date().toISOString().split('T')[0],
                amount: amount,
                currency: this.subscription.currency,
                tier: this.subscription.tier,
                period: this.subscription.period,
                status: 'completed',
                method: method,
                type: 'subscription',
                transactionId: transactionCode,
                invoiceNumber: 'INV-' + Date.now()
            };

            // Update subscription expiry
            this.subscription.expiryDate = this.calculateExpiryDateForPeriod(this.subscription.period);
            this.subscription.nextPaymentDate = this.subscription.expiryDate;
            this.subscription.status = 'active';

            // Save updates
            localStorage.setItem('m-pesewa-subscription', JSON.stringify(this.subscription));
            
            // Update payment history
            this.paymentHistory.unshift(payment);
            const allPayments = JSON.parse(localStorage.getItem('m-pesewa-payments') || '[]');
            allPayments.push(payment);
            localStorage.setItem('m-pesewa-payments', JSON.stringify(allPayments));

            this.closeModal(modal);
            window.showToast('Payment submitted successfully!', 'success');
            
            setTimeout(() => {
                this.renderSubscriptionInfo();
                this.renderPaymentHistory();
            }, 500);
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    toggleAutoRenew(enabled) {
        this.subscription.autoRenew = enabled;
        localStorage.setItem('m-pesewa-subscription', JSON.stringify(this.subscription));
        
        window.showToast(
            `Auto-renew ${enabled ? 'enabled' : 'disabled'}`,
            enabled ? 'success' : 'info'
        );
    }

    downloadInvoice(paymentId) {
        const payment = this.paymentHistory.find(p => p.id === paymentId);
        if (!payment) {
            window.showToast('Payment not found', 'error');
            return;
        }

        // Create invoice content
        const invoiceContent = `
            M-PESEWA INVOICE
            =================
            
            Invoice Number: ${payment.invoiceNumber || 'N/A'}
            Date: ${this.formatDate(payment.date)}
            
            BILL TO:
            ${this.currentLender.name}
            ${this.currentLender.phone ? 'Phone: ' + this.currentLender.phone : ''}
            ${this.currentLender.email ? 'Email: ' + this.currentLender.email : ''}
            
            SUBSCRIPTION DETAILS:
            Tier: ${payment.tier}
            Period: ${payment.period}
            Amount: ${this.formatCurrency(payment.amount)}
            Payment Method: ${this.getPaymentMethodName(payment.method)}
            Transaction ID: ${payment.transactionId || 'N/A'}
            Status: ${payment.status}
            
            Thank you for your subscription!
            
            M-PESEWA
            Emergency Micro-Lending in Trusted Circles
            support@m-pesewa.com
        `;

        // Create download
        const blob = new Blob([invoiceContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${payment.invoiceNumber || payment.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        window.showToast('Invoice downloaded', 'success');
    }

    showTierDetails(tier) {
        const tierInfo = this.getTierInfo(tier);
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title">${tierInfo.name} Details</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="tier-details">
                        <div class="tier-overview">
                            <h4>Overview</h4>
                            <p>${tierInfo.description || 'Premium lending tier with enhanced features.'}</p>
                        </div>
                        
                        <div class="tier-limits">
                            <h4>Lending Limits</h4>
                            <ul>
                                <li>Maximum per loan: ${this.formatCurrency(tierInfo.weeklyLimit || tierInfo.monthlyLimit)}</li>
                                <li>Maximum active loans: ${tierInfo.maxLoans || 'Unlimited'}</li>
                                <li>Maximum borrowers: ${tierInfo.maxBorrowers || 'Unlimited'}</li>
                            </ul>
                        </div>
                        
                        <div class="tier-features-detailed">
                            <h4>Features</h4>
                            <ul>
                                ${tierInfo.features.map(feature => `
                                    <li>✓ ${feature}</li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div class="tier-requirements">
                            <h4>Requirements</h4>
                            <ul>
                                ${tierInfo.requirements ? tierInfo.requirements.map(req => `
                                    <li>• ${req}</li>
                                `).join('') : `
                                    <li>• Valid government ID</li>
                                    <li>• Active phone number</li>
                                    <li>• Bank account or mobile money</li>
                                `}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    ${tier !== this.subscription.tier ? `
                        <button class="btn btn-primary upgrade-to-tier-btn" data-tier="${tier}">
                            Upgrade to ${tierInfo.name}
                        </button>
                    ` : ''}
                    <button class="btn btn-outline close-modal">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Upgrade button
        const upgradeBtn = modal.querySelector('.upgrade-to-tier-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                this.closeModal(modal);
                this.showUpgradeModal(tier);
            });
        }

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    getTierInfo(tier) {
        const tiers = {
            'basic': {
                name: 'Basic Tier',
                weeklyLimit: 1500,
                monthlyLimit: 1500,
                description: 'Perfect for occasional lenders who want to help friends and family with small emergency loans.',
                features: [
                    'No CRB check required',
                    'Basic borrower verification',
                    'Max ₵1,500 per loan',
                    'Access to all groups',
                    'Basic email support',
                    'Manual ledger management'
                ],
                requirements: ['Government ID', 'Phone number']
            },
            'premium': {
                name: 'Premium Tier',
                weeklyLimit: 5000,
                monthlyLimit: 5000,
                description: 'For regular lenders who want higher limits and better tools to manage their lending activities.',
                features: [
                    'No CRB check required',
                    'Enhanced borrower verification',
                    'Max ₵5,000 per loan',
                    'Priority support',
                    'Advanced analytics',
                    'Custom lending categories',
                    'Bulk borrower management',
                    'Email and phone support'
                ],
                requirements: ['Government ID', 'Phone number', 'Proof of income']
            },
            'super': {
                name: 'Super Tier',
                weeklyLimit: 20000,
                monthlyLimit: 20000,
                description: 'For professional lenders and small businesses who need the highest limits and premium features.',
                features: [
                    'CRB check required',
                    'Full borrower verification',
                    'Max ₵20,000 per loan',
                    '24/7 priority support',
                    'Advanced risk assessment',
                    'Dedicated account manager',
                    'Bulk lending tools',
                    'Custom reporting',
                    'API access (optional)',
                    'Whitelabel options'
                ],
                requirements: ['Government ID', 'Phone number', 'Proof of income', 'Business registration (if applicable)']
            },
            'lender-of-lenders': {
                name: 'Lender of Lenders',
                weeklyLimit: 0,
                monthlyLimit: 50000,
                description: 'Exclusive tier for lenders who want to finance other lenders. Create your own lending network.',
                features: [
                    'Lend to other lenders',
                    'Set your own interest rates',
                    'Max ₵50,000 per lender',
                    'Minimum 1 month repayment',
                    'Exclusive lender network',
                    'Advanced portfolio management',
                    'Custom agreements',
                    'Dedicated relationship manager',
                    'Priority debt collection',
                    'Market insights and analytics'
                ],
                requirements: [
                    'Government ID',
                    'Phone number',
                    'Proof of significant income',
                    'Business registration',
                    'Minimum 1 year lending history',
                    'Reference from existing lender'
                ]
            }
        };
        
        return tiers[tier] || tiers.basic;
    }

    getPaymentMethodName(method) {
        const methods = {
            'mpesa': 'M-Pesa',
            'bank': 'Bank Transfer',
            'card': 'Credit/Debit Card',
            'mobile_money': 'Mobile Money',
            'cash': 'Cash'
        };
        return methods[method] || method;
    }

    getPaymentMethodIcon(method) {
        const icons = {
            'mpesa': '📱',
            'bank': '🏦',
            'card': '💳',
            'mobile_money': '💰',
            'cash': '💵'
        };
        return icons[method] || '💳';
    }

    formatCurrency(amount) {
        const currency = this.subscription?.currency || 'KSh';
        return `${currency} ${amount.toLocaleString()}`;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getDaysRemaining(dateString) {
        const today = new Date();
        const targetDate = new Date(dateString);
        const diffTime = targetDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    closeModal(modal) {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    }
}

// Initialize subscription manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.subscriptions-page') || 
        document.querySelector('#subscriptions-section') ||
        window.location.pathname.includes('subscriptions')) {
        window.subscriptionManager = new SubscriptionManager();
    }
});