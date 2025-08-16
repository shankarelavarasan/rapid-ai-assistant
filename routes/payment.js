/**
 * Payment API Routes - Global Payment Processing
 */

import express from 'express';
import PaymentService from '../services/paymentService.js';

const router = express.Router();
const paymentService = new PaymentService();

/**
 * @route POST /api/payment/process
 * @description Process a payment
 */
router.post('/process', async (req, res) => {
    try {
        const paymentData = req.body;
        
        // Validate required fields
        if (!paymentData.amount || !paymentData.currency || !paymentData.method) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: amount, currency, method'
            });
        }
        
        const result = await paymentService.processPayment(paymentData);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process payment'
        });
    }
});

/**
 * @route POST /api/payment/subscription
 * @description Create a subscription
 */
router.post('/subscription', async (req, res) => {
    try {
        const subscriptionData = req.body;
        
        if (!subscriptionData.planId || !subscriptionData.userId) {
            return res.status(400).json({
                success: false,
                error: 'Plan ID and User ID are required'
            });
        }
        
        const result = await paymentService.createSubscription(subscriptionData);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create subscription'
        });
    }
});

/**
 * @route DELETE /api/payment/subscription/:subscriptionId
 * @description Cancel a subscription
 */
router.delete('/subscription/:subscriptionId', async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const { immediate = false } = req.query;
        
        const result = await paymentService.cancelSubscription(subscriptionId, immediate === 'true');
        
        res.json(result);
        
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel subscription'
        });
    }
});

/**
 * @route POST /api/payment/refund
 * @description Process a refund
 */
router.post('/refund', async (req, res) => {
    try {
        const { transactionId, amount, reason } = req.body;
        
        if (!transactionId) {
            return res.status(400).json({
                success: false,
                error: 'Transaction ID is required'
            });
        }
        
        const result = await paymentService.processRefund(transactionId, amount, reason);
        
        res.json(result);
        
    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process refund'
        });
    }
});

/**
 * @route GET /api/payment/analytics
 * @description Get payment analytics
 */
router.get('/analytics', async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        const analytics = paymentService.getPaymentAnalytics(timeRange);
        
        res.json({
            success: true,
            data: analytics
        });
        
    } catch (error) {
        console.error('Error fetching payment analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payment analytics'
        });
    }
});

/**
 * @route GET /api/payment/plans
 * @description Get subscription plans
 */
router.get('/plans', async (req, res) => {
    try {
        const plans = Array.from(paymentService.subscriptionPlans.entries()).map(([id, plan]) => ({
            id,
            ...plan
        }));
        
        res.json({
            success: true,
            plans
        });
        
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch subscription plans'
        });
    }
});

/**
 * @route GET /api/payment/currencies
 * @description Get supported currencies
 */
router.get('/currencies', async (req, res) => {
    try {
        const currencies = Array.from(paymentService.currencies.entries()).map(([code, currency]) => ({
            code,
            ...currency
        }));
        
        res.json({
            success: true,
            currencies
        });
        
    } catch (error) {
        console.error('Error fetching currencies:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch currencies'
        });
    }
});

/**
 * @route POST /api/payment/convert-currency
 * @description Convert currency
 */
router.post('/convert-currency', async (req, res) => {
    try {
        const { amount, fromCurrency, toCurrency } = req.body;
        
        if (!amount || !fromCurrency || !toCurrency) {
            return res.status(400).json({
                success: false,
                error: 'Amount, from currency, and to currency are required'
            });
        }
        
        const convertedAmount = await paymentService.convertCurrency(amount, fromCurrency, toCurrency);
        
        res.json({
            success: true,
            originalAmount: amount,
            originalCurrency: fromCurrency,
            convertedAmount,
            convertedCurrency: toCurrency,
            exchangeRate: convertedAmount / amount
        });
        
    } catch (error) {
        console.error('Error converting currency:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to convert currency'
        });
    }
});

/**
 * @route GET /api/payment/providers
 * @description Get available payment providers by region
 */
router.get('/providers', async (req, res) => {
    try {
        const { region } = req.query;
        
        let availableProviders = paymentService.providers;
        
        if (region) {
            availableProviders = Object.fromEntries(
                Object.entries(paymentService.providers).filter(([name, provider]) => 
                    provider.regions.includes(region) || provider.regions.includes('global')
                )
            );
        }
        
        res.json({
            success: true,
            providers: availableProviders,
            region: region || 'all'
        });
        
    } catch (error) {
        console.error('Error fetching payment providers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payment providers'
        });
    }
});

export default router;