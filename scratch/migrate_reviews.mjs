import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const siteDataPath = 'file:///' + path.resolve(projectRoot, 'src/data/siteData.js').replace(/\\/g, '/');

console.log('Importing siteData from:', siteDataPath);

const AVATARS = {
  "Riley James": "https://framerusercontent.com/images/XeylT9Ic2cwthJBQFpH03b3XEo.png?width=1024&height=1024",
  "Marta L.": "https://framerusercontent.com/images/qMrMTWyggoctZktmN3xk9LziWM.png?width=1024&height=1024",
  "Tomas E.": "https://framerusercontent.com/images/v4L6r5bO1P0gFP6z0HYvFxRmcYw.png?scale-down-to=512&width=1024&height=1024",
  "Sofia R.": "https://framerusercontent.com/images/LVcACvWfr9MemEEBhRIZ9Mj0A.png?width=1024&height=1024",
  "Daniel M.": "https://framerusercontent.com/images/XeylT9Ic2cwthJBQFpH03b3XEo.png?width=1024&height=1024"
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

async function run() {
  const { reviews } = await import(siteDataPath);

  const reviewsDir = path.join(projectRoot, 'src/content/reviews');
  fs.mkdirSync(reviewsDir, { recursive: true });

  console.log(`Migrating ${reviews.length} reviews...`);
  for (const review of reviews) {
    const slug = slugify(review.author);
    const reviewFilePath = path.join(reviewsDir, `${slug}.json`);
    
    const data = {
      rating: review.rating,
      text: review.text,
      author: review.author,
      company: review.company,
      avatarImage: {
        discriminant: 'url',
        value: AVATARS[review.author] || "https://framerusercontent.com/images/XeylT9Ic2cwthJBQFpH03b3XEo.png?width=1024&height=1024"
      }
    };
    
    fs.writeFileSync(reviewFilePath, JSON.stringify(data, null, 2));
    console.log(`Created review: ${reviewFilePath}`);
  }

  console.log('Reviews migration completed successfully!');
}

run().catch((err) => {
  console.error('Reviews migration failed:', err);
  process.exit(1);
});
