import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    projects: collection({
      label: 'Projects (Portfolio)',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        subtitle: fields.text({ label: 'Subtitle' }),
        date: fields.text({ label: 'Date' }),
        location: fields.text({ label: 'Location' }),
        industry: fields.text({ label: 'Industry' }),
        testimonial: fields.object({
          quote: fields.text({ label: 'Quote', multiline: true }),
          author: fields.text({ label: 'Author' }),
          company: fields.text({ label: 'Company' }),
        }, {
          label: 'Testimonial',
        }),
        challenge: fields.text({ label: 'Challenge', multiline: true }),
        solution: fields.text({ label: 'Solution', multiline: true }),
        solutionDetails: fields.array(fields.text({ label: 'Solution Detail Item' }), {
          label: 'Solution Details',
          itemLabel: (props) => props.value || 'Detail Item',
        }),
        gallery: fields.array(
          fields.object({
            image: fields.image({
              label: 'Image',
              directory: 'public/images/projects',
              publicPath: '/images/projects/',
            }),
            caption: fields.text({ label: 'Caption' }),
          }),
          {
            label: 'Project Gallery (Images & Captions)',
            itemLabel: (props) => {
              const caption = props.fields.caption.value;
              const image = props.fields.image.value;
              if (caption) return `Gallery: ${caption}`;
              if (image) return `Gallery: ${image.split('/').pop()}`;
              return 'Gallery Item (No Image)';
            }
          }
        ),
        outcome: fields.text({ label: 'Outcome', multiline: true }),
        outcomeDetails: fields.array(fields.text({ label: 'Outcome Detail Item' }), {
          label: 'Outcome Details',
          itemLabel: (props) => props.value || 'Detail Item',
        }),
        featured: fields.checkbox({ label: 'Featured Project', defaultValue: false }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/images/projects',
          publicPath: '/images/projects/',
        }),
      },
    }),
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        category: fields.text({ label: 'Category' }),
        date: fields.text({ label: 'Date' }),
        subtitle: fields.text({ label: 'Subtitle' }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/images/blog',
          publicPath: '/images/blog/',
        }),
        paragraphs: fields.array(
          fields.text({ label: 'Paragraph', multiline: true }),
          {
            label: 'Paragraphs',
            itemLabel: (props) => props.value || 'Paragraph Text',
          }
        ),
      },
    }),
    faqs: collection({
      label: 'FAQs',
      slugField: 'number',
      path: 'src/content/faqs/*',
      format: { data: 'json' },
      schema: {
        number: fields.slug({ name: { label: 'Number (e.g. 01)' } }),
        question: fields.text({ label: 'Question' }),
        answer: fields.text({ label: 'Answer', multiline: true }),
      },
    }),
    reviews: collection({
      label: 'Reviews (Testimonials)',
      slugField: 'author',
      path: 'src/content/reviews/*',
      format: { data: 'json' },
      schema: {
        rating: fields.text({ label: 'Rating (e.g. 5.0)', defaultValue: '5.0' }),
        text: fields.text({ label: 'Review Text', multiline: true }),
        author: fields.slug({ name: { label: 'Author Name' } }),
        company: fields.text({ label: 'Company Name' }),
        avatarImage: fields.image({
          label: 'Avatar Image',
          directory: 'public/images/reviews',
          publicPath: '/images/reviews/',
        }),
      },
    }),
  },
  singletons: {
    homepage: singleton({
      label: 'Homepage Settings',
      path: 'src/content/homepage',
      format: { data: 'json' },
      schema: {
        status: fields.select({
          label: 'Availability Status',
          options: [
            { label: 'Available (Green)', value: 'available' },
            { label: 'Working on Project (Yellow)', value: 'working' },
            { label: 'Busy (Red)', value: 'busy' },
            { label: 'On Holiday (Blue)', value: 'holiday' }
          ],
          defaultValue: 'available',
        }),
        openSlots: fields.number({
          label: 'Open Slots',
          defaultValue: 3,
        }),
        heroTestimonialProject: fields.relationship({
          label: 'Hero Testimonial Project Reference',
          collection: 'projects',
        }),
        featuredProjects: fields.array(
          fields.relationship({
            label: 'Project',
            collection: 'projects',
          }),
          {
            label: 'Featured Projects on Homepage',
            itemLabel: (props) => props.value || 'Select a project',
          }
        ),
        featuredBlogs: fields.array(
          fields.relationship({
            label: 'Blog Post',
            collection: 'blog',
          }),
          {
            label: 'Featured Blog Posts on Homepage',
            itemLabel: (props) => props.value || 'Select a blog post',
          }
        ),
      },
    }),
  },
});
