import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const siteDataPath = 'file:///' + path.resolve(projectRoot, 'src/data/siteData.js').replace(/\\/g, '/');

console.log('Importing siteData from:', siteDataPath);

async function run() {
  const { blogPosts, faqs } = await import(siteDataPath);

  // Define target content directories
  const blogDir = path.join(projectRoot, 'src/content/blog');
  const faqsDir = path.join(projectRoot, 'src/content/faqs');
  const homepageDir = path.join(projectRoot, 'src/content'); // path: 'src/content/homepage' maps to 'src/content/homepage.json'

  // Ensure directories exist
  fs.mkdirSync(blogDir, { recursive: true });
  fs.mkdirSync(faqsDir, { recursive: true });
  fs.mkdirSync(homepageDir, { recursive: true });

  // 1. Migrate Blog Posts
  console.log(`Migrating ${blogPosts.length} blog posts...`);
  for (const post of blogPosts) {
    const postFilePath = path.join(blogDir, `${post.slug}.json`);
    const data = {
      title: post.title,
      category: post.category,
      date: post.date,
      subtitle: post.subtitle,
      coverImage: post.coverImage,
      paragraphs: post.paragraphs
    };
    fs.writeFileSync(postFilePath, JSON.stringify(data, null, 2));
    console.log(`Created: ${postFilePath}`);
  }

  // 2. Migrate FAQs
  console.log(`Migrating ${faqs.length} FAQs...`);
  for (const faq of faqs) {
    const faqFilePath = path.join(faqsDir, `${faq.number}.json`);
    const data = {
      number: faq.number,
      question: faq.question,
      answer: faq.answer
    };
    fs.writeFileSync(faqFilePath, JSON.stringify(data, null, 2));
    console.log(`Created: ${faqFilePath}`);
  }

  // 3. Create default Homepage settings
  const homepageFilePath = path.join(homepageDir, 'homepage.json');
  const homepageData = {
    status: 'available',
    openSlots: 3,
    heroTestimonialProject: 'onyx-skincare',
    featuredProjects: ['onyx-skincare', 'nova', 'fieldtype', 'alder-co'],
    featuredBlogs: ['things-i-wish-clients-knew', 'ideas-in-progress', 'behind-the-work', 'design-notes']
  };
  fs.writeFileSync(homepageFilePath, JSON.stringify(homepageData, null, 2));
  console.log(`Created homepage settings at: ${homepageFilePath}`);

  console.log('Migration completed successfully!');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
