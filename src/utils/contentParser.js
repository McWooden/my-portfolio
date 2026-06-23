export function parseDocumentContent(content = [], fallbackTitle = '') {
  let title = fallbackTitle;
  let subtitle = '';
  let coverImage = null;

  // 1. Find the first heading block as Title
  const titleBlock = content.find(block => block.type === 'heading');
  if (titleBlock) {
    title = titleBlock.children?.map(c => c.text).join('') || title;
  }

  // 2. Find the first paragraph block as Subtitle
  const firstPara = content.find(block => block.type === 'paragraph');
  if (firstPara) {
    subtitle = firstPara.children?.map(c => c.text).join('') || '';
  }

  // 3. Find the first image block as Cover Image
  const firstImage = content.find(block => block.type === 'image');
  if (firstImage) {
    coverImage = firstImage.src || null;
  }

  // Filter out the extracted blocks so they don't duplicate in the body renderer
  const bodyContent = content.filter(block => block !== titleBlock && block !== firstPara && block !== firstImage);

  return {
    title,
    subtitle,
    coverImage,
    bodyContent
  };
}

export function parseProject(project, slug) {
  if (!project) return null;
  const { title, subtitle, coverImage, bodyContent } = parseDocumentContent(project.content, project.title || slug);
  return {
    ...project,
    slug,
    title,
    subtitle,
    coverImage,
    content: bodyContent
  };
}

export function parseBlog(blog, slug) {
  if (!blog) return null;
  const { title, subtitle, coverImage, bodyContent } = parseDocumentContent(blog.content, blog.title || slug);
  return {
    ...blog,
    slug,
    title,
    subtitle,
    coverImage,
    content: bodyContent
  };
}
