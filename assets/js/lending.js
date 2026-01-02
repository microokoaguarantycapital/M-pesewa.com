// Lending Module
'use strict';

class LendingManager {
    constructor() {
        this.currentLender = null;
        this.ledgers = [];
        this.borrowers = [];
        this.init();
    }

    init() {
        this.loadLenderData();
        this.loadLedgers();
        this.loadBorrowers();
        this.setupEventListeners();
        this.renderDashboard();
        this.updateStats();
    }

    loadLenderData() {
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
        this.currentLender = {
            id: userData.id,
            name: userData.fullName || userData.brandName || 'Anonymous Lender',
            subscriptionTier: userData.subscriptionTier || 'basic',
            subscriptionExpiry: userData.subscriptionExpiry,
            categories: userData.categories || [],
            location: userData.location,
            country: userData.country
        };
    }

    async loadLedgers() {
        try {
            const storedLedgers = localStorage.getItem('m-pesewa-ledgers');
            if (storedLedgers) {
                this.ledgers = JSON.parse(storedLedgers);
            } else {
                const response = await fetch('../data/demo-ledgers.json');
                const data = await response.json();
                // Filter ledgers for current lender
                this.ledgers = data.filter(ledger => 
                    ledger.lenderId === this.currentLender.id
                );
                localStorage.setItem('m-pesewa-ledgers', JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error loading ledgers:', error);
            this.ledgers = this.getDefaultLedgers();
        }
    }

    getDefaultLedgers() {
        return [
            {
                id: 'ledger-1',
                lenderId: this.currentLender.id,
                borrowerId: 'borrower-1',
                borrowerName: 'John Kamau',
                amount: 1500,
                dateBorrowed: '2024-01-15',
                dueDate: '2024-01-22',
                category: 'transport',
                interest: 150,
                penalty: 0,
                status: 'active',
                repaid: 500,
                remaining: 1150,
                daysOverdue: 0,
                guarantor1: 'Mary Wanjiku',
                guarantor1Phone: '+254712345678',
                guarantor2: 'Peter Mwangi',
                guarantor2Phone: '+254723456789',
                borrowerPhone: '+254734567890',
                borrowerLocation: 'Nairobi',
                notes: 'For transport to work'
            },
            {
                id: 'ledger-2',
                lenderId: this.currentLender.id,
                borrowerId: 'borrower-2',
                borrowerName: 'Sarah Achieng',
                amount: 3000,
                dateBorrowed: '2024-01-10',
                dueDate: '2024-01-17',
                category: 'food',
                interest: 300,
                penalty: 75,
                status: 'overdue',
                repaid: 1500,
                remaining: 1875,
                daysOverdue: 5,
                guarantor1: 'James Odhiambo',
                guarantor1Phone: '+254745678901',
                guarantor2: 'Grace Atieno',
                guarantor2Phone: '+254756789012',
                borrowerPhone: '+254767890123',
                borrowerLocation: 'Kisumu',
                notes: 'Emergency food supplies'
            }
        ];
    }

    async loadBorrowers() {
        try {
            const response = await fetch('../data/demo-users.json');
            const data = await response.json();
            this.borrowers = data.filter(user => user.role === 'borrower');
        } catch (error) {
            console.error('Error loading borrowers:', error);
            this.borrowers = [];
        }
    }

    setupEventListeners() {
        // New ledger form
        const newLedgerForm = document.getElementById('newLedgerForm');
        if (newLedgerForm) {
            newLedgerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewLedger();
            });
        }

        // Repayment form
        const repaymentForm = document.getElementById('repaymentForm');
        if (repaymentForm) {
            repaymentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRepayment();
            });
        }

        // Filter ledgers
        const filterSelect = document.getElementById('ledgerFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterLedgers(e.target.value);
            });
        }

        // Search ledgers
        const searchInput = document.getElementById('ledgerSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchLedgers(e.target.value);
            });
        }

        // Blacklist borrower
        document.addEventListener('click', (e) => {
            if (e.target.closest('.blacklist-btn')) {
                const ledgerId = e.target.closest('.blacklist-btn').dataset.ledgerId;
                this.handleBlacklist(ledgerId);
            }
        });

        // Rate borrower
        document.addEventListener('click', (e) => {
            if (e.target.closest('.rate-btn')) {
                const ledgerId = e.target.closest('.rate-btn').dataset.ledgerId;
                this.showRatingModal(ledgerId);
            }
        });

        // View ledger details
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-ledger-btn')) {
                const ledgerId = e.target.closest('.view-ledger-btn').dataset.ledgerId;
                this.showLedgerDetails(ledgerId);
            }
        });
    }

    renderDashboard() {
        this.renderLedgerTable();
        this.renderQuickStats();
        this.renderSubscriptionInfo();
    }

    renderLedgerTable() {
        const container = document.getElementById('ledgersContainer');
        if (!container) return;

        if (this.ledgers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3 class="empty-state-title">No Ledgers Yet</h3>
                    <p class="empty-state-description">
                        Start by creating your first ledger for a borrower.
                        Track loans, repayments, and interest easily.
                    </p>
                    <button class="btn btn-primary" data-toggle="modal" data-target="#newLedgerModal">
                        Create First Ledger
                    </button>
                </div>
            `;
            return;
        }

        const table = document.createElement('table');
        table.className = 'data-table ledger-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Borrower</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Remaining</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${this.ledgers.map(ledger => `
                    <tr>
                        <td>
                            <div class="table-avatar">
                                <div class="table-avatar-img">${ledger.borrowerName.charAt(0)}</div>
                                <div class="table-avatar-info">
                                    <div class="table-avatar-name">${ledger.borrowerName}</div>
                                    <div class="table-avatar-email">${this.getCategoryName(ledger.category)}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="ledger-amount">${this.formatCurrency(ledger.amount)}</div>
                            <div class="ledger-date">${this.formatDate(ledger.dateBorrowed)}</div>
                        </td>
                        <td>
                            <div>${this.formatDate(ledger.dueDate)}</div>
                            ${ledger.daysOverdue > 0 ? 
                                `<div class="ledger-overdue">${ledger.daysOverdue} days overdue</div>` : 
                                `<div class="ledger-days-left">${this.getDaysRemaining(ledger.dueDate)} days left</div>`
                            }
                        </td>
                        <td>
                            <div class="ledger-amount">${this.formatCurrency(ledger.remaining)}</div>
                            <div class="ledger-breakdown">
                                <span class="ledger-interest">+${this.formatCurrency(ledger.interest)}</span>
                                ${ledger.penalty > 0 ? 
                                    `<span class="ledger-penalty">+${this.formatCurrency(ledger.penalty)}</span>` : 
                                    ''
                                }
                            </div>
                        </td>
                        <td>
                            <span class="table-status ledger-status-${ledger.status}">
                                ${this.getStatusLabel(ledger.status)}
                            </span>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="table-action-btn view-ledger-btn" data-ledger-id="${ledger.id}" title="View Details">
                                    👁️
                                </button>
                                ${ledger.status === 'active' ? `
                                    <button class="table-action-btn" data-toggle="modal" data-target="#repaymentModal" data-ledger-id="${ledger.id}" title="Record Repayment">
                                        💰
                                    </button>
                                ` : ''}
                                <button class="table-action-btn rate-btn" data-ledger-id="${ledger.id}" title="Rate Borrower">
                                    ⭐
                                </button>
                                ${ledger.daysOverdue > 60 ? `
                                    <button class="table-action-btn blacklist-btn" data-ledger-id="${ledger.id}" title="Blacklist">
                                        ⚫
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        container.innerHTML = '';
        container.appendChild(table);
    }

    renderQuickStats() {
        const stats = this.calculateStats();
        const container = document.getElementById('lenderStats');
        if (!container) return;

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-card-value">${this.formatCurrency(stats.totalLent)}</div>
                <div class="stat-card-label">Total Lent</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-value">${stats.activeLedgers}</div>
                <div class="stat-card-label">Active Ledgers</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-value">${this.formatCurrency(stats.totalOutstanding)}</div>
                <div class="stat-card-label">Outstanding</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-value">${this.formatCurrency(stats.totalInterest)}</div>
                <div class="stat-card-label">Interest Earned</div>
            </div>
        `;
    }

    renderSubscriptionInfo() {
        const container = document.getElementById('subscriptionInfo');
        if (!container || !this.currentLender.subscriptionExpiry) return;

        const expiry = new Date(this.currentLender.subscriptionExpiry);
        const today = new Date();
        const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        let statusClass = 'badge-success';
        let statusText = 'Active';

        if (daysRemaining <= 0) {
            statusClass = 'badge-danger';
            statusText = 'Expired';
        } else if (daysRemaining <= 7) {
            statusClass = 'badge-warning';
            statusText = 'Expiring Soon';
        }

        container.innerHTML = `
            <div class="subscription-card">
                <div class="subscription-header">
                    <h4>Subscription Status</h4>
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
                <div class="subscription-details">
                    <div class="detail-row">
                        <span class="detail-label">Tier:</span>
                        <span class="detail-value">${this.currentLender.subscriptionTier.toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Expiry:</span>
                        <span class="detail-value">${this.formatDate(this.currentLender.subscriptionExpiry)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Days Remaining:</span>
                        <span class="detail-value ${daysRemaining <= 7 ? 'text-warning' : ''}">
                            ${daysRemaining > 0 ? daysRemaining : 0}
                        </span>
                    </div>
                </div>
                ${daysRemaining <= 7 ? `
                    <div class="subscription-alert">
                        <div class="alert alert-warning">
                            <strong>Renewal Required:</strong> 
                            ${daysRemaining > 0 ? 
                                `Your subscription expires in ${daysRemaining} days` : 
                                'Your subscription has expired'
                            }
                        </div>
                        <button class="btn btn-primary btn-block" onclick="window.location.href='subscriptions.html'">
                            Renew Subscription
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    calculateStats() {
        return {
            totalLent: this.ledgers.reduce((sum, ledger) => sum + ledger.amount, 0),
            activeLedgers: this.ledgers.filter(ledger => ledger.status === 'active').length,
            totalOutstanding: this.ledgers.reduce((sum, ledger) => sum + ledger.remaining, 0),
            totalInterest: this.ledgers.reduce((sum, ledger) => sum + ledger.interest + ledger.penalty, 0),
            overdueLedgers: this.ledgers.filter(ledger => ledger.daysOverdue > 0).length,
            clearedLedgers: this.ledgers.filter(ledger => ledger.status === 'cleared').length
        };
    }

    updateStats() {
        const stats = this.calculateStats();
        
        // Update various stat displays
        const elements = {
            'totalLent': stats.totalLent,
            'activeLedgers': stats.activeLedgers,
            'totalOutstanding': stats.totalOutstanding,
            'totalInterest': stats.totalInterest,
            'overdueLedgers': stats.overdueLedgers,
            'clearedLedgers': stats.clearedLedgers
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (id.includes('Lent') || id.includes('Outstanding') || id.includes('Interest')) {
                    element.textContent = this.formatCurrency(value);
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    async handleNewLedger() {
        const form = document.getElementById('newLedgerForm');
        if (!form) return;

        const formData = new FormData(form);
        const borrowerName = formData.get('borrowerName');
        const amount = parseFloat(formData.get('amount'));
        const category = formData.get('category');

        // Validate
        if (!borrowerName || !amount || !category) {
            window.showToast('Please fill in all required fields', 'error');
            return;
        }

        // Check subscription limit
        const tierLimit = this.getTierLimit();
        if (amount > tierLimit) {
            window.showToast(`Amount exceeds your tier limit of ${this.formatCurrency(tierLimit)}`, 'error');
            return;
        }

        // Calculate dates
        const today = new Date();
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + 7);

        // Create new ledger
        const newLedger = {
            id: 'ledger-' + Date.now(),
            lenderId: this.currentLender.id,
            borrowerId: 'borrower-' + Date.now(),
            borrowerName: borrowerName,
            amount: amount,
            dateBorrowed: today.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            category: category,
            interest: amount * 0.10, // 10% interest
            penalty: 0,
            status: 'active',
            repaid: 0,
            remaining: amount * 1.10, // principal + interest
            daysOverdue: 0,
            guarantor1: formData.get('guarantor1') || '',
            guarantor1Phone: formData.get('guarantor1Phone') || '',
            guarantor2: formData.get('guarantor2') || '',
            guarantor2Phone: formData.get('guarantor2Phone') || '',
            borrowerPhone: formData.get('borrowerPhone') || '',
            borrowerLocation: formData.get('borrowerLocation') || '',
            notes: formData.get('notes') || ''
        };

        // Add to ledgers
        this.ledgers.unshift(newLedger);
        
        // Save to localStorage
        const allLedgers = JSON.parse(localStorage.getItem('m-pesewa-ledgers') || '[]');
        allLedgers.push(newLedger);
        localStorage.setItem('m-pesewa-ledgers', JSON.stringify(allLedgers));

        // Close modal and reset form
        const modal = document.getElementById('newLedgerModal');
        if (modal) {
            modal.classList.remove('active');
        }
        form.reset();

        // Show success message
        window.showToast('New ledger created successfully!', 'success');

        // Update display
        setTimeout(() => {
            this.renderDashboard();
            this.updateStats();
        }, 500);
    }

    async handleRepayment() {
        const form = document.getElementById('repaymentForm');
        if (!form) return;

        const formData = new FormData(form);
        const ledgerId = formData.get('ledgerId');
        const amount = parseFloat(formData.get('amount'));
        const date = formData.get('date');

        if (!ledgerId || !amount || !date) {
            window.showToast('Please fill in all required fields', 'error');
            return;
        }

        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) {
            window.showToast('Ledger not found', 'error');
            return;
        }

        if (amount > ledger.remaining) {
            window.showToast(`Amount exceeds remaining balance of ${this.formatCurrency(ledger.remaining)}`, 'error');
            return;
        }

        // Update ledger
        ledger.repaid += amount;
        ledger.remaining -= amount;

        // Check if fully repaid
        if (ledger.remaining <= 0) {
            ledger.status = 'cleared';
            ledger.remaining = 0;
        }

        // Update in localStorage
        const allLedgers = JSON.parse(localStorage.getItem('m-pesewa-ledgers') || '[]');
        const index = allLedgers.findIndex(l => l.id === ledgerId);
        if (index !== -1) {
            allLedgers[index] = ledger;
            localStorage.setItem('m-pesewa-ledgers', JSON.stringify(allLedgers));
        }

        // Close modal and reset form
        const modal = document.getElementById('repaymentModal');
        if (modal) {
            modal.classList.remove('active');
        }
        form.reset();

        // Show success message
        window.showToast(`Repayment of ${this.formatCurrency(amount)} recorded!`, 'success');

        // Update display
        setTimeout(() => {
            this.renderDashboard();
            this.updateStats();
        }, 500);
    }

    filterLedgers(filter) {
        let filtered = this.ledgers;

        switch (filter) {
            case 'active':
                filtered = this.ledgers.filter(l => l.status === 'active');
                break;
            case 'overdue':
                filtered = this.ledgers.filter(l => l.daysOverdue > 0);
                break;
            case 'cleared':
                filtered = this.ledgers.filter(l => l.status === 'cleared');
                break;
            case 'defaulted':
                filtered = this.ledgers.filter(l => l.daysOverdue > 60);
                break;
        }

        this.renderFilteredLedgers(filtered);
    }

    searchLedgers(query) {
        if (!query) {
            this.renderLedgerTable();
            return;
        }

        const filtered = this.ledgers.filter(ledger =>
            ledger.borrowerName.toLowerCase().includes(query.toLowerCase()) ||
            ledger.borrowerPhone.includes(query) ||
            ledger.category.toLowerCase().includes(query.toLowerCase())
        );

        this.renderFilteredLedgers(filtered);
    }

    renderFilteredLedgers(ledgers) {
        const container = document.getElementById('ledgersContainer');
        if (!container) return;

        if (ledgers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3 class="empty-state-title">No Ledgers Found</h3>
                    <p class="empty-state-description">Try adjusting your search or filter criteria.</p>
                </div>
            `;
            return;
        }

        // Similar to renderLedgerTable but with filtered data
        const table = document.createElement('table');
        table.className = 'data-table ledger-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Borrower</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Remaining</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${ledgers.map(ledger => `
                    <tr>
                        <td>${ledger.borrowerName}</td>
                        <td>${this.formatCurrency(ledger.amount)}</td>
                        <td>${this.formatDate(ledger.dueDate)}</td>
                        <td>${this.formatCurrency(ledger.remaining)}</td>
                        <td>
                            <span class="table-status ledger-status-${ledger.status}">
                                ${this.getStatusLabel(ledger.status)}
                            </span>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="table-action-btn view-ledger-btn" data-ledger-id="${ledger.id}">
                                    👁️
                                </button>
                                ${ledger.status === 'active' ? `
                                    <button class="table-action-btn" data-toggle="modal" data-target="#repaymentModal" data-ledger-id="${ledger.id}">
                                        💰
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        container.innerHTML = '';
        container.appendChild(table);
    }

    async handleBlacklist(ledgerId) {
        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return;

        const confirmed = confirm(`Blacklist ${ledger.borrowerName} for defaulting on ${this.formatCurrency(ledger.remaining)}?`);
        if (!confirmed) return;

        // Update ledger status
        ledger.status = 'defaulted';

        // Add to blacklist
        const blacklist = JSON.parse(localStorage.getItem('m-pesewa-blacklist') || '[]');
        blacklist.push({
            borrowerId: ledger.borrowerId,
            borrowerName: ledger.borrowerName,
            amount: ledger.remaining,
            ledgerId: ledger.id,
            dateDefaulted: new Date().toISOString().split('T')[0],
            lenderId: this.currentLender.id,
            country: this.currentLender.country
        });
        localStorage.setItem('m-pesewa-blacklist', JSON.stringify(blacklist));

        window.showToast(`${ledger.borrowerName} added to blacklist`, 'success');
        this.renderDashboard();
    }

    showRatingModal(ledgerId) {
        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Rate Borrower</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Rate ${ledger.borrowerName}'s repayment behavior:</p>
                    <div class="rating-input">
                        <div class="stars">
                            ${[1,2,3,4,5].map(star => `
                                <button class="star-btn" data-rating="${star}">★</button>
                            `).join('')}
                        </div>
                        <div class="rating-labels">
                            <span>Poor</span>
                            <span>Excellent</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="ratingComment">Comments (optional)</label>
                        <textarea id="ratingComment" class="form-control" rows="3" placeholder="Add any comments about the borrower..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="submitRating">Submit Rating</button>
                    <button class="btn btn-outline close-modal">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        let selectedRating = 0;

        // Star rating interaction
        modal.querySelectorAll('.star-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                selectedRating = index + 1;
                modal.querySelectorAll('.star-btn').forEach((b, i) => {
                    b.style.color = i < selectedRating ? '#FF9F1C' : '#E0E4EA';
                });
            });
        });

        // Submit rating
        modal.querySelector('#submitRating').addEventListener('click', () => {
            if (selectedRating === 0) {
                window.showToast('Please select a rating', 'error');
                return;
            }

            // Save rating
            const ratings = JSON.parse(localStorage.getItem('m-pesewa-ratings') || '[]');
            ratings.push({
                borrowerId: ledger.borrowerId,
                borrowerName: ledger.borrowerName,
                rating: selectedRating,
                comment: document.getElementById('ratingComment').value,
                date: new Date().toISOString().split('T')[0],
                lenderId: this.currentLender.id,
                ledgerId: ledger.id
            });
            localStorage.setItem('m-pesewa-ratings', JSON.stringify(ratings));

            window.showToast(`Rating submitted for ${ledger.borrowerName}`, 'success');
            this.closeModal(modal);
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    showLedgerDetails(ledgerId) {
        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3 class="modal-title">Ledger Details</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="ledger-details-grid">
                        <div class="detail-section">
                            <h4>Borrower Information</h4>
                            <div class="detail-row">
                                <span class="detail-label">Name:</span>
                                <span class="detail-value">${ledger.borrowerName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Phone:</span>
                                <span class="detail-value">${ledger.borrowerPhone}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Location:</span>
                                <span class="detail-value">${ledger.borrowerLocation}</span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Loan Details</h4>
                            <div class="detail-row">
                                <span class="detail-label">Amount:</span>
                                <span class="detail-value">${this.formatCurrency(ledger.amount)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Category:</span>
                                <span class="detail-value">${this.getCategoryName(ledger.category)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Date Borrowed:</span>
                                <span class="detail-value">${this.formatDate(ledger.dateBorrowed)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Due Date:</span>
                                <span class="detail-value">${this.formatDate(ledger.dueDate)}</span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Financial Breakdown</h4>
                            <div class="detail-row">
                                <span class="detail-label">Principal:</span>
                                <span class="detail-value">${this.formatCurrency(ledger.amount)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Interest (10%):</span>
                                <span class="detail-value">${this.formatCurrency(ledger.interest)}</span>
                            </div>
                            ${ledger.penalty > 0 ? `
                                <div class="detail-row">
                                    <span class="detail-label">Penalty:</span>
                                    <span class="detail-value">${this.formatCurrency(ledger.penalty)}</span>
                                </div>
                            ` : ''}
                            <div class="detail-row">
                                <span class="detail-label">Total Repaid:</span>
                                <span class="detail-value">${this.formatCurrency(ledger.repaid)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Remaining Balance:</span>
                                <span class="detail-value">${this.formatCurrency(ledger.remaining)}</span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Guarantors</h4>
                            ${ledger.guarantor1 ? `
                                <div class="detail-row">
                                    <span class="detail-label">Guarantor 1:</span>
                                    <span class="detail-value">${ledger.guarantor1} (${ledger.guarantor1Phone})</span>
                                </div>
                            ` : ''}
                            ${ledger.guarantor2 ? `
                                <div class="detail-row">
                                    <span class="detail-label">Guarantor 2:</span>
                                    <span class="detail-value">${ledger.guarantor2} (${ledger.guarantor2Phone})</span>
                                </div>
                            ` : ''}
                        </div>

                        ${ledger.notes ? `
                            <div class="detail-section">
                                <h4>Notes</h4>
                                <p>${ledger.notes}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    ${ledger.status === 'active' ? `
                        <button class="btn btn-primary" data-toggle="modal" data-target="#repaymentModal" data-ledger-id="${ledger.id}">
                            Record Repayment
                        </button>
                    ` : ''}
                    <button class="btn btn-outline close-modal">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    closeModal(modal) {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    }

    getTierLimit() {
        const limits = {
            basic: 1500,
            premium: 5000,
            super: 20000,
            'lender-of-lenders': 50000
        };
        return limits[this.currentLender.subscriptionTier] || 1500;
    }

    getCategoryName(categoryCode) {
        const categories = {
            transport: 'Transport',
            data: 'Data/Airtime',
            wifi: 'Wi-Fi/Internet',
            gas: 'Cooking Gas',
            food: 'Food',
            advance: 'Advance Loan',
            repairs: 'Urgent Repairs',
            water: 'Water Bill',
            fuel: 'Vehicle Fuel',
            'vehicle-repair': 'Vehicle Repair',
            medicine: 'Medicine',
            electricity: 'Electricity',
            school: 'School Fees',
            tv: 'TV Subscription'
        };
        return categories[categoryCode] || categoryCode;
    }

    getStatusLabel(status) {
        const labels = {
            active: 'Active',
            overdue: 'Overdue',
            cleared: 'Cleared',
            defaulted: 'Defaulted'
        };
        return labels[status] || status;
    }

    getDaysRemaining(dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    }

    formatCurrency(amount) {
        return `₵${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Initialize lending manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a lending page
    if (window.location.pathname.includes('lending.html') || 
        window.location.pathname.includes('lender-dashboard.html') ||
        document.getElementById('ledgersContainer')) {
        window.lendingManager = new LendingManager();
    }
});