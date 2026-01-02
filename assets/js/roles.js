// Role Management Module
'use strict';

class RoleManager {
    constructor() {
        this.currentRole = null;
        this.availableRoles = ['borrower', 'lender', 'admin'];
        this.rolePermissions = this.defineRolePermissions();
        this.init();
    }

    init() {
        this.loadRoleFromStorage();
        this.setupRoleSwitcher();
        this.enforceRoleBasedAccess();
    }

    defineRolePermissions() {
        return {
            borrower: {
                dashboard: true,
                borrow: true,
                viewGroups: true,
                viewLedgers: false,
                lend: false,
                manageBlacklist: false,
                adminAccess: false,
                maxGroups: 4,
                canCreateGroup: false
            },
            lender: {
                dashboard: true,
                borrow: true,
                viewGroups: true,
                viewLedgers: true,
                lend: true,
                manageBlacklist: true,
                adminAccess: false,
                maxGroups: 4,
                canCreateGroup: true,
                subscriptionRequired: true
            },
            admin: {
                dashboard: true,
                borrow: false,
                viewGroups: true,
                viewLedgers: true,
                lend: false,
                manageBlacklist: true,
                adminAccess: true,
                maxGroups: null,
                canCreateGroup: true,
                canOverride: true,
                canModerate: true
            }
        };
    }

    loadRoleFromStorage() {
        try {
            const userData = localStorage.getItem('m-pesewa-user');
            if (userData) {
                const user = JSON.parse(userData);
                this.currentRole = user.role;
            }
        } catch (error) {
            console.error('Error loading role from storage:', error);
            this.currentRole = null;
        }
    }

    setRole(role) {
        if (!this.availableRoles.includes(role)) {
            console.error('Invalid role:', role);
            return false;
        }

        this.currentRole = role;
        
        // Update user data in storage
        try {
            const userData = localStorage.getItem('m-pesewa-user');
            if (userData) {
                const user = JSON.parse(userData);
                user.role = role;
                localStorage.setItem('m-pesewa-user', JSON.stringify(user));
            }
        } catch (error) {
            console.error('Error updating role in storage:', error);
        }

        return true;
    }

    getCurrentRole() {
        return this.currentRole;
    }

    getRolePermissions(role = this.currentRole) {
        return this.rolePermissions[role] || {};
    }

    hasPermission(permission) {
        if (!this.currentRole) return false;
        const permissions = this.getRolePermissions();
        return permissions[permission] === true;
    }

    canAccessPage(page) {
        const pagePermissions = {
            'borrower-dashboard.html': ['borrower', 'lender', 'admin'],
            'lender-dashboard.html': ['lender', 'admin'],
            'admin-dashboard.html': ['admin'],
            'lending.html': ['lender', 'admin'],
            'borrowing.html': ['borrower', 'lender', 'admin'],
            'groups.html': ['borrower', 'lender', 'admin'],
            'ledger.html': ['lender', 'admin'],
            'blacklist.html': ['lender', 'admin'],
            'subscriptions.html': ['lender', 'admin'],
            'debt-collectors.html': ['borrower', 'lender', 'admin'],
            'about.html': ['borrower', 'lender', 'admin'],
            'qa.html': ['borrower', 'lender', 'admin'],
            'contact.html': ['borrower', 'lender', 'admin']
        };

        const allowedRoles = pagePermissions[page] || [];
        return allowedRoles.includes(this.currentRole);
    }

    enforceRoleBasedAccess() {
        const currentPage = window.location.pathname.split('/').pop();
        
        // Skip enforcement on index page
        if (currentPage === 'index.html' || currentPage === '') {
            return;
        }

        // Check if user is logged in
        if (!this.currentRole) {
            window.showToast('Please login to access this page', 'warning');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
            return;
        }

        // Check if user has permission for current page
        if (!this.canAccessPage(currentPage)) {
            window.showToast('You do not have permission to access this page', 'error');
            setTimeout(() => {
                this.redirectToAppropriateDashboard();
            }, 1500);
            return;
        }

        // Update UI based on role
        this.updateUIForCurrentRole();
    }

    redirectToAppropriateDashboard() {
        if (!this.currentRole) {
            window.location.href = '../index.html';
            return;
        }

        switch (this.currentRole) {
            case 'borrower':
                window.location.href = 'borrower-dashboard.html';
                break;
            case 'lender':
                window.location.href = 'lender-dashboard.html';
                break;
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
            default:
                window.location.href = '../index.html';
        }
    }

    updateUIForCurrentRole() {
        // Hide/show elements based on role
        this.hideAdminElements();
        this.updateNavigation();
        this.updateDashboardContent();
    }

    hideAdminElements() {
        if (!this.hasPermission('adminAccess')) {
            // Hide admin-only elements
            const adminElements = document.querySelectorAll('.admin-only, [data-role="admin"]');
            adminElements.forEach(el => {
                el.style.display = 'none';
            });

            // Remove admin links from navigation
            const adminLinks = document.querySelectorAll('a[href*="admin"], .nav-link[href*="admin"]');
            adminLinks.forEach(link => {
                link.style.display = 'none';
            });
        }
    }

    updateNavigation() {
        const navLinks = document.querySelectorAll('.nav-link, .sidebar-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const page = href.split('/').pop();
                if (page && !this.canAccessPage(page)) {
                    link.style.display = 'none';
                }
            }
        });

        // Update active state based on current page
        const currentPage = window.location.pathname.split('/').pop();
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href.includes(currentPage)) {
                link.classList.add('active');
            }
        });
    }

    updateDashboardContent() {
        // Update dashboard title based on role
        const dashboardTitle = document.querySelector('.dashboard-title');
        if (dashboardTitle) {
            switch (this.currentRole) {
                case 'borrower':
                    dashboardTitle.textContent = 'Borrower Dashboard';
                    break;
                case 'lender':
                    dashboardTitle.textContent = 'Lender Dashboard';
                    break;
                case 'admin':
                    dashboardTitle.textContent = 'Admin Dashboard';
                    break;
            }
        }

        // Update role badge
        const roleBadge = document.querySelector('.user-role');
        if (roleBadge) {
            roleBadge.textContent = this.currentRole.charAt(0).toUpperCase() + this.currentRole.slice(1);
            
            // Add role-specific color
            roleBadge.className = 'user-role';
            switch (this.currentRole) {
                case 'borrower':
                    roleBadge.classList.add('role-borrower');
                    break;
                case 'lender':
                    roleBadge.classList.add('role-lender');
                    break;
                case 'admin':
                    roleBadge.classList.add('role-admin');
                    break;
            }
        }

        // Update quick actions based on role
        this.updateQuickActions();
    }

    updateQuickActions() {
        const quickActions = document.querySelector('.quick-actions');
        if (!quickActions) return;

        // Clear existing actions
        quickActions.innerHTML = '';

        // Add role-specific actions
        switch (this.currentRole) {
            case 'borrower':
                quickActions.innerHTML = `
                    <a href="borrowing.html" class="btn btn-primary">
                        <span>💰</span> Request Loan
                    </a>
                    <a href="groups.html" class="btn btn-outline">
                        <span>👥</span> View Groups
                    </a>
                `;
                break;
                
            case 'lender':
                quickActions.innerHTML = `
                    <a href="lending.html" class="btn btn-primary">
                        <span>📝</span> New Ledger
                    </a>
                    <a href="groups.html" class="btn btn-outline">
                        <span>👥</span> Manage Groups
                    </a>
                    <a href="subscriptions.html" class="btn btn-outline">
                        <span>💳</span> Subscription
                    </a>
                `;
                break;
                
            case 'admin':
                quickActions.innerHTML = `
                    <a href="blacklist.html" class="btn btn-primary">
                        <span>⚫</span> Manage Blacklist
                    </a>
                    <a href="pages/dashboard/admin-dashboard.html?tab=overrides" class="btn btn-outline">
                        <span>🛡️</span> Ledger Overrides
                    </a>
                    <a href="debt-collectors.html" class="btn btn-outline">
                        <span>👮</span> Debt Collectors
                    </a>
                `;
                break;
        }
    }

    setupRoleSwitcher() {
        // Check if role switcher exists on the page
        const roleSwitcher = document.getElementById('roleSwitcher');
        if (!roleSwitcher) return;

        // Get user's available roles (from user data)
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
        const availableRoles = userData.availableRoles || [this.currentRole];

        // Populate role switcher
        roleSwitcher.innerHTML = '';
        availableRoles.forEach(role => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role.charAt(0).toUpperCase() + role.slice(1);
            if (role === this.currentRole) {
                option.selected = true;
            }
            roleSwitcher.appendChild(option);
        });

        // Handle role change
        roleSwitcher.addEventListener('change', (e) => {
            const newRole = e.target.value;
            if (newRole !== this.currentRole) {
                const confirmed = confirm(`Switch to ${newRole} role? You will be redirected to the appropriate dashboard.`);
                if (confirmed) {
                    this.setRole(newRole);
                    this.redirectToAppropriateDashboard();
                } else {
                    // Reset to current role
                    e.target.value = this.currentRole;
                }
            }
        });
    }

    // Check if user can join more groups
    canJoinMoreGroups(currentGroupCount) {
        const permissions = this.getRolePermissions();
        if (permissions.maxGroups === null) return true;
        return currentGroupCount < permissions.maxGroups;
    }

    // Check if user can create groups
    canCreateGroups() {
        return this.hasPermission('canCreateGroup');
    }

    // Check if user can lend
    canLend() {
        if (!this.hasPermission('lend')) return false;
        
        // For lenders, check subscription status
        if (this.currentRole === 'lender') {
            const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
            if (userData.subscriptionStatus === 'expired') {
                window.showToast('Your subscription has expired. Please renew to continue lending.', 'warning');
                return false;
            }
        }
        
        return true;
    }

    // Get role-specific limits
    getLimits() {
        const permissions = this.getRolePermissions();
        return {
            maxGroups: permissions.maxGroups,
            canCreateGroup: permissions.canCreateGroup,
            requiresSubscription: permissions.subscriptionRequired,
            canOverride: permissions.canOverride,
            canModerate: permissions.canModerate
        };
    }

    // Get role-specific dashboard stats
    getDashboardStats() {
        const stats = JSON.parse(localStorage.getItem('dashboardStats') || '{}');
        const roleStats = stats[this.currentRole] || {};
        
        // Add role-specific default stats
        switch (this.currentRole) {
            case 'borrower':
                return {
                    activeLoans: roleStats.activeLoans || 0,
                    totalBorrowed: roleStats.totalBorrowed || 0,
                    repaymentRate: roleStats.repaymentRate || '100%',
                    groupsJoined: roleStats.groupsJoined || 1,
                    rating: roleStats.rating || 5.0
                };
                
            case 'lender':
                return {
                    totalLent: roleStats.totalLent || 0,
                    activeLedgers: roleStats.activeLedgers || 0,
                    totalInterest: roleStats.totalInterest || 0,
                    repaymentRate: roleStats.repaymentRate || '99%',
                    subscriptionDays: roleStats.subscriptionDays || 28
                };
                
            case 'admin':
                return {
                    totalUsers: roleStats.totalUsers || 0,
                    totalGroups: roleStats.totalGroups || 0,
                    totalLoans: roleStats.totalLoans || 0,
                    defaultRate: roleStats.defaultRate || '1%',
                    platformRevenue: roleStats.platformRevenue || 0
                };
                
            default:
                return {};
        }
    }
}

// Initialize role manager
const roleManager = new RoleManager();

// Export for use in other modules
window.roleManager = roleManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Auto-enforce role-based access on all pages except index
    if (!window.location.pathname.includes('index.html') && 
        window.location.pathname !== '/') {
        roleManager.enforceRoleBasedAccess();
    }
});