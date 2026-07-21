import huddinConfig from '../../../data/huddinContext.json';

/**
 * Parses a chat message to check if it's a chatbot command or static FAQ reference.
 *
 * @param {string} text - Message text
 * @param {string} pathname - Current route path
 * @returns {{ isCommand: boolean, actionType: 'login' | 'navigation' | 'faq' | 'none', faqIdx: number, targetId: string | null, isPage: boolean }}
 */
export function parseCommandOrFaq(text, pathname) {
  const lowerText = text.toLowerCase().trim();
  
  // Is it a slash command or exact FAQ matching?
  const isSlash = lowerText.startsWith('/');
  const faqIdxExact = huddinConfig.faq.findIndex(
    f => f.question.toLowerCase().trim() === lowerText
  );
  
  const isCommand = isSlash || faqIdxExact !== -1;
  
  if (!isCommand) {
    return { isCommand: false, actionType: 'none', faqIdx: -1, targetId: null, isPage: false };
  }

  if (lowerText.startsWith('/login')) {
    return { isCommand: true, actionType: 'login', faqIdx: -1, targetId: null, isPage: false };
  }

  if (lowerText.startsWith('/navigation')) {
    const parts = text.trim().split(/\s+/);
    if (parts.length > 1) {
      const sec = parts[1].toLowerCase();
      if (sec === 'network') {
        return { isCommand: true, actionType: 'navigation', faqIdx: -1, targetId: 'network', isPage: true };
      }
      const mapping = { 
        home: 'hero', 
        services: 'services', 
        portfolio: 'portfolio', 
        reviews: 'reviews', 
        blog: 'blog', 
        faq: 'faq', 
        contact: 'contact' 
      };
      const id = mapping[sec];
      if (id) {
        return { isCommand: true, actionType: 'navigation', faqIdx: -1, targetId: id, isPage: false };
      }
    }
    return { isCommand: true, actionType: 'navigation', faqIdx: -1, targetId: null, isPage: false };
  }

  let faqIdx = faqIdxExact;
  if (lowerText.startsWith('/faq')) {
    const parts = text.trim().split(/\s+/);
    if (parts.length > 1) {
      const match = parts[1].match(/q(\d+)/i);
      if (match) {
        faqIdx = parseInt(match[1], 10) - 1;
      }
    }
  }

  if (faqIdx !== -1 && huddinConfig.faq[faqIdx]) {
    return { isCommand: true, actionType: 'faq', faqIdx, targetId: null, isPage: false };
  }

  return { isCommand: true, actionType: 'none', faqIdx: -1, targetId: null, isPage: false };
}

/**
 * Returns autocomplete suggestion items for command entry.
 */
export function getAutoCompleteItems({
  input,
  isPuterSignedIn,
  pathname,
  router,
  setInput,
  setShowAutocomplete,
  handlePuterSignIn,
  handleSendMessage
}) {
  const text = input.toLowerCase().trim();
  const queryText = (input.startsWith('/') || input === '') ? text : '/' + text;

  if (queryText === '' || queryText === '/') {
    const items = [
      { cmd: '/navigation', desc: 'Navigate homepage sections', action: () => { setInput('/navigation '); setShowAutocomplete(true); } },
      { cmd: '/faq', desc: 'Browse frequently asked questions', action: () => { setInput('/faq '); setShowAutocomplete(true); } }
    ];
    if (!isPuterSignedIn) {
      items.push({ cmd: '/login', desc: "Issue a session ticket!", action: () => { handlePuterSignIn(); setInput(''); setShowAutocomplete(false); } });
    }
    return items;
  }

  if (queryText.startsWith('/navigation')) {
    const subQuery = queryText.substring('/navigation'.length).trim().toLowerCase();
    const sections = [
      { label: 'Home', id: 'hero', cmd: '/navigation home', isPage: false },
      { label: 'Services', id: 'services', cmd: '/navigation services', isPage: false },
      { label: 'Portfolio', id: 'portfolio', cmd: '/navigation portfolio', isPage: false },
      { label: 'Reviews', id: 'reviews', cmd: '/navigation reviews', isPage: false },
      { label: 'Blog', id: 'blog', cmd: '/navigation blog', isPage: false },
      { label: 'FAQ', id: 'faq', cmd: '/navigation faq', isPage: false },
      { label: 'Contact', id: 'contact', cmd: '/navigation contact', isPage: false },
      { label: 'Network', id: 'network', cmd: '/navigation network', isPage: true }
    ];

    const filtered = sections.filter(s => s.cmd.toLowerCase().includes(queryText) || s.label.toLowerCase().includes(subQuery));
    return filtered.map(s => ({
      cmd: s.cmd,
      desc: s.isPage ? `Navigate to ${s.label}` : `Scroll to ${s.label}`,
      action: () => {
        if (s.isPage) {
          if (s.id === 'network') {
            if (pathname !== '/network') {
              window.dispatchEvent(new Event('page-loading-start'));
              router.push('/network');
            }
          }
        } else {
          if (pathname !== '/') {
            window.dispatchEvent(new Event('page-loading-start'));
            router.push('/#' + s.id);
          } else {
            const element = document.getElementById(s.id);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              window.history.pushState(null, null, `#${s.id}`);
            }
          }
        }
        setInput('');
        setShowAutocomplete(false);
      }
    }));
  }

  if (queryText.startsWith('/faq')) {
    const subQuery = queryText.substring('/faq'.length).trim().toLowerCase();
    const faqs = huddinConfig.faq.map((f, idx) => ({
      cmd: `/faq q${idx + 1}`,
      desc: f.question,
      action: () => {
        handleSendMessage(f.question);
        setInput('');
        setShowAutocomplete(false);
      }
    }));

    const filtered = faqs.filter(f => f.cmd.toLowerCase().includes(queryText) || f.desc.toLowerCase().includes(subQuery));
    return filtered;
  }

  const baseCommands = [
    { cmd: '/navigation', desc: 'Navigate homepage sections', action: () => { setInput('/navigation '); setShowAutocomplete(true); } },
    { cmd: '/faq', desc: 'Browse frequently asked questions', action: () => { setInput('/faq '); setShowAutocomplete(true); } },
    { cmd: '/login', desc: "Make a session ticket!", action: () => { handlePuterSignIn(); setInput(''); setShowAutocomplete(false); } }
  ];
  return baseCommands.filter(c => c.cmd.toLowerCase().startsWith(queryText));
}
