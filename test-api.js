/**
 * API Testing Script for Rapid AI Store
 * Tests all major endpoints to ensure they're working correctly
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function testAPI() {
    console.log('🚀 Testing Rapid AI Store API...\n');
    console.log(`Base URL: ${BASE_URL}\n`);

    const tests = [
        // Health and Info
        { name: 'Health Check', endpoint: '/health', method: 'GET' },
        { name: 'API Info', endpoint: '/api', method: 'GET' },
        
        // AI Store
        { name: 'Get Apps', endpoint: '/api/store/apps', method: 'GET' },
        { name: 'Get Categories', endpoint: '/api/store/categories', method: 'GET' },
        { name: 'Get Featured Apps', endpoint: '/api/store/featured', method: 'GET' },
        { name: 'Get Store Stats', endpoint: '/api/store/stats', method: 'GET' },
        { name: 'Store Health', endpoint: '/api/store/health', method: 'GET' },
        
        // Partnership
        { name: 'Partnership Tiers', endpoint: '/api/partnership/tiers', method: 'GET' },
        { name: 'Partnership Programs', endpoint: '/api/partnership/programs', method: 'GET' },
        { name: 'Partnership Analytics', endpoint: '/api/partnership/analytics', method: 'GET' },
        
        // Payment
        { name: 'Subscription Plans', endpoint: '/api/payment/plans', method: 'GET' },
        { name: 'Supported Currencies', endpoint: '/api/payment/currencies', method: 'GET' },
        { name: 'Payment Providers', endpoint: '/api/payment/providers', method: 'GET' },
        { name: 'Payment Analytics', endpoint: '/api/payment/analytics', method: 'GET' },
        
        // AI Services
        { name: 'Templates', endpoint: '/api/templates', method: 'GET' }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            console.log(`Testing: ${test.name}...`);
            
            const response = await fetch(`${BASE_URL}${test.endpoint}`, {
                method: test.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${test.name} - Status: ${response.status}`);
                
                // Log some key data for verification
                if (data.success !== undefined) {
                    console.log(`   Success: ${data.success}`);
                }
                if (data.status) {
                    console.log(`   Status: ${data.status}`);
                }
                if (data.name) {
                    console.log(`   Name: ${data.name}`);
                }
                
                passed++;
            } else {
                console.log(`❌ ${test.name} - Status: ${response.status} ${response.statusText}`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} - Error: ${error.message}`);
            failed++;
        }
        
        console.log(''); // Empty line for readability
    }

    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
        console.log('\n🎉 All tests passed! Your AI Store API is ready for production!');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the endpoints and try again.');
    }
}

// Test specific functionality
async function testAppPublishing() {
    console.log('\n🔧 Testing App Publishing...');
    
    const testApp = {
        name: 'Test AI Tool',
        description: 'A test AI tool for the marketplace',
        category: 'ai-tools',
        tags: ['test', 'ai', 'demo'],
        version: '1.0.0',
        price: 0,
        website: 'https://example.com',
        supportEmail: 'support@example.com'
    };

    try {
        const response = await fetch(`${BASE_URL}/api/store/apps`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testApp)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ App publishing test passed');
            console.log(`   App ID: ${result.appId}`);
            console.log(`   Status: ${result.status}`);
            console.log(`   Quality Score: ${result.qualityScore}`);
        } else {
            console.log(`❌ App publishing test failed - Status: ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ App publishing test error: ${error.message}`);
    }
}

async function testAIAssetGeneration() {
    console.log('\n🎨 Testing AI Asset Generation...');
    
    const assetRequest = {
        appName: 'Test AI Tool',
        category: 'productivity',
        description: 'A productivity tool powered by AI',
        assetTypes: ['icons', 'screenshots']
    };

    try {
        const response = await fetch(`${BASE_URL}/api/store/ai/generate-assets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assetRequest)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ AI asset generation test passed');
            console.log(`   Icons generated: ${result.assets.icons.length}`);
            console.log(`   Screenshots generated: ${result.assets.screenshots.length}`);
        } else {
            console.log(`❌ AI asset generation test failed - Status: ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ AI asset generation test error: ${error.message}`);
    }
}

// Run all tests
async function runAllTests() {
    await testAPI();
    await testAppPublishing();
    await testAIAssetGeneration();
    
    console.log('\n🏁 All tests completed!');
    console.log('\n🌟 Your Rapid AI Store is ready for the world!');
    console.log('Frontend: https://shankarelavarasan.github.io/rapid-saas-ai-store/');
    console.log('Backend: https://rapid-saas-ai-store.onrender.com');
}

// Check if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().catch(console.error);
}

export { testAPI, testAppPublishing, testAIAssetGeneration };