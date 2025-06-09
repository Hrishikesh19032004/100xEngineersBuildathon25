// find-bad-route.js - Isolate the problematic route
const express = require('express');
require('dotenv').config();

console.log('=== FINDING PROBLEMATIC ROUTE ===\n');

const routes = [
  { name: 'Auth Routes', path: './routes/auth', mountPath: '/api/auth' },
  { name: 'Business Routes', path: './routes/business', mountPath: '/api/business' },
  { name: 'Creator Routes', path: './routes/creator', mountPath: '/api/creator' },
  { name: 'Chatroom Routes', path: './routes/chatroom', mountPath: '/api/chatroom' },
  { name: 'Message Routes', path: './routes/message', mountPath: '/api/message' },
  { name: 'Zego Routes', path: './routes/zego', mountPath: '/api/zego' }
];

async function testEachRoute() {
  for (const { name, path, mountPath } of routes) {
    console.log(`Testing ${name}...`);
    
    try {
      // Create fresh app for each test
      const app = express();
      app.use(express.json());
      
      // Import route
      const route = require(path);
      console.log(`  ✅ Import successful`);
      
      // Try to mount route - this is where the error occurs
      app.use(mountPath, route);
      console.log(`  ✅ Mount successful at ${mountPath}`);
      
      // Try to get route stack info
      if (route && route.stack) {
        console.log(`  📝 Route has ${route.stack.length} handlers`);
        route.stack.forEach((layer, index) => {
          if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
            console.log(`    Route ${index + 1}: ${methods} ${layer.route.path}`);
          }
        });
      }
      
      console.log(`  ✅ ${name} is OK\n`);
      
    } catch (error) {
      console.log(`  ❌ ${name} FAILED!`);
      console.log(`  Error: ${error.message}`);
      console.log(`  Stack: ${error.stack.split('\n')[1]?.trim()}\n`);
      
      // This is the problematic route - let's analyze it
      console.log(`🔍 ANALYZING ${name.toUpperCase()}:`);
      await analyzeRoute(path, name);
      break; // Stop at first failure
    }
  }
}

async function analyzeRoute(routePath, routeName) {
  try {
    console.log(`\n=== ANALYZING ${routeName.toUpperCase()} ===`);
    
    // Read the route file content
    const fs = require('fs');
    const fileContent = fs.readFileSync(routePath.replace('./', ''), 'utf8');
    
    console.log('📄 Route file content analysis:');
    
    // Look for common route patterns that might be malformed
    const lines = fileContent.split('\n');
    const routePatterns = [];
    
    lines.forEach((line, index) => {
      // Look for router method calls
      if (line.match(/router\.(get|post|put|delete|patch)\s*\(/)) {
        const match = line.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
        if (match) {
          const method = match[1].toUpperCase();
          const path = match[2];
          routePatterns.push({ line: index + 1, method, path, raw: line.trim() });
        }
      }
    });
    
    console.log(`\n📍 Found ${routePatterns.length} route definitions:`);
    routePatterns.forEach(({ line, method, path, raw }) => {
      console.log(`  Line ${line}: ${method} ${path}`);
      
      // Check for common issues
      if (path.includes(':') && !path.match(/:[a-zA-Z_][a-zA-Z0-9_]*/)) {
        console.log(`    ⚠️  POTENTIAL ISSUE: Invalid parameter syntax in "${path}"`);
      }
      if (path.includes('::')) {
        console.log(`    ⚠️  POTENTIAL ISSUE: Double colon in "${path}"`);
      }
      if (path.endsWith(':')) {
        console.log(`    ⚠️  POTENTIAL ISSUE: Parameter name missing after colon in "${path}"`);
      }
      if (path.includes('/:')) {
        const afterColon = path.split('/:')[1];
        if (afterColon && !afterColon.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
          console.log(`    ⚠️  POTENTIAL ISSUE: Invalid parameter name "${afterColon}" in "${path}"`);
        }
      }
    });
    
    // Show suspicious lines
    console.log(`\n🔍 Checking for suspicious patterns:`);
    lines.forEach((line, index) => {
      if (line.includes('router.') && (line.includes(':') || line.includes('/'))) {
        const trimmed = line.trim();
        if (trimmed) {
          // Check for malformed route patterns
          if (trimmed.match(/['"`][^'"`]*:(?![a-zA-Z_])/)) {
            console.log(`  ⚠️  Line ${index + 1}: ${trimmed}`);
            console.log(`      ^ This line might have a malformed route parameter`);
          }
        }
      }
    });
    
  } catch (readError) {
    console.log(`❌ Could not analyze route file: ${readError.message}`);
  }
}

// Run the test
testEachRoute().catch(console.error);