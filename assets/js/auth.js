// Authentication Module
'use strict';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.loadUserFromStorage();
        this.setupAuthListeners();
    }

    loadUserFromStorage() {
        try {
            const userData = localStorage.getItem('m-pesewa-user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.currentRole = this.currentUser.role;
                this.isAuthenticated = true;
                this.updateUIForAuthenticatedUser();
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
            this.clearUser();
        }
    }

    saveUserToStorage(user) {
        try {
            localStorage.setItem('m-pesewa-user', JSON.stringify(user));
            localStorage.setItem('m-pesewa-token', 'demo-token-' + Date.now());
        } catch (error) {
            console.error('Error saving user to storage:', error);
        }
    }

    clearUser() {
        localStorage.removeItem('m-pesewa-user');
        localStorage.removeItem('m-pesewa-token');
        this.currentUser = null;
        this.currentRole = null;
        this.isAuthenticated = false;
        this.updateUIForUnauthenticatedUser();
    }

    async login(credentials) {
        try {
            // Demo authentication - in production, this would be an API call
            const demoUsers = JSON.parse(localStorage.getItem('demoUsers')) || [];
            const user = demoUsers.find(u => 
                u.phone === credentials.phone && 
                u.password === credentials.password &&
                u.country === credentials.country
            );

            if (user) {
                this.currentUser = user;
                this.currentRole = user.role;
                this.isAuthenticated = true;
                this.saveUserToStorage(user);
                this.updateUIForAuthenticatedUser();
                
                // Show success message
                window.showToast('Login successful!', 'success');
                return { success: true, user };
            } else {
                // Fallback demo login for testing
                const demoUser = {
                    id: 'demo-user-' + Date.now(),
                    name: 'Demo User',
                    phone: credentials.phone,
                    country: credentials.country,
                    role: 'borrower',
                    registeredAt: new Date().toISOString()
                };
                
                this.currentUser = demoUser;
                this.currentRole = 'borrower';
                this.isAuthenticated = true;
                this.saveUserToStorage(demoUser);
                this.updateUIForAuthenticatedUser();
                
                window.showToast('Using demo account for testing', 'info');
                return { success: true, user: demoUser };
            }
        } catch (error) {
            console.error('Login error:', error);
            window.showToast('Login failed. Please try again.', 'error');
            return { success: false, error: error.message };
        }
    }

    logout() {
        this.clearUser();
        window.showToast('Logged out successfully', 'success');
        
        // Redirect to home page after logout
        setTimeout(() => {
            if (!window.location.pathname.includes('index.html')) {
                window.location.href = '../index.html';
            }
        }, 1000);
    }

    async register(userData) {
        try {
            // Generate user ID
            const userId = 'user-' + Date.now();
            
            // Create user object
            const newUser = {
                id: userId,
                ...userData,
                registeredAt: new Date().toISOString(),
                status: 'active',
                rating: userData.role === 'borrower' ? 5 : null,
                subscriptionExpiry: userData.role === 'lender' ? this.calculateSubscriptionExpiry() : null
            };

            // Save to localStorage
            const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            existingUsers.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

            // Auto-login after registration
            this.currentUser = newUser;
            this.currentRole = newUser.role;
            this.isAuthenticated = true;
            this.saveUserToStorage(newUser);
            this.updateUIForAuthenticatedUser();

            window.showToast('Registration successful!', 'success');
            return { success: true, user: newUser };
        } catch (error) {
            console.error('Registration error:', error);
            window.showToast('Registration failed. Please try again.', 'error');
            return { success: false, error: error.message };
        }
    }

    calculateSubscriptionExpiry() {
        const today = new Date();
        const expiry = new Date(today.getFullYear(), today.getMonth() + 1, 28);
        return expiry.toISOString();
    }

    updateUIForAuthenticatedUser() {
        // Update header buttons
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (loginBtn && registerBtn) {
            loginBtn.textContent = 'Dashboard';
            loginBtn.onclick = () => this.redirectToDashboard();
            
            registerBtn.textContent = 'Logout';
            registerBtn.onclick = () => this.logout();
            registerBtn.classList.remove('btn-primary');
            registerBtn.classList.add('btn-outline');
        }

        // Update mobile auth buttons if they exist
        const mobileLoginBtn = document.querySelector('.mobile-auth .btn-outline');
        const mobileRegisterBtn = document.querySelector('.mobile-auth .btn-primary');
        
        if (mobileLoginBtn && mobileRegisterBtn) {
            mobileLoginBtn.textContent = 'Dashboard';
            mobileLoginBtn.onclick = () => this.redirectToDashboard();
            
            mobileRegisterBtn.textContent = 'Logout';
            mobileRegisterBtn.onclick = () => this.logout();
            mobileRegisterBtn.classList.remove('btn-primary');
            mobileRegisterBtn.classList.add('btn-outline');
        }
    }

    updateUIForUnauthenticatedUser() {
        // Update header buttons
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (loginBtn && registerBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.onclick = () => {
                const modal = document.getElementById('loginModal');
                if (modal) modal.classList.add('active');
            };
            
            registerBtn.textContent = 'Get Started';
            registerBtn.onclick = () => {
                document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' });
            };
            registerBtn.classList.remove('btn-outline');
            registerBtn.classList.add('btn-primary');
        }

        // Update mobile auth buttons if they exist
        const mobileLoginBtn = document.querySelector('.mobile-auth .btn-outline');
        const mobileRegisterBtn = document.querySelector('.mobile-auth .btn-primary');
        
        if (mobileLoginBtn && mobileRegisterBtn) {
            mobileLoginBtn.textContent = 'Login';
            mobileLoginBtn.onclick = () => {
                const modal = document.getElementById('loginModal');
                if (modal) modal.classList.add('active');
            };
            
            mobileRegisterBtn.textContent = 'Register';
            mobileRegisterBtn.onclick = () => {
                document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' });
            };
            mobileRegisterBtn.classList.remove('btn-outline');
            mobileRegisterBtn.classList.add('btn-primary');
        }
    }

    redirectToDashboard() {
        if (!this.isAuthenticated || !this.currentUser) {
            window.showToast('Please login first', 'warning');
            return;
        }

        const role = this.currentUser.role;
        switch (role) {
            case 'borrower':
                window.location.href = 'pages/dashboard/borrower-dashboard.html';
                break;
            case 'lender':
                window.location.href = 'pages/dashboard/lender-dashboard.html';
                break;
            case 'admin':
                window.location.href = 'pages/dashboard/admin-dashboard.html';
                break;
            default:
                window.showToast('Invalid user role', 'error');
        }
    }

    setupAuthListeners() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const country = document.getElementById('loginCountry').value;
                const phone = document.getElementById('loginPhone').value;
                const password = document.getElementById('loginPassword').value;
                
                if (!country || !phone || !password) {
                    window.showToast('Please fill in all fields', 'error');
                    return;
                }

                const result = await this.login({ country, phone, password });
                if (result.success) {
                    // Close modal
                    const modal = document.getElementById('loginModal');
                    if (modal) modal.classList.remove('active');
                    
                    // Redirect to dashboard
                    setTimeout(() => this.redirectToDashboard(), 1000);
                }
            });
        }

        // Borrower registration
        const borrowerForm = document.getElementById('borrowerRegistration');
        if (borrowerForm) {
            borrowerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = this.collectBorrowerFormData();
                const validation = this.validateBorrowerForm(formData);
                
                if (!validation.valid) {
                    window.showToast(validation.message, 'error');
                    return;
                }

                const userData = {
                    ...formData,
                    role: 'borrower'
                };

                const result = await this.register(userData);
                if (result.success) {
                    borrowerForm.reset();
                    setTimeout(() => this.redirectToDashboard(), 1500);
                }
            });
        }

        // Lender registration
        const lenderForm = document.getElementById('lenderRegistration');
        if (lenderForm) {
            lenderForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = this.collectLenderFormData();
                const validation = this.validateLenderForm(formData);
                
                if (!validation.valid) {
                    window.showToast(validation.message, 'error');
                    return;
                }

                const userData = {
                    ...formData,
                    role: 'lender'
                };

                const result = await this.register(userData);
                if (result.success) {
                    lenderForm.reset();
                    
                    // Simulate payment process
                    window.showToast('Redirecting to payment gateway...', 'info');
                    setTimeout(() => {
                        window.showToast('Payment successful! Account activated.', 'success');
                        setTimeout(() => this.redirectToDashboard(), 1000);
                    }, 2000);
                }
            });
        }
    }

    collectBorrowerFormData() {
        return {
            fullName: document.getElementById('borrowerFullName').value,
            nationalId: document.getElementById('borrowerNationalId').value,
            phone: document.getElementById('borrowerPhone').value,
            email: document.getElementById('borrowerEmail').value,
            country: document.getElementById('borrowerCountry').value,
            location: document.getElementById('borrowerLocation').value,
            occupation: document.getElementById('borrowerOccupation').value,
            nextOfKinPhone: document.getElementById('nextOfKinPhone').value,
            guarantor1Name: document.getElementById('guarantor1Name').value,
            guarantor1Phone: document.getElementById('guarantor1Phone').value,
            guarantor2Name: document.getElementById('guarantor2Name').value,
            guarantor2Phone: document.getElementById('guarantor2Phone').value,
            categories: Array.from(document.querySelectorAll('input[name="borrowerCategories"]:checked'))
                .map(cb => cb.value)
        };
    }

    collectLenderFormData() {
        return {
            fullName: document.getElementById('lenderFullName').value,
            brandName: document.getElementById('lenderBrandName').value,
            phone: document.getElementById('lenderPhone').value,
            email: document.getElementById('lenderEmail').value,
            country: document.getElementById('lenderCountry').value,
            location: document.getElementById('lenderLocation').value,
            subscriptionTier: document.getElementById('selectedTier').value,
            categories: Array.from(document.querySelectorAll('input[name="lenderCategories"]:checked'))
                .map(cb => cb.value)
        };
    }

    validateBorrowerForm(data) {
        const requiredFields = [
            'fullName', 'nationalId', 'phone', 'country', 'location', 
            'occupation', 'nextOfKinPhone', 'guarantor1Name', 
            'guarantor1Phone', 'guarantor2Name', 'guarantor2Phone'
        ];

        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                return {
                    valid: false,
                    message: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`
                };
            }
        }

        // Validate phone numbers
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(data.phone)) {
            return {
                valid: false,
                message: 'Please enter a valid phone number'
            };
        }

        if (!phoneRegex.test(data.guarantor1Phone) || !phoneRegex.test(data.guarantor2Phone)) {
            return {
                valid: false,
                message: 'Please enter valid guarantor phone numbers'
            };
        }

        return { valid: true };
    }

    validateLenderForm(data) {
        const requiredFields = ['fullName', 'phone', 'country', 'location', 'subscriptionTier'];

        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                return {
                    valid: false,
                    message: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`
                };
            }
        }

        // Validate phone number
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(data.phone)) {
            return {
                valid: false,
                message: 'Please enter a valid phone number'
            };
        }

        return { valid: true };
    }

    // Check if user has permission for a specific role
    hasRole(role) {
        return this.isAuthenticated && this.currentRole === role;
    }

    // Check if user has any of the specified roles
    hasAnyRole(roles) {
        return this.isAuthenticated && roles.includes(this.currentRole);
    }

    // Get user's subscription status
    getSubscriptionStatus() {
        if (!this.currentUser || !this.currentUser.subscriptionExpiry) {
            return null;
        }

        const expiry = new Date(this.currentUser.subscriptionExpiry);
        const today = new Date();
        const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        return {
            expiry,
            daysRemaining,
            isExpired: daysRemaining <= 0,
            isExpiringSoon: daysRemaining > 0 && daysRemaining <= 7
        };
    }
}

// Initialize auth service
const authService = new AuthService();

// Export for use in other modules
window.authService = authService;