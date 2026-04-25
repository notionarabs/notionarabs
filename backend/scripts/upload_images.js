const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function processCSV(csvPath) {
  try {
    console.log(`Reading CSV: ${csvPath}`);
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split(/\r?\n/);
    if (lines.length < 2) return;

    const headers = lines[0].split(',');
    const imageIndex = headers.findIndex(h => h.toLowerCase().includes('image') || h.includes('صورة') || h.toLowerCase().includes('preview'));

    if (imageIndex === -1) {
      console.error('Could not find image column');
      return;
    }

    const newLines = [lines[0]];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      // Simple CSV splitter (doesn't handle commas in quotes, but we can improve if needed)
      // For now, let's use a more robust regex for CSV split
      const parts = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      
      // Clean up the match results
      const row = parts.map(p => p.replace(/^"|"$/g, '').trim());
      
      let imagePath = row[imageIndex];

      if (imagePath && (imagePath.includes(':') || imagePath.startsWith('/') || !imagePath.startsWith('http'))) {
        try {
          console.log(`Uploading local image: ${imagePath}`);
          // Resolve relative paths if necessary
          const absolutePath = path.isAbsolute(imagePath) ? imagePath : path.join(path.dirname(csvPath), imagePath);
          
          if (fs.existsSync(absolutePath)) {
            const result = await cloudinary.uploader.upload(absolutePath, {
              folder: 'notion_arabs_import'
            });
            console.log(`Successfully uploaded. URL: ${result.secure_url}`);
            row[imageIndex] = result.secure_url;
          } else {
            console.warn(`File not found: ${absolutePath}`);
          }
        } catch (uploadErr) {
          console.error(`Failed to upload ${imagePath}:`, uploadErr.message);
        }
      }

      // Reconstruct the CSV line with quotes to be safe
      const newRow = row.map(cell => `"${cell}"`).join(',');
      newLines.push(newRow);
    }

    const outputPath = csvPath.replace('.csv', '_ready.csv');
    // Using a very specific header to avoid clash
    newLines[0] = newLines[0].replace(/Preview Image \(رابط الصورة\)|Preview Image/i, 'Image (صورة القالب)');
    fs.writeFileSync(outputPath, '\ufeff' + newLines.join('\n'), 'utf8');
    console.log(`Finished! New CSV saved at: ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error('Process failed:', err);
  }
}

const targetFile = process.argv[2] || 'c:\\Users\\hazem\\Downloads\\notion_arabs_sample_template.csv';
processCSV(targetFile);
