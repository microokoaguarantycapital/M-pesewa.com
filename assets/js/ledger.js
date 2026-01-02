// Ledger Management Module
'use strict';

class LedgerManager {
    constructor() {
        this.currentLender = null;
        this.ledgers = [];
        this.filteredLedgers = [];
        this.activeFilters = {
            status: 'all',
            category: 'all',
            dateRange: 'all'
        };
        this.init();
    }

    init() {
        this.loadLenderData();
        this.loadLedgers();
        this.setupEventListeners();
        this.renderLedgerTable();
        this.renderStats();
    }

    loadLenderData() {
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
        this.currentLender = {
            id: userData.id,
            name: userData.fullName || userData.brandName || 'Anonymous Lender',
            rating: userData.rating || 5.0,
            subscription: userData.subscription || 'basic',
            subscriptionExpiry: userData.subscriptionExpiry,
            location: userData.location,
            country: userData.country,
            categories: userData.categories || []
        };
    }

    async loadLedgers() {
        try {
            const allLedgers = JSON.parse(localStorage.getItem('m-pesewa-ledgers') || '[]');
            
            // Filter ledgers for current lender
            this.ledgers = allLedgers.filter(ledger => 
                ledger.lenderId === this.currentLender.id ||
                ledger.lenderName === this.currentLender.name
            );

            // Update overdue status
            this.updateLedgerStatus();
            
            // Apply initial filters
            this.filterLedgers();
        } catch (error) {
            console.error('Error loading ledgers:', error);
            this.ledgers = this.getDefaultLedgers();
            this.filteredLedgers = [...this.ledgers];
        }
    }

    getDefaultLedgers() {
        return [
            {
                id: 'ledger-1',
                borrowerName: 'John Doe',
                borrowerPhone: '+254700000001',
                borrowerLocation: 'Nairobi, Kenya',
                amount: 2500,
                dateBorrowed: '2024-01-20',
                dueDate: '2024-01-27',
                category: 'transport',
                interest: 250,
                penalty: 0,
                status: 'active',
                repaid: 1000,
                remaining: 1750,
                daysOverdue: 0,
                guarantor1Name: 'Jane Smith',
                guarantor1Phone: '+254700000002',
                guarantor2Name: 'Robert Johnson',
                guarantor2Phone: '+254700000003',
                notes: 'Transport to work',
                rating: 4.5,
                lastPayment: '2024-01-25'
            },
            {
                id: 'ledger-2',
                borrowerName: 'Mary Wanjiku',
                borrowerPhone: '+254700000004',
                borrowerLocation: 'Kisumu, Kenya',
                amount: 5000,
                dateBorrowed: '2024-01-15',
                dueDate: '2024-01-22',
                category: 'school',
                interest: 500,
                penalty: 125,
                status: 'overdue',
                repaid: 3000,
                remaining: 2625,
                daysOverdue: 5,
                guarantor1Name: 'Peter Kamau',
                guarantor1Phone: '+254700000005',
                guarantor2Name: 'Sarah Muthoni',
                guarantor2Phone: '+254700000006',
                notes: 'School fees emergency',
                rating: 3.0,
                lastPayment: '2024-01-18'
            },
            {
                id: 'ledger-3',
                borrowerName: 'David Ochieng',
                borrowerPhone: '+254700000007',
                borrowerLocation: 'Mombasa, Kenya',
                amount: 3000,
                dateBorrowed: '2024-01-10',
                dueDate: '2024-01-17',
                category: 'medicine',
                interest: 300,
                penalty: 0,
                status: 'cleared',
                repaid: 3300,
                remaining: 0,
                daysOverdue: 0,
                guarantor1Name: 'Grace Atieno',
                guarantor1Phone: '+254700000008',
                guarantor2Name: 'James Odhiambo',
                guarantor2Phone: '+254700000009',
                notes: 'Medical emergency',
                rating: 5.0,
                lastPayment: '2024-01-16'
            }
        ];
    }

    setupEventListeners() {
        // Filter controls
        const statusFilter = document.getElementById('statusFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const dateFilter = document.getElementById('dateFilter');
        const searchInput = document.getElementById('ledgerSearch');

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.activeFilters.status = e.target.value;
                this.filterLedgers();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.activeFilters.category = e.target.value;
                this.filterLedgers();
            });
        }

        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.activeFilters.dateRange = e.target.value;
                this.filterLedgers();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchLedgers(e.target.value);
            });
        }

        // Add ledger button
        const addLedgerBtn = document.getElementById('addLedgerBtn');
        if (addLedgerBtn) {
            addLedgerBtn.addEventListener('click', () => {
                this.showAddLedgerModal();
            });
        }

        // Export button
        const exportBtn = document.getElementById('exportLedgersBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportLedgers();
            });
        }

        // Event delegation for ledger actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-ledger-btn')) {
                const ledgerId = e.target.closest('.view-ledger-btn').dataset.ledgerId;
                this.showLedgerDetails(ledgerId);
            }

            if (e.target.closest('.edit-ledger-btn')) {
                const ledgerId = e.target.closest('.edit-ledger-btn').dataset.ledgerId;
                this.editLedger(ledgerId);
            }

            if (e.target.closest('.rate-borrower-btn')) {
                const ledgerId = e.target.closest('.rate-borrower-btn').dataset.ledgerId;
                this.rateBorrower(ledgerId);
            }

            if (e.target.closest('.record-payment-btn')) {
                const ledgerId = e.target.closest('.record-payment-btn').dataset.ledgerId;
                this.recordPayment(ledgerId);
            }

            if (e.target.closest('.blacklist-btn')) {
                const ledgerId = e.target.closest('.blacklist-btn').dataset.ledgerId;
                this.blacklistBorrower(ledgerId);
            }
        });
    }

    filterLedgers() {
        let filtered = [...this.ledgers];

        // Filter by status
        if (this.activeFilters.status !== 'all') {
            filtered = filtered.filter(ledger => ledger.status === this.activeFilters.status);
        }

        // Filter by category
        if (this.activeFilters.category !== 'all') {
            filtered = filtered.filter(ledger => ledger.category === this.activeFilters.category);
        }

        // Filter by date range
        if (this.activeFilters.dateRange !== 'all') {
            const today = new Date();
            const startDate = new Date();

            switch (this.activeFilters.dateRange) {
                case 'today':
                    startDate.setDate(today.getDate() - 1);
                    break;
                case 'week':
                    startDate.setDate(today.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(today.getMonth() - 1);
                    break;
                case 'quarter':
                    startDate.setMonth(today.getMonth() - 3);
                    break;
                case 'year':
                    startDate.setFullYear(today.getFullYear() - 1);
                    break;
            }

            filtered = filtered.filter(ledger => {
                const ledgerDate = new Date(ledger.dateBorrowed);
                return ledgerDate >= startDate && ledgerDate <= today;
            });
        }

        this.filteredLedgers = filtered;
        this.renderLedgerTable();
    }

    searchLedgers(query) {
        if (!query.trim()) {
            this.filteredLedgers = [...this.ledgers];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredLedgers = this.ledgers.filter(ledger => 
                ledger.borrowerName.toLowerCase().includes(searchTerm) ||
                ledger.borrowerPhone.includes(searchTerm) ||
                ledger.category.toLowerCase().includes(searchTerm) ||
                ledger.notes?.toLowerCase().includes(searchTerm)
            );
        }
        this.renderLedgerTable();
    }

    renderLedgerTable() {
        const container = document.getElementById('ledgerTableContainer');
        if (!container) return;

        if (this.filteredLedgers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3 class="empty-state-title">No Ledgers Found</h3>
                    <p class="empty-state-description">
                        ${this.ledgers.length === 0 
                            ? 'You don\'t have any ledgers yet. Add your first ledger to start tracking loans.'
                            : 'No ledgers match your current filters. Try adjusting your filter criteria.'}
                    </p>
                    ${this.ledgers.length === 0 ? `
                        <button class="btn btn-primary" id="addFirstLedgerBtn">
                            Add First Ledger
                        </button>
                    ` : ''}
                </div>
            `;

            const addFirstBtn = document.getElementById('addFirstLedgerBtn');
            if (addFirstBtn) {
                addFirstBtn.addEventListener('click', () => this.showAddLedgerModal());
            }
            return;
        }

        const table = document.createElement('table');
        table.className = 'data-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Borrower</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Remaining</th>
                    <th>Rating</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${this.filteredLedgers.map(ledger => `
                    <tr>
                        <td>
                            <div class="borrower-info">
                                <strong>${ledger.borrowerName}</strong>
                                <div class="borrower-contact">${ledger.borrowerPhone}</div>
                            </div>
                        </td>
                        <td>
                            <span class="category-badge">${this.getCategoryName(ledger.category)}</span>
                        </td>
                        <td>${this.formatCurrency(ledger.amount)}</td>
                        <td>${this.formatDate(ledger.dateBorrowed)}</td>
                        <td>
                            <span class="${ledger.daysOverdue > 0 ? 'text-danger' : ''}">
                                ${this.formatDate(ledger.dueDate)}
                                ${ledger.daysOverdue > 0 ? `<br><small>(${ledger.daysOverdue} days overdue)</small>` : ''}
                            </span>
                        </td>
                        <td>
                            <span class="table-status table-status-${ledger.status}">
                                ${this.getStatusLabel(ledger.status)}
                            </span>
                        </td>
                        <td>${this.formatCurrency(ledger.remaining)}</td>
                        <td>
                            <div class="rating-stars">
                                ${this.renderStars(ledger.rating || 0)}
                            </div>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="table-action-btn view-ledger-btn" data-ledger-id="${ledger.id}" title="View Details">
                                    👁️
                                </button>
                                <button class="table-action-btn edit-ledger-btn" data-ledger-id="${ledger.id}" title="Edit Ledger">
                                    ✏️
                                </button>
                                <button class="table-action-btn record-payment-btn" data-ledger-id="${ledger.id}" title="Record Payment">
                                    💰
                                </button>
                                <button class="table-action-btn rate-borrower-btn" data-ledger-id="${ledger.id}" title="Rate Borrower">
                                    ⭐
                                </button>
                                ${ledger.daysOverdue > 30 ? `
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

    renderStats() {
        const stats = this.calculateStats();
        const container = document.getElementById('ledgerStats');
        if (!container) return;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-icon">📋</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${this.ledgers.length}</div>
                        <div class="stat-card-label">Total Ledgers</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-icon">💰</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${this.formatCurrency(stats.totalLent)}</div>
                        <div class="stat-card-label">Total Lent</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-icon">📈</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${this.formatCurrency(stats.totalEarned)}</div>
                        <div class="stat-card-label">Interest Earned</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-icon">⏰</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${stats.overdueCount}</div>
                        <div class="stat-card-label">Overdue</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-icon">✅</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${stats.clearedCount}</div>
                        <div class="stat-card-label">Cleared</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-icon">📊</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${stats.avgRating.toFixed(1)}</div>
                        <div class="stat-card-label">Avg. Rating</div>
                    </div>
                </div>
            </div>
        `;
    }

    calculateStats() {
        const stats = {
            totalLedgers: this.ledgers.length,
            totalLent: this.ledgers.reduce((sum, ledger) => sum + ledger.amount, 0),
            totalRepaid: this.ledgers.reduce((sum, ledger) => sum + ledger.repaid, 0),
            totalOutstanding: this.ledgers.reduce((sum, ledger) => sum + ledger.remaining, 0),
            totalInterest: this.ledgers.reduce((sum, ledger) => sum + ledger.interest + ledger.penalty, 0),
            totalEarned: this.ledgers.reduce((sum, ledger) => sum + (ledger.interest + ledger.penalty), 0),
            activeCount: this.ledgers.filter(ledger => ledger.status === 'active').length,
            overdueCount: this.ledgers.filter(ledger => ledger.status === 'overdue').length,
            clearedCount: this.ledgers.filter(ledger => ledger.status === 'cleared').length,
            avgRating: this.ledgers.reduce((sum, ledger) => sum + (ledger.rating || 0), 0) / this.ledgers.length || 0
        };

        stats.repaymentRate = stats.totalLent > 0 ? 
            ((stats.totalRepaid / (stats.totalLent + stats.totalInterest)) * 100).toFixed(1) : 0;

        return stats;
    }

    showAddLedgerModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3 class="modal-title">Add New Ledger</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addLedgerForm">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="borrowerName">Borrower Name *</label>
                                <input type="text" id="borrowerName" name="borrowerName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="borrowerPhone">Borrower Phone *</label>
                                <input type="tel" id="borrowerPhone" name="borrowerPhone" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="borrowerLocation">Borrower Location *</label>
                                <input type="text" id="borrowerLocation" name="borrowerLocation" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="loanCategory">Loan Category *</label>
                                <select id="loanCategory" name="loanCategory" class="form-control" required>
                                    <option value="">Select category</option>
                                    ${this.getCategoryOptions()}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="loanAmount">Loan Amount *</label>
                                <input type="number" id="loanAmount" name="loanAmount" class="form-control" min="100" required>
                            </div>
                            <div class="form-group">
                                <label for="dateBorrowed">Date Borrowed *</label>
                                <input type="date" id="dateBorrowed" name="dateBorrowed" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="dueDate">Due Date *</label>
                                <input type="date" id="dueDate" name="dueDate" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="loanNotes">Purpose/Notes</label>
                                <textarea id="loanNotes" name="loanNotes" class="form-control" rows="2"></textarea>
                            </div>
                        </div>

                        <div class="section-divider">
                            <h4>Guarantors/Referrers</h4>
                        </div>

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="guarantor1Name">Guarantor 1 Name *</label>
                                <input type="text" id="guarantor1Name" name="guarantor1Name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="guarantor1Phone">Guarantor 1 Phone *</label>
                                <input type="tel" id="guarantor1Phone" name="guarantor1Phone" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="guarantor2Name">Guarantor 2 Name *</label>
                                <input type="text" id="guarantor2Name" name="guarantor2Name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="guarantor2Phone">Guarantor 2 Phone *</label>
                                <input type="tel" id="guarantor2Phone" name="guarantor2Phone" class="form-control" required>
                            </div>
                        </div>

                        <div class="loan-summary">
                            <h5>Loan Summary</h5>
                            <div class="summary-grid">
                                <div class="summary-item">
                                    <span>Principal:</span>
                                    <span id="summaryPrincipal">₵0</span>
                                </div>
                                <div class="summary-item">
                                    <span>Interest (10%):</span>
                                    <span id="summaryInterest">₵0</span>
                                </div>
                                <div class="summary-item">
                                    <span>Total Due:</span>
                                    <span id="summaryTotal" class="total-amount">₵0</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="saveLedgerBtn">Save Ledger</button>
                    <button class="btn btn-outline close-modal">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];

        modal.querySelector('#dateBorrowed').value = today;
        modal.querySelector('#dueDate').value = nextWeekStr;

        // Update loan summary on amount change
        const amountInput = modal.querySelector('#loanAmount');
        amountInput.addEventListener('input', () => {
            this.updateLoanSummary(modal);
        });

        // Save ledger
        modal.querySelector('#saveLedgerBtn').addEventListener('click', () => {
            this.saveNewLedger(modal);
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Initial summary update
        this.updateLoanSummary(modal);
    }

    updateLoanSummary(modal) {
        const amountInput = modal.querySelector('#loanAmount');
        const amount = parseFloat(amountInput.value) || 0;
        const interest = amount * 0.10;
        const total = amount + interest;

        modal.querySelector('#summaryPrincipal').textContent = this.formatCurrency(amount);
        modal.querySelector('#summaryInterest').textContent = this.formatCurrency(interest);
        modal.querySelector('#summaryTotal').textContent = this.formatCurrency(total);
    }

    getCategoryOptions() {
        const categories = [
            { value: 'transport', label: 'Transport (Fare)' },
            { value: 'airtime', label: 'Airtime/Credit' },
            { value: 'internet', label: 'Wi-Fi/Internet' },
            { value: 'cooking', label: 'Cooking Gas' },
            { value: 'food', label: 'Food' },
            { value: 'advance', label: 'Advance Loan' },
            { value: 'credo', label: 'Credo (Repairs/Tools)' },
            { value: 'water', label: 'Water Bill' },
            { value: 'fuel', label: 'Bike/Car/Tuktuk Fuel' },
            { value: 'repair', label: 'Bike/Car/Tuktuk Repair' },
            { value: 'medicine', label: 'Medicine' },
            { value: 'electricity', label: 'Electricity Tokens' },
            { value: 'school', label: 'School Fees' },
            { value: 'tv', label: 'TV Subscription' }
        ];

        return categories.map(cat => 
            `<option value="${cat.value}">${cat.label}</option>`
        ).join('');
    }

    saveNewLedger(modal) {
        const form = modal.querySelector('#addLedgerForm');
        const formData = new FormData(form);

        const amount = parseFloat(formData.get('loanAmount'));
        const dateBorrowed = formData.get('dateBorrowed');
        const dueDate = formData.get('dueDate');

        // Validate
        if (!amount || !dateBorrowed || !dueDate) {
            window.showToast('Please fill in all required fields', 'error');
            return;
        }

        // Check subscription limits
        if (!this.checkSubscriptionLimit(amount)) {
            window.showToast('Amount exceeds your subscription limit', 'error');
            return;
        }

        // Create new ledger
        const newLedger = {
            id: 'ledger-' + Date.now(),
            lenderId: this.currentLender.id,
            lenderName: this.currentLender.name,
            borrowerName: formData.get('borrowerName'),
            borrowerPhone: formData.get('borrowerPhone'),
            borrowerLocation: formData.get('borrowerLocation'),
            amount: amount,
            dateBorrowed: dateBorrowed,
            dueDate: dueDate,
            category: formData.get('loanCategory'),
            interest: amount * 0.10,
            penalty: 0,
            status: 'active',
            repaid: 0,
            remaining: amount * 1.10,
            daysOverdue: 0,
            guarantor1Name: formData.get('guarantor1Name'),
            guarantor1Phone: formData.get('guarantor1Phone'),
            guarantor2Name: formData.get('guarantor2Name'),
            guarantor2Phone: formData.get('guarantor2Phone'),
            notes: formData.get('loanNotes'),
            rating: 0,
            lastPayment: null,
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        const allLedgers = JSON.parse(localStorage.getItem('m-pesewa-ledgers') || '[]');
        allLedgers.push(newLedger);
        localStorage.setItem('m-pesewa-ledgers', JSON.stringify(allLedgers));

        // Add to local array
        this.ledgers.push(newLedger);
        this.filteredLedgers = [...this.ledgers];

        // Show success message
        window.showToast('Ledger added successfully!', 'success');

        // Close modal
        this.closeModal(modal);

        // Update display
        setTimeout(() => {
            this.renderLedgerTable();
            this.renderStats();
        }, 500);
    }

    checkSubscriptionLimit(amount) {
        const subscriptionLimits = {
            'basic': 1500,
            'premium': 5000,
            'super': 20000,
            'lender-of-lenders': 50000
        };

        const limit = subscriptionLimits[this.currentLender.subscription] || 1500;
        return amount <= limit;
    }

    showLedgerDetails(ledgerId) {
        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
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
                            <div class="detail-row">
                                <span class="detail-label">Category:</span>
                                <span class="detail-value">${this.getCategoryName(ledger.category)}</span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Loan Information</h4>
                            <div class="detail-row">
                                <span class="detail-label">Amount:</span>
                                <span class="detail-value">${this.formatCurrency(ledger.amount)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Date Borrowed:</span>
                                <span class="detail-value">${this.formatDate(ledger.dateBorrowed)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Due Date:</span>
                                <span class="detail-value">${this.formatDate(ledger.dueDate)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Status:</span>
                                <span class="detail-value">
                                    <span class="table-status table-status-${ledger.status}">
                                        ${this.getStatusLabel(ledger.status)}
                                    </span>
                                </span>
                            </div>
                            ${ledger.daysOverdue > 0 ? `
                                <div class="detail-row">
                                    <span class="detail-label">Days Overdue:</span>
                                    <span class="detail-value text-danger">${ledger.daysOverdue}</span>
                                </div>
                            ` : ''}
                        </div>

                        <div class="detail-section">
                            <h4>Financial Details</h4>
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
                                <span class="detail-label">Remaining:</span>
                                <span class="detail-value">${this.formatCurrency(ledger.remaining)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Total Due:</span>
                                <span class="detail-value total-amount">
                                    ${this.formatCurrency(ledger.amount + ledger.interest + ledger.penalty)}
                                </span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Guarantors</h4>
                            <div class="guarantor-list">
                                <div class="guarantor-item">
                                    <strong>${ledger.guarantor1Name}</strong>
                                    <div>${ledger.guarantor1Phone}</div>
                                </div>
                                <div class="guarantor-item">
                                    <strong>${ledger.guarantor2Name}</strong>
                                    <div>${ledger.guarantor2Phone}</div>
                                </div>
                            </div>
                        </div>

                        ${ledger.notes ? `
                            <div class="detail-section">
                                <h4>Purpose/Notes</h4>
                                <p>${ledger.notes}</p>
                            </div>
                        ` : ''}

                        <div class="detail-section">
                            <h4>Borrower Rating</h4>
                            <div class="rating-display">
                                <div class="stars">${this.renderStars(ledger.rating || 0)}</div>
                                <div class="rating-value">${(ledger.rating || 0).toFixed(1)}/5.0</div>
                            </div>
                            ${ledger.lastPayment ? `
                                <div class="detail-row">
                                    <span class="detail-label">Last Payment:</span>
                                    <span class="detail-value">${this.formatDate(ledger.lastPayment)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary record-payment-btn" data-ledger-id="${ledger.id}">
                        Record Payment
                    </button>
                    <button class="btn btn-outline rate-borrower-btn" data-ledger-id="${ledger.id}">
                        Rate Borrower
                    </button>
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

        // Bind action buttons
        const recordBtn = modal.querySelector('.record-payment-btn');
        const rateBtn = modal.querySelector('.rate-borrower-btn');

        recordBtn.addEventListener('click', () => {
            this.recordPayment(ledger.id);
            closeModal();
        });

        rateBtn.addEventListener('click', () => {
            this.rateBorrower(ledger.id);
            closeModal();
        });
    }

    editLedger(ledgerId) {
        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3 class="modal-title">Edit Ledger</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editLedgerForm">
                        <input type="hidden" name="ledgerId" value="${ledger.id}">
                        
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="editBorrowerName">Borrower Name</label>
                                <input type="text" id="editBorrowerName" name="borrowerName" 
                                       class="form-control" value="${ledger.borrowerName}" required>
                            </div>
                            <div class="form-group">
                                <label for="editBorrowerPhone">Borrower Phone</label>
                                <input type="tel" id="editBorrowerPhone" name="borrowerPhone" 
                                       class="form-control" value="${ledger.borrowerPhone}" required>
                            </div>
                            <div class="form-group">
                                <label for="editAmount">Loan Amount</label>
                                <input type="number" id="editAmount" name="amount" 
                                       class="form-control" value="${ledger.amount}" min="100" required>
                            </div>
                            <div class="form-group">
                                <label for="editStatus">Status</label>
                                <select id="editStatus" name="status" class="form-control">
                                    <option value="active" ${ledger.status === 'active' ? 'selected' : ''}>Active</option>
                                    <option value="overdue" ${ledger.status === 'overdue' ? 'selected' : ''}>Overdue</option>
                                    <option value="cleared" ${ledger.status === 'cleared' ? 'selected' : ''}>Cleared</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editRepaid">Amount Repaid</label>
                                <input type="number" id="editRepaid" name="repaid" 
                                       class="form-control" value="${ledger.repaid}" min="0" max="${ledger.amount + ledger.interest + ledger.penalty}">
                            </div>
                            <div class="form-group">
                                <label for="editPenalty">Penalty Amount</label>
                                <input type="number" id="editPenalty" name="penalty" 
                                       class="form-control" value="${ledger.penalty}" min="0">
                            </div>
                            <div class="form-group full-width">
                                <label for="editNotes">Notes</label>
                                <textarea id="editNotes" name="notes" class="form-control" rows="3">${ledger.notes || ''}</textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="saveEditBtn">Save Changes</button>
                    <button class="btn btn-outline close-modal">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Save changes
        modal.querySelector('#saveEditBtn').addEventListener('click', () => {
            this.saveLedgerEdit(modal, ledger);
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    saveLedgerEdit(modal, originalLedger) {
        const form = modal.querySelector('#editLedgerForm');
        const formData = new FormData(form);

        const updatedLedger = {
            ...originalLedger,
            borrowerName: formData.get('borrowerName'),
            borrowerPhone: formData.get('borrowerPhone'),
            amount: parseFloat(formData.get('amount')),
            status: formData.get('status'),
            repaid: parseFloat(formData.get('repaid')),
            penalty: parseFloat(formData.get('penalty')),
            notes: formData.get('notes'),
            updatedAt: new Date().toISOString()
        };

        // Recalculate remaining amount
        updatedLedger.remaining = updatedLedger.amount + updatedLedger.interest + updatedLedger.penalty - updatedLedger.repaid;

        // Update in localStorage
        const allLedgers = JSON.parse(localStorage.getItem('m-pesewa-ledgers') || '[]');
        const index = allLedgers.findIndex(l => l.id === originalLedger.id);
        if (index !== -1) {
            allLedgers[index] = updatedLedger;
            localStorage.setItem('m-pesewa-ledgers', JSON.stringify(allLedgers));
        }

        // Update local array
        const localIndex = this.ledgers.findIndex(l => l.id === originalLedger.id);
        if (localIndex !== -1) {
            this.ledgers[localIndex] = updatedLedger;
        }

        window.showToast('Ledger updated successfully!', 'success');
        this.closeModal(modal);
        
        setTimeout(() => {
            this.renderLedgerTable();
            this.renderStats();
        }, 500);
    }

    recordPayment(ledgerId) {
        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">Record Payment</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="payment-summary">
                        <div class="summary-row">
                            <span>Borrower:</span>
                            <span>${ledger.borrowerName}</span>
                        </div>
                        <div class="summary-row">
                            <span>Remaining Balance:</span>
                            <span class="amount">${this.formatCurrency(ledger.remaining)}</span>
                        </div>
                    </div>
                    
                    <form id="recordPaymentForm">
                        <input type="hidden" name="ledgerId" value="${ledger.id}">
                        
                        <div class="form-group">
                            <label for="paymentAmount">Payment Amount *</label>
                            <input type="number" id="paymentAmount" name="amount" class="form-control" 
                                   min="100" max="${ledger.remaining}" required>
                            <div class="form-help">Maximum: ${this.formatCurrency(ledger.remaining)}</div>
                        </div>
                        
                        <div class="form-group">
                            <label for="paymentDate">Payment Date *</label>
                            <input type="date" id="paymentDate" name="paymentDate" class="form-control" 
                                   value="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="paymentMethod">Payment Method *</label>
                            <select id="paymentMethod" name="paymentMethod" class="form-control" required>
                                <option value="">Select method</option>
                                <option value="mpesa">M-Pesa</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="cash">Cash</option>
                                <option value="mobile_money">Mobile Money</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="transactionRef">Transaction Reference (Optional)</label>
                            <input type="text" id="transactionRef" name="transactionRef" class="form-control" 
                                   placeholder="e.g., M-Pesa transaction code">
                        </div>
                        
                        <div class="form-group">
                            <label for="paymentNotes">Notes (Optional)</label>
                            <textarea id="paymentNotes" name="notes" class="form-control" rows="2"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="savePaymentBtn">Save Payment</button>
                    <button class="btn btn-outline close-modal">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Save payment
        modal.querySelector('#savePaymentBtn').addEventListener('click', () => {
            this.savePayment(modal, ledger);
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    savePayment(modal, ledger) {
        const form = modal.querySelector('#recordPaymentForm');
        const formData = new FormData(form);

        const amount = parseFloat(formData.get('amount'));
        const paymentDate = formData.get('paymentDate');
        const method = formData.get('paymentMethod');

        if (!amount || !paymentDate || !method) {
            window.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (amount > ledger.remaining) {
            window.showToast('Amount exceeds remaining balance', 'error');
            return;
        }

        // Update ledger
        ledger.repaid += amount;
        ledger.remaining -= amount;
        ledger.lastPayment = paymentDate;

        // Check if fully repaid
        if (ledger.remaining <= 0) {
            ledger.status = 'cleared';
            ledger.remaining = 0;
        }

        // Save payment record
        const payments = JSON.parse(localStorage.getItem('m-pesewa-payments') || '[]');
        payments.push({
            id: 'payment-' + Date.now(),
            ledgerId: ledger.id,
            amount: amount,
            date: paymentDate,
            method: method,
            transactionRef: formData.get('transactionRef'),
            notes: formData.get('notes'),
            recordedBy: this.currentLender.name,
            recordedAt: new Date().toISOString()
        });
        localStorage.setItem('m-pesewa-payments', JSON.stringify(payments));

        // Update ledger in localStorage
        const allLedgers = JSON.parse(localStorage.getItem('m-pesewa-ledgers') || '[]');
        const index = allLedgers.findIndex(l => l.id === ledger.id);
        if (index !== -1) {
            allLedgers[index] = ledger;
            localStorage.setItem('m-pesewa-ledgers', JSON.stringify(allLedgers));
        }

        window.showToast(`Payment of ${this.formatCurrency(amount)} recorded!`, 'success');
        this.closeModal(modal);
        
        setTimeout(() => {
            this.renderLedgerTable();
            this.renderStats();
        }, 500);
    }

    rateBorrower(ledgerId) {
        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">Rate Borrower</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="borrower-info">
                        <h4>${ledger.borrowerName}</h4>
                        <p>Loan: ${this.formatCurrency(ledger.amount)} • ${this.getCategoryName(ledger.category)}</p>
                    </div>
                    
                    <div class="rating-section">
                        <h5>Select Rating (1-5 stars)</h5>
                        <div class="star-rating" id="starRating">
                            ${[1,2,3,4,5].map(i => `
                                <span class="star" data-value="${i}">☆</span>
                            `).join('')}
                        </div>
                        <div class="current-rating" id="currentRatingDisplay">
                            Current Rating: ${this.renderStars(ledger.rating || 0)} (${(ledger.rating || 0).toFixed(1)}/5.0)
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-top: 2rem;">
                        <label for="ratingComments">Comments (Optional)</label>
                        <textarea id="ratingComments" class="form-control" rows="3" 
                                  placeholder="Add comments about the borrower..."></textarea>
                    </div>
                    
                    <div class="rating-criteria">
                        <small>Rate based on: Timely repayments, Communication, Trustworthiness</small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="saveRatingBtn">Save Rating</button>
                    <button class="btn btn-outline close-modal">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Star rating interaction
        const stars = modal.querySelectorAll('.star');
        let selectedRating = ledger.rating || 0;

        stars.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.value);
                this.updateStarDisplay(stars, selectedRating);
            });

            star.addEventListener('mouseover', () => {
                const hoverValue = parseInt(star.dataset.value);
                this.updateStarDisplay(stars, hoverValue, true);
            });

            star.addEventListener('mouseout', () => {
                this.updateStarDisplay(stars, selectedRating);
            });
        });

        // Initial display
        this.updateStarDisplay(stars, selectedRating);

        // Save rating
        modal.querySelector('#saveRatingBtn').addEventListener('click', () => {
            this.saveBorrowerRating(modal, ledger, selectedRating);
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    updateStarDisplay(stars, rating, isHover = false) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.textContent = '★';
                star.style.color = isHover ? '#FF9F1C' : '#FF9F1C';
            } else {
                star.textContent = '☆';
                star.style.color = isHover ? '#FFD700' : '#CCCCCC';
            }
        });

        const display = document.getElementById('currentRatingDisplay');
        if (display) {
            let starsHtml = '';
            for (let i = 0; i < 5; i++) {
                starsHtml += i < rating ? '★' : '☆';
            }
            display.innerHTML = `Selected Rating: ${starsHtml} (${rating.toFixed(1)}/5.0)`;
        }
    }

    saveBorrowerRating(modal, ledger, rating) {
        const comments = modal.querySelector('#ratingComments').value;

        // Update ledger rating
        ledger.rating = rating;

        // Save rating record
        const ratings = JSON.parse(localStorage.getItem('m-pesewa-ratings') || '[]');
        ratings.push({
            id: 'rating-' + Date.now(),
            ledgerId: ledger.id,
            borrowerName: ledger.borrowerName,
            borrowerPhone: ledger.borrowerPhone,
            rating: rating,
            comments: comments,
            ratedBy: this.currentLender.name,
            ratedAt: new Date().toISOString()
        });
        localStorage.setItem('m-pesewa-ratings', JSON.stringify(ratings));

        // Update ledger in localStorage
        const allLedgers = JSON.parse(localStorage.getItem('m-pesewa-ledgers') || '[]');
        const index = allLedgers.findIndex(l => l.id === ledger.id);
        if (index !== -1) {
            allLedgers[index] = ledger;
            localStorage.setItem('m-pesewa-ledgers', JSON.stringify(allLedgers));
        }

        window.showToast(`Rating saved: ${rating} stars`, 'success');
        this.closeModal(modal);
        
        setTimeout(() => {
            this.renderLedgerTable();
            this.renderStats();
        }, 500);
    }

    blacklistBorrower(ledgerId) {
        const ledger = this.ledgers.find(l => l.id === ledgerId);
        if (!ledger) return;

        const confirmed = confirm(
            `Blacklist ${ledger.borrowerName}?\n\n` +
            `Amount: ${this.formatCurrency(ledger.remaining)}\n` +
            `Overdue: ${ledger.daysOverdue} days\n\n` +
            `This will prevent the borrower from taking new loans.`
        );

        if (!confirmed) return;

        // Add to blacklist
        const blacklist = JSON.parse(localStorage.getItem('m-pesewa-blacklist') || '[]');
        
        if (!blacklist.find(item => item.borrowerPhone === ledger.borrowerPhone)) {
            blacklist.push({
                id: 'blacklist-' + Date.now(),
                borrowerName: ledger.borrowerName,
                borrowerPhone: ledger.borrowerPhone,
                lenderName: this.currentLender.name,
                amount: ledger.remaining,
                daysOverdue: ledger.daysOverdue,
                ledgerId: ledger.id,
                reason: `Defaulted on loan (${ledger.daysOverdue} days overdue)`,
                blacklistedBy: this.currentLender.name,
                blacklistedAt: new Date().toISOString(),
                status: 'active'
            });
            localStorage.setItem('m-pesewa-blacklist', JSON.stringify(blacklist));
        }

        window.showToast(`${ledger.borrowerName} added to blacklist`, 'warning');
    }

    exportLedgers() {
        const data = this.filteredLedgers.map(ledger => ({
            'Borrower Name': ledger.borrowerName,
            'Phone': ledger.borrowerPhone,
            'Location': ledger.borrowerLocation,
            'Category': this.getCategoryName(ledger.category),
            'Amount': ledger.amount,
            'Date Borrowed': ledger.dateBorrowed,
            'Due Date': ledger.dueDate,
            'Status': this.getStatusLabel(ledger.status),
            'Amount Repaid': ledger.repaid,
            'Remaining': ledger.remaining,
            'Interest': ledger.interest,
            'Penalty': ledger.penalty,
            'Rating': ledger.rating || 'Not rated',
            'Notes': ledger.notes || ''
        }));

        // Convert to CSV
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `m-pesewa-ledgers-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        window.showToast('Ledgers exported successfully!', 'success');
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const rows = data.map(row => 
            headers.map(header => 
                `"${String(row[header] || '').replace(/"/g, '""')}"`
            ).join(',')
        );
        return [headers.join(','), ...rows].join('\n');
    }

    updateLedgerStatus() {
        const today = new Date();
        
        this.ledgers.forEach(ledger => {
            if (ledger.status !== 'cleared') {
                const dueDate = new Date(ledger.dueDate);
                const daysOverdue = Math.max(0, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)));
                
                if (daysOverdue > 0) {
                    ledger.daysOverdue = daysOverdue;
                    ledger.status = 'overdue';
                    
                    // Add penalty after 7 days overdue (5% daily)
                    if (daysOverdue > 7) {
                        const penaltyDays = daysOverdue - 7;
                        ledger.penalty = ledger.remaining * 0.05 * penaltyDays;
                        ledger.remaining = ledger.amount + ledger.interest + ledger.penalty - ledger.repaid;
                    }
                }
            }
        });
    }

    getCategoryName(category) {
        const categoryNames = {
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
        return categoryNames[category] || 'Emergency Loan';
    }

    getStatusLabel(status) {
        const statusLabels = {
            'active': 'Active',
            'overdue': 'Overdue',
            'cleared': 'Cleared',
            'defaulted': 'Defaulted'
        };
        return statusLabels[status] || 'Unknown';
    }

    formatCurrency(amount) {
        const userCountry = this.currentLender?.country || 'kenya';
        const currencies = {
            'kenya': 'KSh',
            'uganda': 'UGX',
            'tanzania': 'TZS',
            'rwanda': 'RWF',
            'burundi': 'BIF',
            'somalia': 'SOS',
            'south-sudan': 'SSP',
            'ethiopia': 'ETB',
            'congo': 'CDF',
            'nigeria': 'NGN',
            'south-africa': 'ZAR',
            'ghana': 'GHS'
        };
        const currency = currencies[userCountry] || '₵';
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

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) stars += '★';
        if (halfStar) stars += '½';
        for (let i = 0; i < emptyStars; i++) stars += '☆';
        
        return stars;
    }

    closeModal(modal) {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    }
}

// Initialize ledger manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.ledger-page') || 
        document.querySelector('#ledger-section') ||
        window.location.pathname.includes('ledger')) {
        window.ledgerManager = new LedgerManager();
    }
});