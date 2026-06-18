import { NextResponse } from 'next/server';
import huddinConfig from '../../data/huddinContext.json';
import { projects, blogPosts, reviews } from '../../data/siteData';
import { networkPeople } from '../../data/networkData';

export const dynamic = 'force-dynamic';

export async function GET() {
  const master = huddinConfig.master || 'Sholahuddin Ahmad (Huddin)';
  const summary = huddinConfig.aboutHuddin?.summary || '';
  const availability = huddinConfig.aboutHuddin?.availability || '';
  const responseSpeed = huddinConfig.aboutHuddin?.responseSpeed || '';
  const tools = huddinConfig.aboutHuddin?.tools?.join(', ') || '';

  let markdown = `# Huddin - Developer & Designer Portfolio

${summary}

- **Availability**: ${availability}
- **Response Speed**: ${responseSpeed}
- **Primary Tools**: ${tools}

## Services Offered
`;

  Object.entries(huddinConfig.services || {}).forEach(([key, value]) => {
    markdown += `- **${key}**: ${value}\n`;
  });

  markdown += `\n## Projects & Case Studies\n\n`;
  projects.forEach((p) => {
    markdown += `### ${p.title}\n`;
    markdown += `- **Subtitle**: ${p.subtitle}\n`;
    markdown += `- **Date**: ${p.date} | **Location**: ${p.location} | **Industry**: ${p.industry}\n`;
    markdown += `- **Challenge**: ${p.challenge}\n`;
    markdown += `- **Solution**: ${p.solution}\n`;
    markdown += `- **Outcome**: ${p.outcome}\n`;
    if (p.testimonial) {
      markdown += `- **Testimonial**: "${p.testimonial.quote}" — ${p.testimonial.author}, ${p.testimonial.company}\n`;
    }
    markdown += `\n`;
  });

  markdown += `## Blog Posts\n\n`;
  blogPosts.forEach((post) => {
    markdown += `### ${post.title} (${post.category})\n`;
    markdown += `- **Date**: ${post.date}\n`;
    markdown += `- **Summary**: ${post.subtitle}\n`;
    if (post.paragraphs && post.paragraphs.length > 0) {
      markdown += `\n${post.paragraphs.join('\n\n')}\n`;
    }
    markdown += `\n`;
  });

  markdown += `## Professional Network\n\n`;
  networkPeople
    .filter((person) => person.name !== "larry")
    .forEach((person) => {
      markdown += `- **${person.name}** (${person.role}): ${person.website || '#'}\n`;
    });

  markdown += `\n## Testimonials\n\n`;
  reviews.forEach((r) => {
    markdown += `- [Rating: ${r.rating}/5.0] "${r.text}" — ${r.author}, ${r.company}\n`;
  });

  markdown += `\n## FAQ\n\n`;
  huddinConfig.faq?.forEach((f) => {
    markdown += `- **Q**: ${f.question}\n  **A**: ${f.answer}\n`;
  });

  markdown += `\n## Certifications & Communities\n\n`;
  markdown += `### Communities\n`;
  huddinConfig.communitiesAndCerts?.communities?.forEach((c) => {
    markdown += `- **${c.name}**: ${c.description}\n`;
  });
  markdown += `\n### Certifications\n`;
  huddinConfig.communitiesAndCerts?.certifications?.forEach((c) => {
    markdown += `- **${c.name}**: ${c.description}\n`;
  });

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
