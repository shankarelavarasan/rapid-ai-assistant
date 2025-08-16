/**
 * Payment Service - Global Payment Processing & Revenue Management
 * Handles payments, subscriptions, revenue tracking, and multi-currency support
 */

class PaymentService {
    constructor() {
        this.transactions = new Map();
        this.subscriptions = new Map();
        this.paymentMethods = new Map();
        this.currencies = new Map();
        
        // Initialize supported currencies
        this.initializeCurrencies();
        
        // Payment providers
        this.providers = {
            stripe: { enabled: true, regions: ['US', 'EU', 'CA', 'AU'] },
            razorpay: { enabled: true, regions: ['IN', 'MY', 'SG'] },
            paypal: { enabled: true, regions: ['global'] },
            alipay: { enabled: true, regions: ['CN', 'HK', 'TW'] },
            paytm: { enabled: true, regions: ['IN'] },
            gcash: { enabled: true, regions: ['PH'] },
            dana: { enabled: true, regions: ['ID'] }
        };
        
        // Subscription plans
        this.subscriptionPlans = new Map();
        this.initializeSubscriptionPlans();
        
        // Revenue metrics
        this.revenueMetrics = {
            totalRevenue: 0,
            monthlyRecurringRevenue: 0,
            averageRevenuePerUser: 0,
            churnRate: 0,
            lifetimeValue: 0,
            revenueByRegion: new Map(),
            revenueByPlan: new Map()
        };
        
        // Fraud detection
        this.fraudDetection = {
            enabled: true,
            riskThreshold: 0.7,
            blockedCountries: [],
            suspiciousPatterns: []
        };
    }

    /**
     * Initialize supported currencies
     */
    initializeCurrencies() {
        const currencies = [
            { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
            { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
            { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
            { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.12 },
            { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 149.50 },
            { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.24 },
            { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52 },
            { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.36 },
            { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.35 },
            { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', rate: 4.67 }
        ];
        
        currencies.forEach(currency => {
            this.currencies.set(currency.code, currency);
        });
    }

    /**
     * Initialize subscription plans
     */
    initializeSubscriptionPlans() {
        const plans = [
            {
                id: 'free',
                name: 'Free Plan',
                price: 0,
                currency: 'USD',
                interval: 'month',
                features: [
                    '5 AI asset generations per month',
                    'Basic app publishing',
                    'Community support',
                    'Standard analytics'
                ],
                limits: {
                    aiGenerations: 5,
                    apps: 1,
                    storage: '100MB',
                    bandwidth: '1GB'
                }
            },
            {
                id: 'starter',
                name: 'Starter Plan',
                price: 29,
                currency: 'USD',
                interval: 'month',
                features: [
                    '100 AI asset generations per month',
                    'Unlimited app publishing',
                    'Email support',
                    'Advanced analytics',
                    'Custom branding'
                ],
                limits: {
                    aiGenerations: 100,
                    apps: 10,
                    storage: '1GB',
                    bandwidth: '10GB'
                }
            },
            {
                id: 'professional',
                name: 'Professional Plan',
                price: 99,
                currency: 'USD',
                interval: 'month',
                features: [
                    'Unlimited AI asset generations',
                    'Priority app review',
                    'Priority support',
                    'Advanced analytics',
                    'API access',
                    'White-label options'
                ],
                limits: {
                    aiGenerations: -1, // unlimited
                    apps: 50,
                    storage: '10GB',
                    bandwidth: '100GB'
                }
            },
            {
                id: 'enterprise',
                name: 'Enterprise Plan',
                price: 299,
                currency: 'USD',
                interval: 'month',
                features: [
                    'Everything in Professional',
                    'Custom AI model training',
                    'Dedicated support team',
                    'SLA guarantees',
                    'Custom integrations',
                    'Advanced security'
                ],
                limits: {
                    aiGenerations: -1,
                    apps: -1,
                    storage: '100GB',
                    bandwidth: '1TB'
                }
            }
        ];
        
        plans.forEach(plan => {
            this.subscriptionPlans.set(plan.id, plan);
        });
    }

    /**
     * Process payment
     */
    async processPayment(paymentData) {
        try {
            const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Fraud detection
            const fraudCheck = await this.checkFraud(paymentData);
            if (fraudCheck.risk > this.fraudDetection.riskThreshold) {
                return {
                    success: false,
                    error: 'Payment blocked due to security concerns',
                    fraudScore: fraudCheck.risk
                };
            }
            
            // Currency conversion
            const convertedAmount = await this.convertCurrency(
                paymentData.amount,
                paymentData.currency,
                'USD'
            );
            
            // Select payment provider
            const provider = this.selectPaymentProvider(paymentData.region, paymentData.method);
            
            // Process payment with provider
            const providerResponse = await this.processWithProvider(provider, {
                ...paymentData,
                transactionId,
                convertedAmount
            });
            
            if (!providerResponse.success) {
                return {
                    success: false,
                    error: providerResponse.error,
                    transactionId
                };
            }
            
            // Create transaction record
            const transaction = {
                id: transactionId,
                userId: paymentData.userId,
                amount: paymentData.amount,
                currency: paymentData.currency,
                convertedAmount,
                method: paymentData.method,
                provider: provider.name,
                status: 'completed',
                type: paymentData.type || 'one_time',
                description: paymentData.description,
                metadata: paymentData.metadata || {},
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                providerTransactionId: providerResponse.transactionId,
                fees: this.calculateFees(paymentData.amount, provider)
            };
            
            this.transactions.set(transactionId, transaction);
            
            // Update revenue metrics
            this.updateRevenueMetrics(transaction);
            
            // Send confirmation
            await this.sendPaymentConfirmation(transaction);
            
            return {
                success: true,
                transactionId,
                amount: paymentData.amount,
                currency: paymentData.currency,
                status: 'completed',
                receipt: this.generateReceipt(transaction)
            };
            
        } catch (error) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create subscription
     */
    async createSubscription(subscriptionData) {
        try {
            const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const plan = this.subscriptionPlans.get(subscriptionData.planId);
            
            if (!plan) {
                return {
                    success: false,
                    error: 'Invalid subscription plan'
                };
            }
            
            // Process initial payment if not free plan
            let initialPayment = null;
            if (plan.price > 0) {
                initialPayment = await this.processPayment({
                    ...subscriptionData,
                    amount: plan.price,
                    currency: plan.currency,
                    type: 'subscription',
                    description: `${plan.name} - Initial Payment`
                });
                
                if (!initialPayment.success) {
                    return initialPayment;
                }
            }
            
            // Create subscription record
            const subscription = {
                id: subscriptionId,
                userId: subscriptionData.userId,
                planId: subscriptionData.planId,
                status: 'active',
                currentPeriodStart: new Date().toISOString(),
                currentPeriodEnd: this.calculatePeriodEnd(plan.interval),
                cancelAtPeriodEnd: false,
                createdAt: new Date().toISOString(),
                trialEnd: subscriptionData.trialDays ? 
                    new Date(Date.now() + subscriptionData.trialDays * 24 * 60 * 60 * 1000).toISOString() : null,
                
                billing: {
                    amount: plan.price,
                    currency: plan.currency,
                    interval: plan.interval,
                    nextBillingDate: this.calculateNextBillingDate(plan.interval)
                },
                
                usage: {
                    aiGenerations: 0,
                    apps: 0,
                    storage: 0,
                    bandwidth: 0
                },
                
                limits: plan.limits,
                features: plan.features
            };
            
            this.subscriptions.set(subscriptionId, subscription);
            
            // Update MRR
            if (plan.price > 0) {
                this.revenueMetrics.monthlyRecurringRevenue += plan.price;
            }
            
            return {
                success: true,
                subscriptionId,
                plan: plan.name,
                status: 'active',
                nextBillingDate: subscription.billing.nextBillingDate,
                initialPayment
            };
            
        } catch (error) {
            console.error('Subscription creation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId, immediate = false) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            return {
                success: false,
                error: 'Subscription not found'
            };
        }
        
        if (immediate) {
            subscription.status = 'cancelled';
            subscription.cancelledAt = new Date().toISOString();
            subscription.currentPeriodEnd = new Date().toISOString();
        } else {
            subscription.cancelAtPeriodEnd = true;
            subscription.cancelRequestedAt = new Date().toISOString();
        }
        
        // Update MRR
        const plan = this.subscriptionPlans.get(subscription.planId);
        if (plan && immediate) {
            this.revenueMetrics.monthlyRecurringRevenue -= plan.price;
        }
        
        // Send cancellation confirmation
        await this.sendCancellationConfirmation(subscription, immediate);
        
        return {
            success: true,
            subscriptionId,
            status: immediate ? 'cancelled' : 'active',
            endsAt: subscription.currentPeriodEnd,
            immediate
        };
    }

    /**
     * Process refund
     */
    async processRefund(transactionId, amount = null, reason = '') {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) {
            return {
                success: false,
                error: 'Transaction not found'
            };
        }
        
        if (transaction.status === 'refunded') {
            return {
                success: false,
                error: 'Transaction already refunded'
            };
        }
        
        const refundAmount = amount || transaction.amount;
        if (refundAmount > transaction.amount) {
            return {
                success: false,
                error: 'Refund amount cannot exceed original transaction amount'
            };
        }
        
        try {
            const refundId = `ref_${Date.now()}_${transactionId}`;
            
            // Process refund with payment provider
            const providerRefund = await this.processRefundWithProvider(
                transaction.provider,
                transaction.providerTransactionId,
                refundAmount
            );
            
            if (!providerRefund.success) {
                return {
                    success: false,
                    error: providerRefund.error
                };
            }
            
            // Update transaction
            transaction.status = refundAmount === transaction.amount ? 'refunded' : 'partially_refunded';
            transaction.refundedAmount = (transaction.refundedAmount || 0) + refundAmount;
            transaction.refundedAt = new Date().toISOString();
            transaction.refundReason = reason;
            
            // Create refund record
            const refund = {
                id: refundId,
                transactionId,
                amount: refundAmount,
                currency: transaction.currency,
                reason,
                status: 'completed',
                createdAt: new Date().toISOString(),
                providerRefundId: providerRefund.refundId
            };
            
            // Update revenue metrics
            this.revenueMetrics.totalRevenue -= refundAmount;
            
            // Send refund confirmation
            await this.sendRefundConfirmation(transaction, refund);
            
            return {
                success: true,
                refundId,
                amount: refundAmount,
                currency: transaction.currency,
                status: 'completed'
            };
            
        } catch (error) {
            console.error('Refund processing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get payment analytics
     */
    getPaymentAnalytics(timeRange = '30d') {
        const transactions = Array.from(this.transactions.values());
        const subscriptions = Array.from(this.subscriptions.values());
        
        // Filter by time range
        const startDate = this.getStartDateForRange(timeRange);
        const filteredTransactions = transactions.filter(
            txn => new Date(txn.createdAt) >= startDate
        );
        
        // Calculate metrics
        const totalRevenue = filteredTransactions.reduce((sum, txn) => sum + txn.convertedAmount, 0);
        const totalTransactions = filteredTransactions.length;
        const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        
        // Success rate
        const successfulTransactions = filteredTransactions.filter(txn => txn.status === 'completed').length;
        const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;
        
        // Revenue by currency
        const revenueByCurrency = {};
        filteredTransactions.forEach(txn => {
            revenueByCurrency[txn.currency] = (revenueByCurrency[txn.currency] || 0) + txn.amount;
        });
        
        // Revenue by payment method
        const revenueByMethod = {};
        filteredTransactions.forEach(txn => {
            revenueByMethod[txn.method] = (revenueByMethod[txn.method] || 0) + txn.convertedAmount;
        });
        
        // Subscription metrics
        const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
        const mrr = this.revenueMetrics.monthlyRecurringRevenue;
        const churnRate = this.calculateChurnRate(subscriptions, timeRange);
        
        return {
            overview: {
                totalRevenue,
                totalTransactions,
                averageTransactionValue,
                successRate,
                activeSubscriptions,
                monthlyRecurringRevenue: mrr,
                churnRate
            },
            
            breakdown: {
                revenueByCurrency,
                revenueByMethod,
                revenueByPlan: this.calculateRevenueByPlan(subscriptions),
                revenueByRegion: Object.fromEntries(this.revenueMetrics.revenueByRegion)
            },
            
            trends: {
                dailyRevenue: this.calculateDailyRevenue(filteredTransactions),
                subscriptionGrowth: this.calculateSubscriptionGrowth(subscriptions),
                paymentMethodTrends: this.calculatePaymentMethodTrends(filteredTransactions)
            },
            
            insights: this.generatePaymentInsights(filteredTransactions, subscriptions)
        };
    }

    /**
     * Check for fraud
     */
    async checkFraud(paymentData) {
        let riskScore = 0;
        const factors = [];
        
        // High amount transactions
        if (paymentData.amount > 1000) {
            riskScore += 0.2;
            factors.push('high_amount');
        }
        
        // Blocked countries
        if (this.fraudDetection.blockedCountries.includes(paymentData.country)) {
            riskScore += 0.8;
            factors.push('blocked_country');
        }
        
        // Multiple failed attempts (simulated)
        if (Math.random() < 0.1) {
            riskScore += 0.3;
            factors.push('multiple_failures');
        }
        
        // Velocity check (simulated)
        if (Math.random() < 0.05) {
            riskScore += 0.4;
            factors.push('high_velocity');
        }
        
        return {
            risk: Math.min(1.0, riskScore),
            factors,
            recommendation: riskScore > 0.7 ? 'block' : riskScore > 0.4 ? 'review' : 'approve'
        };
    }

    /**
     * Convert currency
     */
    async convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;
        
        const fromRate = this.currencies.get(fromCurrency)?.rate || 1;
        const toRate = this.currencies.get(toCurrency)?.rate || 1;
        
        // Convert to USD first, then to target currency
        const usdAmount = amount / fromRate;
        return usdAmount * toRate;
    }

    /**
     * Select payment provider based on region and method
     */
    selectPaymentProvider(region, method) {
        // Simplified provider selection logic
        if (region === 'IN') {
            return { name: 'razorpay', enabled: true };
        } else if (region === 'CN') {
            return { name: 'alipay', enabled: true };
        } else {
            return { name: 'stripe', enabled: true };
        }
    }

    /**
     * Process payment with provider (simulated)
     */
    async processWithProvider(provider, paymentData) {
        // Simulate payment processing
        const success = Math.random() > 0.05; // 95% success rate
        
        if (success) {
            return {
                success: true,
                transactionId: `${provider.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
        } else {
            return {
                success: false,
                error: 'Payment declined by provider'
            };
        }
    }

    /**
     * Calculate fees
     */
    calculateFees(amount, provider) {
        const feeRates = {
            stripe: 0.029, // 2.9%
            razorpay: 0.025, // 2.5%
            paypal: 0.034, // 3.4%
            alipay: 0.022, // 2.2%
        };
        
        const rate = feeRates[provider.name] || 0.03;
        return {
            rate,
            amount: amount * rate,
            currency: 'USD'
        };
    }

    /**
     * Update revenue metrics
     */
    updateRevenueMetrics(transaction) {
        this.revenueMetrics.totalRevenue += transaction.convertedAmount;
        
        // Update regional revenue
        const region = transaction.metadata?.region || 'unknown';
        const currentRegionalRevenue = this.revenueMetrics.revenueByRegion.get(region) || 0;
        this.revenueMetrics.revenueByRegion.set(region, currentRegionalRevenue + transaction.convertedAmount);
    }

    /**
     * Calculate period end
     */
    calculatePeriodEnd(interval) {
        const now = new Date();
        switch (interval) {
            case 'month':
                return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();
            case 'year':
                return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString();
            default:
                return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }
    }

    /**
     * Calculate next billing date
     */
    calculateNextBillingDate(interval) {
        return this.calculatePeriodEnd(interval);
    }

    /**
     * Generate receipt
     */
    generateReceipt(transaction) {
        return {
            receiptId: `receipt_${transaction.id}`,
            transactionId: transaction.id,
            amount: transaction.amount,
            currency: transaction.currency,
            method: transaction.method,
            date: transaction.completedAt,
            description: transaction.description,
            downloadUrl: `https://receipts.rapidai.com/${transaction.id}.pdf`
        };
    }

    /**
     * Send payment confirmation (simulated)
     */
    async sendPaymentConfirmation(transaction) {
        console.log(`Payment confirmation sent for transaction ${transaction.id}`);
        return true;
    }

    /**
     * Send cancellation confirmation (simulated)
     */
    async sendCancellationConfirmation(subscription, immediate) {
        console.log(`Cancellation confirmation sent for subscription ${subscription.id}`);
        return true;
    }

    /**
     * Send refund confirmation (simulated)
     */
    async sendRefundConfirmation(transaction, refund) {
        console.log(`Refund confirmation sent for transaction ${transaction.id}`);
        return true;
    }

    /**
     * Process refund with provider (simulated)
     */
    async processRefundWithProvider(provider, providerTransactionId, amount) {
        // Simulate refund processing
        return {
            success: true,
            refundId: `${provider}_ref_${Date.now()}`
        };
    }

    /**
     * Get start date for time range
     */
    getStartDateForRange(timeRange) {
        const now = new Date();
        switch (timeRange) {
            case '7d':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30d':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case '90d':
                return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            case '1y':
                return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            default:
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
    }

    /**
     * Calculate churn rate
     */
    calculateChurnRate(subscriptions, timeRange) {
        // Simplified churn calculation
        const cancelledSubs = subscriptions.filter(sub => sub.status === 'cancelled').length;
        const totalSubs = subscriptions.length;
        
        return totalSubs > 0 ? (cancelledSubs / totalSubs) * 100 : 0;
    }

    /**
     * Calculate revenue by plan
     */
    calculateRevenueByPlan(subscriptions) {
        const revenueByPlan = {};
        
        subscriptions.forEach(sub => {
            const plan = this.subscriptionPlans.get(sub.planId);
            if (plan && sub.status === 'active') {
                revenueByPlan[plan.name] = (revenueByPlan[plan.name] || 0) + plan.price;
            }
        });
        
        return revenueByPlan;
    }

    /**
     * Calculate daily revenue
     */
    calculateDailyRevenue(transactions) {
        const dailyRevenue = {};
        
        transactions.forEach(txn => {
            const date = txn.createdAt.split('T')[0];
            dailyRevenue[date] = (dailyRevenue[date] || 0) + txn.convertedAmount;
        });
        
        return dailyRevenue;
    }

    /**
     * Calculate subscription growth
     */
    calculateSubscriptionGrowth(subscriptions) {
        // Simplified growth calculation
        return {
            newSubscriptions: subscriptions.filter(sub => {
                const createdDate = new Date(sub.createdAt);
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                return createdDate >= thirtyDaysAgo;
            }).length,
            growthRate: 15.3 // Mock growth rate
        };
    }

    /**
     * Calculate payment method trends
     */
    calculatePaymentMethodTrends(transactions) {
        const trends = {};
        
        transactions.forEach(txn => {
            trends[txn.method] = (trends[txn.method] || 0) + 1;
        });
        
        return trends;
    }

    /**
     * Generate payment insights
     */
    generatePaymentInsights(transactions, subscriptions) {
        const insights = [];
        
        // High-value transactions
        const highValueTxns = transactions.filter(txn => txn.convertedAmount > 500).length;
        if (highValueTxns > 0) {
            insights.push({
                type: 'revenue',
                title: 'High-Value Transactions',
                description: `${highValueTxns} transactions over $500 this period`,
                impact: 'positive'
            });
        }
        
        // Subscription growth
        const newSubs = subscriptions.filter(sub => {
            const createdDate = new Date(sub.createdAt);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return createdDate >= thirtyDaysAgo;
        }).length;
        
        if (newSubs > 10) {
            insights.push({
                type: 'growth',
                title: 'Strong Subscription Growth',
                description: `${newSubs} new subscriptions this month`,
                impact: 'positive'
            });
        }
        
        return insights;
    }
}

export default PaymentService;