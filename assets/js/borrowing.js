// Borrowing Module
'use strict';

class BorrowingManager {
    constructor() {
        this.currentBorrower = null;
        this.activeLoans = [];
        this.loanHistory = [];
        this.availableLenders = [];
        this.init();
    }

    init() {
        this.loadBorrowerData();
        this.loadLoans();
        this.loadLenders();
        this.setupEventListeners();
        this.renderDashboard();
        this.updateStats();
    }

    loadBorrowerData() {
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
        this.currentBorrower = {
            id: userData.id,
            name: userData.fullName || 'Anonymous Borrower',
            rating: userData.rating || 5.0,
            groups: userData.groups || [],
            location: userData.location,
            country: userData.country,
            occupation: userData.occupation,
            guarantors: [
                { name: userData.guarantor1Name, phone: userData.guarantor1Phone },
                { name: userData.guarantor2Name, phone: userData.guarantor2Phone }
            ].filter(g => g.name && g.phone)
        };
    }

    async loadLoans() {
        try {
            const allLedgers = JSON.parse(localStorage.getItem('m-pesewa-ledgers') || '[]');
            
            // Filter ledgers for current borrower
            const borrowerLoans = allLedgers.filter(ledger => 
                ledger.borrowerName === this.currentBorrower.name ||
                ledger.borrowerPhone === this.currentBorrower.phone
            );

            // Separate active loans and history
            this.activeLoans = borrowerLoans.filter(loan => loan.status === 'active');
            this.loanHistory = borrowerLoans.filter(loan => loan.status !== 'active');

            // Update overdue status
            this.updateOverdueStatus();
        } catch (error) {
            console.error('Error loading loans:', error);
            this.activeLoans = this.getDefaultLoans();
            this.loanHistory = [];
        }
    }

    getDefaultLoans() {
        return [
            {
                id: 'loan-1',
                lenderName: 'Trusted Lender Co.',
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
                lenderPhone: '+254700000000',
                notes: 'Transport to work'
            },
            {
                id: 'loan-2',
                lenderName: 'Community Lender',
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
                lenderPhone: '+254711111111',
                notes: 'School fees emergency'
            }
        ];
    }

    async loadLenders() {
        try {
            const response = await fetch('../data/demo-users.json');
            const data = await response.json();
            this.availableLenders = data.filter(user => 
                user.role === 'lender' && 
                user.country === this.currentBorrower.country
            );
        } catch (error) {
            console.error('Error loading lenders:', error);
            this.availableLenders = [];
        }
    }

    setupEventListeners() {
        // Loan request form
        const requestForm = document.getElementById('loanRequestForm');
        if (requestForm) {
            requestForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLoanRequest();
            });
        }

        // Repayment form
        const repaymentForm = document.getElementById('borrowerRepaymentForm');
        if (repaymentForm) {
            repaymentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBorrowerRepayment();
            });
        }

        // Filter loans
        const filterSelect = document.getElementById('loanFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterLoans(e.target.value);
            });
        }

        // Request extension
        document.addEventListener('click', (e) => {
            if (e.target.closest('.extension-btn')) {
                const loanId = e.target.closest('.extension-btn').dataset.loanId;
                this.requestExtension(loanId);
            }
        });

        // View loan details
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-loan-btn')) {
                const loanId = e.target.closest('.view-loan-btn').dataset.loanId;
                this.showLoanDetails(loanId);
            }
        });

        // Make payment
        document.addEventListener('click', (e) => {
            if (e.target.closest('.payment-btn')) {
                const loanId = e.target.closest('.payment-btn').dataset.loanId;
                this.showPaymentModal(loanId);
            }
        });
    }

    renderDashboard() {
        this.renderActiveLoans();
        this.renderLoanHistory();
        this.renderQuickStats();
        this.renderBorrowerRating();
    }

    renderActiveLoans() {
        const container = document.getElementById('activeLoansContainer');
        if (!container) return;

        if (this.activeLoans.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💰</div>
                    <h3 class="empty-state-title">No Active Loans</h3>
                    <p class="empty-state-description">
                        You don't have any active loans. Request a new loan when you need emergency funds.
                    </p>
                    <button class="btn btn-primary" data-toggle="modal" data-target="#loanRequestModal">
                        Request New Loan
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.activeLoans.map(loan => `
            <div class="loan-card ${loan.daysOverdue > 0 ? 'overdue' : ''}">
                <div class="loan-card-header">
                    <div class="loan-icon">${this.getCategoryIcon(loan.category)}</div>
                    <div>
                        <h4 class="loan-title">${this.getCategoryName(loan.category)}</h4>
                        <div class="loan-lender">Lender: ${loan.lenderName}</div>
                    </div>
                    <div class="loan-status-badge ${loan.daysOverdue > 0 ? 'badge-danger' : 'badge-success'}">
                        ${loan.daysOverdue > 0 ? `${loan.daysOverdue} days overdue` : 'Active'}
                    </div>
                </div>
                
                <div class="loan-card-body">
                    <div class="loan-stats">
                        <div class="stat">
                            <span class="stat-label">Amount</span>
                            <span class="stat-value">${this.formatCurrency(loan.amount)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Due Date</span>
                            <span class="stat-value">${this.formatDate(loan.dueDate)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Remaining</span>
                            <span class="stat-value">${this.formatCurrency(loan.remaining)}</span>
                        </div>
                    </div>
                    
                    <div class="progress" style="margin: 1rem 0;">
                        <div class="progress-bar" style="width: ${((loan.repaid / (loan.amount + loan.interest + loan.penalty)) * 100)}%"></div>
                    </div>
                    
                    <div class="loan-meta">
                        <span>Repaid: ${this.formatCurrency(loan.repaid)}</span>
                        <span>Interest: ${this.formatCurrency(loan.interest)}</span>
                        ${loan.penalty > 0 ? `<span>Penalty: ${this.formatCurrency(loan.penalty)}</span>` : ''}
                    </div>
                </div>
                
                <div class="loan-card-footer">
                    <button class="btn btn-outline view-loan-btn" data-loan-id="${loan.id}">
                        View Details
                    </button>
                    <button class="btn btn-primary payment-btn" data-loan-id="${loan.id}">
                        Make Payment
                    </button>
                    ${loan.daysOverdue > 0 ? `
                        <button class="btn btn-outline extension-btn" data-loan-id="${loan.id}">
                            Request Extension
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderLoanHistory() {
        const container = document.getElementById('loanHistoryContainer');
        if (!container || this.loanHistory.length === 0) return;

        const table = document.createElement('table');
        table.className = 'data-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Lender</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${this.loanHistory.slice(0, 5).map(loan => `
                    <tr>
                        <td>${loan.lenderName}</td>
                        <td>${this.formatCurrency(loan.amount)}</td>
                        <td>${this.formatDate(loan.dateBorrowed)}</td>
                        <td>
                            <span class="table-status ${loan.status === 'cleared' ? 'table-status-completed' : 'table-status-inactive'}">
                                ${loan.status === 'cleared' ? 'Cleared' : 'Defaulted'}
                            </span>
                        </td>
                        <td>
                            <button class="table-action-btn view-loan-btn" data-loan-id="${loan.id}" title="View Details">
                                👁️
                            </button>
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
        const container = document.getElementById('borrowerStats');
        if (!container) return;

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-card-value">${this.activeLoans.length}</div>
                <div class="stat-card-label">Active Loans</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-value">${this.formatCurrency(stats.totalBorrowed)}</div>
                <div class="stat-card-label">Total Borrowed</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-value">${this.formatCurrency(stats.totalRepaid)}</div>
                <div class="stat-card-label">Total Repaid</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-value">${this.formatCurrency(stats.totalOutstanding)}</div>
                <div class="stat-card-label">Outstanding</div>
            </div>
        `;
    }

    renderBorrowerRating() {
        const container = document.getElementById('borrowerRating');
        if (!container) return;

        const rating = this.currentBorrower.rating;
        const stars = this.renderStars(rating);

        container.innerHTML = `
            <div class="rating-card">
                <h4>Your Rating</h4>
                <div class="rating-display">
                    <div class="stars">${stars}</div>
                    <div class="rating-value">${rating.toFixed(1)}/5.0</div>
                </div>
                <p class="rating-description">
                    ${this.getRatingDescription(rating)}
                </p>
                ${rating < 3 ? `
                    <div class="alert alert-warning">
                        <strong>Improve Your Rating:</strong> 
                        Pay loans on time to improve your rating and access more groups.
                    </div>
                ` : ''}
            </div>
        `;
    }

    calculateStats() {
        const allLoans = [...this.activeLoans, ...this.loanHistory];
        
        return {
            totalBorrowed: allLoans.reduce((sum, loan) => sum + loan.amount, 0),
            totalRepaid: allLoans.reduce((sum, loan) => sum + loan.repaid, 0),
            totalOutstanding: this.activeLoans.reduce((sum, loan) => sum + loan.remaining, 0),
            totalInterest: allLoans.reduce((sum, loan) => sum + loan.interest + loan.penalty, 0),
            overdueLoans: this.activeLoans.filter(loan => loan.daysOverdue > 0).length,
            clearedLoans: this.loanHistory.filter(loan => loan.status === 'cleared').length
        };
    }

    updateStats() {
        const stats = this.calculateStats();
        
        // Update various stat displays
        const elements = {
            'totalBorrowed': stats.totalBorrowed,
            'totalRepaid': stats.totalRepaid,
            'totalOutstanding': stats.totalOutstanding,
            'totalInterest': stats.totalInterest,
            'overdueLoans': stats.overdueLoans,
            'clearedLoans': stats.clearedLoans
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (id.includes('Borrowed') || id.includes('Repaid') || id.includes('Outstanding') || id.includes('Interest')) {
                    element.textContent = this.formatCurrency(value);
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    async handleLoanRequest() {
        const form = document.getElementById('loanRequestForm');
        if (!form) return;

        const formData = new FormData(form);
        const amount = parseFloat(formData.get('amount'));
        const category = formData.get('category');
        const lenderId = formData.get('lender');
        const purpose = formData.get('purpose');

        // Validate
        if (!amount || !category || !lenderId || !purpose) {
            window.showToast('Please fill in all required fields', 'error');
            return;
        }

        // Check if borrower has too many active loans
        if (this.activeLoans.length >= 3) {
            window.showToast('You have reached the maximum active loans limit (3)', 'error');
            return;
        }

        // Get lender details
        const lender = this.availableLenders.find(l => l.id === lenderId);
        if (!lender) {
            window.showToast('Selected lender not found', 'error');
            return;
        }

        // Calculate dates
        const today = new Date();
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + 7);

        // Create loan request
        const loanRequest = {
            id: 'loan-' + Date.now(),
            borrowerId: this.currentBorrower.id,
            borrowerName: this.currentBorrower.name,
            lenderId: lender.id,
            lenderName: lender.fullName || lender.brandName,
            amount: amount,
            category: category,
            purpose: purpose,
            dateRequested: today.toISOString().split('T')[0],
            status: 'pending',
            dueDate: dueDate.toISOString().split('T')[0],
            guarantors: this.currentBorrower.guarantors
        };

        // Save request
        const requests = JSON.parse(localStorage.getItem('m-pesewa-loan-requests') || '[]');
        requests.push(loanRequest);
        localStorage.setItem('m-pesewa-loan-requests', JSON.stringify(requests));

        // Close modal and reset form
        const modal = document.getElementById('loanRequestModal');
        if (modal) {
            modal.classList.remove('active');
        }
        form.reset();

        // Show success message
        window.showToast('Loan request submitted! Waiting for lender approval.', 'success');

        // Simulate lender approval (for demo)
        setTimeout(() => {
            this.simulateLoanApproval(loanRequest);
        }, 3000);
    }

    simulateLoanApproval(loanRequest) {
        // Update request status
        const requests = JSON.parse(localStorage.getItem('m-pesewa-loan-requests') || '[]');
        const requestIndex = requests.findIndex(r => r.id === loanRequest.id);
        if (requestIndex !== -1) {
            requests[requestIndex].status = 'approved';
            localStorage.setItem('m-pesewa-loan-requests', JSON.stringify(requests));
        }

        // Create ledger entry
        const newLoan = {
            id: 'ledger-' + Date.now(),
            lenderId: loanRequest.lenderId,
            borrowerId: loanRequest.borrowerId,
            borrowerName: loanRequest.borrowerName,
            amount: loanRequest.amount,
            dateBorrowed: new Date().toISOString().split('T')[0],
            dueDate: loanRequest.dueDate,
            category: loanRequest.category,
            interest: loanRequest.amount * 0.10,
            penalty: 0,
            status: 'active',
            repaid: 0,
            remaining: loanRequest.amount * 1.10,
            daysOverdue: 0,
            lenderName: loanRequest.lenderName,
            lenderPhone: '+254700000000', // Default for demo
            borrowerPhone: '+254711111111', // Default for demo
            borrowerLocation: this.currentBorrower.location,
            notes: loanRequest.purpose
        };

        // Add to ledgers
        const allLedgers = JSON.parse(localStorage.getItem('m-pesewa-ledgers') || '[]');
        allLedgers.push(newLoan);
        localStorage.setItem('m-pesewa-ledgers', JSON.stringify(allLedgers));

        // Add to active loans
        this.activeLoans.push(newLoan);

        // Show notification
        window.showToast(`Loan approved! ${this.formatCurrency(loanRequest.amount)} disbursed.`, 'success');

        // Update display
        setTimeout(() => {
            this.renderDashboard();
            this.updateStats();
        }, 500);
    }

    async handleBorrowerRepayment() {
        const form = document.getElementById('borrowerRepaymentForm');
        if (!form) return;

        const formData = new FormData(form);
        const loanId = formData.get('loanId');
        const amount = parseFloat(formData.get('amount'));
        const paymentMethod = formData.get('paymentMethod');
        const transactionId = formData.get('transactionId');

        if (!loanId || !amount || !paymentMethod) {
            window.showToast('Please fill in all required fields', 'error');
            return;
        }

        const loan = this.activeLoans.find(l => l.id === loanId);
        if (!loan) {
            window.showToast('Loan not found', 'error');
            return;
        }

        if (amount > loan.remaining) {
            window.showToast(`Amount exceeds remaining balance of ${this.formatCurrency(loan.remaining)}`, 'error');
            return;
        }

        // Update loan
        loan.repaid += amount;
        loan.remaining -= amount;

        // Check if fully repaid
        if (loan.remaining <= 0) {
            loan.status = 'cleared';
            loan.remaining = 0;
            
            // Move to history
            const index = this.activeLoans.findIndex(l => l.id === loanId);
            if (index !== -1) {
                this.activeLoans.splice(index, 1);
                this.loanHistory.push(loan);
            }
        }

        // Update in localStorage
        const allLedgers = JSON.parse(localStorage.getItem('m-pesewa-ledgers') || '[]');
        const ledgerIndex = allLedgers.findIndex(l => l.id === loanId);
        if (ledgerIndex !== -1) {
            allLedgers[ledgerIndex] = loan;
            localStorage.setItem('m-pesewa-ledgers', JSON.stringify(allLedgers));
        }

        // Record payment
        const payments = JSON.parse(localStorage.getItem('m-pesewa-payments') || '[]');
        payments.push({
            loanId: loanId,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            method: paymentMethod,
            transactionId: transactionId,
            borrowerId: this.currentBorrower.id
        });
        localStorage.setItem('m-pesewa-payments', JSON.stringify(payments));

        // Close modal and reset form
        const modal = document.getElementById('repaymentModal');
        if (modal) {
            modal.classList.remove('active');
        }
        form.reset();

        // Show success message
        window.showToast(`Payment of ${this.formatCurrency(amount)} recorded!`, 'success');

        // Update display
        setTimeout(() => {
            this.renderDashboard();
            this.updateStats();
        }, 500);
    }

    filterLoans(filter) {
        let filtered = this.activeLoans;

        switch (filter) {
            case 'overdue':
                filtered = this.activeLoans.filter(loan => loan.daysOverdue > 0);
                break;
            case 'due-soon':
                filtered = this.activeLoans.filter(loan => {
                    const daysRemaining = this.getDaysRemaining(loan.dueDate);
                    return daysRemaining <= 3 && daysRemaining > 0;
                });
                break;
            case 'recent':
                filtered = this.activeLoans.filter(loan => {
                    const daysSince = this.getDaysSince(loan.dateBorrowed);
                    return daysSince <= 7;
                });
                break;
        }

        this.renderFilteredLoans(filtered);
    }

    renderFilteredLoans(loans) {
        const container = document.getElementById('activeLoansContainer');
        if (!container) return;

        if (loans.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3 class="empty-state-title">No Loans Found</h3>
                    <p class="empty-state-description">Try adjusting your filter criteria.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = loans.map(loan => `
            <div class="loan-card ${loan.daysOverdue > 0 ? 'overdue' : ''}">
                <div class="loan-card-header">
                    <h4>${this.getCategoryName(loan.category)}</h4>
                    <div class="loan-status-badge ${loan.daysOverdue > 0 ? 'badge-danger' : 'badge-success'}">
                        ${loan.daysOverdue > 0 ? 'Overdue' : 'Active'}
                    </div>
                </div>
                <div class="loan-card-body">
                    <div class="loan-amount">${this.formatCurrency(loan.remaining)} remaining</div>
                    <div class="loan-due">Due: ${this.formatDate(loan.dueDate)}</div>
                </div>
                <div class="loan-card-footer">
                    <button class="btn btn-outline view-loan-btn" data-loan-id="${loan.id}">
                        View
                    </button>
                    <button class="btn btn-primary payment-btn" data-loan-id="${loan.id}">
                        Pay
                    </button>
                </div>
            </div>
        `).join('');
    }

    requestExtension(loanId) {
        const loan = this.activeLoans.find(l => l.id === loanId);
        if (!loan) return;

        const confirmed = confirm(`Request 7-day extension for loan of ${this.formatCurrency(loan.remaining)}?`);
        if (!confirmed) return;

        // Update due date
        const currentDue = new Date(loan.dueDate);
        currentDue.setDate(currentDue.getDate() + 7);
        loan.dueDate = currentDue.toISOString().split('T')[0];

        // Update in localStorage
        const allLedgers = JSON.parse(localStorage.getItem('m-pesewa-ledgers') || '[]');
        const index = allLedgers.findIndex(l => l.id === loanId);
        if (index !== -1) {
            allLedgers[index] = loan;
            localStorage.setItem('m-pesewa-ledgers', JSON.stringify(allLedgers));
        }

        window.showToast('Extension requested! Lender will review.', 'success');
        this.renderDashboard();
    }

    showPaymentModal(loanId) {
        const loan = this.activeLoans.find(l => l.id === loanId);
        if (!loan) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Make Payment</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="payment-summary">
                        <div class="summary-row">
                            <span>Loan:</span>
                            <span>${this.getCategoryName(loan.category)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Lender:</span>
                            <span>${loan.lenderName}</span>
                        </div>
                        <div class="summary-row">
                            <span>Remaining Balance:</span>
                            <span class="amount">${this.formatCurrency(loan.remaining)}</span>
                        </div>
                    </div>
                    
                    <form id="paymentForm">
                        <input type="hidden" name="loanId" value="${loan.id}">
                        
                        <div class="form-group">
                            <label for="paymentAmount">Amount to Pay *</label>
                            <input type="number" id="paymentAmount" name="amount" class="form-control" 
                                   min="100" max="${loan.remaining}" value="${Math.min(1000, loan.remaining)}" required>
                            <div class="form-help">Minimum: ${this.formatCurrency(100)}</div>
                        </div>
                        
                        <div class="form-group">
                            <label for="paymentMethod">Payment Method *</label>
                            <select id="paymentMethod" name="paymentMethod" class="form-control" required>
                                <option value="">Select method</option>
                                <option value="mpesa">M-Pesa</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="cash">Cash</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="transactionId">Transaction ID (Optional)</label>
                            <input type="text" id="transactionId" name="transactionId" class="form-control" 
                                   placeholder="e.g., M-Pesa transaction code">
                        </div>
                        
                        <div class="payment-instructions">
                            <h5>Payment Instructions:</h5>
                            <p>Send payment to lender via agreed method. Update this form after payment.</p>
                            <div class="lender-contact">
                                <strong>Lender Contact:</strong> ${loan.lenderPhone}
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="submitPayment">Submit Payment</button>
                    <button class="btn btn-outline close-modal">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Submit payment
        modal.querySelector('#submitPayment').addEventListener('click', () => {
            const form = modal.querySelector('#paymentForm');
            const formData = new FormData(form);
            
            const amount = parseFloat(formData.get('amount'));
            const paymentMethod = formData.get('paymentMethod');
            
            if (!amount || !paymentMethod) {
                window.showToast('Please fill in all required fields', 'error');
                return;
            }

            if (amount > loan.remaining) {
                window.showToast(`Amount exceeds remaining balance`, 'error');
                return;
            }

            // Process payment
            this.processPayment(loan.id, amount, paymentMethod, formData.get('transactionId'));
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

    processPayment(loanId, amount, method, transactionId) {
        const loan = this.activeLoans.find(l => l.id === loanId);
        if (!loan) return;

        // Update loan
        loan.repaid += amount;
        loan.remaining -= amount;

        // Check if fully repaid
        if (loan.remaining <= 0) {
            loan.status = 'cleared';
            loan.remaining = 0;
            
            // Move to history
            const index = this.activeLoans.findIndex(l => l.id === loanId);
            if (index !== -1) {
                this.activeLoans.splice(index, 1);
                this.loanHistory.push(loan);
            }
        }

        // Update in localStorage
        const allLedgers = JSON.parse(localStorage.getItem('m-pesewa-ledgers') || '[]');
        const ledgerIndex = allLedgers.findIndex(l => l.id === loanId);
        if (ledgerIndex !== -1) {
            allLedgers[ledgerIndex] = loan;
            localStorage.setItem('m-pesewa-ledgers', JSON.stringify(allLedgers));
        }

        // Record payment
        const payments = JSON.parse(localStorage.getItem('m-pesewa-payments') || '[]');
        payments.push({
            loanId: loanId,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            method: method,
            transactionId: transactionId,
            borrowerId: this.currentBorrower.id
        });
        localStorage.setItem('m-pesewa-payments', JSON.stringify(payments));

        window.showToast(`Payment of ${this.formatCurrency(amount)} recorded!`, 'success');
        this.renderDashboard();
        this.updateStats();
    }

    showLoanDetails(loanId) {
        const loan = [...this.activeLoans, ...this.loanHistory].find(l => l.id === loanId);
        if (!loan) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title">Loan Details</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="loan-details-grid">
                        <div class="detail-section">
                            <h4>Loan Information</h4>
                            <div class="detail-row">
                                <span class="detail-label">Category:</span>
                                <span class="detail-value">${this.getCategoryName(loan.category)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Lender:</span>
                                <span class="detail-value">${loan.lenderName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Date Borrowed:</span>
                                <span class="detail-value">${this.formatDate(loan.dateBorrowed)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Due Date:</span>
                                <span class="detail-value">${this.formatDate(loan.dueDate)}</span>
                            </div>
                            ${loan.daysOverdue > 0 ? `
                                <div class="detail-row">
                                    <span class="detail-label">Days Overdue:</span>
                                    <span class="detail-value text-danger">${loan.daysOverdue}</span>
                                </div>
                            ` : ''}
                        </div>

                        <div class="detail-section">
                            <h4>Financial Details</h4>
                            <div class="detail-row">
                                <span class="detail-label">Principal:</span>
                                <span class="detail-value">${this.formatCurrency(loan.amount)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Interest (10%):</span>
                                <span class="detail-value">${this.formatCurrency(loan.interest)}</span>
                            </div>
                            ${loan.penalty > 0 ? `
                                <div class="detail-row">
                                    <span class="detail-label">Penalty:</span>
                                    <span class="detail-value">${this.formatCurrency(loan.penalty)}</span>
                                </div>
                            ` : ''}
                            <div class="detail-row">
                                <span class="detail-label">Total Repaid:</span>
                                <span class="detail-value">${this.formatCurrency(loan.repaid)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Remaining:</span>
                                <span class="detail-value">${this.formatCurrency(loan.remaining)}</span>
                            </div>
                        </div>

                        ${loan.notes ? `
                            <div class="detail-section">
                                <h4>Purpose</h4>
                                <p>${loan.notes}</p>
                            </div>
                        ` : ''}

                        <div class="detail-section">
                            <h4>Lender Contact</h4>
                            <div class="contact-info">
                                <div>📞 ${loan.lenderPhone}</div>
                                <button class="btn btn-outline btn-small" onclick="navigator.clipboard.writeText('${loan.lenderPhone}')">
                                    Copy Number
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    ${loan.status === 'active' ? `
                        <button class="btn btn-primary payment-btn" data-loan-id="${loan.id}">
                            Make Payment
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

        // Re-bind payment button
        const paymentBtn = modal.querySelector('.payment-btn');
        if (paymentBtn) {
            paymentBtn.addEventListener('click', () => {
                this.showPaymentModal(loan.id);
                closeModal();
            });
        }
    }

    closeModal(modal) {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    }

    updateOverdueStatus() {
        const today = new Date();
        
        this.activeLoans.forEach(loan => {
            const dueDate = new Date(loan.dueDate);
            const daysOverdue = Math.max(0, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)));
            
            if (daysOverdue > 0 && loan.daysOverdue !== daysOverdue) {
                loan.daysOverdue = daysOverdue;
                loan.status = 'overdue';
                
                // Add penalty after 7 days overdue (5% daily)
                if (daysOverdue > 7) {
                    const penaltyDays = daysOverdue - 7;
                    loan.penalty = loan.remaining * 0.05 * penaltyDays;
                    loan.remaining = loan.amount + loan.interest + loan.penalty - loan.repaid;
                }
            }
        });
    }

    getCategoryIcon(category) {
        const categoryIcons = {
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
        return categoryIcons[category] || '💰';
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

    formatCurrency(amount) {
        const userCountry = this.currentBorrower?.country || 'kenya';
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
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getDaysRemaining(dateString) {
        const today = new Date();
        const dueDate = new Date(dateString);
        const diffTime = dueDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getDaysSince(dateString) {
        const today = new Date();
        const pastDate = new Date(dateString);
        const diffTime = today - pastDate;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
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

    getRatingDescription(rating) {
        if (rating >= 4.5) return 'Excellent rating! You have access to all groups and best terms.';
        if (rating >= 4.0) return 'Very good rating. You can join up to 4 groups.';
        if (rating >= 3.5) return 'Good rating. You can join up to 3 groups.';
        if (rating >= 3.0) return 'Average rating. You can join up to 2 groups.';
        if (rating >= 2.5) return 'Below average rating. Limited to 1 group.';
        return 'Poor rating. Improve by paying loans on time to access more groups.';
    }
}

// Initialize borrowing manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.borrowing-page') || 
        document.querySelector('#borrowing-section') ||
        window.location.pathname.includes('borrowing')) {
        window.borrowingManager = new BorrowingManager();
    }
});