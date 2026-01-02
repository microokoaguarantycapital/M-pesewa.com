// Groups Management Module
'use strict';

class GroupsManager {
    constructor() {
        this.currentCountry = null;
        this.userGroups = [];
        this.allGroups = [];
        this.init();
    }

    init() {
        this.loadCurrentCountry();
        this.loadGroupsData();
        this.setupEventListeners();
        this.renderGroups();
    }

    loadCurrentCountry() {
        // Get country from user data or URL parameter
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
        const urlParams = new URLSearchParams(window.location.search);
        
        this.currentCountry = urlParams.get('country') || 
                             userData.country || 
                             'ke'; // Default to Kenya
    }

    async loadGroupsData() {
        try {
            // Try to load from localStorage first
            const storedGroups = localStorage.getItem('m-pesewa-groups');
            if (storedGroups) {
                this.allGroups = JSON.parse(storedGroups);
            } else {
                // Load from demo data
                const response = await fetch('../data/demo-groups.json');
                this.allGroups = await response.json();
                localStorage.setItem('m-pesewa-groups', JSON.stringify(this.allGroups));
            }

            // Load user's groups
            const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
            this.userGroups = userData.groups || [];

            // Filter groups by current country
            this.allGroups = this.allGroups.filter(group => 
                group.country === this.currentCountry
            );

        } catch (error) {
            console.error('Error loading groups data:', error);
            this.allGroups = this.getDefaultGroups();
        }
    }

    getDefaultGroups() {
        return [
            {
                id: 'group-1',
                name: 'Family Trust Circle',
                type: 'family',
                country: 'ke',
                members: 45,
                lenders: 12,
                borrowers: 33,
                totalLent: 150000,
                repaymentRate: '99%',
                createdBy: 'John Maina',
                createdAt: '2024-01-15',
                minMembers: 5,
                maxMembers: 1000,
                description: 'Family-based lending circle for emergency support',
                rules: ['Must be family member', 'Maximum loan: KSh 5,000', '7-day repayment'],
                isPublic: false,
                requiresInvite: true
            },
            {
                id: 'group-2',
                name: 'Nairobi Professionals',
                type: 'professional',
                country: 'ke',
                members: 128,
                lenders: 45,
                borrowers: 83,
                totalLent: 450000,
                repaymentRate: '98%',
                createdBy: 'Sarah Wambui',
                createdAt: '2024-02-10',
                minMembers: 5,
                maxMembers: 1000,
                description: 'Professional network for emergency loans',
                rules: ['Must be employed', 'Provide 2 references', 'Maximum 4 groups'],
                isPublic: false,
                requiresInvite: true
            },
            {
                id: 'group-3',
                name: 'Church Benevolent Fund',
                type: 'church',
                country: 'ke',
                members: 89,
                lenders: 23,
                borrowers: 66,
                totalLent: 280000,
                repaymentRate: '100%',
                createdBy: 'Pastor Kamau',
                createdAt: '2024-01-20',
                minMembers: 5,
                maxMembers: 1000,
                description: 'Church members supporting each other',
                rules: ['Active church member', 'Monthly contribution optional', 'Prayer support included'],
                isPublic: false,
                requiresInvite: true
            }
        ];
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('groupSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchGroups(e.target.value);
            });
        }

        // Filter functionality
        const filterSelect = document.getElementById('groupFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterGroups(e.target.value);
            });
        }

        // Create group form
        const createForm = document.getElementById('createGroupForm');
        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateGroup();
            });
        }

        // Join group buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.join-group-btn')) {
                const groupId = e.target.closest('.join-group-btn').dataset.groupId;
                this.handleJoinGroup(groupId);
            }
        });

        // View group details
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-group-btn')) {
                const groupId = e.target.closest('.view-group-btn').dataset.groupId;
                this.showGroupDetails(groupId);
            }
        });
    }

    renderGroups() {
        const container = document.getElementById('groupsContainer');
        if (!container) return;

        // Clear container
        container.innerHTML = '';

        // Check if user can create groups
        const canCreate = window.roleManager ? window.roleManager.canCreateGroups() : false;

        // Add create group card if user can create groups
        if (canCreate) {
            const createCard = this.createGroupCard();
            container.appendChild(createCard);
        }

        // Add groups
        this.allGroups.forEach(group => {
            const groupCard = this.createGroupElement(group);
            container.appendChild(groupCard);
        });

        // If no groups, show empty state
        if (this.allGroups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <h3 class="empty-state-title">No Groups Found</h3>
                    <p class="empty-state-description">
                        No groups available in ${this.getCountryName(this.currentCountry)}.
                        ${canCreate ? 'Be the first to create a group!' : 'Ask for an invite to join existing groups.'}
                    </p>
                </div>
            `;
        }

        // Update stats
        this.updateGroupStats();
    }

    createGroupCard() {
        const card = document.createElement('div');
        card.className = 'group-card create-group-card';
        card.innerHTML = `
            <div class="group-card-header">
                <div class="group-icon">➕</div>
                <h3 class="group-name">Create New Group</h3>
            </div>
            <div class="group-card-body">
                <p class="group-description">Start a new trusted circle for lending and borrowing</p>
                <ul class="group-features">
                    <li>Minimum 5 members required</li>
                    <li>Maximum 1,000 members</li>
                    <li>Country-specific group</li>
                    <li>Invitation-only entry</li>
                </ul>
            </div>
            <div class="group-card-footer">
                <button class="btn btn-primary btn-block" data-toggle="modal" data-target="#createGroupModal">
                    Create Group
                </button>
            </div>
        `;
        return card;
    }

    createGroupElement(group) {
        const isMember = this.userGroups.includes(group.id);
        const canJoin = window.roleManager ? 
            window.roleManager.canJoinMoreGroups(this.userGroups.length) : true;

        const card = document.createElement('div');
        card.className = 'group-card';
        card.innerHTML = `
            <div class="group-card-header">
                <div class="group-icon">${this.getGroupIcon(group.type)}</div>
                <div>
                    <h3 class="group-name">${group.name}</h3>
                    <div class="group-type">${group.type} • ${this.getCountryFlag(group.country)}</div>
                </div>
                ${isMember ? '<span class="badge badge-success">Member</span>' : ''}
            </div>
            
            <div class="group-card-body">
                <p class="group-description">${group.description}</p>
                
                <div class="group-stats">
                    <div class="stat">
                        <span class="stat-value">${group.members}</span>
                        <span class="stat-label">Members</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${this.formatCurrency(group.totalLent)}</span>
                        <span class="stat-label">Total Lent</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${group.repaymentRate}</span>
                        <span class="stat-label">Repayment Rate</span>
                    </div>
                </div>
                
                <div class="group-meta">
                    <span>👥 ${group.lenders} lenders • ${group.borrowers} borrowers</span>
                    <span>📅 Created ${this.formatDate(group.createdAt)}</span>
                </div>
            </div>
            
            <div class="group-card-footer">
                <button class="btn btn-outline view-group-btn" data-group-id="${group.id}">
                    View Details
                </button>
                ${!isMember && canJoin ? `
                    <button class="btn btn-primary join-group-btn" data-group-id="${group.id}">
                        Request Join
                    </button>
                ` : ''}
                ${!isMember && !canJoin ? `
                    <button class="btn btn-outline" disabled title="You have reached the maximum groups limit">
                        Max Groups Reached
                    </button>
                ` : ''}
            </div>
        `;
        return card;
    }

    searchGroups(query) {
        if (!query) {
            this.renderGroups();
            return;
        }

        const filteredGroups = this.allGroups.filter(group => 
            group.name.toLowerCase().includes(query.toLowerCase()) ||
            group.description.toLowerCase().includes(query.toLowerCase()) ||
            group.type.toLowerCase().includes(query.toLowerCase())
        );

        this.renderFilteredGroups(filteredGroups);
    }

    filterGroups(filterType) {
        if (!filterType || filterType === 'all') {
            this.renderGroups();
            return;
        }

        const filteredGroups = this.allGroups.filter(group => 
            filterType === 'my' ? 
                this.userGroups.includes(group.id) : 
                group.type === filterType
        );

        this.renderFilteredGroups(filteredGroups);
    }

    renderFilteredGroups(groups) {
        const container = document.getElementById('groupsContainer');
        if (!container) return;

        container.innerHTML = '';

        groups.forEach(group => {
            const groupCard = this.createGroupElement(group);
            container.appendChild(groupCard);
        });

        if (groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3 class="empty-state-title">No Groups Found</h3>
                    <p class="empty-state-description">Try adjusting your search or filter criteria.</p>
                </div>
            `;
        }
    }

    async handleCreateGroup() {
        const form = document.getElementById('createGroupForm');
        if (!form) return;

        const formData = new FormData(form);
        const groupData = {
            id: 'group-' + Date.now(),
            name: formData.get('groupName'),
            type: formData.get('groupType'),
            country: this.currentCountry,
            description: formData.get('groupDescription'),
            rules: formData.get('groupRules')?.split('\n').filter(rule => rule.trim()) || [],
            minMembers: 5,
            maxMembers: 1000,
            members: 1, // Creator is first member
            lenders: 0,
            borrowers: 0,
            totalLent: 0,
            repaymentRate: '0%',
            createdBy: this.getCurrentUserName(),
            createdAt: new Date().toISOString().split('T')[0],
            isPublic: formData.get('isPublic') === 'true',
            requiresInvite: formData.get('requiresInvite') === 'true'
        };

        // Validate
        if (!groupData.name || !groupData.type) {
            window.showToast('Please fill in all required fields', 'error');
            return;
        }

        // Add group to list
        this.allGroups.unshift(groupData);
        this.userGroups.push(groupData.id);

        // Save to localStorage
        localStorage.setItem('m-pesewa-groups', JSON.stringify(this.allGroups));

        // Update user data
        this.updateUserGroups();

        // Close modal and reset form
        const modal = document.getElementById('createGroupModal');
        if (modal) {
            modal.classList.remove('active');
        }
        form.reset();

        // Show success message
        window.showToast('Group created successfully!', 'success');

        // Re-render groups
        setTimeout(() => {
            this.renderGroups();
        }, 500);
    }

    async handleJoinGroup(groupId) {
        const group = this.allGroups.find(g => g.id === groupId);
        if (!group) {
            window.showToast('Group not found', 'error');
            return;
        }

        // Check if already a member
        if (this.userGroups.includes(groupId)) {
            window.showToast('You are already a member of this group', 'info');
            return;
        }

        // Check group capacity
        if (group.members >= group.maxMembers) {
            window.showToast('This group has reached maximum capacity', 'error');
            return;
        }

        // Check user's group limit
        if (!window.roleManager.canJoinMoreGroups(this.userGroups.length)) {
            window.showToast('You have reached the maximum number of groups (4)', 'error');
            return;
        }

        // For demo purposes, auto-join
        // In real app, this would be a request that needs approval
        const confirmed = confirm(`Request to join "${group.name}"? This group requires invitation.`);
        
        if (confirmed) {
            // Simulate approval process
            window.showToast('Join request sent. Waiting for approval...', 'info');
            
            setTimeout(() => {
                // Auto-approve for demo
                this.userGroups.push(groupId);
                group.members += 1;
                
                // Update user role in group (randomly assign as borrower or lender)
                const userRole = Math.random() > 0.5 ? 'lender' : 'borrower';
                if (userRole === 'lender') {
                    group.lenders += 1;
                } else {
                    group.borrowers += 1;
                }

                // Save updates
                localStorage.setItem('m-pesewa-groups', JSON.stringify(this.allGroups));
                this.updateUserGroups();

                window.showToast(`Approved! You joined as a ${userRole}.`, 'success');
                this.renderGroups();
            }, 2000);
        }
    }

    showGroupDetails(groupId) {
        const group = this.allGroups.find(g => g.id === groupId);
        if (!group) return;

        // Create modal for group details
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title">${group.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="group-details">
                        <div class="detail-row">
                            <span class="detail-label">Type:</span>
                            <span class="detail-value">${group.type}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Country:</span>
                            <span class="detail-value">${this.getCountryName(group.country)} ${this.getCountryFlag(group.country)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Created:</span>
                            <span class="detail-value">${this.formatDate(group.createdAt)} by ${group.createdBy}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Members:</span>
                            <span class="detail-value">${group.members} (${group.lenders} lenders, ${group.borrowers} borrowers)</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Total Lent:</span>
                            <span class="detail-value">${this.formatCurrency(group.totalLent)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Repayment Rate:</span>
                            <span class="detail-value">${group.repaymentRate}</span>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Description</h4>
                            <p>${group.description}</p>
                        </div>
                        
                        ${group.rules.length > 0 ? `
                            <div class="detail-section">
                                <h4>Group Rules</h4>
                                <ul class="rules-list">
                                    ${group.rules.map(rule => `<li>${rule}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        <div class="detail-section">
                            <h4>Requirements</h4>
                            <ul>
                                <li>Minimum members: ${group.minMembers}</li>
                                <li>Maximum members: ${group.maxMembers}</li>
                                <li>Entry: ${group.requiresInvite ? 'Invitation only' : 'Open'}</li>
                                <li>Visibility: ${group.isPublic ? 'Public' : 'Private'}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    ${!this.userGroups.includes(groupId) ? `
                        <button class="btn btn-primary join-group-btn" data-group-id="${groupId}">
                            Request to Join
                        </button>
                    ` : ''}
                    <button class="btn btn-outline close-modal">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });

        // Re-bind join button
        const joinBtn = modal.querySelector('.join-group-btn');
        if (joinBtn) {
            joinBtn.addEventListener('click', () => {
                this.handleJoinGroup(groupId);
                this.closeModal(modal);
            });
        }
    }

    closeModal(modal) {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    }

    updateGroupStats() {
        const stats = {
            totalGroups: this.allGroups.length,
            totalMembers: this.allGroups.reduce((sum, group) => sum + group.members, 0),
            totalLent: this.allGroups.reduce((sum, group) => sum + group.totalLent, 0),
            myGroups: this.userGroups.length
        };

        // Update stats display if it exists
        const statsContainer = document.querySelector('.group-stats-overview');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${stats.totalGroups}</div>
                    <div class="stat-label">Total Groups</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalMembers}</div>
                    <div class="stat-label">Total Members</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.formatCurrency(stats.totalLent)}</div>
                    <div class="stat-label">Total Lent</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.myGroups}</div>
                    <div class="stat-label">My Groups</div>
                </div>
            `;
        }
    }

    updateUserGroups() {
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
        userData.groups = this.userGroups;
        localStorage.setItem('m-pesewa-user', JSON.stringify(userData));
    }

    getCurrentUserName() {
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
        return userData.fullName || 'Anonymous User';
    }

    getGroupIcon(type) {
        const icons = {
            family: '👨‍👩‍👧‍👦',
            professional: '💼',
            church: '⛪',
            local: '🏘️',
            social: '🎉',
            default: '👥'
        };
        return icons[type] || icons.default;
    }

    getCountryFlag(countryCode) {
        const flags = {
            ke: '🇰🇪', ug: '🇺🇬', tz: '🇹🇿', rw: '🇷🇼', bi: '🇧🇮',
            so: '🇸🇴', ss: '🇸🇸', et: '🇪🇹', cd: '🇨🇬', ng: '🇳🇬',
            za: '🇿🇦', gh: '🇬🇭'
        };
        return flags[countryCode] || '🇺🇳';
    }

    getCountryName(countryCode) {
        const countries = {
            ke: 'Kenya', ug: 'Uganda', tz: 'Tanzania', rw: 'Rwanda', bi: 'Burundi',
            so: 'Somalia', ss: 'South Sudan', et: 'Ethiopia', cd: 'Congo', ng: 'Nigeria',
            za: 'South Africa', gh: 'Ghana'
        };
        return countries[countryCode] || 'Unknown Country';
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

// Initialize groups manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a groups page
    if (window.location.pathname.includes('groups.html') || 
        document.getElementById('groupsContainer')) {
        window.groupsManager = new GroupsManager();
    }
});