// Blacklist Management Module
'use strict';

class BlacklistManager {
    constructor() {
        this.blacklist = [];
        this.filteredList = [];
        this.currentUser = null;
        this.activeFilters = {
            country: 'all',
            status: 'active',
            search: ''
        };
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadBlacklist();
        this.setupEventListeners();
        this.renderBlacklistTable();
        this.renderStats();
    }

    loadUserData() {
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
        this.currentUser = {
            id: userData.id,
            name: userData.fullName || userData.brandName || 'Anonymous',
            role: userData.role,
            country: userData.country,
            isAdmin: userData.role === 'admin'
        };
    }

    async loadBlacklist() {
        try {
            const response = await fetch('../data/collectors.json');
            const collectorsData = await response.json();
            
            // For demo, create blacklist from collectors data
            this.blacklist = collectorsData.slice(0, 50).map((collector, index) => ({
                id: 'blacklist-' + index,
                borrowerName: collector.name,
                borrowerPhone: collector.phone,
                borrowerId: 'ID-' + (1000 + index),
                amount: Math.floor(Math.random() * 10000) + 1000,
                daysOverdue: Math.floor(Math.random() * 60) + 30,
                country: collector.country || 'kenya',
                lenderName: 'Lender ' + (index % 10 + 1),
                ledgerId: 'ledger-' + index,
                reason: 'Defaulted on loan payment',
                blacklistedBy: 'System Admin',
                blacklistedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: Math.random() > 0.7 ? 'cleared' : 'active',
                notes: 'Defaulted on multiple loans'
            }));

            // Also load from localStorage if exists
            const storedBlacklist = JSON.parse(localStorage.getItem('m-pesewa-blacklist') || '[]');
            if (storedBlacklist.length > 0) {
                this.blacklist = [...this.blacklist, ...storedBlacklist];
            }

            this.filteredList = [...this.blacklist];
            this.applyFilters();
        } catch (error) {
            console.error('Error loading blacklist:', error);
            this.blacklist = this.getDefaultBlacklist();
            this.filteredList = [...this.blacklist];
        }
    }

    getDefaultBlacklist() {
        return [
            {
                id: 'blacklist-1',
                borrowerName: 'John Kamau',
                borrowerPhone: '+254711111111',
                borrowerId: 'ID-123456',
                amount: 5000,
                daysOverdue: 45,
                country: 'kenya',
                lenderName: 'Trusted Lender Co.',
                ledgerId: 'ledger-001',
                reason: 'Defaulted on transport loan',
                blacklistedBy: 'System Admin',
                blacklistedAt: '2024-01-15',
                status: 'active',
                notes: 'Has not responded to calls'
            },
            {
                id: 'blacklist-2',
                borrowerName: 'Sarah Mwangi',
                borrowerPhone: '+254722222222',
                borrowerId: 'ID-123457',
                amount: 3000,
                daysOverdue: 60,
                country: 'uganda',
                lenderName: 'Community Lender',
                ledgerId: 'ledger-002',
                reason: 'Defaulted on school fees loan',
                blacklistedBy: 'Admin User',
                blacklistedAt: '2024-01-10',
                status: 'active',
                notes: 'Moved to different town'
            },
            {
                id: 'blacklist-3',
                borrowerName: 'David Ochieng',
                borrowerPhone: '+254733333333',
                borrowerId: 'ID-123458',
                amount: 7500,
                daysOverdue: 90,
                country: 'tanzania',
                lenderName: 'Premium Lender',
                ledgerId: 'ledger-003',
                reason: 'Multiple defaults',
                blacklistedBy: 'System Admin',
                blacklistedAt: '2023-12-20',
                status: 'active',
                notes: 'High risk borrower'
            },
            {
                id: 'blacklist-4',
                borrowerName: 'Grace Atieno',
                borrowerPhone: '+254744444444',
                borrowerId: 'ID-123459',
                amount: 2000,
                daysOverdue: 35,
                country: 'rwanda',
                lenderName: 'Local Lender',
                ledgerId: 'ledger-004',
                reason: 'Defaulted on medical loan',
                blacklistedBy: 'Admin User',
                blacklistedAt: '2024-01-20',
                status: 'cleared',
                notes: 'Paid in full on 2024-01-25'
            }
        ];
    }

    setupEventListeners() {
        // Filter controls
        const countryFilter = document.getElementById('countryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const searchInput = document.getElementById('blacklistSearch');

        if (countryFilter) {
            countryFilter.addEventListener('change', (e) => {
                this.activeFilters.country = e.target.value;
                this.applyFilters();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.activeFilters.status = e.target.value;
                this.applyFilters();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.activeFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Export button
        const exportBtn = document.getElementById('exportBlacklistBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportBlacklist();
            });
        }

        // Add to blacklist button (admin only)
        const addBtn = document.getElementById('addBlacklistBtn');
        if (addBtn && this.currentUser.isAdmin) {
            addBtn.addEventListener('click', () => {
                this.showAddBlacklistModal();
            });
        }

        // Event delegation for table actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-blacklist-btn')) {
                const id = e.target.closest('.view-blacklist-btn').dataset.id;
                this.viewBlacklistDetails(id);
            }

            if (e.target.closest('.remove-blacklist-btn')) {
                const id = e.target.closest('.remove-blacklist-btn').dataset.id;
                this.removeFromBlacklist(id);
            }

            if (e.target.closest('.notify-btn')) {
                const id = e.target.closest('.notify-btn').dataset.id;
                this.notifyBorrower(id);
            }

            if (e.target.closest('.assign-collector-btn')) {
                const id = e.target.closest('.assign-collector-btn').dataset.id;
                this.assignDebtCollector(id);
            }
        });
    }

    applyFilters() {
        let filtered = [...this.blacklist];

        // Filter by country
        if (this.activeFilters.country !== 'all') {
            filtered = filtered.filter(item => 
                item.country === this.activeFilters.country
            );
        }

        // Filter by status
        if (this.activeFilters.status !== 'all') {
            filtered = filtered.filter(item => 
                item.status === this.activeFilters.status
            );
        }

        // Filter by search
        if (this.activeFilters.search) {
            const searchTerm = this.activeFilters.search;
            filtered = filtered.filter(item =>
                item.borrowerName.toLowerCase().includes(searchTerm) ||
                item.borrowerPhone.includes(searchTerm) ||
                item.borrowerId.toLowerCase().includes(searchTerm) ||
                item.lenderName.toLowerCase().includes(searchTerm)
            );
        }

        this.filteredList = filtered;
        this.renderBlacklistTable();
    }

    renderBlacklistTable() {
        const container = document.getElementById('blacklistTableContainer');
        if (!container) return;

        if (this.filteredList.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3 class="empty-state-title">No Blacklisted Borrowers Found</h3>
                    <p class="empty-state-description">
                        ${this.blacklist.length === 0 
                            ? 'The blacklist is currently empty.'
                            : 'No borrowers match your current filters.'}
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
                    <th>Borrower</th>
                    <th>ID</th>
                    <th>Amount</th>
                    <th>Days Overdue</th>
                    <th>Country</th>
                    <th>Lender</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${this.filteredList.map(item => `
                    <tr class="${item.status === 'cleared' ? 'table-row-cleared' : ''}">
                        <td>
                            <div class="borrower-info">
                                <strong>${item.borrowerName}</strong>
                                <div class="borrower-contact">${item.borrowerPhone}</div>
                            </div>
                        </td>
                        <td>
                            <code>${item.borrowerId}</code>
                        </td>
                        <td>
                            <span class="amount-overdue">${this.formatCurrency(item.amount)}</span>
                        </td>
                        <td>
                            <span class="${item.daysOverdue > 60 ? 'text-danger' : 'text-warning'}">
                                ${item.daysOverdue} days
                            </span>
                        </td>
                        <td>
                            <span class="country-flag">${this.getCountryFlag(item.country)}</span>
                            ${this.getCountryName(item.country)}
                        </td>
                        <td>${item.lenderName}</td>
                        <td>
                            <span class="table-status table-status-${item.status}">
                                ${item.status === 'active' ? 'Blacklisted' : 'Cleared'}
                            </span>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="table-action-btn view-blacklist-btn" data-id="${item.id}" title="View Details">
                                    👁️
                                </button>
                                ${this.currentUser.isAdmin ? `
                                    <button class="table-action-btn remove-blacklist-btn" data-id="${item.id}" title="Remove from Blacklist">
                                        ✅
                                    </button>
                                    <button class="table-action-btn notify-btn" data-id="${item.id}" title="Send Notification">
                                        🔔
                                    </button>
                                    <button class="table-action-btn assign-collector-btn" data-id="${item.id}" title="Assign Debt Collector">
                                        👥
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
        const container = document.getElementById('blacklistStats');
        if (!container) return;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-icon">⚫</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${stats.totalBlacklisted}</div>
                        <div class="stat-card-label">Total Blacklisted</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-icon">💰</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${this.formatCurrency(stats.totalAmount)}</div>
                        <div class="stat-card-label">Total Amount</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-icon">📈</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${stats.avgDaysOverdue}</div>
                        <div class="stat-card-label">Avg. Days Overdue</div>
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
                    <div class="stat-card-icon">🌍</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${stats.countriesCount}</div>
                        <div class="stat-card-label">Countries</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-icon">👥</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${stats.lendersCount}</div>
                        <div class="stat-card-label">Lenders Affected</div>
                    </div>
                </div>
            </div>
        `;
    }

    calculateStats() {
        const activeItems = this.blacklist.filter(item => item.status === 'active');
        const clearedItems = this.blacklist.filter(item => item.status === 'cleared');
        
        const uniqueCountries = [...new Set(this.blacklist.map(item => item.country))];
        const uniqueLenders = [...new Set(this.blacklist.map(item => item.lenderName))];

        return {
            totalBlacklisted: this.blacklist.length,
            activeCount: activeItems.length,
            clearedCount: clearedItems.length,
            totalAmount: activeItems.reduce((sum, item) => sum + item.amount, 0),
            avgDaysOverdue: activeItems.length > 0 
                ? Math.round(activeItems.reduce((sum, item) => sum + item.daysOverdue, 0) / activeItems.length)
                : 0,
            countriesCount: uniqueCountries.length,
            lendersCount: uniqueLenders.length
        };
    }

    viewBlacklistDetails(id) {
        const item = this.blacklist.find(i => i.id === id);
        if (!item) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3 class="modal-title">Blacklist Details</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="blacklist-details-grid">
                        <div class="detail-section">
                            <h4>Borrower Information</h4>
                            <div class="detail-row">
                                <span class="detail-label">Name:</span>
                                <span class="detail-value">${item.borrowerName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Phone:</span>
                                <span class="detail-value">${item.borrowerPhone}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">ID Number:</span>
                                <span class="detail-value">${item.borrowerId}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Country:</span>
                                <span class="detail-value">
                                    ${this.getCountryFlag(item.country)} ${this.getCountryName(item.country)}
                                </span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Loan Information</h4>
                            <div class="detail-row">
                                <span class="detail-label">Amount Owed:</span>
                                <span class="detail-value amount-overdue">${this.formatCurrency(item.amount)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Days Overdue:</span>
                                <span class="detail-value ${item.daysOverdue > 60 ? 'text-danger' : 'text-warning'}">
                                    ${item.daysOverdue} days
                                </span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Lender:</span>
                                <span class="detail-value">${item.lenderName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Ledger ID:</span>
                                <span class="detail-value">${item.ledgerId}</span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Blacklist Information</h4>
                            <div class="detail-row">
                                <span class="detail-label">Status:</span>
                                <span class="detail-value">
                                    <span class="table-status table-status-${item.status}">
                                        ${item.status === 'active' ? 'Blacklisted' : 'Cleared'}
                                    </span>
                                </span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Reason:</span>
                                <span class="detail-value">${item.reason}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Blacklisted By:</span>
                                <span class="detail-value">${item.blacklistedBy}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Date Blacklisted:</span>
                                <span class="detail-value">${this.formatDate(item.blacklistedAt)}</span>
                            </div>
                        </div>

                        ${item.notes ? `
                            <div class="detail-section">
                                <h4>Notes</h4>
                                <p>${item.notes}</p>
                            </div>
                        ` : ''}

                        ${item.status === 'cleared' ? `
                            <div class="detail-section">
                                <div class="alert alert-success">
                                    <strong>Cleared:</strong> This borrower has been removed from the blacklist.
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    ${item.status === 'active' && this.currentUser.isAdmin ? `
                        <button class="btn btn-success remove-blacklist-btn" data-id="${item.id}">
                            Remove from Blacklist
                        </button>
                        <button class="btn btn-primary assign-collector-btn" data-id="${item.id}">
                            Assign Debt Collector
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

        // Bind action buttons
        const removeBtn = modal.querySelector('.remove-blacklist-btn');
        const assignBtn = modal.querySelector('.assign-collector-btn');

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.removeFromBlacklist(item.id);
                closeModal();
            });
        }

        if (assignBtn) {
            assignBtn.addEventListener('click', () => {
                this.assignDebtCollector(item.id);
                closeModal();
            });
        }
    }

    removeFromBlacklist(id) {
        if (!this.currentUser.isAdmin) {
            window.showToast('Only admins can remove from blacklist', 'error');
            return;
        }

        const item = this.blacklist.find(i => i.id === id);
        if (!item) return;

        const confirmed = confirm(
            `Remove ${item.borrowerName} from blacklist?\n\n` +
            `This will allow them to borrow again.`
        );

        if (!confirmed) return;

        // Update status to cleared
        item.status = 'cleared';
        item.clearedAt = new Date().toISOString();
        item.clearedBy = this.currentUser.name;

        // Save to localStorage
        const storedBlacklist = JSON.parse(localStorage.getItem('m-pesewa-blacklist') || '[]');
        const index = storedBlacklist.findIndex(i => i.id === id);
        if (index !== -1) {
            storedBlacklist[index] = item;
        } else {
            storedBlacklist.push(item);
        }
        localStorage.setItem('m-pesewa-blacklist', JSON.stringify(storedBlacklist));

        window.showToast(`${item.borrowerName} removed from blacklist`, 'success');
        
        setTimeout(() => {
            this.applyFilters();
            this.renderStats();
        }, 500);
    }

    notifyBorrower(id) {
        const item = this.blacklist.find(i => i.id === id);
        if (!item) return;

        const message = prompt(
            'Enter notification message:',
            `Dear ${item.borrowerName}, you have been blacklisted due to defaulting on your loan of ` +
            `${this.formatCurrency(item.amount)}. Please contact your lender ${item.lenderName} to resolve this.`
        );

        if (message) {
            // Simulate sending notification
            console.log(`Notification sent to ${item.borrowerPhone}: ${message}`);
            window.showToast('Notification sent successfully!', 'success');
        }
    }

    assignDebtCollector(id) {
        const item = this.blacklist.find(i => i.id === id);
        if (!item) return;

        // Load collectors data
        fetch('../data/collectors.json')
            .then(response => response.json())
            .then(collectors => {
                // Filter collectors by country
                const countryCollectors = collectors.filter(c => 
                    c.country === item.country
                );

                if (countryCollectors.length === 0) {
                    window.showToast('No debt collectors available for this country', 'warning');
                    return;
                }

                this.showCollectorSelectionModal(item, countryCollectors);
            })
            .catch(error => {
                console.error('Error loading collectors:', error);
                window.showToast('Error loading debt collectors', 'error');
            });
    }

    showCollectorSelectionModal(item, collectors) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3 class="modal-title">Assign Debt Collector</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="assignment-info">
                        <h4>Borrower: ${item.borrowerName}</h4>
                        <p>Amount: ${this.formatCurrency(item.amount)} • Days Overdue: ${item.daysOverdue}</p>
                    </div>

                    <div class="collectors-list">
                        <h5>Available Debt Collectors (${collectors.length})</h5>
                        ${collectors.slice(0, 10).map(collector => `
                            <div class="collector-card">
                                <div class="collector-info">
                                    <h6>${collector.name}</h6>
                                    <div class="collector-details">
                                        <span>📞 ${collector.phone}</span>
                                        <span>📍 ${collector.location}</span>
                                        <span>⭐ Success Rate: ${collector.successRate || '80%'}</span>
                                    </div>
                                    <div class="collector-description">
                                        ${collector.description || 'Experienced debt collector specializing in loan recovery.'}
                                    </div>
                                </div>
                                <div class="collector-actions">
                                    <button class="btn btn-outline btn-small assign-single-btn" 
                                            data-collector-id="${collector.id}">
                                        Assign
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="assignment-notes" style="margin-top: 2rem;">
                        <label for="assignmentNotes">Assignment Notes (Optional)</label>
                        <textarea id="assignmentNotes" class="form-control" rows="3" 
                                  placeholder="Add any specific instructions for the debt collector..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline close-modal">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Assign collector buttons
        modal.querySelectorAll('.assign-single-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const collectorId = btn.dataset.collectorId;
                const collector = collectors.find(c => c.id == collectorId);
                if (collector) {
                    this.confirmCollectorAssignment(item, collector, modal);
                }
            });
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    confirmCollectorAssignment(item, collector, modal) {
        const notes = document.getElementById('assignmentNotes')?.value || '';

        const confirmed = confirm(
            `Assign ${collector.name} to recover debt from ${item.borrowerName}?\n\n` +
            `Collector: ${collector.name}\n` +
            `Phone: ${collector.phone}\n` +
            `Location: ${collector.location}\n\n` +
            `Amount: ${this.formatCurrency(item.amount)}\n` +
            `Notes: ${notes || 'None'}`
        );

        if (!confirmed) return;

        // Create assignment record
        const assignments = JSON.parse(localStorage.getItem('m-pesewa-collector-assignments') || '[]');
        assignments.push({
            id: 'assignment-' + Date.now(),
            blacklistId: item.id,
            borrowerName: item.borrowerName,
            borrowerPhone: item.borrowerPhone,
            amount: item.amount,
            collectorId: collector.id,
            collectorName: collector.name,
            collectorPhone: collector.phone,
            assignedBy: this.currentUser.name,
            assignedAt: new Date().toISOString(),
            notes: notes,
            status: 'assigned'
        });
        localStorage.setItem('m-pesewa-collector-assignments', JSON.stringify(assignments));

        // Update blacklist item
        item.assignedCollector = collector.name;
        item.assignedCollectorId = collector.id;

        window.showToast(`Assigned ${collector.name} as debt collector`, 'success');
        this.closeModal(modal);
    }

    showAddBlacklistModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3 class="modal-title">Add to Blacklist</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addBlacklistForm">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="blacklistBorrowerName">Borrower Name *</label>
                                <input type="text" id="blacklistBorrowerName" name="borrowerName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="blacklistBorrowerPhone">Borrower Phone *</label>
                                <input type="tel" id="blacklistBorrowerPhone" name="borrowerPhone" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="blacklistBorrowerId">Borrower ID *</label>
                                <input type="text" id="blacklistBorrowerId" name="borrowerId" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="blacklistCountry">Country *</label>
                                <select id="blacklistCountry" name="country" class="form-control" required>
                                    <option value="">Select country</option>
                                    ${this.getCountryOptions()}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="blacklistAmount">Amount Owed *</label>
                                <input type="number" id="blacklistAmount" name="amount" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="blacklistDaysOverdue">Days Overdue *</label>
                                <input type="number" id="blacklistDaysOverdue" name="daysOverdue" class="form-control" min="30" required>
                            </div>
                            <div class="form-group">
                                <label for="blacklistLenderName">Lender Name *</label>
                                <input type="text" id="blacklistLenderName" name="lenderName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="blacklistLedgerId">Ledger ID *</label>
                                <input type="text" id="blacklistLedgerId" name="ledgerId" class="form-control" required>
                            </div>
                            <div class="form-group full-width">
                                <label for="blacklistReason">Reason *</label>
                                <textarea id="blacklistReason" name="reason" class="form-control" rows="3" required></textarea>
                            </div>
                            <div class="form-group full-width">
                                <label for="blacklistNotes">Additional Notes (Optional)</label>
                                <textarea id="blacklistNotes" name="notes" class="form-control" rows="2"></textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="saveBlacklistBtn">Add to Blacklist</button>
                    <button class="btn btn-outline close-modal">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Save to blacklist
        modal.querySelector('#saveBlacklistBtn').addEventListener('click', () => {
            this.saveToBlacklist(modal);
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    saveToBlacklist(modal) {
        const form = modal.querySelector('#addBlacklistForm');
        const formData = new FormData(form);

        const newItem = {
            id: 'blacklist-' + Date.now(),
            borrowerName: formData.get('borrowerName'),
            borrowerPhone: formData.get('borrowerPhone'),
            borrowerId: formData.get('borrowerId'),
            amount: parseFloat(formData.get('amount')),
            daysOverdue: parseInt(formData.get('daysOverdue')),
            country: formData.get('country'),
            lenderName: formData.get('lenderName'),
            ledgerId: formData.get('ledgerId'),
            reason: formData.get('reason'),
            blacklistedBy: this.currentUser.name,
            blacklistedAt: new Date().toISOString(),
            status: 'active',
            notes: formData.get('notes')
        };

        // Validate: Must be at least 30 days overdue for blacklisting
        if (newItem.daysOverdue < 30) {
            window.showToast('Borrower must be at least 30 days overdue for blacklisting', 'error');
            return;
        }

        // Save to localStorage
        const storedBlacklist = JSON.parse(localStorage.getItem('m-pesewa-blacklist') || '[]');
        storedBlacklist.push(newItem);
        localStorage.setItem('m-pesewa-blacklist', JSON.stringify(storedBlacklist));

        // Add to local array
        this.blacklist.push(newItem);

        window.showToast('Borrower added to blacklist', 'success');
        this.closeModal(modal);
        
        setTimeout(() => {
            this.applyFilters();
            this.renderStats();
        }, 500);
    }

    exportBlacklist() {
        const data = this.filteredList.map(item => ({
            'Borrower Name': item.borrowerName,
            'Phone': item.borrowerPhone,
            'ID': item.borrowerId,
            'Amount Owed': item.amount,
            'Days Overdue': item.daysOverdue,
            'Country': this.getCountryName(item.country),
            'Lender': item.lenderName,
            'Ledger ID': item.ledgerId,
            'Reason': item.reason,
            'Status': item.status === 'active' ? 'Blacklisted' : 'Cleared',
            'Date Blacklisted': this.formatDate(item.blacklistedAt),
            'Notes': item.notes || ''
        }));

        // Convert to CSV
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `m-pesewa-blacklist-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        window.showToast('Blacklist exported successfully!', 'success');
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

    getCountryOptions() {
        const countries = [
            { code: 'kenya', name: 'Kenya', flag: '🇰🇪' },
            { code: 'uganda', name: 'Uganda', flag: '🇺🇬' },
            { code: 'tanzania', name: 'Tanzania', flag: '🇹🇿' },
            { code: 'rwanda', name: 'Rwanda', flag: '🇷🇼' },
            { code: 'burundi', name: 'Burundi', flag: '🇧🇮' },
            { code: 'somalia', name: 'Somalia', flag: '🇸🇴' },
            { code: 'south-sudan', name: 'South Sudan', flag: '🇸🇸' },
            { code: 'ethiopia', name: 'Ethiopia', flag: '🇪🇹' },
            { code: 'congo', name: 'Congo', flag: '🇨🇬' },
            { code: 'nigeria', name: 'Nigeria', flag: '🇳🇬' },
            { code: 'south-africa', name: 'South Africa', flag: '🇿🇦' },
            { code: 'ghana', name: 'Ghana', flag: '🇬🇭' }
        ];

        return countries.map(country => 
            `<option value="${country.code}">${country.flag} ${country.name}</option>`
        ).join('');
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
            'congo': '🇨🇬',
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
        return names[countryCode] || 'Unknown';
    }

    formatCurrency(amount) {
        const userCountry = this.currentUser?.country || 'kenya';
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

    closeModal(modal) {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    }
}

// Initialize blacklist manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.blacklist-page') || 
        document.querySelector('#blacklist-section') ||
        window.location.pathname.includes('blacklist')) {
        window.blacklistManager = new BlacklistManager();
    }
});