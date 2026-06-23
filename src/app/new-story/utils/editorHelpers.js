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
    const isDirectlyWrapped = wrapper && wrapper.tagName === 'DIV' && wrapper.getAttribute('contenteditable') === 'false';
    
    if (!isDirectlyWrapped) {
      wrapper = doc.createElement('div');
      wrapper.setAttribute('contenteditable', 'false');
      wrapper.className = 'w-full my-6 select-none flex flex-col items-center';
      img.className = 'rounded-[20px] border border-border w-full';
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
    } else {
      wrapper.className = 'w-full my-6 select-none flex flex-col items-center';
    }

    let next = wrapper.nextSibling;
    while (next && next.nodeType === 3) {
      next = next.nextSibling;
    }
    if (next && next.classList && next.classList.contains('image-caption')) {
      wrapper.appendChild(next);
    }
  });
  return doc.body.innerHTML;
};
