/**
 * Partnership API Routes - Developer Relations & Revenue Management
 */

import express from 'express';
import PartnershipService from '../services/partnershipService.js';

const router = express.Router();
const partnershipService = new PartnershipService();

/**
 * @route POST /api/partnership/register
 * @description Register new developer partner
 */
router.post('/register', async (req, res) => {
    try {
        const partnerData = req.body;
        
        // Validate required fields
        if (!partnerData.name || !partnerData.email || !partnerData.company) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, email, company'
            });
        }
        
        const result = await partnershipService.registerPartner(partnerData);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('Error registering partner:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to register partner'
        });
    }
});

/**
 * @route GET /api/partnership/dashboard/:partnerId
 * @description Get partner dashboard data
 */
router.get('/dashboard/:partnerId', async (req, res) => {
    try {
        const { partnerId } = req.params;
        const dashboardData = partnershipService.getPartnerDashboard(partnerId);
        
        if (!dashboardData) {
            return res.status(404).json({
                success: false,
                error: 'Partner not found'
            });
        }
        
        res.json({
            success: true,
            data: dashboardData
        });
        
    } catch (error) {
        console.error('Error fetching partner dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch partner dashboard'
        });
    }
});

/**
 * @route POST /api/partnership/revenue-share
 * @description Calculate revenue share for partner
 */
router.post('/revenue-share', async (req, res) => {
    try {
        const { partnerId, revenue } = req.body;
        
        if (!partnerId || !revenue) {
            return res.status(400).json({
                success: false,
                error: 'Partner ID and revenue amount are required'
            });
        }
        
        const shareResult = partnershipService.calculateRevenueShare(partnerId, revenue);
        
        if (!shareResult) {
            return res.status(404).json({
                success: false,
                error: 'Partner not found'
            });
        }
        
        res.json({
            success: true,
            data: shareResult
        });
        
    } catch (error) {
        console.error('Error calculating revenue share:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate revenue share'
        });
    }
});

/**
 * @route POST /api/partnership/payout
 * @description Process partner payout
 */
router.post('/payout', async (req, res) => {
    try {
        const { partnerId, amount } = req.body;
        
        if (!partnerId || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Partner ID and amount are required'
            });
        }
        
        const payoutResult = await partnershipService.processPartnerPayout(partnerId, amount);
        
        res.json(payoutResult);
        
    } catch (error) {
        console.error('Error processing payout:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process payout'
        });
    }
});

/**
 * @route GET /api/partnership/analytics
 * @description Get partnership analytics
 */
router.get('/analytics', async (req, res) => {
    try {
        const analytics = partnershipService.getPartnershipAnalytics();
        
        res.json({
            success: true,
            data: analytics
        });
        
    } catch (error) {
        console.error('Error fetching partnership analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch partnership analytics'
        });
    }
});

/**
 * @route GET /api/partnership/tiers
 * @description Get partnership tier information
 */
router.get('/tiers', async (req, res) => {
    try {
        const tiers = Array.from(partnershipService.partnershipTiers.entries()).map(([id, tier]) => ({
            id,
            ...tier
        }));
        
        res.json({
            success: true,
            tiers
        });
        
    } catch (error) {
        console.error('Error fetching partnership tiers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch partnership tiers'
        });
    }
});

/**
 * @route GET /api/partnership/programs
 * @description Get partnership programs information
 */
router.get('/programs', async (req, res) => {
    try {
        res.json({
            success: true,
            programs: partnershipService.programs
        });
        
    } catch (error) {
        console.error('Error fetching partnership programs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch partnership programs'
        });
    }
});

export default router;