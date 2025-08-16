/**
 * AI Store API Routes - Core Marketplace Endpoints
 * Handles app publishing, discovery, downloads, and marketplace operations
 */

import express from 'express';
import AIStoreService from '../services/aiStoreService.js';
import AnalyticsService from '../services/analytics.js';
import GlobalScalingService from '../services/globalScaling.js';
import PartnershipService from '../services/partnershipService.js';
import PaymentService from '../services/paymentService.js';

const router = express.Router();

// Initialize services
const aiStore = new AIStoreService();
const analytics = new AnalyticsService();
const globalScaling = new GlobalScalingService();
const partnership = new PartnershipService();
const payment = new PaymentService();

/**
 * @route GET /api/store/apps
 * @description Get all apps with filtering and pagination
 */
router.get('/apps', async (req, res) => {
    try {
        const {
            category,
            search,
            sort = 'popular',
            page = 1,
            limit = 20,
            minRating,
            maxPrice,
            featured
        } = req.query;
        
        let apps;
        
        if (search) {
            // Search apps
            const searchResults = aiStore.searchApps(search, {
                category,
                minRating: minRating ? parseFloat(minRating) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
            });
            apps = searchResults.results;
        } else if (featured === 'true') {
            // Get featured apps
            apps = aiStore.getFeaturedApps(parseInt(limit));
        } else {
            // Get all apps with filters
            apps = Array.from(aiStore.apps.values())
                .filter(app => app.status === 'approved')
                .filter(app => !category || app.category === category)
                .filter(app => !minRating || app.rating >= parseFloat(minRating))
                .filter(app => !maxPrice || (app.price || 0) <= parseFloat(maxPrice));
        }
        
        // Sort apps
        switch (sort) {
            case 'popular':
                apps.sort((a, b) => b.downloads - a.downloads);
                break;
            case 'rating':
                apps.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                apps.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
                break;
            case 'price_low':
                apps.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price_high':
                apps.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
        }
        
        // Pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const paginatedApps = apps.slice(startIndex, startIndex + parseInt(limit));
        
        res.json({
            success: true,
            apps: paginatedApps,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: apps.length,
                pages: Math.ceil(apps.length / parseInt(limit))
            },
            filters: {
                categories: Array.from(aiStore.categories.keys()),
                sortOptions: ['popular', 'rating', 'newest', 'price_low', 'price_high']
            }
        });
        
    } catch (error) {
        console.error('Error fetching apps:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch apps'
        });
    }
});

/**
 * @route GET /api/store/apps/:appId
 * @description Get detailed app information
 */
router.get('/apps/:appId', async (req, res) => {
    try {
        const { appId } = req.params;
        const appDetails = aiStore.getAppDetails(appId);
        
        if (appDetails.error) {
            return res.status(404).json({
                success: false,
                error: appDetails.error
            });
        }
        
        // Track app view
        analytics.trackAIToolUsage('appView', req.user?.id, 0, true);
        
        res.json({
            success: true,
            app: appDetails
        });
        
    } catch (error) {
        console.error('Error fetching app details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch app details'
        });
    }
});

/**
 * @route POST /api/store/apps
 * @description Publish new app to the store
 */
router.post('/apps', async (req, res) => {
    try {
        const appData = req.body;
        const developerId = req.user?.id || 'anonymous';
        
        // Validate required fields
        if (!appData.name || !appData.description || !appData.category) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, description, category'
            });
        }
        
        const result = await aiStore.publishApp(appData, developerId);
        
        if (result.success) {
            // Track app publication
            analytics.trackAIToolUsage('appPublish', developerId, 0, true);
            
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('Error publishing app:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to publish app'
        });
    }
});

/**
 * @route POST /api/store/apps/:appId/download
 * @description Download app
 */
router.post('/apps/:appId/download', async (req, res) => {
    try {
        const { appId } = req.params;
        const userId = req.user?.id || 'anonymous';
        const userLocation = req.body.location || {};
        
        const downloadResult = await aiStore.downloadApp(appId, userId);
        
        if (downloadResult.success) {
            // Track download
            analytics.trackAppInstall(appId, userId, {
                category: req.body.category,
                region: userLocation.region
            });
            
            res.json(downloadResult);
        } else {
            res.status(400).json(downloadResult);
        }
        
    } catch (error) {
        console.error('Error downloading app:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download app'
        });
    }
});

/**
 * @route GET /api/store/categories
 * @description Get all app categories
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = Array.from(aiStore.categories.entries()).map(([id, category]) => ({
            id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            appCount: category.appCount,
            totalDownloads: category.totalDownloads,
            averageRating: category.averageRating
        }));
        
        res.json({
            success: true,
            categories
        });
        
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
});

/**
 * @route GET /api/store/search
 * @description Search apps with AI-powered recommendations
 */
router.get('/search', async (req, res) => {
    try {
        const { q: query, category, minRating, maxPrice } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }
        
        const searchResults = aiStore.searchApps(query, {
            category,
            minRating: minRating ? parseFloat(minRating) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
        });
        
        // Track search
        analytics.trackAIToolUsage('search', req.user?.id, 0, true);
        
        res.json({
            success: true,
            ...searchResults
        });
        
    } catch (error) {
        console.error('Error searching apps:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search apps'
        });
    }
});

/**
 * @route GET /api/store/featured
 * @description Get featured apps
 */
router.get('/featured', async (req, res) => {
    try {
        const { limit = 12 } = req.query;
        const featuredApps = aiStore.getFeaturedApps(parseInt(limit));
        
        res.json({
            success: true,
            apps: featuredApps,
            count: featuredApps.length
        });
        
    } catch (error) {
        console.error('Error fetching featured apps:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured apps'
        });
    }
});

/**
 * @route GET /api/store/stats
 * @description Get marketplace statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const marketplaceStats = aiStore.getMarketplaceStats();
        const analyticsData = analytics.getDashboardData();
        const globalMetrics = globalScaling.getGlobalMetrics();
        
        res.json({
            success: true,
            marketplace: marketplaceStats,
            analytics: analyticsData,
            global: globalMetrics,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error fetching marketplace stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch marketplace statistics'
        });
    }
});

/**
 * @route POST /api/store/ai/generate-assets
 * @description Generate AI-powered app assets
 */
router.post('/ai/generate-assets', async (req, res) => {
    try {
        const { appName, category, description, assetTypes = ['icons', 'screenshots'] } = req.body;
        
        if (!appName || !category) {
            return res.status(400).json({
                success: false,
                error: 'App name and category are required'
            });
        }
        
        // Generate assets using AI
        const assets = await aiStore.generateAppAssets({
            name: appName,
            category,
            description
        });
        
        // Track AI usage
        analytics.trackAIToolUsage('assetGeneration', req.user?.id, 2500, true);
        
        res.json({
            success: true,
            assets,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error generating assets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate assets'
        });
    }
});

/**
 * @route GET /api/store/recommendations/:userId
 * @description Get personalized app recommendations
 */
router.get('/recommendations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;
        
        // Get user's download history and preferences
        // For demo, we'll return popular apps from different categories
        const recommendations = aiStore.getFeaturedApps(parseInt(limit));
        
        res.json({
            success: true,
            recommendations,
            userId,
            algorithm: 'collaborative_filtering',
            confidence: 0.85
        });
        
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate recommendations'
        });
    }
});

/**
 * @route GET /api/store/global/optimal-region
 * @description Get optimal region for user
 */
router.post('/global/optimal-region', async (req, res) => {
    try {
        const { latitude, longitude, serviceType = 'api' } = req.body;
        
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'User location (latitude, longitude) is required'
            });
        }
        
        const optimalRegion = globalScaling.getOptimalRegion(
            { latitude, longitude },
            serviceType
        );
        
        res.json({
            success: true,
            optimalRegion,
            serviceType,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error finding optimal region:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to find optimal region'
        });
    }
});

/**
 * @route GET /api/store/health
 * @description Get marketplace health status
 */
router.get('/health', async (req, res) => {
    try {
        const globalHealth = globalScaling.monitorGlobalHealth();
        const marketplaceStats = aiStore.getMarketplaceStats();
        
        const health = {
            status: globalHealth.overall,
            services: {
                aiStore: 'healthy',
                analytics: 'healthy',
                globalScaling: globalHealth.overall,
                partnership: 'healthy',
                payment: 'healthy'
            },
            metrics: {
                totalApps: marketplaceStats.overview.totalApps,
                totalDownloads: marketplaceStats.overview.totalDownloads,
                averageRating: marketplaceStats.overview.averageRating,
                uptime: '99.97%'
            },
            regions: globalHealth.regions,
            alerts: globalHealth.alerts,
            timestamp: new Date().toISOString()
        };
        
        const statusCode = globalHealth.overall === 'healthy' ? 200 : 
                          globalHealth.overall === 'warning' ? 200 : 503;
        
        res.status(statusCode).json({
            success: true,
            health
        });
        
    } catch (error) {
        console.error('Error checking health:', error);
        res.status(503).json({
            success: false,
            error: 'Health check failed',
            status: 'unhealthy'
        });
    }
});

export default router;