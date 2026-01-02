// M-PESEWA Main Application JavaScript
'use strict';

// Global State
const AppState = {
    currentUser: null,
    currentRole: null,
    currentCountry: null,
    isLoggedIn: false,
    isAdmin: false
};

// DOM Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const pwaBanner = document.getElementById('pwaBanner');
const dismissBanner = document.getElementById('dismissBanner');
const installApp = document.getElementById('installApp');

// Initialize App
function initApp() {
    loadDemoData();
    setupEventListeners();
    setupRoleTabs();
    setupCountrySelector();
    setupRegistrationForms();
    checkAuthStatus();
    initPWA();
    initAnimations();
}

// Load Demo Data
function loadDemoData() {
    // Load countries data
    fetch('data/countries.json')
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('countries', JSON.stringify(data));
        })
        .catch(error => console.error('Error loading countries:', error));

    // Load categories data
    fetch('data/categories.json')
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('categories', JSON.stringify(data));
        })
        .catch(error => console.error('Error loading categories:', error));

    // Load demo users
    fetch('data/demo-users.json')
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('demoUsers', JSON.stringify(data));
        })
        .catch(error => console.error('Error loading demo users:', error));
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile Menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!mobileMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
            mobileMenu.classList.remove('active');
        }
    });

    // Login/Register
    if (loginBtn) {
        loginBtn.addEventListener('click', showLoginModal);
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            document.getElementById('registration').scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', hideLoginModal);
    }

    // Close modal when clicking outside
    loginModal.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            hideLoginModal();
        }
    });

    // PWA Banner
    if (dismissBanner) {
        dismissBanner.addEventListener('click', dismissPWABanner);
    }
    
    if (installApp) {
        installApp.addEventListener('click', installPWA);
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Borrower Registration Form
    const borrowerForm = document.getElementById('borrowerRegistration');
    if (borrowerForm) {
        borrowerForm.addEventListener('submit', handleBorrowerRegistration);
    }

    // Lender Registration Form
    const lenderForm = document.getElementById('lenderRegistration');
    if (lenderForm) {
        lenderForm.addEventListener('submit', handleLenderRegistration);
    }

    // Country Selector
    const countrySelect = document.getElementById('countrySelect');
    if (countrySelect) {
        countrySelect.addEventListener('change', handleCountryChange);
    }

    // Role Tabs
    document.querySelectorAll('.role-tab').forEach(tab => {
        tab.addEventListener('click', handleRoleTabClick);
    });

    // Tier Selection
    document.querySelectorAll('.tier-card').forEach(card => {
        card.addEventListener('click', handleTierSelection);
    });
}

// Setup Role Tabs
function setupRoleTabs() {
    const tabs = document.querySelectorAll('.role-tab');
    const forms = document.querySelectorAll('.registration-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const role = tab.dataset.role;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show corresponding form
            forms.forEach(form => form.classList.remove('active'));
            
            if (role === 'borrower') {
                document.getElementById('borrowerForm').classList.add('active');
            } else if (role === 'lender') {
                document.getElementById('lenderForm').classList.add('active');
            } else if (role === 'both') {
                // Show both forms or create combined form
                document.getElementById('borrowerForm').classList.add('active');
                // Note: In a real app, you might want a combined form
            }
        });
    });
}

// Setup Country Selector
function setupCountrySelector() {
    const countrySelect = document.getElementById('countrySelect');
    if (!countrySelect) return;

    // Load countries from localStorage or use default
    const countries = JSON.parse(localStorage.getItem('countries')) || [
        { code: 'ke', name: 'Kenya', flag: '🇰🇪', currency: 'KSh' },
        { code: 'ug', name: 'Uganda', flag: '🇺🇬', currency: 'UGX' },
        { code: 'tz', name: 'Tanzania', flag: '🇹🇿', currency: 'TZS' },
        { code: 'rw', name: 'Rwanda', flag: '🇷🇼', currency: 'RWF' },
        { code: 'bi', name: 'Burundi', flag: '🇧🇮', currency: 'BIF' },
        { code: 'so', name: 'Somalia', flag: '🇸🇴', currency: 'SOS' },
        { code: 'ss', name: 'South Sudan', flag: '🇸🇸', currency: 'SSP' },
        { code: 'et', name: 'Ethiopia', flag: '🇪🇹', currency: 'ETB' },
        { code: 'cd', name: 'Congo', flag: '🇨🇬', currency: 'CDF' },
        { code: 'ng', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
        { code: 'za', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR' },
        { code: 'gh', name: 'Ghana', flag: '🇬🇭', currency: 'GHS' }
    ];

    // Clear existing options except first
    while (countrySelect.options.length > 1) {
        countrySelect.remove(1);
    }

    // Add country options
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = `${country.name} ${country.flag}`;
        countrySelect.appendChild(option);
    });
}

// Setup Registration Forms
function setupRegistrationForms() {
    // Setup tier card selection
    document.querySelectorAll('.tier-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.tier-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            document.getElementById('selectedTier').value = card.dataset.tier;
        });
    });

    // Setup loan calculator if present
    const calcAmount = document.getElementById('calcAmount');
    const calcDays = document.getElementById('calcDays');
    const tierButtons = document.querySelectorAll('.tier-btn');
    const amountButtons = document.querySelectorAll('.btn-amount');
    const daysButtons = document.querySelectorAll('.btn-days');

    if (calcAmount && calcDays) {
        calcAmount.addEventListener('input', updateLoanCalculator);
        calcDays.addEventListener('input', updateLoanCalculator);

        amountButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                calcAmount.value = btn.dataset.amount;
                updateLoanCalculator();
            });
        });

        daysButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                calcDays.value = btn.dataset.days;
                updateLoanCalculator();
            });
        });

        tierButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                tierButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                calcAmount.max = btn.dataset.max;
                updateLoanCalculator();
            });
        });

        updateLoanCalculator();
    }
}

// Update Loan Calculator
function updateLoanCalculator() {
    const amount = parseInt(document.getElementById('calcAmount').value) || 0;
    const days = parseInt(document.getElementById('calcDays').value) || 7;
    
    // Update displays
    document.getElementById('amountDisplay').textContent = formatCurrency(amount);
    document.getElementById('daysDisplay').textContent = `${days} day${days !== 1 ? 's' : ''}`;
    
    // Calculate values
    const interestRate = 0.10; // 10%
    const interest = amount * interestRate;
    const total = amount + interest;
    const daily = total / days;
    
    // Update result displays
    document.getElementById('principalAmount').textContent = formatCurrency(amount);
    document.getElementById('interestAmount').textContent = formatCurrency(interest);
    document.getElementById('totalRepayment').textContent = formatCurrency(total);
    document.getElementById('dailyRepayment').textContent = formatCurrency(daily);
}

// Format Currency
function formatCurrency(amount) {
    return `₵${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
}

// Show Login Modal
function showLoginModal() {
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Hide Login Modal
function hideLoginModal() {
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const country = document.getElementById('loginCountry').value;
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!country || !phone || !password) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Simulate login with demo data
    const demoUsers = JSON.parse(localStorage.getItem('demoUsers')) || [];
    const user = demoUsers.find(u => u.phone === phone && u.country === country);
    
    if (user && user.password === password) {
        AppState.currentUser = user;
        AppState.currentRole = user.role;
        AppState.currentCountry = user.country;
        AppState.isLoggedIn = true;
        AppState.isAdmin = user.role === 'admin';
        
        showToast('Login successful!', 'success');
        hideLoginModal();
        
        // Redirect based on role
        setTimeout(() => {
            if (user.role === 'borrower') {
                window.location.href = 'pages/dashboard/borrower-dashboard.html';
            } else if (user.role === 'lender') {
                window.location.href = 'pages/dashboard/lender-dashboard.html';
            } else if (user.role === 'admin') {
                window.location.href = 'pages/dashboard/admin-dashboard.html';
            }
        }, 1000);
    } else {
        showToast('Invalid credentials. Using demo login.', 'error');
        
        // Fallback to demo login for testing
        setTimeout(() => {
            window.location.href = 'pages/dashboard/borrower-dashboard.html';
        }, 1500);
    }
}

// Handle Borrower Registration
function handleBorrowerRegistration(event) {
    event.preventDefault();
    
    // Get form values
    const formData = {
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
    
    // Validate required fields
    const requiredFields = ['fullName', 'nationalId', 'phone', 'country', 'location', 'occupation', 
                          'nextOfKinPhone', 'guarantor1Name', 'guarantor1Phone', 'guarantor2Name', 'guarantor2Phone'];
    
    for (const field of requiredFields) {
        if (!formData[field]) {
            showToast(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
            return;
        }
    }
    
    // Save to localStorage (simulating registration)
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const newUser = {
        ...formData,
        id: generateId(),
        role: 'borrower',
        registeredAt: new Date().toISOString(),
        rating: 5,
        status: 'active'
    };
    
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    showToast('Borrower registration successful!', 'success');
    
    // Reset form
    event.target.reset();
    
    // Redirect to dashboard after delay
    setTimeout(() => {
        AppState.currentUser = newUser;
        AppState.currentRole = 'borrower';
        AppState.currentCountry = newUser.country;
        AppState.isLoggedIn = true;
        window.location.href = 'pages/dashboard/borrower-dashboard.html';
    }, 1500);
}

// Handle Lender Registration
function handleLenderRegistration(event) {
    event.preventDefault();
    
    // Get form values
    const formData = {
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
    
    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'country', 'location', 'subscriptionTier'];
    
    for (const field of requiredFields) {
        if (!formData[field]) {
            showToast(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
            return;
        }
    }
    
    // Save to localStorage (simulating registration)
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const newUser = {
        ...formData,
        id: generateId(),
        role: 'lender',
        registeredAt: new Date().toISOString(),
        subscriptionExpiry: calculateSubscriptionExpiry(),
        status: 'pending_payment'
    };
    
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    showToast('Lender registration submitted! Redirecting to payment...', 'success');
    
    // Simulate payment redirect
    setTimeout(() => {
        // In a real app, this would redirect to payment gateway
        newUser.status = 'active';
        newUser.subscriptionExpiry = calculateSubscriptionExpiry();
        
        // Update user status
        const updatedUsers = users.map(u => u.id === newUser.id ? newUser : u);
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        
        AppState.currentUser = newUser;
        AppState.currentRole = 'lender';
        AppState.currentCountry = newUser.country;
        AppState.isLoggedIn = true;
        
        window.location.href = 'pages/dashboard/lender-dashboard.html';
    }, 2000);
}

// Calculate Subscription Expiry
function calculateSubscriptionExpiry() {
    const today = new Date();
    const expiry = new Date(today.getFullYear(), today.getMonth() + 1, 28);
    return expiry.toISOString();
}

// Handle Country Change
function handleCountryChange(event) {
    const countryCode = event.target.value;
    if (countryCode) {
        AppState.currentCountry = countryCode;
        // In a real app, you might update content based on country
        showToast(`Country changed to ${event.target.options[event.target.selectedIndex].text}`, 'info');
    }
}

// Handle Role Tab Click
function handleRoleTabClick(event) {
    const role = event.target.dataset.role;
    const tabs = document.querySelectorAll('.role-tab');
    const forms = document.querySelectorAll('.registration-form');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    forms.forEach(form => form.classList.remove('active'));
    
    if (role === 'borrower') {
        document.getElementById('borrowerForm').classList.add('active');
    } else if (role === 'lender') {
        document.getElementById('lenderForm').classList.add('active');
    } else if (role === 'both') {
        // For demo purposes, show lender form
        document.getElementById('lenderForm').classList.add('active');
    }
}

// Handle Tier Selection
function handleTierSelection(event) {
    const tierCard = event.target.closest('.tier-card');
    if (!tierCard) return;
    
    document.querySelectorAll('.tier-card').forEach(card => card.classList.remove('active'));
    tierCard.classList.add('active');
    document.getElementById('selectedTier').value = tierCard.dataset.tier;
}

// Check Auth Status
function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        AppState.currentUser = user;
        AppState.currentRole = user.role;
        AppState.currentCountry = user.country;
        AppState.isLoggedIn = true;
        AppState.isAdmin = user.role === 'admin';
        
        // Update UI for logged in user
        if (loginBtn && registerBtn) {
            loginBtn.textContent = 'Dashboard';
            loginBtn.onclick = () => {
                if (user.role === 'borrower') {
                    window.location.href = 'pages/dashboard/borrower-dashboard.html';
                } else if (user.role === 'lender') {
                    window.location.href = 'pages/dashboard/lender-dashboard.html';
                } else if (user.role === 'admin') {
                    window.location.href = 'pages/dashboard/admin-dashboard.html';
                }
            };
            
            registerBtn.textContent = 'Logout';
            registerBtn.onclick = handleLogout;
            registerBtn.classList.remove('btn-primary');
            registerBtn.classList.add('btn-outline');
        }
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    AppState.currentUser = null;
    AppState.currentRole = null;
    AppState.isLoggedIn = false;
    AppState.isAdmin = false;
    
    // Reset UI
    if (loginBtn && registerBtn) {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = showLoginModal;
        
        registerBtn.textContent = 'Get Started';
        registerBtn.onclick = () => {
            document.getElementById('registration').scrollIntoView({ behavior: 'smooth' });
        };
        registerBtn.classList.remove('btn-outline');
        registerBtn.classList.add('btn-primary');
    }
    
    showToast('Logged out successfully', 'success');
    
    // Reload page to update state
    setTimeout(() => location.reload(), 1000);
}

// Initialize PWA
function initPWA() {
    // Check if PWA is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        pwaBanner.classList.remove('active');
        return;
    }
    
    // Check if deferredPrompt exists (for install banner)
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        window.deferredPrompt = event;
        
        // Show install banner
        setTimeout(() => {
            pwaBanner.classList.add('active');
        }, 3000);
    });
    
    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
        pwaBanner.classList.remove('active');
        window.deferredPrompt = null;
        showToast('App installed successfully!', 'success');
    });
}

// Dismiss PWA Banner
function dismissPWABanner() {
    pwaBanner.classList.remove('active');
    localStorage.setItem('pwaBannerDismissed', 'true');
}

// Install PWA
function installPWA() {
    if (!window.deferredPrompt) {
        showToast('App installation not available', 'error');
        return;
    }
    
    window.deferredPrompt.prompt();
    
    window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        window.deferredPrompt = null;
        pwaBanner.classList.remove('active');
    });
}

// Initialize Animations
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements with scroll-reveal class
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
    
    // Add scroll-reveal class to sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('scroll-reveal');
    });
}

// Show Toast Notification
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
    
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icons for different toast types
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
            <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Add close button functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    });
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }, 5000);
}

// Generate Unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export for use in other modules
window.AppState = AppState;
window.showToast = showToast;