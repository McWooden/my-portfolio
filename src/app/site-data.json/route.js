import { NextResponse } from 'next/server';
import huddinConfig from '../../data/huddinContext.json';
import { projects, blogPosts, reviews } from '../../data/siteData';
import { networkPeople } from '../../data/networkData';

export const dynamic = 'force-dynamic';

export async function GET() {
  const aggregatedData = {
    personalInfo: {
      name: huddinConfig.name,
      master: huddinConfig.master,
      summary: huddinConfig.aboutHuddin?.summary,
      availability: huddinConfig.aboutHuddin?.availability,
      responseSpeed: huddinConfig.aboutHuddin?.responseSpeed,
      tools: huddinConfig.aboutHuddin?.tools,
    },
    services: huddinConfig.services,
    projects: projects,
    blogPosts: blogPosts,
    reviews: reviews,
    network: networkPeople.filter(person => person.name !== "larry"),
    faq: huddinConfig.faq,
    communitiesAndCerts: huddinConfig.communitiesAndCerts
  };

  return NextResponse.json(aggregatedData, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    }
  });
}
