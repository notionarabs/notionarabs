#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing bundle size...\n');

// Set environment variable for bundle analyzer
process.env.ANALYZE = 'true';

try {
  // Build the application with bundle analyzer
  console.log('📦 Building application with bundle analyzer...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n✅ Bundle analysis complete!');
  console.log('📊 Check the generated report in your browser.');
  
  // Create a summary report
  const buildDir = path.join(__dirname, '../.next');
  const staticDir = path.join(buildDir, 'static');
  
  if (fs.existsSync(staticDir)) {
    console.log('\n📈 Bundle Summary:');
    
    // Analyze JS chunks
    const jsDir = path.join(staticDir, 'chunks');
    if (fs.existsSync(jsDir)) {
      const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
      let totalJSSize = 0;
      
      console.log('\n📄 JavaScript Chunks:');
      jsFiles.forEach(file => {
        const filePath = path.join(jsDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        totalJSSize += stats.size;
        console.log(`  ${file}: ${sizeKB} KB`);
      });
      
      console.log(`\n📊 Total JS Size: ${(totalJSSize / 1024).toFixed(2)} KB`);
    }
    
    // Analyze CSS files
    const cssDir = path.join(staticDir, 'css');
    if (fs.existsSync(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
      let totalCSSSize = 0;
      
      console.log('\n🎨 CSS Files:');
      cssFiles.forEach(file => {
        const filePath = path.join(cssDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        totalCSSSize += stats.size;
        console.log(`  ${file}: ${sizeKB} KB`);
      });
      
      console.log(`\n📊 Total CSS Size: ${(totalCSSSize / 1024).toFixed(2)} KB`);
    }
    
    console.log('\n💡 Optimization Tips:');
    console.log('  - Use dynamic imports for large components');
    console.log('  - Implement code splitting for routes');
    console.log('  - Optimize images with Next.js Image component');
    console.log('  - Remove unused dependencies');
    console.log('  - Use tree shaking for better bundle optimization');
  }
  
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
}
