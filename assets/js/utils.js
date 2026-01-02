// Shared Utilities and Constants
'use strict';

class Utils {
    constructor() {
        this.countries = this.getCountries();
        this.categories = this.getCategories();
        this.subscriptionTiers = this.getSubscriptionTiers();
        this.currencies = this.getCurrencies();
    }

    // Country-related utilities
    getCountries() {
        return [
            { id: 'kenya', name: 'Kenya', code: 'KE', flag: '🇰🇪', currency: 'KSh', phoneCode: '+254' },
            { id: 'uganda', name: 'Uganda', code: 'UG', flag: '🇺🇬', currency: 'UGX', phoneCode: '+256' },
            { id: 'tanzania', name: 'Tanzania', code: 'TZ', flag: '🇹🇿', currency: 'TZS', phoneCode: '+255' },
            { id: 'rwanda', name: 'Rwanda', code: 'RW', flag: '🇷🇼', currency: 'RWF', phoneCode: '+250' },
            { id: 'burundi', name: 'Burundi', code: 'BI', flag: '🇧🇮', currency: 'BIF', phoneCode: '+257' },
            { id: 'somalia', name: 'Somalia', code: 'SO', flag: '🇸🇴', currency: 'SOS', phoneCode: '+252' },
            { id: 'south-sudan', name: 'South Sudan', code: 'SS', flag: '🇸🇸', currency: 'SSP', phoneCode: '+211' },
            { id: 'ethiopia', name: 'Ethiopia', code: 'ET', flag: '🇪🇹', currency: 'ETB', phoneCode: '+251' },
            { id: 'congo', name: 'Congo (DRC)', code: 'CD', flag: '🇨🇩', currency: 'CDF', phoneCode: '+243' },
            { id: 'nigeria', name: 'Nigeria', code: 'NG', flag: '🇳🇬', currency: 'NGN', phoneCode: '+234' },
            { id: 'south-africa', name: 'South Africa', code: 'ZA', flag: '🇿🇦', currency: 'ZAR', phoneCode: '+27' },
            { id: 'ghana', name: 'Ghana', code: 'GH', flag: '🇬🇭', currency: 'GHS', phoneCode: '+233' }
        ];
    }

    getCountryById(id) {
        return this.countries.find(country => country.id === id);
    }

    getCountryName(id) {
        const country = this.getCountryById(id);
        return country ? country.name : 'Unknown Country';
    }

    getCountryFlag(id) {
        const country = this.getCountryById(id);
        return country ? country.flag : '🌍';
    }

    getCurrency(id) {
        const country = this.getCountryById(id);
        return country ? country.currency : '₵';
    }

    // Category utilities
    getCategories() {
        return [
            { id: 'transport', name: 'Transport (Fare)', icon: '🚌', color: '#0A65FC' },
            { id: 'airtime', name: 'Airtime/Credit', icon: '📱', color: '#20BF6F' },
            { id: 'internet', name: 'Wi-Fi/Internet', icon: '🌐', color: '#FF9F1C' },
            { id: 'cooking', name: 'Cooking Gas', icon: '🔥', color: '#FF4401' },
            { id: 'food', name: 'Food', icon: '🍲', color: '#6B6B6B' },
            { id: 'advance', name: 'Advance Loan', icon: '💼', color: '#061257' },
            { id: 'credo', name: 'Credo (Repairs/Tools)', icon: '🛠️', color: '#333333' },
            { id: 'water', name: 'Water Bill', icon: '💧', color: '#0A65FC' },
            { id: 'fuel', name: 'Bike/Car/Tuktuk Fuel', icon: '⛽', color: '#FF9F1C' },
            { id: 'repair', name: 'Bike/Car/Tuktuk Repair', icon: '🔧', color: '#6B6B6B' },
            { id: 'medicine', name: 'Medicine', icon: '💊', color: '#FF4401' },
            { id: 'electricity', name: 'Electricity Tokens', icon: '💡', color: '#FF9F1C' },
            { id: 'school', name: 'School Fees', icon: '🎓', color: '#20BF6F' },
            { id: 'tv', name: 'TV Subscription', icon: '📺', color: '#0A65FC' }
        ];
    }

    getCategoryById(id) {
        return this.categories.find(category => category.id === id);
    }

    getCategoryName(id) {
        const category = this.getCategoryById(id);
        return category ? category.name : 'Unknown Category';
    }

    getCategoryIcon(id) {
        const category = this.getCategoryById(id);
        return category ? category.icon : '💰';
    }

    getCategoryColor(id) {
        const category = this.getCategoryById(id);
        return category ? category.color : '#0A65FC';
    }

    // Subscription tier utilities
    getSubscriptionTiers() {
        return {
            basic: {
                name: 'Basic',
                weeklyLimit: 1500,
                monthly: 50,
                biAnnual: 250,
                annual: 500,
                color: '#0A65FC',
                crb: false
            },
            premium: {
                name: 'Premium',
                weeklyLimit: 5000,
                monthly: 250,
                biAnnual: 1500,
                annual: 2500,
                color: '#20BF6F',
                crb: false
            },
            super: {
                name: 'Super',
                weeklyLimit: 20000,
                monthly: 1000,
                biAnnual: 5000,
                annual: 8500,
                color: '#FF9F1C',
                crb: true
            },
            'lender-of-lenders': {
                name: 'Lender of Lenders',
                monthlyLimit: 50000,
                monthly: 500,
                biAnnual: 3500,
                annual: 6500,
                color: '#061257',
                crb: true
            }
        };
    }

    getTierById(id) {
        return this.subscriptionTiers[id];
    }

    getTierName(id) {
        const tier = this.getTierById(id);
        return tier ? tier.name : 'Unknown Tier';
    }

    // Currency formatting
    getCurrencies() {
        return {
            'kenya': { symbol: 'KSh', code: 'KES', name: 'Kenyan Shilling' },
            'uganda': { symbol: 'UGX', code: 'UGX', name: 'Ugandan Shilling' },
            'tanzania': { symbol: 'TZS', code: 'TZS', name: 'Tanzanian Shilling' },
            'rwanda': { symbol: 'FRw', code: 'RWF', name: 'Rwandan Franc' },
            'burundi': { symbol: 'FBu', code: 'BIF', name: 'Burundian Franc' },
            'somalia': { symbol: 'SOS', code: 'SOS', name: 'Somali Shilling' },
            'south-sudan': { symbol: 'SSP', code: 'SSP', name: 'South Sudanese Pound' },
            'ethiopia': { symbol: 'Br', code: 'ETB', name: 'Ethiopian Birr' },
            'congo': { symbol: 'FC', code: 'CDF', name: 'Congolese Franc' },
            'nigeria': { symbol: '₦', code: 'NGN', name: 'Nigerian Naira' },
            'south-africa': { symbol: 'R', code: 'ZAR', name: 'South African Rand' },
            'ghana': { symbol: 'GH₵', code: 'GHS', name: 'Ghanaian Cedi' }
        };
    }

    formatCurrency(amount, countryId = 'kenya') {
        const currency = this.currencies[countryId] || { symbol: '₵', code: 'USD' };
        const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return `${currency.symbol} ${formattedAmount}`;
    }

    formatDate(date, format = 'medium') {
        const d = new Date(date);
        
        if (format === 'short') {
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } else if (format === 'long') {
            return d.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    formatRelativeTime(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return this.formatDate(date, 'short');
    }

    // Validation utilities
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        // Basic international phone validation
        const re = /^\+[1-9]\d{1,14}$/;
        return re.test(phone);
    }

    validatePassword(password) {
        // Minimum 8 characters, maximum 12, at least one uppercase, one lowercase, one number
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,12}$/;
        return re.test(password);
    }

    validateNationalId(id, country) {
        // Country-specific ID validation (simplified)
        const patterns = {
            'kenya': /^\d{8,9}$/, // 8-9 digits
            'uganda': /^\d{14}$/, // 14 digits
            'tanzania': /^\d{20}$/, // 20 digits
            'rwanda': /^\d{16}$/, // 16 digits
            'ghana': /^GHA-\d{9}-\d{1}$/ // GHA-123456789-1 format
        };
        
        const pattern = patterns[country] || /^\d{6,20}$/;
        return pattern.test(id);
    }

    // Date calculation utilities
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    addWeeks(date, weeks) {
        return this.addDays(date, weeks * 7);
    }

    addMonths(date, months) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }

    getDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Loan calculation utilities
    calculateInterest(amount, days = 7, interestRate = 0.10) {
        // 10% interest per week
        const weeks = days / 7;
        return amount * interestRate * weeks;
    }

    calculatePenalty(amount, overdueDays, penaltyRate = 0.05) {
        // 5% daily penalty after 7 days
        return amount * penaltyRate * overdueDays;
    }

    calculateTotalRepayment(amount, days) {
        const interest = this.calculateInterest(amount, Math.min(days, 7));
        let penalty = 0;
        
        if (days > 7) {
            const overdueDays = days - 7;
            penalty = this.calculatePenalty(amount + interest, overdueDays);
        }
        
        return {
            principal: amount,
            interest: interest,
            penalty: penalty,
            total: amount + interest + penalty,
            daily: (amount + interest + penalty) / days
        };
    }

    // LocalStorage utilities
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    clearStorage() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // User session utilities
    getCurrentUser() {
        return this.getItem('m-pesewa-user', null);
    }

    setCurrentUser(user) {
        return this.setItem('m-pesewa-user', user);
    }

    clearCurrentUser() {
        return this.removeItem('m-pesewa-user');
    }

    isLoggedIn() {
        const user = this.getCurrentUser();
        return !!user && !!user.id;
    }

    getUserRole() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    }

    // Navigation utilities
    navigateTo(path, data = null) {
        if (data) {
            sessionStorage.setItem('navigation-data', JSON.stringify(data));
        }
        window.location.href = path;
    }

    getNavigationData() {
        const data = sessionStorage.getItem('navigation-data');
        sessionStorage.removeItem('navigation-data');
        return data ? JSON.parse(data) : null;
    }

    // UI utilities
    showLoading(message = 'Loading...') {
        let loader = document.getElementById('global-loader');
        
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'global-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <div class="loader-text">${message}</div>
                </div>
            `;
            document.body.appendChild(loader);
            
            // Add loader styles
            const style = document.createElement('style');
            style.textContent = `
                .global-loader {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                }
                
                .loader-content {
                    text-align: center;
                    padding: 30px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                }
                
                .loader-spinner {
                    width: 50px;
                    height: 50px;
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #0A65FC;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                
                .loader-text {
                    font-size: 16px;
                    color: #333;
                    font-weight: 500;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        loader.style.display = 'flex';
    }

    hideLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });

        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getToastIcon(type)}</span>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close">&times;</button>
        `;

        // Add toast styles if not already added
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-width: 300px;
                    max-width: 400px;
                    z-index: 10000;
                    transform: translateX(150%);
                    transition: transform 0.3s ease;
                    border-left: 4px solid;
                }
                
                .toast.show {
                    transform: translateX(0);
                }
                
                .toast-info {
                    border-left-color: #0A65FC;
                }
                
                .toast-success {
                    border-left-color: #20BF6F;
                }
                
                .toast-error {
                    border-left-color: #FF4401;
                }
                
                .toast-warning {
                    border-left-color: #FF9F1C;
                }
                
                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .toast-icon {
                    font-size: 1.2em;
                }
                
                .toast-message {
                    font-size: 14px;
                    color: #333;
                }
                
                .toast-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                    margin-left: 15px;
                }
                
                .toast-close:hover {
                    color: #333;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.hideToast(toast);
        });

        // Auto-hide
        if (duration > 0) {
            setTimeout(() => {
                this.hideToast(toast);
            }, duration);
        }

        return toast;
    }

    hideToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    getToastIcon(type) {
        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️'
        };
        return icons[type] || 'ℹ️';
    }

    // Form utilities
    serializeForm(form) {
        const data = {};
        const formData = new FormData(form);
        
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        const errors = [];

        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                errors.push(`${input.name || input.id} is required`);
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }

            // Email validation
            if (input.type === 'email' && input.value) {
                if (!this.validateEmail(input.value)) {
                    isValid = false;
                    errors.push('Invalid email address');
                    input.classList.add('error');
                }
            }

            // Phone validation
            if (input.type === 'tel' && input.value) {
                if (!this.validatePhone(input.value)) {
                    isValid = false;
                    errors.push('Invalid phone number format');
                    input.classList.add('error');
                }
            }

            // Password validation
            if (input.type === 'password' && input.value) {
                if (!this.validatePassword(input.value)) {
                    isValid = false;
                    errors.push('Password must be 8-12 characters with uppercase, lowercase, and number');
                    input.classList.add('error');
                }
            }
        });

        return { isValid, errors };
    }

    // Network utilities
    async fetchWithTimeout(resource, options = {}) {
        const { timeout = 10000 } = options;
        
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(id);
        return response;
    }

    async fetchJSON(url, options = {}) {
        try {
            const response = await this.fetchWithTimeout(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    // Performance utilities
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`Performance ${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    }

    // Export utility for CSV/Excel
    exportToCSV(data, filename) {
        if (!data || data.length === 0) {
            console.error('No data to export');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const cell = row[header];
                return typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename || 'export'}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Create global instance
window.utils = new Utils();

// Expose utility functions globally for easy access
window.formatCurrency = (amount, country) => window.utils.formatCurrency(amount, country);
window.formatDate = (date, format) => window.utils.formatDate(date, format);
window.formatRelativeTime = (date) => window.utils.formatRelativeTime(date);
window.showToast = (message, type, duration) => window.utils.showToast(message, type, duration);
window.showLoading = (message) => window.utils.showLoading(message);
window.hideLoading = () => window.utils.hideLoading();
window.validateEmail = (email) => window.utils.validateEmail(email);
window.validatePhone = (phone) => window.utils.validatePhone(phone);
window.validatePassword = (password) => window.utils.validatePassword(password);
window.getCurrentUser = () => window.utils.getCurrentUser();
window.isLoggedIn = () => window.utils.isLoggedIn();
window.getUserRole = () => window.utils.getUserRole();
window.navigateTo = (path, data) => window.utils.navigateTo(path, data);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Auto-hide loading spinner if present
    window.utils.hideLoading();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const saveBtn = document.querySelector('[data-action="save"]');
            if (saveBtn) saveBtn.click();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.active');
            if (openModal) {
                const closeBtn = openModal.querySelector('.modal-close, .close-modal');
                if (closeBtn) closeBtn.click();
            }
        }
    });
});