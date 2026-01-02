// Debt Collectors Management Module
'use strict';

class CollectorsManager {
    constructor() {
        this.collectors = [];
        this.filteredCollectors = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.filters = {
            country: 'all',
            city: '',
            name: '',
            status: 'all'
        };
        this.init();
    }

    async init() {
        await this.loadCollectors();
        this.setupEventListeners();
        this.renderCollectors();
        this.renderStats();
        this.updatePagination();
    }

    async loadCollectors() {
        try {
            const response = await fetch('../data/collectors.json');
            const data = await response.json();
            this.collectors = data.collectors || this.getDefaultCollectors();
            this.filteredCollectors = [...this.collectors];
        } catch (error) {
            console.error('Error loading collectors:', error);
            this.collectors = this.getDefaultCollectors();
            this.filteredCollectors = [...this.collectors];
        }
    }

    getDefaultCollectors() {
        const countries = ['kenya', 'uganda', 'tanzania', 'rwanda', 'ghana', 'nigeria', 'south-africa'];
        const cities = {
            'kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
            'uganda': ['Kampala', 'Entebbe', 'Jinja', 'Gulu'],
            'tanzania': ['Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma'],
            'rwanda': ['Kigali', 'Butare', 'Gisenyi', 'Ruhengeri'],
            'ghana': ['Accra', 'Kumasi', 'Tamale', 'Takoradi'],
            'nigeria': ['Lagos', 'Abuja', 'Port Harcourt', 'Kano'],
            'south-africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria']
        };

        const names = [
            'James Kariuki', 'Sarah Mwangi', 'David Ochieng', 'Grace Akinyi',
            'Michael Odhiambo', 'Esther Wanjiru', 'Peter Kamau', 'Mercy Atieno',
            'John Okoth', 'Jane Adhiambo', 'Robert Mburu', 'Mary Wangari',
            'William Maina', 'Elizabeth Njeri', 'Joseph Kimani', 'Susan Nyambura',
            'Charles Kiprop', 'Margaret Wambui', 'Thomas Chege', 'Dorothy Muthoni'
        ];

        const collectors = [];
        
        for (let i = 0; i < 200; i++) {
            const country = countries[Math.floor(Math.random() * countries.length)];
            const city = cities[country][Math.floor(Math.random() * cities[country].length)];
            const name = names[Math.floor(Math.random() * names.length)];
            
            collectors.push({
                id: `collector-${i + 1}`,
                name: name,
                email: `${name.toLowerCase().replace(/ /g, '.')}@debtcollection.co.ke`,
                phone: `+2547${Math.floor(Math.random() * 90000000 + 10000000)}`,
                country: country,
                city: city,
                company: `Debt Solutions ${city}`,
                experience: `${Math.floor(Math.random() * 15) + 1} years`,
                successRate: `${Math.floor(Math.random() * 30) + 70}%`,
                status: Math.random() > 0.2 ? 'active' : 'inactive',
                verified: Math.random() > 0.3,
                languages: ['English', Math.random() > 0.5 ? 'Swahili' : null, Math.random() > 0.7 ? 'French' : null].filter(Boolean),
                services: [
                    'Loan Recovery',
                    'Asset Recovery',
                    'Legal Consultation',
                    'Mediation',
                    'Skip Tracing'
                ].slice(0, Math.floor(Math.random() * 3) + 2),
                rating: (Math.random() * 2 + 3).toFixed(1),
                casesCompleted: Math.floor(Math.random() * 500) + 50,
                hourlyRate: `$${Math.floor(Math.random() * 100) + 50}`,
                minCaseSize: `$${Math.floor(Math.random() * 5000) + 1000}`,
                availability: Math.random() > 0.3 ? 'Available' : 'Limited',
                joined: `${Math.floor(Math.random() * 5) + 2019}`
            });
        }

        return collectors;
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('collectorSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.name = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Country filter
        const countryFilter = document.getElementById('countryFilter');
        if (countryFilter) {
            countryFilter.addEventListener('change', (e) => {
                this.filters.country = e.target.value;
                this.applyFilters();
            });
        }

        // City filter
        const cityFilter = document.getElementById('cityFilter');
        if (cityFilter) {
            cityFilter.addEventListener('change', (e) => {
                this.filters.city = e.target.value;
                this.applyFilters();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.applyFilters();
            });
        }

        // Sort options
        const sortSelect = document.getElementById('sortCollectors');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortCollectors(e.target.value);
            });
        }

        // Clear filters
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Export button
        const exportBtn = document.getElementById('exportCollectors');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportCollectors();
            });
        }

        // Contact collector buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('contact-collector-btn')) {
                const collectorId = e.target.dataset.collectorId;
                this.contactCollector(collectorId);
            }
        });

        // View details buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-collector-details-btn')) {
                const collectorId = e.target.dataset.collectorId;
                this.viewCollectorDetails(collectorId);
            }
        });

        // Pagination
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-link')) {
                const page = parseInt(e.target.dataset.page);
                this.goToPage(page);
            }
        });
    }

    applyFilters() {
        this.filteredCollectors = this.collectors.filter(collector => {
            // Name filter
            if (this.filters.name && !collector.name.toLowerCase().includes(this.filters.name)) {
                return false;
            }

            // Country filter
            if (this.filters.country !== 'all' && collector.country !== this.filters.country) {
                return false;
            }

            // City filter
            if (this.filters.city && collector.city !== this.filters.city) {
                return false;
            }

            // Status filter
            if (this.filters.status !== 'all' && collector.status !== this.filters.status) {
                return false;
            }

            return true;
        });

        this.currentPage = 1;
        this.renderCollectors();
        this.renderStats();
        this.updatePagination();
    }

    clearFilters() {
        this.filters = {
            country: 'all',
            city: '',
            name: '',
            status: 'all'
        };

        const searchInput = document.getElementById('collectorSearch');
        if (searchInput) searchInput.value = '';

        const countryFilter = document.getElementById('countryFilter');
        if (countryFilter) countryFilter.value = 'all';

        const cityFilter = document.getElementById('cityFilter');
        if (cityFilter) cityFilter.value = '';

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) statusFilter.value = 'all';

        this.applyFilters();
    }

    sortCollectors(sortBy) {
        switch (sortBy) {
            case 'name-asc':
                this.filteredCollectors.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                this.filteredCollectors.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'rating-desc':
                this.filteredCollectors.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
                break;
            case 'success-desc':
                this.filteredCollectors.sort((a, b) => {
                    const aRate = parseInt(a.successRate);
                    const bRate = parseInt(b.successRate);
                    return bRate - aRate;
                });
                break;
            case 'experience-desc':
                this.filteredCollectors.sort((a, b) => {
                    const aExp = parseInt(a.experience);
                    const bExp = parseInt(b.experience);
                    return bExp - aExp;
                });
                break;
            case 'cases-desc':
                this.filteredCollectors.sort((a, b) => b.casesCompleted - a.casesCompleted);
                break;
        }

        this.currentPage = 1;
        this.renderCollectors();
        this.updatePagination();
    }

    renderCollectors() {
        const container = document.getElementById('collectorsList');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const collectorsToShow = this.filteredCollectors.slice(startIndex, endIndex);

        if (collectorsToShow.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3 class="empty-state-title">No Collectors Found</h3>
                    <p class="empty-state-description">
                        No debt collectors match your current filters. Try adjusting your search criteria.
                    </p>
                    <button class="btn btn-primary" id="clearFilters">
                        Clear Filters
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = collectorsToShow.map(collector => `
            <div class="collector-card">
                <div class="collector-card-header">
                    <div class="collector-avatar">💼</div>
                    <div class="collector-info">
                        <h4 class="collector-name">${collector.name}</h4>
                        <div class="collector-company">${collector.company}</div>
                        <div class="collector-location">
                            <span class="country-flag">${this.getCountryFlag(collector.country)}</span>
                            ${collector.city}, ${this.getCountryName(collector.country)}
                        </div>
                    </div>
                    <div class="collector-status">
                        <span class="status-badge ${collector.status}">${collector.status}</span>
                        ${collector.verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                    </div>
                </div>
                
                <div class="collector-card-body">
                    <div class="collector-stats">
                        <div class="stat">
                            <span class="stat-label">Success Rate</span>
                            <span class="stat-value ${parseInt(collector.successRate) > 85 ? 'high' : 'medium'}">${collector.successRate}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Experience</span>
                            <span class="stat-value">${collector.experience}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Rating</span>
                            <span class="stat-value">${collector.rating}/5.0</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Cases</span>
                            <span class="stat-value">${collector.casesCompleted}</span>
                        </div>
                    </div>
                    
                    <div class="collector-services">
                        <h5>Services Offered:</h5>
                        <div class="services-list">
                            ${collector.services.map(service => `
                                <span class="service-tag">${service}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="collector-contact">
                        <div class="contact-info">
                            <span class="contact-label">Phone:</span>
                            <span class="contact-value">${collector.phone}</span>
                        </div>
                        <div class="contact-info">
                            <span class="contact-label">Email:</span>
                            <span class="contact-value">${collector.email}</span>
                        </div>
                        <div class="contact-info">
                            <span class="contact-label">Languages:</span>
                            <span class="contact-value">${collector.languages.join(', ')}</span>
                        </div>
                    </div>
                    
                    <div class="collector-pricing">
                        <span class="pricing-item">Hourly Rate: ${collector.hourlyRate}</span>
                        <span class="pricing-item">Min Case: ${collector.minCaseSize}</span>
                        <span class="pricing-item">Availability: ${collector.availability}</span>
                    </div>
                </div>
                
                <div class="collector-card-footer">
                    <button class="btn btn-outline view-collector-details-btn" data-collector-id="${collector.id}">
                        View Details
                    </button>
                    <button class="btn btn-primary contact-collector-btn" data-collector-id="${collector.id}">
                        Contact
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderStats() {
        const statsContainer = document.getElementById('collectorsStats');
        if (!statsContainer) return;

        const total = this.filteredCollectors.length;
        const active = this.filteredCollectors.filter(c => c.status === 'active').length;
        const verified = this.filteredCollectors.filter(c => c.verified).length;
        const avgRating = total > 0 ? 
            (this.filteredCollectors.reduce((sum, c) => sum + parseFloat(c.rating), 0) / total).toFixed(1) : 0;
        const avgSuccessRate = total > 0 ?
            Math.round(this.filteredCollectors.reduce((sum, c) => sum + parseInt(c.successRate), 0) / total) : 0;

        const countries = [...new Set(this.filteredCollectors.map(c => c.country))];
        const cities = [...new Set(this.filteredCollectors.map(c => c.city))];

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-icon">👥</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${total}</div>
                        <div class="stat-card-label">Collectors</div>
                        <div class="stat-card-subtext">${active} active</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-icon">⭐</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${avgRating}/5.0</div>
                        <div class="stat-card-label">Avg Rating</div>
                        <div class="stat-card-subtext">Based on client reviews</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-icon">🏆</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${avgSuccessRate}%</div>
                        <div class="stat-card-label">Avg Success Rate</div>
                        <div class="stat-card-subtext">Case completion rate</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-icon">✓</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${verified}</div>
                        <div class="stat-card-label">Verified</div>
                        <div class="stat-card-subtext">${verified > 0 ? Math.round((verified/total)*100) : 0}% of total</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-icon">🌍</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">${countries.length}</div>
                        <div class="stat-card-label">Countries</div>
                        <div class="stat-card-subtext">${cities.length} cities</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-icon">💼</div>
                    <div class="stat-card-content">
                        <div class="stat-card-value">6+</div>
                        <div class="stat-card-label">Services</div>
                        <div class="stat-card-subtext">Loan recovery, mediation, etc.</div>
                    </div>
                </div>
            </div>
        `;
    }

    updatePagination() {
        const pagination = document.getElementById('collectorsPagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredCollectors.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="page-link ${this.currentPage === 1 ? 'disabled' : ''}" 
                    data-page="${this.currentPage - 1}" ${this.currentPage === 1 ? 'disabled' : ''}>
                &laquo; Previous
            </button>
        `;

        // Page numbers
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-link ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button class="page-link ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    data-page="${this.currentPage + 1}" ${this.currentPage === totalPages ? 'disabled' : ''}>
                Next &raquo;
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    goToPage(page) {
        if (page < 1 || page > Math.ceil(this.filteredCollectors.length / this.itemsPerPage)) {
            return;
        }

        this.currentPage = page;
        this.renderCollectors();
        this.updatePagination();
        
        // Scroll to top of list
        const listContainer = document.getElementById('collectorsList');
        if (listContainer) {
            listContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    contactCollector(collectorId) {
        const collector = this.collectors.find(c => c.id === collectorId);
        if (!collector) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title">Contact ${collector.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="collector-contact-info">
                        <div class="contact-method">
                            <div class="method-icon">📞</div>
                            <div class="method-details">
                                <h5>Phone Number</h5>
                                <p>${collector.phone}</p>
                                <button class="btn-text copy-contact-btn" data-text="${collector.phone}">
                                    Copy Phone
                                </button>
                            </div>
                        </div>
                        
                        <div class="contact-method">
                            <div class="method-icon">📧</div>
                            <div class="method-details">
                                <h5>Email Address</h5>
                                <p>${collector.email}</p>
                                <button class="btn-text copy-contact-btn" data-text="${collector.email}">
                                    Copy Email
                                </button>
                            </div>
                        </div>
                        
                        <div class="contact-method">
                            <div class="method-icon">🏢</div>
                            <div class="method-details">
                                <h5>Company</h5>
                                <p>${collector.company}</p>
                                <p>${collector.city}, ${this.getCountryName(collector.country)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="contact-form">
                        <h4>Send Message</h4>
                        <form id="contactCollectorForm">
                            <div class="form-group">
                                <label for="contactName">Your Name *</label>
                                <input type="text" id="contactName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="contactPhone">Your Phone *</label>
                                <input type="tel" id="contactPhone" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="contactEmail">Your Email</label>
                                <input type="email" id="contactEmail" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="caseType">Case Type *</label>
                                <select id="caseType" class="form-control" required>
                                    <option value="">Select case type</option>
                                    <option value="loan-recovery">Loan Recovery</option>
                                    <option value="asset-recovery">Asset Recovery</option>
                                    <option value="debt-mediation">Debt Mediation</option>
                                    <option value="legal-consultation">Legal Consultation</option>
                                    <option value="skip-tracing">Skip Tracing</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="caseAmount">Case Amount (Approx.)</label>
                                <input type="text" id="caseAmount" class="form-control" placeholder="e.g., $5,000">
                            </div>
                            <div class="form-group">
                                <label for="caseDescription">Case Description *</label>
                                <textarea id="caseDescription" class="form-control" rows="4" required 
                                          placeholder="Describe the debt case, including borrower details, amount owed, and timeline..."></textarea>
                            </div>
                            
                            <div class="terms-agreement">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="agreeTerms" required>
                                    <span>
                                        I understand that M-PESEWA only provides contact information for debt collectors and is not involved in recovery activities.
                                        All agreements and terms are between me and the debt collector.
                                    </span>
                                </label>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="sendMessageBtn">
                        Send Message
                    </button>
                    <button class="btn btn-outline close-modal">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Copy buttons
        modal.querySelectorAll('.copy-contact-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.target.dataset.text;
                navigator.clipboard.writeText(text);
                window.showToast('Copied to clipboard', 'success');
            });
        });

        // Send message
        modal.querySelector('#sendMessageBtn').addEventListener('click', () => {
            const form = modal.querySelector('#contactCollectorForm');
            const name = form.querySelector('#contactName').value;
            const phone = form.querySelector('#contactPhone').value;
            const caseType = form.querySelector('#caseType').value;
            const description = form.querySelector('#caseDescription').value;

            if (!name || !phone || !caseType || !description) {
                window.showToast('Please fill in all required fields', 'error');
                return;
            }

            // Simulate sending message
            const messageData = {
                collectorId: collector.id,
                collectorName: collector.name,
                clientName: name,
                clientPhone: phone,
                caseType: caseType,
                caseAmount: form.querySelector('#caseAmount').value,
                description: description,
                timestamp: new Date().toISOString()
            };

            console.log('Contact message sent:', messageData);
            
            this.closeModal(modal);
            window.showToast('Message sent to collector! They will contact you within 24 hours.', 'success');
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    viewCollectorDetails(collectorId) {
        const collector = this.collectors.find(c => c.id === collectorId);
        if (!collector) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3 class="modal-title">${collector.name}</h3>
                    <div class="collector-tags">
                        <span class="status-badge ${collector.status}">${collector.status}</span>
                        ${collector.verified ? '<span class="verified-badge">✓ Verified Collector</span>' : ''}
                    </div>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="collector-details-view">
                        <div class="collector-header">
                            <div class="collector-avatar-large">💼</div>
                            <div class="collector-header-info">
                                <div class="collector-company-large">${collector.company}</div>
                                <div class="collector-location-large">
                                    <span class="country-flag">${this.getCountryFlag(collector.country)}</span>
                                    ${collector.city}, ${this.getCountryName(collector.country)}
                                </div>
                                <div class="collector-experience">
                                    <span>${collector.experience} experience</span>
                                    <span>•</span>
                                    <span>Joined ${collector.joined}</span>
                                    <span>•</span>
                                    <span>${collector.availability}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="collector-stats-detailed">
                            <div class="stat-card-detailed">
                                <div class="stat-icon">🏆</div>
                                <div class="stat-content">
                                    <div class="stat-value-large">${collector.successRate}</div>
                                    <div class="stat-label">Success Rate</div>
                                </div>
                            </div>
                            <div class="stat-card-detailed">
                                <div class="stat-icon">⭐</div>
                                <div class="stat-content">
                                    <div class="stat-value-large">${collector.rating}/5.0</div>
                                    <div class="stat-label">Client Rating</div>
                                </div>
                            </div>
                            <div class="stat-card-detailed">
                                <div class="stat-icon">📋</div>
                                <div class="stat-content">
                                    <div class="stat-value-large">${collector.casesCompleted}</div>
                                    <div class="stat-label">Cases Completed</div>
                                </div>
                            </div>
                            <div class="stat-card-detailed">
                                <div class="stat-icon">💵</div>
                                <div class="stat-content">
                                    <div class="stat-value-large">${collector.hourlyRate}</div>
                                    <div class="stat-label">Hourly Rate</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="collector-services-detailed">
                            <h4>Services Offered</h4>
                            <div class="services-grid">
                                ${collector.services.map(service => `
                                    <div class="service-card">
                                        <div class="service-icon">⚖️</div>
                                        <div class="service-name">${service}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="collector-languages">
                            <h4>Languages Spoken</h4>
                            <div class="languages-list">
                                ${collector.languages.map(lang => `
                                    <span class="language-tag">${lang}</span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="collector-contact-detailed">
                            <h4>Contact Information</h4>
                            <div class="contact-grid">
                                <div class="contact-item">
                                    <span class="contact-label">Phone:</span>
                                    <span class="contact-value">${collector.phone}</span>
                                    <button class="btn-text copy-btn" data-text="${collector.phone}">Copy</button>
                                </div>
                                <div class="contact-item">
                                    <span class="contact-label">Email:</span>
                                    <span class="contact-value">${collector.email}</span>
                                    <button class="btn-text copy-btn" data-text="${collector.email}">Copy</button>
                                </div>
                                <div class="contact-item">
                                    <span class="contact-label">Location:</span>
                                    <span class="contact-value">${collector.city}, ${this.getCountryName(collector.country)}</span>
                                </div>
                                <div class="contact-item">
                                    <span class="contact-label">Company:</span>
                                    <span class="contact-value">${collector.company}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="collector-pricing-detailed">
                            <h4>Pricing & Terms</h4>
                            <div class="pricing-grid">
                                <div class="pricing-item">
                                    <span class="pricing-label">Hourly Rate:</span>
                                    <span class="pricing-value">${collector.hourlyRate}</span>
                                </div>
                                <div class="pricing-item">
                                    <span class="pricing-label">Minimum Case Size:</span>
                                    <span class="pricing-value">${collector.minCaseSize}</span>
                                </div>
                                <div class="pricing-item">
                                    <span class="pricing-label">Success Fee:</span>
                                    <span class="pricing-value">15-30% of recovered amount</span>
                                </div>
                                <div class="pricing-item">
                                    <span class="pricing-label">Retainer Required:</span>
                                    <span class="pricing-value">${Math.random() > 0.5 ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="collector-process">
                            <h4>Recovery Process</h4>
                            <div class="process-steps">
                                <div class="process-step">
                                    <div class="step-number">1</div>
                                    <div class="step-content">
                                        <h5>Initial Consultation</h5>
                                        <p>Free 30-minute consultation to discuss your case and determine feasibility.</p>
                                    </div>
                                </div>
                                <div class="process-step">
                                    <div class="step-number">2</div>
                                    <div class="step-content">
                                        <h5>Case Assessment</h5>
                                        <p>Thorough review of debt details, documentation, and recovery options.</p>
                                    </div>
                                </div>
                                <div class="process-step">
                                    <div class="step-number">3</div>
                                    <div class="step-content">
                                        <h5>Recovery Strategy</h5>
                                        <p>Development of customized recovery plan with clear timeline and costs.</p>
                                    </div>
                                </div>
                                <div class="process-step">
                                    <div class="step-number">4</div>
                                    <div class="step-content">
                                        <h5>Execution & Updates</h5>
                                        <p>Regular updates throughout the recovery process with transparent communication.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="collector-verification">
                            <h4>Verification & Compliance</h4>
                            <div class="verification-list">
                                <div class="verification-item">
                                    <span class="verification-icon">✓</span>
                                    <span>Identity verified through government ID</span>
                                </div>
                                <div class="verification-item">
                                    <span class="verification-icon">✓</span>
                                    <span>Business license and registration verified</span>
                                </div>
                                <div class="verification-item">
                                    <span class="verification-icon">✓</span>
                                    <span>No criminal record (police clearance)</span>
                                </div>
                                <div class="verification-item">
                                    <span class="verification-icon">✓</span>
                                    <span>Professional liability insurance</span>
                                </div>
                                <div class="verification-item">
                                    <span class="verification-icon">✓</span>
                                    <span>Compliance with debt collection regulations</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary contact-collector-btn" data-collector-id="${collector.id}">
                        Contact ${collector.name}
                    </button>
                    <button class="btn btn-outline close-modal">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Copy buttons
        modal.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.target.dataset.text;
                navigator.clipboard.writeText(text);
                window.showToast('Copied to clipboard', 'success');
            });
        });

        // Contact button
        const contactBtn = modal.querySelector('.contact-collector-btn');
        contactBtn.addEventListener('click', () => {
            this.closeModal(modal);
            this.contactCollector(collector.id);
        });

        // Close modal
        const closeModal = () => this.closeModal(modal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    exportCollectors() {
        const data = this.filteredCollectors.map(collector => ({
            Name: collector.name,
            Company: collector.company,
            Phone: collector.phone,
            Email: collector.email,
            Location: `${collector.city}, ${this.getCountryName(collector.country)}`,
            Status: collector.status,
            'Success Rate': collector.successRate,
            Rating: collector.rating,
            Experience: collector.experience,
            'Cases Completed': collector.casesCompleted,
            Services: collector.services.join(', '),
            Languages: collector.languages.join(', '),
            Verified: collector.verified ? 'Yes' : 'No'
        }));

        // Create CSV
        const csvContent = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debt-collectors-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        window.showToast('Collectors list exported successfully', 'success');
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
            'congo': '🇨🇩',
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

    closeModal(modal) {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    }
}

// Initialize collectors manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.collectors-page') || 
        document.querySelector('#collectors-section')) {
        window.collectorsManager = new CollectorsManager();
    }
});