export const convertToWebP = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 1920;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas conversion to blob failed'));
            }
          },
          'image/webp',
          0.85
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const wrapImagesInContentEditableFalse = (html) => {
  if (!html) return '';
  if (typeof window === 'undefined') return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const imgs = doc.querySelectorAll('img');
  imgs.forEach((img) => {
    let wrapper = img.parentElement;
    
    // If the image is directly inside a P tag, or its wrapper DIV is inside a P tag, unwrap it.
    if (wrapper && wrapper.tagName === 'P') {
      const newWrapper = doc.createElement('div');
      newWrapper.setAttribute('contenteditable', 'false');
      newWrapper.className = 'image-wrapper w-full my-6 select-none flex flex-col items-center';
      img.className = 'rounded-[20px] border border-border w-full';
      
      wrapper.parentNode.insertBefore(newWrapper, wrapper.nextSibling);
      newWrapper.appendChild(img);
      wrapper = newWrapper;
    } else if (wrapper && wrapper.tagName === 'DIV' && wrapper.parentNode && wrapper.parentNode.tagName === 'P') {
      const pNode = wrapper.parentNode;
      pNode.parentNode.insertBefore(wrapper, pNode.nextSibling);
      if (pNode.innerHTML.trim() === '' || pNode.innerHTML === '<br>') {
        pNode.remove();
      }
    }

    const isDirectlyWrapped = wrapper && wrapper.tagName === 'DIV' && wrapper.getAttribute('contenteditable') === 'false';
    if (!isDirectlyWrapped) {
      wrapper = doc.createElement('div');
      wrapper.setAttribute('contenteditable', 'false');
      wrapper.className = 'image-wrapper w-full my-6 select-none flex flex-col items-center';
      img.className = 'rounded-[20px] border border-border w-full';
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
    } else {
      wrapper.className = 'image-wrapper w-full my-6 select-none flex flex-col items-center';
    }

    let next = wrapper.nextSibling;
    while (next && next.nodeType === 3) {
      next = next.nextSibling;
    }
    if (next && next.classList && next.classList.contains('image-caption')) {
      wrapper.appendChild(next);
    }

    // Always guarantee that a caption element exists inside the wrapper
    let caption = wrapper.querySelector('.image-caption');
    if (!caption) {
      caption = doc.createElement('span');
      caption.className = 'image-caption text-center text-sm text-neutral-500 font-mono mt-[10px] outline-none block w-full';
      caption.setAttribute('contenteditable', 'true');
      caption.setAttribute('placeholder', 'Type caption for image (optional)');
      wrapper.appendChild(caption);
    } else {
      caption.className = 'image-caption text-center text-sm text-neutral-500 font-mono mt-[10px] outline-none block w-full';
      caption.setAttribute('contenteditable', 'true');
      caption.setAttribute('placeholder', 'Type caption for image (optional)');
    }

    // Clean up any stray paragraphs or other non-image elements inside the wrapper
    if (wrapper.parentNode) {
      const nonImageChildren = [];
      Array.from(wrapper.childNodes).forEach((child) => {
        if (child !== img && child !== caption) {
          nonImageChildren.push(child);
        }
      });
      const refNode = wrapper.nextSibling;
      nonImageChildren.forEach((child) => {
        wrapper.parentNode.insertBefore(child, refNode);
      });
    }
  });
  return doc.body.innerHTML;
};

export const highlightSyntax = (codeText, lang) => {
  if (!codeText) return '';
  if (lang === 'txt') {
    return codeText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  }

  let html = codeText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const tokens = [];
  let tokenCounter = 0;
  
  const addToken = (str, className) => {
    const placeholder = `___TOKEN_${tokenCounter++}___`;
    tokens.push({ placeholder, html: `<span class="${className}">${str}</span>` });
    return placeholder;
  };

  // 1. Comments
  if (lang === 'python' || lang === 'php') {
    html = html.replace(/(#[^\n]*)/g, (match) => addToken(match, 'hl-comment'));
  }
  if (lang !== 'python' && lang !== 'json') {
    html = html.replace(/(\/\/[^\n]*)/g, (match) => addToken(match, 'hl-comment'));
    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, (match) => addToken(match, 'hl-comment'));
  }

  // 2. Strings
  html = html.replace(/("(?:\\.|[^"\\])*")/g, (match) => addToken(match, 'hl-string'));
  html = html.replace(/('(?:\\.|[^'\\])*')/g, (match) => addToken(match, 'hl-string'));
  if (['js', 'ts', 'jsx', 'tsx'].includes(lang)) {
    html = html.replace(/(`(?:\\.|[^`\\])*`)/g, (match) => addToken(match, 'hl-string'));
  }

  // 3. Keywords
  let keywords = [];
  if (['js', 'ts', 'jsx', 'tsx'].includes(lang)) {
    keywords = ['const', 'let', 'var', 'function', 'class', 'import', 'export', 'from', 'default', 'return', 'if', 'else', 'for', 'while', 'new', 'async', 'await', 'try', 'catch', 'finally', 'switch', 'case', 'break', 'continue', 'typeof', 'instanceof', 'in', 'of', 'extends', 'super', 'this', 'true', 'false', 'null', 'undefined', 'throw'];
  } else if (lang === 'python') {
    keywords = ['def', 'class', 'import', 'from', 'as', 'return', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'lambda', 'and', 'or', 'not', 'is', 'in', 'pass', 'break', 'continue', 'True', 'False', 'None', 'global', 'nonlocal', 'yield', 'del', 'assert'];
  } else if (lang === 'php') {
    keywords = ['function', 'class', 'public', 'private', 'protected', 'static', 'return', 'if', 'else', 'elseif', 'foreach', 'for', 'while', 'echo', 'new', 'try', 'catch', 'finally', 'throw', 'namespace', 'use', 'extends', 'implements', 'interface', 'trait', 'array', 'as', 'break', 'case', 'const', 'continue', 'default', 'die', 'exit', 'global', 'include', 'include_once', 'require', 'require_once', 'switch'];
  } else if (lang === 'json') {
    keywords = ['true', 'false', 'null'];
  }

  if (keywords.length > 0) {
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    html = html.replace(keywordRegex, (match) => addToken(match, 'hl-keyword'));
  }

  // 4. Numbers
  html = html.replace(/\b(\d+)\b/g, (match) => addToken(match, 'hl-number'));

  // 5. Special rules for HTML tags and CSS properties
  if (lang === 'html') {
    html = html.replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, (match) => {
      return match.replace(/(&lt;\/?[a-zA-Z0-9:-]+)/, (m) => addToken(m, 'hl-keyword'));
    });
    html = html.replace(/(\s[a-zA-Z0-9:-]+(?=\s*=))/g, (match) => addToken(match, 'hl-builtin'));
  } else if (lang === 'css') {
    // 1. Hex colors (e.g. #ffffff)
    html = html.replace(/(#[a-fA-F0-9]{3,8})\b/g, (match) => addToken(match, 'hl-number'));
    // 2. Selectors (e.g. .class, #id)
    html = html.replace(/(\.[a-zA-Z0-9_-]+|#[a-zA-Z0-9_-]+)/g, (match) => addToken(match, 'hl-keyword'));
    // 3. Properties (e.g. color, background)
    html = html.replace(/([a-zA-Z-]+\s*:\s*)/g, (match) => {
      const parts = match.split(':');
      return addToken(parts[0], 'hl-builtin') + ':';
    });
  }

  let changed = true;
  while (changed) {
    changed = false;
    tokens.forEach((t) => {
      if (html.includes(t.placeholder)) {
        html = html.replace(t.placeholder, t.html);
        changed = true;
      }
    });
  }

  return html.replace(/\n/g, '<br>');
};

const createCustomDropdown = (doc, currentLang, languageColors) => {
  const container = doc.createElement('div');
  container.className = 'code-language-dropdown relative z-20';
  
  const btn = doc.createElement('button');
  btn.className = 'code-language-btn text-neutral-400 text-xs font-sans opacity-70 hover:text-white transition-colors flex items-center gap-1 cursor-pointer py-1';
  btn.setAttribute('type', 'button');
  
  const span = doc.createElement('span');
  span.className = 'selected-lang';
  span.textContent = currentLang;
  
  const chevron = doc.createElement('span');
  chevron.className = 'chevron';
  chevron.textContent = '▼';
  chevron.style.fontSize = '8px';
  chevron.style.marginLeft = '2px';
  chevron.style.opacity = '0.5';
  
  btn.appendChild(span);
  btn.appendChild(chevron);
  
  const menu = doc.createElement('div');
  menu.className = 'code-language-menu hidden absolute left-0 mt-1 w-24 bg-neutral-950 border border-neutral-900 rounded-xl py-1.5 px-1 shadow-2xl flex flex-col gap-0.5 z-30 max-h-40 overflow-y-auto';
  
  const languages = [
    { val: 'txt', label: 'txt' },
    { val: 'html', label: 'html' },
    { val: 'css', label: 'css' },
    { val: 'js', label: 'js' },
    { val: 'ts', label: 'ts' },
    { val: 'jsx', label: 'jsx' },
    { val: 'tsx', label: 'tsx' },
    { val: 'python', label: 'python' },
    { val: 'php', label: 'php' },
    { val: 'json', label: 'json' }
  ];
  
  languages.forEach((lang) => {
    const item = doc.createElement('div');
    const isSel = lang.val === currentLang;
    item.className = `code-language-item w-full text-left px-2.5 py-1.5 hover:bg-neutral-900 rounded-lg text-xs transition-colors duration-150 cursor-pointer ${isSel ? 'bg-neutral-900 text-white selected' : 'text-neutral-400'}`;
    item.setAttribute('data-value', lang.val);
    item.textContent = lang.label;
    menu.appendChild(item);
  });
  
  container.appendChild(btn);
  container.appendChild(menu);
  return container;
};

export const wrapCodeBlocksInWrapper = (html) => {
  if (!html) return '';
  if (typeof window === 'undefined') return html;
  
  const languageColors = {
    txt: '#a3a3a3',
    html: '#f06529',
    css: '#2965f1',
    js: '#f7df1e',
    ts: '#3178c6',
    jsx: '#61dafb',
    tsx: '#007acc',
    python: '#3776ab',
    php: '#777bb4',
    json: '#f5ba1a'
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const pres = doc.querySelectorAll('pre');
  
  pres.forEach((pre) => {
    const currentLang = pre.getAttribute('data-language') || 'txt';
    pre.className = 'code-block-wrapper relative group my-6 border border-neutral-900 bg-[#050505] rounded-2xl p-8 flex flex-col gap-0';
    pre.setAttribute('spellcheck', 'false');

    let header = pre.querySelector('.code-block-header');
    if (!header) {
      header = doc.createElement('div');
      header.setAttribute('contenteditable', 'false');
      header.className = 'code-block-header flex items-center justify-between';
      pre.insertBefore(header, pre.firstChild);
    } else {
      header.setAttribute('contenteditable', 'false');
      header.className = 'code-block-header flex items-center justify-between';
    }

    let dropdown = header.querySelector('.code-language-dropdown');
    if (!dropdown) {
      dropdown = createCustomDropdown(doc, currentLang, languageColors);
      header.appendChild(dropdown);
    } else {
      dropdown.className = 'code-language-dropdown relative z-20';
      const span = dropdown.querySelector('.selected-lang');
      if (span) span.textContent = currentLang;
      const items = dropdown.querySelectorAll('.code-language-item');
      items.forEach((item) => {
        const val = item.getAttribute('data-value');
        if (val === currentLang) {
          item.className = 'code-language-item w-full text-left px-2.5 py-1.5 hover:bg-neutral-900 rounded-lg text-xs transition-colors duration-150 cursor-pointer bg-neutral-900 text-white selected';
        } else {
          item.className = 'code-language-item w-full text-left px-2.5 py-1.5 hover:bg-neutral-900 rounded-lg text-xs transition-colors duration-150 cursor-pointer text-neutral-400';
        }
      });
    }

    let copyBtn = header.querySelector('.copy-code-btn');
    if (!copyBtn) {
      copyBtn = doc.createElement('button');
      copyBtn.className = 'copy-code-btn border border-neutral-800 rounded-lg px-2 py-1 hover:bg-neutral-900 transition-colors cursor-pointer flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-sans';
      copyBtn.setAttribute('type', 'button');
      copyBtn.innerHTML = `
        <svg class="w-3 h-3 transform -scale-x-100" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        <span>Copy</span>
      `;
      header.appendChild(copyBtn);
    } else {
      copyBtn.className = 'copy-code-btn border border-neutral-800 rounded-lg px-2 py-1 hover:bg-neutral-900 transition-colors cursor-pointer flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-sans';
      copyBtn.innerHTML = `
        <svg class="w-3 h-3 transform -scale-x-100" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        <span>Copy</span>
      `;
    }

    // Support migrating from <code> tags to <span class="pre--content">
    let oldCode = pre.querySelector('code');
    let contentSpan = pre.querySelector('.pre--content');
    if (oldCode && !contentSpan) {
      contentSpan = doc.createElement('span');
      contentSpan.className = 'pre--content block font-mono text-sm overflow-x-auto text-left w-full bg-transparent border-0 rounded-none p-0 m-0 text-neutral-300';
      contentSpan.innerHTML = oldCode.innerHTML;
      oldCode.replaceWith(contentSpan);
    } else if (!contentSpan) {
      contentSpan = doc.createElement('span');
      contentSpan.className = 'pre--content block font-mono text-sm overflow-x-auto text-left w-full bg-transparent border-0 rounded-none p-0 m-0 text-neutral-300';
      
      const childNodes = Array.from(pre.childNodes);
      childNodes.forEach((child) => {
        if (child !== header) {
          contentSpan.appendChild(child);
        }
      });
      pre.appendChild(contentSpan);
    } else {
      contentSpan.className = 'pre--content block font-mono text-sm overflow-x-auto text-left w-full bg-transparent border-0 rounded-none p-0 m-0 text-neutral-300';
    }

    pre.removeAttribute('contenteditable');
    const rawText = contentSpan.innerHTML
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<[^>]+>/g, '');
    contentSpan.innerHTML = highlightSyntax(rawText, currentLang);
  });
  
  // If there are legacy wrapping divs, unwrap them
  const legacyWrappers = doc.querySelectorAll('div.code-block-wrapper');
  legacyWrappers.forEach((div) => {
    const parent = div.parentNode;
    if (parent) {
      while (div.firstChild) {
        parent.insertBefore(div.firstChild, div);
      }
      parent.removeChild(div);
    }
  });

  return doc.body.innerHTML;
};
