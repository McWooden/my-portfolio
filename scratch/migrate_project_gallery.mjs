import fs from 'fs';
import path from 'path';

const PROJECTS_DIR = 'src/content/projects';

function migrate() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.error(`Directory not found: ${PROJECTS_DIR}`);
    return;
  }
  
  const files = fs.readdirSync(PROJECTS_DIR);
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(PROJECTS_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (data.gallery) {
      console.log(`Project ${file} already has gallery field. Skipping...`);
      continue;
    }
    
    const images = data.images || [];
    const imageCaps = data.imageCaps || [];
    
    const gallery = [];
    const maxLength = Math.max(images.length, imageCaps.length);
    for (let i = 0; i < maxLength; i++) {
      gallery.push({
        image: images[i] || null,
        caption: imageCaps[i] || ''
      });
    }
    
    data.gallery = gallery;
    
    // Clean up old fields
    delete data.images;
    delete data.imageCaps;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Migrated ${file}: merged ${images.length} images and ${imageCaps.length} captions into gallery.`);
  }
}

console.log('Starting project gallery migration...');
migrate();
console.log('Migration finished successfully!');
