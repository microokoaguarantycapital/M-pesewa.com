// Loan Calculator Module
'use strict';

class LoanCalculator {
    constructor() {
        this.tiers = {
            basic: { max: 1500, weeklyLimit: 1500 },
            premium: { max: 5000, weeklyLimit: 5000 },
            super: { max: 20000, weeklyLimit: 20000 },
            'lender-of-lenders': { max: 50000, monthlyLimit: 50000 }
        };
        this.currentTier = 'premium';
        this.interestRate = 0.10; // 10% per week
        this.penaltyRate = 0.05;  // 5% daily penalty after 7 days
        this.defaultPeriod = 60;  // 60 days (2 months) for default
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserTier();
        this.updateCalculator();
    }

    setupEventListeners() {
        // Tier selection
        document.addEventListener('change', (e) => {
            if (e.target.name === 'tierSelect') {
                this.currentTier = e.target.value;
                this.updateCalculator();
            }
        });

        // Amount input
        const amountInput = document.getElementById('loanAmount');
        if (amountInput) {
            amountInput.addEventListener('input', () => this.updateCalculator());
        }

        // Repayment period
        const periodInput = document.getElementById('repaymentPeriod');
        if (periodInput) {
            periodInput.addEventListener('input', () => this.updateCalculator());
        }

        // Calculate button
        const calculateBtn = document.getElementById('calculateLoan');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.updateCalculator());
        }

        // Reset button
        const resetBtn = document.getElementById('resetCalculator');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetCalculator());
        }

        // Print button
        const printBtn = document.getElementById('printCalculation');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printCalculation());
        }

        // Share button
        const shareBtn = document.getElementById('shareCalculation');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareCalculation());
        }
    }

    loadUserTier() {
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
        if (userData.subscriptionTier) {
            this.currentTier = userData.subscriptionTier;
            
            // Update tier selector if exists
            const tierSelect = document.querySelector('[name="tierSelect"]');
            if (tierSelect) {
                tierSelect.value = this.currentTier;
            }
        }
    }

    updateCalculator() {
        const amount = parseFloat(document.getElementById('loanAmount')?.value) || 0;
        const period = parseInt(document.getElementById('repaymentPeriod')?.value) || 7;
        
        // Validate amount against tier limits
        const tier = this.tiers[this.currentTier];
        const maxAmount = tier.weeklyLimit || tier.monthlyLimit || tier.max;
        
        if (amount > maxAmount) {
            window.showToast(`Amount exceeds ${this.currentTier} tier limit of ${maxAmount}`, 'error');
            document.getElementById('loanAmount').value = maxAmount;
            return this.updateCalculator();
        }

        // Calculate interest
        const interest = amount * this.interestRate;
        const totalWithInterest = amount + interest;
        
        // Calculate daily repayment for 7 days
        const dailyRepayment = totalWithInterest / 7;
        
        // Calculate penalties if period > 7 days
        let penalty = 0;
        let totalWithPenalty = totalWithInterest;
        
        if (period > 7) {
            const penaltyDays = period - 7;
            penalty = totalWithInterest * this.penaltyRate * penaltyDays;
            totalWithPenalty = totalWithInterest + penalty;
        }

        // Determine if loan would be in default
        const isDefault = period > this.defaultPeriod;
        
        // Update display
        this.updateDisplay({
            amount,
            period,
            interest,
            dailyRepayment,
            penalty,
            totalWithInterest,
            totalWithPenalty,
            isDefault,
            tier: this.currentTier,
            maxAmount
        });

        // Update charts
        this.updateCharts(amount, interest, penalty);
        
        // Update repayment schedule
        this.generateRepaymentSchedule(amount, interest, period, penalty);
    }

    updateDisplay(data) {
        // Update basic calculations
        const updateElement = (id, value, isCurrency = true) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = isCurrency ? this.formatCurrency(value) : value;
            }
        };

        updateElement('loanAmountDisplay', data.amount);
        updateElement('loanPeriodDisplay', data.period, false);
        updateElement('interestAmount', data.interest);
        updateElement('dailyRepaymentAmount', data.dailyRepayment);
        updateElement('penaltyAmount', data.penalty);
        updateElement('totalRepayment', data.totalWithPenalty);
        updateElement('weeklyTotal', data.totalWithInterest);

        // Update tier info
        const tierInfo = document.getElementById('tierInfo');
        if (tierInfo) {
            const tier = this.tiers[data.tier];
            const limit = tier.weeklyLimit || tier.monthlyLimit || tier.max;
            tierInfo.innerHTML = `
                <strong>${this.getTierName(data.tier)}</strong><br>
                Max: ${this.formatCurrency(limit)}${tier.weeklyLimit ? '/week' : tier.monthlyLimit ? '/month' : ''}
            `;
        }

        // Update default warning
        const defaultWarning = document.getElementById('defaultWarning');
        if (defaultWarning) {
            if (data.isDefault) {
                defaultWarning.style.display = 'block';
                defaultWarning.innerHTML = `
                    ⚠️ <strong>Loan in Default</strong><br>
                    This loan period (${data.period} days) exceeds the 60-day default period.
                    Borrower would be blacklisted.
                `;
            } else {
                defaultWarning.style.display = 'none';
            }
        }

        // Update penalty warning
        const penaltyWarning = document.getElementById('penaltyWarning');
        if (penaltyWarning) {
            if (data.period > 7) {
                penaltyWarning.style.display = 'block';
                penaltyWarning.innerHTML = `
                    ⚠️ <strong>Penalty Applied</strong><br>
                    ${data.period - 7} day(s) beyond 7-day period incurring 5% daily penalty.
                `;
            } else {
                penaltyWarning.style.display = 'none';
            }
        }

        // Update amount slider if exists
        const amountSlider = document.getElementById('loanAmountSlider');
        if (amountSlider) {
            amountSlider.value = data.amount;
            amountSlider.max = data.maxAmount;
        }

        // Update period slider if exists
        const periodSlider = document.getElementById('repaymentPeriodSlider');
        if (periodSlider) {
            periodSlider.value = data.period;
        }
    }

    updateCharts(principal, interest, penalty) {
        // Pie chart for loan composition
        const pieChart = document.getElementById('loanPieChart');
        if (pieChart && typeof Chart !== 'undefined') {
            const ctx = pieChart.getContext('2d');
            
            // Destroy existing chart
            if (window.loanPieChart) {
                window.loanPieChart.destroy();
            }

            window.loanPieChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Principal', 'Interest (10%)', 'Penalty (5%/day)'],
                    datasets: [{
                        data: [principal, interest, penalty],
                        backgroundColor: [
                            '#0A65FC', // Blue for principal
                            '#20BF6F', // Green for interest
                            '#FF9F1C'  // Orange for penalty
                        ],
                        borderWidth: 2,
                        borderColor: '#FFFFFF'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const value = context.raw;
                                    const total = principal + interest + penalty;
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: ${this.formatCurrency(value)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Repayment timeline chart
        const timelineChart = document.getElementById('repaymentTimeline');
        if (timelineChart && typeof Chart !== 'undefined') {
            const ctx = timelineChart.getContext('2d');
            
            // Destroy existing chart
            if (window.timelineChart) {
                window.timelineChart.destroy();
            }

            const period = parseInt(document.getElementById('repaymentPeriod')?.value) || 7;
            const dailyAmount = (principal + interest) / 7;
            const labels = Array.from({length: period}, (_, i) => `Day ${i + 1}`);
            const data = Array.from({length: period}, (_, i) => {
                if (i < 7) {
                    return dailyAmount;
                } else {
                    // Apply penalty for days beyond 7
                    const penaltyDays = i - 6;
                    return dailyAmount + (dailyAmount * this.penaltyRate * penaltyDays);
                }
            });

            window.timelineChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Daily Repayment Amount',
                        data: data,
                        backgroundColor: (context) => {
                            const index = context.dataIndex;
                            return index < 7 ? '#20BF6F' : '#FF9F1C';
                        },
                        borderColor: '#FFFFFF',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Amount'
                            },
                            ticks: {
                                callback: (value) => this.formatCurrency(value)
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Day'
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    return `Day ${context.dataIndex + 1}: ${this.formatCurrency(context.raw)}`;
                                }
                            }
                        },
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    generateRepaymentSchedule(principal, interest, period, penalty) {
        const scheduleContainer = document.getElementById('repaymentSchedule');
        if (!scheduleContainer) return;

        const totalInterest = interest + penalty;
        const dailyAmount = (principal + interest) / 7;
        
        let scheduleHTML = `
            <table class="repayment-table">
                <thead>
                    <tr>
                        <th>Day</th>
                        <th>Amount Due</th>
                        <th>Cumulative</th>
                        <th>Status</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let cumulative = 0;
        for (let day = 1; day <= period; day++) {
            let amountDue = dailyAmount;
            let notes = '';
            
            if (day > 7) {
                const penaltyDays = day - 7;
                const penaltyAmount = dailyAmount * this.penaltyRate * penaltyDays;
                amountDue += penaltyAmount;
                notes = `Includes penalty for ${penaltyDays} day(s) overdue`;
            }
            
            cumulative += amountDue;
            
            scheduleHTML += `
                <tr>
                    <td>Day ${day}</td>
                    <td>${this.formatCurrency(amountDue)}</td>
                    <td>${this.formatCurrency(cumulative)}</td>
                    <td>
                        <span class="status-badge ${day <= 7 ? 'on-time' : 'overdue'}">
                            ${day <= 7 ? 'On Time' : 'Overdue'}
                        </span>
                    </td>
                    <td>${notes}</td>
                </tr>
            `;
        }

        scheduleHTML += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2"><strong>Total Repayment:</strong></td>
                        <td colspan="3"><strong>${this.formatCurrency(principal + interest + penalty)}</strong></td>
                    </tr>
                    <tr>
                        <td colspan="2">Principal:</td>
                        <td colspan="3">${this.formatCurrency(principal)}</td>
                    </tr>
                    <tr>
                        <td colspan="2">Interest (10%):</td>
                        <td colspan="3">${this.formatCurrency(interest)}</td>
                    </tr>
                    <tr>
                        <td colspan="2">Penalty (5%/day after day 7):</td>
                        <td colspan="3">${this.formatCurrency(penalty)}</td>
                    </tr>
                </tfoot>
            </table>
        `;

        scheduleContainer.innerHTML = scheduleHTML;
    }

    resetCalculator() {
        // Reset inputs to defaults
        const amountInput = document.getElementById('loanAmount');
        if (amountInput) {
            amountInput.value = 1000;
        }

        const periodInput = document.getElementById('repaymentPeriod');
        if (periodInput) {
            periodInput.value = 7;
        }

        const tierSelect = document.querySelector('[name="tierSelect"]');
        if (tierSelect) {
            tierSelect.value = 'premium';
            this.currentTier = 'premium';
        }

        // Update calculator
        this.updateCalculator();
        
        window.showToast('Calculator reset to defaults', 'info');
    }

    printCalculation() {
        const printContent = document.getElementById('calculatorResults');
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>M-PESEWA Loan Calculation</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #0A65FC; }
                        .calculation-summary { 
                            border: 1px solid #ccc; 
                            padding: 20px; 
                            margin: 20px 0;
                            border-radius: 8px;
                        }
                        .summary-item { 
                            display: flex; 
                            justify-content: space-between; 
                            margin: 10px 0;
                            padding: 8px 0;
                            border-bottom: 1px solid #eee;
                        }
                        .warning { 
                            background-color: #FFF3CD; 
                            border: 1px solid #FFEAA7; 
                            padding: 15px; 
                            border-radius: 4px;
                            margin: 15px 0;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin: 20px 0;
                        }
                        th, td { 
                            border: 1px solid #ddd; 
                            padding: 12px; 
                            text-align: left;
                        }
                        th { 
                            background-color: #0A65FC; 
                            color: white;
                        }
                        .footer { 
                            margin-top: 30px; 
                            text-align: center; 
                            color: #666; 
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <h1>M-PESEWA Loan Calculation</h1>
                    <p>Generated: ${new Date().toLocaleString()}</p>
                    
                    <div class="calculation-summary">
                        <h2>Summary</h2>
                        <div class="summary-item">
                            <span>Loan Amount:</span>
                            <span>${document.getElementById('loanAmountDisplay')?.textContent || 'N/A'}</span>
                        </div>
                        <div class="summary-item">
                            <span>Repayment Period:</span>
                            <span>${document.getElementById('loanPeriodDisplay')?.textContent || 'N/A'} days</span>
                        </div>
                        <div class="summary-item">
                            <span>Interest (10%):</span>
                            <span>${document.getElementById('interestAmount')?.textContent || 'N/A'}</span>
                        </div>
                        <div class="summary-item">
                            <span>Daily Repayment:</span>
                            <span>${document.getElementById('dailyRepaymentAmount')?.textContent || 'N/A'}</span>
                        </div>
                        <div class="summary-item">
                            <span>Penalty (if any):</span>
                            <span>${document.getElementById('penaltyAmount')?.textContent || 'N/A'}</span>
                        </div>
                        <div class="summary-item">
                            <strong>Total Repayment:</strong>
                            <strong>${document.getElementById('totalRepayment')?.textContent || 'N/A'}</strong>
                        </div>
                    </div>
                    
                    <div id="printSchedule"></div>
                    
                    <div class="footer">
                        <p>M-PESEWA - Emergency Micro-Lending in Trusted Circles</p>
                        <p>This is a simulated calculation. Actual loan terms may vary.</p>
                        <p>For more information, visit the M-PESEWA platform.</p>
                    </div>
                </body>
            </html>
        `);

        // Add repayment schedule to print
        const scheduleContainer = printWindow.document.getElementById('printSchedule');
        if (scheduleContainer) {
            const scheduleTable = document.querySelector('.repayment-table');
            if (scheduleTable) {
                scheduleContainer.innerHTML = '<h2>Repayment Schedule</h2>' + scheduleTable.outerHTML;
            }
        }

        printWindow.document.close();
        printWindow.print();
    }

    shareCalculation() {
        const amount = document.getElementById('loanAmountDisplay')?.textContent || 'N/A';
        const period = document.getElementById('loanPeriodDisplay')?.textContent || 'N/A';
        const total = document.getElementById('totalRepayment')?.textContent || 'N/A';

        const text = `M-PESEWA Loan Calculation:\n` +
                     `Loan: ${amount}\n` +
                     `Period: ${period} days\n` +
                     `Total Repayment: ${total}\n` +
                     `\nCalculate your loan: ${window.location.origin}${window.location.pathname}`;

        if (navigator.share) {
            navigator.share({
                title: 'M-PESEWA Loan Calculation',
                text: text,
                url: window.location.href
            }).catch(error => {
                console.log('Error sharing:', error);
                this.copyToClipboard(text);
            });
        } else {
            this.copyToClipboard(text);
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            window.showToast('Calculation copied to clipboard', 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            window.showToast('Failed to copy to clipboard', 'error');
        });
    }

    getTierName(tier) {
        const names = {
            'basic': 'Basic Tier',
            'premium': 'Premium Tier',
            'super': 'Super Tier',
            'lender-of-lenders': 'Lender of Lenders'
        };
        return names[tier] || tier;
    }

    formatCurrency(amount) {
        const userData = JSON.parse(localStorage.getItem('m-pesewa-user') || '{}');
        const country = userData.country || 'kenya';
        
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
            'nigeria': '₦',
            'south-africa': 'R',
            'ghana': 'GH₵'
        };
        
        const currency = currencies[country] || '₵';
        return `${currency} ${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.calculator-section') || 
        document.querySelector('#calculator') ||
        window.location.pathname.includes('calculator')) {
        window.loanCalculator = new LoanCalculator();
    }
});