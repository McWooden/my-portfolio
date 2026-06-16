import fs from 'fs';
import path from 'path';

const PROJECTS_DIR = 'src/content/projects';
const BLOG_DIR = 'src/content/blog';

function migrateImageField(val) {
  if (!val) return val;
  if (typeof val === 'string') {
    const isUrl = val.startsWith('http://') || val.startsWith('https://');
    return {
      discriminant: isUrl ? 'url' : 'local',
      value: val
    };
  }
  return val; // already migrated or object
}

function migrateProjects() {
  if (!fs.existsSync(PROJECTS_DIR)) return;
  const files = fs.readdirSync(PROJECTS_DIR);
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(PROJECTS_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    let modified = false;
    
    if (data.coverImage && typeof data.coverImage === 'string') {
      data.coverImage = migrateImageField(data.coverImage);
      modified = true;
    }
    
    if (data.images && Array.isArray(data.images)) {
      data.images = data.images.map((img) => {
        if (typeof img === 'string') {
          modified = true;
          return migrateImageField(img);
        }
        return img;
      });
    }
    
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Migrated project: ${file}`);
    }
  }
}

function migrateBlogs() {
  if (!fs.existsSync(BLOG_DIR)) return;
  const files = fs.readdirSync(BLOG_DIR);
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(BLOG_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    let modified = false;
    
    if (data.coverImage && typeof data.coverImage === 'string') {
      data.coverImage = migrateImageField(data.coverImage);
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Migrated blog: ${file}`);
    }
  }
}

console.log('Starting migration of projects and blogs image fields...');
migrateProjects();
migrateBlogs();
console.log('Migration finished successfully!');
