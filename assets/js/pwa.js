// Progressive Web App Functionality
'use strict';

class PWAHandler {
    constructor() {
        this.deferredPrompt = null;
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        this.installButton = null;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOfflineDetection();
        this.setupAppBadge();
        this.setupPeriodicSync();
        this.setupShareTarget();
        this.checkForUpdates();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('../service-worker.js', {
                    scope: './'
                });

                console.log('Service Worker registered with scope:', registration.scope);

                // Update found, refresh page
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });

                // Track service worker state
                if (registration.installing) {
                    console.log('Service worker installing');
                } else if (registration.waiting) {
                    console.log('Service worker installed');
                } else if (registration.active) {
                    console.log('Service worker active');
                }

                // Handle messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event.data);
                });

            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    setupInstallPrompt() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallBanner();
            this.deferredPrompt = null;
            
            // Show confirmation
            window.showToast('M-PESEWA installed successfully!', 'success');
            
            // Track installation
            this.trackInstallation();
        });

        // Setup install button if it exists
        this.installButton = document.getElementById('installApp');
        if (this.installButton) {
            this.installButton.addEventListener('click', () => {
                this.promptInstall();
            });
        }

        // Dismiss banner
        const dismissBtn = document.getElementById('dismissBanner');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                this.hideInstallBanner();
                localStorage.setItem('pwa-banner-dismissed', 'true');
            });
        }
    }

    showInstallBanner() {
        // Check if already dismissed
        if (localStorage.getItem('pwa-banner-dismissed') === 'true') {
            return;
        }

        // Check if already installed
        if (this.isStandalone) {
            return;
        }

        const banner = document.getElementById('pwaBanner');
        if (banner) {
            banner.style.display = 'flex';
            
            // Auto-hide after 30 seconds
            setTimeout(() => {
                if (banner.style.display === 'flex') {
                    this.hideInstallBanner();
                    localStorage.setItem('pwa-banner-dismissed', 'true');
                }
            }, 30000);
        }
    }

    hideInstallBanner() {
        const banner = document.getElementById('pwaBanner');
        if (banner) {
            banner.style.display = 'none';
        }
    }

    async promptInstall() {
        if (!this.deferredPrompt) {
            return;
        }

        this.deferredPrompt.prompt();
        
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        this.deferredPrompt = null;
        this.hideInstallBanner();
    }

    setupOfflineDetection() {
        // Update online/offline status
        const updateOnlineStatus = () => {
            const isOnline = navigator.onLine;
            document.documentElement.classList.toggle('offline', !isOnline);
            
            if (!isOnline) {
                this.showOfflineIndicator();
                this.cacheCriticalData();
            } else {
                this.hideOfflineIndicator();
                this.syncPendingActions();
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus(); // Initial check
    }

    showOfflineIndicator() {
        let indicator = document.getElementById('offlineIndicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offlineIndicator';
            indicator.className = 'offline-indicator';
            indicator.innerHTML = `
                <div class="offline-content">
                    <span class="offline-icon">📶</span>
                    <span class="offline-text">You are offline. Some features may be limited.</span>
                </div>
            `;
            document.body.appendChild(indicator);
        }

        indicator.classList.add('visible');
        
        // Add offline styles
        const style = document.createElement('style');
        style.id = 'offline-styles';
        style.textContent = `
            .offline-indicator {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 20px;
                text-align: center;
                z-index: 10000;
                transform: translateY(-100%);
                transition: transform 0.3s ease;
            }
            
            .offline-indicator.visible {
                transform: translateY(0);
            }
            
            .offline-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .offline-icon {
                font-size: 1.2em;
            }
            
            .offline-text {
                font-weight: 500;
            }
            
            body.offline .online-only {
                opacity: 0.5;
                pointer-events: none;
            }
        `;
        
        if (!document.getElementById('offline-styles')) {
            document.head.appendChild(style);
        }
    }

    hideOfflineIndicator() {
        const indicator = document.getElementById('offlineIndicator');
        if (indicator) {
            indicator.classList.remove('visible');
            
            // Remove after animation
            setTimeout(() => {
                if (indicator && !indicator.classList.contains('visible')) {
                    indicator.remove();
                }
            }, 300);
        }
    }

    async cacheCriticalData() {
        if ('caches' in window) {
            try {
                const cache = await caches.open('m-pesewa-critical');
                
                // Cache critical pages
                const criticalPages = [
                    '../index.html',
                    '../pages/dashboard/borrower-dashboard.html',
                    '../pages/dashboard/lender-dashboard.html',
                    '../assets/css/main.css',
                    '../assets/css/components.css',
                    '../assets/js/app.js',
                    '../assets/js/utils.js'
                ];

                await cache.addAll(criticalPages);
                
                // Cache critical data
                const criticalData = [
                    '../data/categories.json',
                    '../data/subscriptions.json'
                ];

                await cache.addAll(criticalData);
                
                console.log('Critical data cached for offline use');
            } catch (error) {
                console.error('Failed to cache critical data:', error);
            }
        }
    }

    async syncPendingActions() {
        // Sync any pending actions from localStorage
        const pendingActions = JSON.parse(localStorage.getItem('pending-actions') || '[]');
        
        if (pendingActions.length > 0) {
            window.showToast(`Syncing ${pendingActions.length} pending actions...`, 'info');
            
            for (const action of pendingActions) {
                try {
                    // Simulate API call
                    await this.simulateAPICall(action);
                    console.log('Synced action:', action);
                } catch (error) {
                    console.error('Failed to sync action:', action, error);
                }
            }
            
            // Clear synced actions
            localStorage.setItem('pending-actions', JSON.stringify([]));
            window.showToast('All pending actions synced!', 'success');
        }
    }

    async simulateAPICall(action) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In a real app, this would be an actual API call
        console.log('API call simulated for:', action);
        return { success: true };
    }

    setupAppBadge() {
        if ('setAppBadge' in navigator) {
            // Update badge count based on notifications
            this.updateBadgeCount();
            
            // Listen for notification events
            document.addEventListener('notification', (e) => {
                this.updateBadgeCount();
            });
        }
    }

    async updateBadgeCount() {
        if ('setAppBadge' in navigator) {
            try {
                // Get unread notifications count from localStorage
                const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
                const unreadCount = notifications.filter(n => !n.read).length;
                
                if (unreadCount > 0) {
                    await navigator.setAppBadge(unreadCount);
                } else {
                    await navigator.clearAppBadge();
                }
            } catch (error) {
                console.error('Failed to update app badge:', error);
            }
        }
    }

    setupPeriodicSync() {
        if ('periodicSync' in navigator && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(async (registration) => {
                try {
                    // Request permission for periodic sync
                    const status = await navigator.permissions.query({
                        name: 'periodic-background-sync'
                    });

                    if (status.state === 'granted') {
                        // Register periodic sync
                        await registration.periodicSync.register('sync-data', {
                            minInterval: 24 * 60 * 60 * 1000 // 24 hours
                        });
                        console.log('Periodic sync registered');
                    }
                } catch (error) {
                    console.error('Periodic sync failed:', error);
                }
            });
        }
    }

    setupShareTarget() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            // Check if this is a share target
            const urlParams = new URLSearchParams(window.location.search);
            const sharedText = urlParams.get('text');
            const sharedUrl = urlParams.get('url');
            
            if (sharedText || sharedUrl) {
                this.handleSharedContent(sharedText, sharedUrl);
            }
        }
    }

    handleSharedContent(text, url) {
        // Handle shared content from other apps
        console.log('Shared content received:', { text, url });
        
        // Show notification
        window.showToast('Content shared to M-PESEWA', 'info');
        
        // You could redirect to a specific page or show a modal
        // For now, just log it
        const shareData = {
            text: text,
            url: url,
            timestamp: new Date().toISOString()
        };
        
        // Save shared content for later use
        localStorage.setItem('last-shared-content', JSON.stringify(shareData));
    }

    checkForUpdates() {
        // Check for updates every hour
        setInterval(() => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.update();
                });
            }
        }, 60 * 60 * 1000); // 1 hour
    }

    showUpdateAvailable() {
        const updateDialog = document.createElement('div');
        updateDialog.className = 'modal active';
        updateDialog.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">Update Available</h3>
                </div>
                <div class="modal-body">
                    <div class="update-message">
                        <div class="update-icon">🔄</div>
                        <h4>A new version of M-PESEWA is available!</h4>
                        <p>Refresh to get the latest features and improvements.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="refreshAppBtn">
                        Refresh Now
                    </button>
                    <button class="btn btn-outline" id="updateLaterBtn">
                        Later
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(updateDialog);
        document.body.style.overflow = 'hidden';

        // Refresh button
        updateDialog.querySelector('#refreshAppBtn').addEventListener('click', () => {
            window.location.reload();
        });

        // Later button
        updateDialog.querySelector('#updateLaterBtn').addEventListener('click', () => {
            document.body.removeChild(updateDialog);
            document.body.style.overflow = '';
        });
    }

    handleServiceWorkerMessage(message) {
        switch (message.type) {
            case 'NEW_CONTENT_AVAILABLE':
                this.showUpdateAvailable();
                break;
                
            case 'BACKGROUND_SYNC_COMPLETED':
                console.log('Background sync completed:', message.data);
                break;
                
            case 'PUSH_RECEIVED':
                this.handlePushNotification(message.data);
                break;
                
            case 'OFFLINE_ACTION_QUEUED':
                this.queueOfflineAction(message.data);
                break;
        }
    }

    handlePushNotification(data) {
        // Show notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(data.title || 'M-PESEWA', {
                body: data.body || 'New notification',
                icon: '../assets/images/logo-192.png',
                badge: '../assets/images/badge-72.png'
            });
        }
        
        // Also show in-app notification
        window.showToast(data.body || 'New notification', 'info');
        
        // Update badge count
        this.updateBadgeCount();
    }

    queueOfflineAction(action) {
        const pendingActions = JSON.parse(localStorage.getItem('pending-actions') || '[]');
        pendingActions.push({
            ...action,
            timestamp: new Date().toISOString(),
            id: 'action-' + Date.now()
        });
        localStorage.setItem('pending-actions', JSON.stringify(pendingActions));
        
        window.showToast('Action queued for when you\'re back online', 'info');
    }

    trackInstallation() {
        // Track installation in localStorage
        const installs = JSON.parse(localStorage.getItem('pwa-installs') || '[]');
        installs.push({
            date: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform
        });
        localStorage.setItem('pwa-installs', JSON.stringify(installs));
    }

    // Utility method to check PWA capabilities
    static checkPWASupport() {
        const supports = {
            serviceWorker: 'serviceWorker' in navigator,
            pushNotifications: 'PushManager' in window,
            backgroundSync: 'SyncManager' in window,
            periodicSync: 'periodicSync' in navigator,
            appBadge: 'setAppBadge' in navigator,
            shareTarget: 'serviceWorker' in navigator && navigator.serviceWorker.controller,
            installPrompt: 'onbeforeinstallprompt' in window,
            standalone: window.matchMedia('(display-mode: standalone)').matches
        };

        return supports;
    }

    // Method to request notification permission
    static async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                console.log('Notification permission granted');
                return true;
            } else {
                console.log('Notification permission denied');
                return false;
            }
        }
        return false;
    }

    // Method to request background sync permission
    static async requestBackgroundSync() {
        if ('SyncManager' in window && 'serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('sync-actions');
                return true;
            } catch (error) {
                console.error('Background sync registration failed:', error);
                return false;
            }
        }
        return false;
    }
}

// Initialize PWA when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if PWA features are supported
    const pwaSupport = PWAHandler.checkPWASupport();
    
    if (pwaSupport.serviceWorker || pwaSupport.installPrompt) {
        window.pwaHandler = new PWAHandler();
        
        // Add PWA capabilities badge to footer if in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const pwaBadge = document.createElement('div');
            pwaBadge.className = 'pwa-capabilities-badge';
            pwaBadge.innerHTML = `
                <details>
                    <summary>PWA Capabilities</summary>
                    <pre>${JSON.stringify(pwaSupport, null, 2)}</pre>
                </details>
            `;
            pwaBadge.style.cssText = `
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: #333;
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 9999;
                max-width: 300px;
                cursor: pointer;
            `;
            document.body.appendChild(pwaBadge);
        }
    }
});

// Expose PWA methods globally for other scripts
window.requestNotificationPermission = PWAHandler.requestNotificationPermission;
window.requestBackgroundSync = PWAHandler.requestBackgroundSync;
window.checkPWASupport = PWAHandler.checkPWASupport;