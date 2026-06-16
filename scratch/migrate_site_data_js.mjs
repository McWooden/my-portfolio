import fs from 'fs';
import path from 'path';
import { projects } from '../src/data/siteData.js';

const siteDataPath = 'src/data/siteData.js';

function migrate() {
  const siteDataContent = fs.readFileSync(siteDataPath, 'utf8');

  const migratedProjects = projects.map(proj => {
    const images = proj.images || [];
    const imageCaps = proj.imageCaps || [];
    const gallery = [];
    const maxLength = Math.max(images.length, imageCaps.length);
    for (let i = 0; i < maxLength; i++) {
      gallery.push({
        image: images[i] || null,
        caption: imageCaps[i] || ''
      });
    }
    
    const newProj = { ...proj, gallery };
    delete newProj.images;
    delete newProj.imageCaps;
    return newProj;
  });

  const projectsStartStr = 'export const projects = [';
  const blogPostsStartStr = 'export const blogPosts = [';

  const startIndex = siteDataContent.indexOf(projectsStartStr);
  const endIndex = siteDataContent.indexOf(blogPostsStartStr);

  if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find projects or blogPosts start markers in siteData.js');
    return;
  }

  // Format the projects array output nicely
  const newProjectsContent = `export const projects = ${JSON.stringify(migratedProjects, null, 2)};\n\n`;

  const updatedContent = siteDataContent.slice(0, startIndex) + newProjectsContent + siteDataContent.slice(endIndex);

  fs.writeFileSync(siteDataPath, updatedContent, 'utf8');
  console.log('Successfully migrated projects in siteData.js to new gallery format!');
}

migrate();
