#!/usr/bin/env node

/**
 * Health Check Script for CharlitexMobileConnect
 * Tests website functionality after deployment
 */

const https = require('https');
const http = require('http');

const SITE_URL = process.env.VITE_APP_URL || 'https://yourdomain.com';
const TIMEOUT = 10000; // 10 seconds

console.log('🔍 CharlitexMobileConnect Health Check');
console.log(`🌐 Testing: ${SITE_URL}`);
console.log('='.repeat(50));

/**
 * Make HTTP request with timeout
 */
function makeRequest(url, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;

    const request = client.get(
      url,
      {
        timeout: timeout,
        headers: {
          'User-Agent': 'CharlitexMobileConnect-HealthCheck/1.0',
        },
      },
      (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            data: data,
          });
        });
      },
    );

    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });

    request.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Test website accessibility
 */
async function testSiteAccessibility() {
  console.log('🌐 Testing site accessibility...');

  try {
    const response = await makeRequest(SITE_URL);

    if (response.statusCode >= 200 && response.statusCode < 400) {
      console.log(`✅ Site accessible (Status: ${response.statusCode})`);
      return true;
    } else {
      console.log(`❌ Site returned status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Site accessibility failed: ${error.message}`);
    return false;
  }
}

/**
 * Test essential page content
 */
async function testPageContent() {
  console.log('📄 Testing page content...');

  try {
    const response = await makeRequest(SITE_URL);
    const content = response.data.toLowerCase();

    const requiredContent = ['charlitexmobileconnect', 'international calls', 'free', '155+', 'countries'];

    let contentScore = 0;
    const missingContent = [];

    requiredContent.forEach((item) => {
      if (content.includes(item)) {
        contentScore++;
      } else {
        missingContent.push(item);
      }
    });

    const contentPercentage = (contentScore / requiredContent.length) * 100;

    if (contentPercentage >= 80) {
      console.log(`✅ Content check passed (${contentScore}/${requiredContent.length} items found)`);
      return true;
    } else {
      console.log(`❌ Content check failed (${contentScore}/${requiredContent.length} items found)`);
      console.log(`   Missing: ${missingContent.join(', ')}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Content check failed: ${error.message}`);
    return false;
  }
}

/**
 * Test SEO elements
 */
async function testSEOElements() {
  console.log('🔍 Testing SEO elements...');

  try {
    const response = await makeRequest(SITE_URL);
    const content = response.data;

    const seoElements = [
      { name: 'Title Tag', pattern: /<title[^>]*>.*CharlitexMobileConnect.*<\/title>/i },
      { name: 'Meta Description', pattern: /<meta[^>]*name=["\']description["\'][^>]*content=["\'][^"\']*international calls[^"\']*["\'][^>]*>/i },
      { name: 'Open Graph', pattern: /<meta[^>]*property=["\']og:title["\'][^>]*>/i },
      { name: 'Canonical URL', pattern: /<link[^>]*rel=["\']canonical["\'][^>]*>/i },
    ];

    let seoScore = 0;
    const missingSEO = [];

    seoElements.forEach((element) => {
      if (element.pattern.test(content)) {
        seoScore++;
      } else {
        missingSEO.push(element.name);
      }
    });

    const seoPercentage = (seoScore / seoElements.length) * 100;

    if (seoPercentage >= 75) {
      console.log(`✅ SEO check passed (${seoScore}/${seoElements.length} elements found)`);
      return true;
    } else {
      console.log(`❌ SEO check failed (${seoScore}/${seoElements.length} elements found)`);
      console.log(`   Missing: ${missingSEO.join(', ')}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ SEO check failed: ${error.message}`);
    return false;
  }
}

/**
 * Test performance metrics
 */
async function testPerformance() {
  console.log('⚡ Testing performance...');

  try {
    const startTime = Date.now();
    const response = await makeRequest(SITE_URL);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const contentLength = response.data.length;
    const contentSizeKB = Math.round((contentLength / 1024) * 100) / 100;

    console.log(`📊 Response time: ${responseTime}ms`);
    console.log(`📦 Content size: ${contentSizeKB}KB`);

    // Check performance thresholds
    if (responseTime < 3000 && contentSizeKB < 1024) {
      console.log('✅ Performance check passed');
      return true;
    } else {
      if (responseTime >= 3000) {
        console.log(`⚠️ Slow response time: ${responseTime}ms (should be < 3000ms)`);
      }
      if (contentSizeKB >= 1024) {
        console.log(`⚠️ Large content size: ${contentSizeKB}KB (should be < 1024KB)`);
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ Performance check failed: ${error.message}`);
    return false;
  }
}

/**
 * Main health check function
 */
async function runHealthCheck() {
  const startTime = Date.now();

  console.log(`🕐 Started at: ${new Date().toISOString()}`);
  console.log();

  const tests = [
    { name: 'Site Accessibility', fn: testSiteAccessibility },
    { name: 'Page Content', fn: testPageContent },
    { name: 'SEO Elements', fn: testSEOElements },
    { name: 'Performance', fn: testPerformance },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.log(`❌ ${test.name} crashed: ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
    console.log(); // Add spacing between tests
  }

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  // Summary
  console.log('='.repeat(50));
  console.log('📊 HEALTH CHECK SUMMARY');
  console.log('='.repeat(50));

  let passedTests = 0;
  results.forEach((result) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.name}`);
    if (result.passed) passedTests++;
  });

  console.log();
  console.log(`📈 Score: ${passedTests}/${results.length} tests passed`);
  console.log(`⏱️  Total time: ${totalTime}ms`);
  console.log(`🕐 Completed at: ${new Date().toISOString()}`);

  const overallSuccess = passedTests === results.length;
  if (overallSuccess) {
    console.log();
    console.log('🎉 ALL CHECKS PASSED! CharlitexMobileConnect is healthy! 🎉');
    process.exit(0);
  } else {
    console.log();
    console.log(`❌ ${results.length - passedTests} check(s) failed. Please investigate.`);
    process.exit(1);
  }
}

// Run the health check
if (require.main === module) {
  runHealthCheck().catch((error) => {
    console.error('💥 Health check crashed:', error);
    process.exit(1);
  });
}

module.exports = { runHealthCheck };
