/**
 * Global Scaling Service - Worldwide Distribution Infrastructure
 * Handles multi-region deployment, CDN management, and global performance optimization
 */

class GlobalScalingService {
    constructor() {
        this.regions = {
            'us-east-1': { name: 'US East', status: 'active', load: 65, latency: 45 },
            'us-west-2': { name: 'US West', status: 'active', load: 72, latency: 38 },
            'eu-west-1': { name: 'Europe', status: 'active', load: 58, latency: 52 },
            'ap-south-1': { name: 'Asia Pacific', status: 'active', load: 81, latency: 67 },
            'ap-southeast-1': { name: 'Southeast Asia', status: 'active', load: 43, latency: 89 },
            'me-south-1': { name: 'Middle East', status: 'scaling', load: 34, latency: 95 }
        };
        
        this.cdnNodes = {
            total: 150,
            active: 147,
            regions: 45,
            cacheHitRate: 94.2,
            bandwidth: '2.3 TB/s'
        };
        
        this.loadBalancing = {
            algorithm: 'weighted-round-robin',
            healthChecks: true,
            autoFailover: true,
            stickySessions: false
        };
        
        this.scalingPolicies = {
            autoScaling: true,
            minInstances: 2,
            maxInstances: 100,
            targetCPU: 70,
            scaleUpCooldown: 300, // seconds
            scaleDownCooldown: 600 // seconds
        };
        
        this.performanceMetrics = {
            globalLatency: 67, // ms average
            availability: 99.97, // percentage
            throughput: 15000, // requests per second
            errorRate: 0.03 // percentage
        };
    }

    /**
     * Get optimal region for user
     */
    getOptimalRegion(userLocation, serviceType = 'api') {
        const userLat = userLocation.latitude;
        const userLng = userLocation.longitude;
        
        let bestRegion = null;
        let minLatency = Infinity;
        
        for (const [regionId, region] of Object.entries(this.regions)) {
            if (region.status !== 'active') continue;
            
            // Calculate estimated latency based on geographic distance and current load
            const estimatedLatency = this.calculateLatency(userLat, userLng, regionId) + 
                                   (region.load * 0.5); // Load factor
            
            if (estimatedLatency < minLatency) {
                minLatency = estimatedLatency;
                bestRegion = {
                    id: regionId,
                    name: region.name,
                    estimatedLatency: Math.round(estimatedLatency),
                    load: region.load,
                    endpoint: this.getRegionEndpoint(regionId, serviceType)
                };
            }
        }
        
        return bestRegion;
    }

    /**
     * Calculate latency based on geographic distance
     */
    calculateLatency(userLat, userLng, regionId) {
        // Simplified latency calculation based on region
        const regionCoords = {
            'us-east-1': { lat: 39.0458, lng: -76.6413 },
            'us-west-2': { lat: 45.5152, lng: -122.6784 },
            'eu-west-1': { lat: 53.4084, lng: -8.2439 },
            'ap-south-1': { lat: 19.0760, lng: 72.8777 },
            'ap-southeast-1': { lat: 1.3521, lng: 103.8198 },
            'me-south-1': { lat: 26.0667, lng: 50.5577 }
        };
        
        const regionCoord = regionCoords[regionId];
        if (!regionCoord) return 100; // Default latency
        
        // Haversine formula for distance calculation
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(regionCoord.lat - userLat);
        const dLng = this.toRad(regionCoord.lng - userLng);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRad(userLat)) * Math.cos(this.toRad(regionCoord.lat)) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // Convert distance to estimated latency (rough approximation)
        return Math.max(20, distance * 0.05); // Minimum 20ms, ~0.05ms per km
    }

    /**
     * Convert degrees to radians
     */
    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Get region endpoint
     */
    getRegionEndpoint(regionId, serviceType) {
        const baseUrls = {
            'us-east-1': 'https://api-us-east.rapidai.com',
            'us-west-2': 'https://api-us-west.rapidai.com',
            'eu-west-1': 'https://api-eu.rapidai.com',
            'ap-south-1': 'https://api-ap-south.rapidai.com',
            'ap-southeast-1': 'https://api-ap-se.rapidai.com',
            'me-south-1': 'https://api-me.rapidai.com'
        };
        
        const baseUrl = baseUrls[regionId] || 'https://api.rapidai.com';
        
        switch (serviceType) {
            case 'ai':
                return `${baseUrl}/ai`;
            case 'assets':
                return `${baseUrl}/assets`;
            case 'apps':
                return `${baseUrl}/apps`;
            default:
                return `${baseUrl}/api`;
        }
    }

    /**
     * Scale region based on demand
     */
    async scaleRegion(regionId, targetLoad = 70) {
        const region = this.regions[regionId];
        if (!region) {
            throw new Error(`Region ${regionId} not found`);
        }
        
        const currentLoad = region.load;
        const scalingFactor = currentLoad / targetLoad;
        
        let action = 'maintain';
        let newInstances = 0;
        
        if (scalingFactor > 1.2) {
            // Scale up
            action = 'scale_up';
            newInstances = Math.ceil(scalingFactor * 2);
        } else if (scalingFactor < 0.6) {
            // Scale down
            action = 'scale_down';
            newInstances = Math.max(this.scalingPolicies.minInstances, 
                                  Math.floor(scalingFactor * 2));
        }
        
        // Simulate scaling operation
        if (action !== 'maintain') {
            console.log(`Scaling ${regionId}: ${action} to ${newInstances} instances`);
            
            // Update region load (simulated)
            region.load = Math.max(30, Math.min(90, targetLoad + (Math.random() * 20 - 10)));
            region.status = action === 'scale_up' ? 'scaling' : 'active';
            
            // Simulate scaling delay
            setTimeout(() => {
                region.status = 'active';
            }, 30000); // 30 seconds
        }
        
        return {
            region: regionId,
            action,
            currentLoad,
            targetLoad,
            newInstances,
            estimatedTime: action !== 'maintain' ? 30 : 0
        };
    }

    /**
     * Get global performance metrics
     */
    getGlobalMetrics() {
        return {
            regions: Object.entries(this.regions).map(([id, region]) => ({
                id,
                name: region.name,
                status: region.status,
                load: region.load,
                latency: region.latency,
                health: region.load < 80 ? 'healthy' : 'warning'
            })),
            
            cdn: {
                ...this.cdnNodes,
                performance: {
                    cacheHitRate: this.cdnNodes.cacheHitRate,
                    bandwidth: this.cdnNodes.bandwidth,
                    edgeLocations: this.cdnNodes.regions
                }
            },
            
            loadBalancing: {
                ...this.loadBalancing,
                activeConnections: 45230,
                requestsPerSecond: this.performanceMetrics.throughput
            },
            
            performance: {
                ...this.performanceMetrics,
                uptime: '99.97%',
                mttr: 4.2, // Mean Time To Recovery in minutes
                sla: 'Premium (99.9%)'
            },
            
            scaling: {
                autoScalingEnabled: this.scalingPolicies.autoScaling,
                totalInstances: this.getTotalInstances(),
                scalingEvents: this.getRecentScalingEvents()
            }
        };
    }

    /**
     * Get total instances across all regions
     */
    getTotalInstances() {
        return Object.values(this.regions).reduce((total, region) => {
            // Simulate instance count based on load
            const instances = Math.ceil(region.load / 25);
            return total + instances;
        }, 0);
    }

    /**
     * Get recent scaling events
     */
    getRecentScalingEvents() {
        return [
            {
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                region: 'ap-south-1',
                action: 'scale_up',
                reason: 'High CPU utilization (85%)',
                instances: '+3'
            },
            {
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                region: 'eu-west-1',
                action: 'scale_down',
                reason: 'Low traffic period',
                instances: '-2'
            }
        ];
    }

    /**
     * Optimize global distribution
     */
    async optimizeDistribution() {
        const optimizations = [];
        
        // Check for overloaded regions
        for (const [regionId, region] of Object.entries(this.regions)) {
            if (region.load > 85) {
                optimizations.push({
                    type: 'scale_up',
                    region: regionId,
                    priority: 'high',
                    action: 'Add more instances to handle load'
                });
            }
        }
        
        // Check for underutilized regions
        for (const [regionId, region] of Object.entries(this.regions)) {
            if (region.load < 30 && region.status === 'active') {
                optimizations.push({
                    type: 'scale_down',
                    region: regionId,
                    priority: 'low',
                    action: 'Reduce instances to optimize costs'
                });
            }
        }
        
        // CDN optimization
        if (this.cdnNodes.cacheHitRate < 90) {
            optimizations.push({
                type: 'cdn_optimization',
                region: 'global',
                priority: 'medium',
                action: 'Optimize cache policies to improve hit rate'
            });
        }
        
        return {
            optimizations,
            estimatedSavings: this.calculateOptimizationSavings(optimizations),
            performanceImpact: this.calculatePerformanceImpact(optimizations)
        };
    }

    /**
     * Calculate optimization savings
     */
    calculateOptimizationSavings(optimizations) {
        let monthlySavings = 0;
        
        optimizations.forEach(opt => {
            if (opt.type === 'scale_down') {
                monthlySavings += 150; // $150 per instance per month
            }
        });
        
        return {
            monthly: monthlySavings,
            annual: monthlySavings * 12,
            currency: 'USD'
        };
    }

    /**
     * Calculate performance impact
     */
    calculatePerformanceImpact(optimizations) {
        let latencyImprovement = 0;
        let availabilityImprovement = 0;
        
        optimizations.forEach(opt => {
            if (opt.type === 'scale_up') {
                latencyImprovement += 5; // 5ms improvement
                availabilityImprovement += 0.01; // 0.01% improvement
            }
        });
        
        return {
            latencyReduction: `${latencyImprovement}ms`,
            availabilityIncrease: `${availabilityImprovement}%`,
            throughputIncrease: `${optimizations.length * 500} req/s`
        };
    }

    /**
     * Get regional compliance information
     */
    getComplianceInfo() {
        return {
            'us-east-1': ['SOC2', 'HIPAA', 'FedRAMP'],
            'us-west-2': ['SOC2', 'HIPAA', 'PCI-DSS'],
            'eu-west-1': ['GDPR', 'SOC2', 'ISO27001'],
            'ap-south-1': ['SOC2', 'ISO27001'],
            'ap-southeast-1': ['SOC2', 'ISO27001', 'MTCS'],
            'me-south-1': ['SOC2', 'ISO27001']
        };
    }

    /**
     * Monitor global health
     */
    monitorGlobalHealth() {
        const healthStatus = {
            overall: 'healthy',
            regions: {},
            alerts: [],
            recommendations: []
        };
        
        let unhealthyRegions = 0;
        
        for (const [regionId, region] of Object.entries(this.regions)) {
            let status = 'healthy';
            
            if (region.load > 90) {
                status = 'critical';
                unhealthyRegions++;
                healthStatus.alerts.push({
                    severity: 'critical',
                    region: regionId,
                    message: `High load detected: ${region.load}%`
                });
            } else if (region.load > 80) {
                status = 'warning';
                healthStatus.alerts.push({
                    severity: 'warning',
                    region: regionId,
                    message: `Elevated load: ${region.load}%`
                });
            }
            
            if (region.latency > 100) {
                status = status === 'healthy' ? 'warning' : status;
                healthStatus.alerts.push({
                    severity: 'warning',
                    region: regionId,
                    message: `High latency: ${region.latency}ms`
                });
            }
            
            healthStatus.regions[regionId] = status;
        }
        
        // Overall health assessment
        if (unhealthyRegions > 2) {
            healthStatus.overall = 'critical';
        } else if (unhealthyRegions > 0) {
            healthStatus.overall = 'warning';
        }
        
        // Generate recommendations
        if (unhealthyRegions > 0) {
            healthStatus.recommendations.push({
                priority: 'high',
                action: 'Scale up overloaded regions',
                impact: 'Improve user experience and system stability'
            });
        }
        
        return healthStatus;
    }
}

export default GlobalScalingService;