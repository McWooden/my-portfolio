/**
 * Utility to prevent typographic orphans (single words on the last line).
 * It goes backwards through the text nodes of each block (p, h1, h2, h3, etc.)
 * to find the last space character and replaces it with a non-breaking space (\u00A0).
 * This works perfectly even if the last words are wrapped in formatting elements like spans, bold, or italic.
 */
export function preventOrphans(containerEl) {
  if (!containerEl) return;
  
  // Target blocks that contain text
  const blocks = containerEl.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
  
  blocks.forEach(block => {
    // Find all text nodes inside this block
    const walk = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const textNodes = [];
    while ((node = walk.nextNode())) {
      if (node.nodeValue && node.nodeValue.trim() !== '') {
        textNodes.push(node);
      }
    }
    
    // Search backwards through text nodes for the last space character to replace
    for (let i = textNodes.length - 1; i >= 0; i--) {
      const node = textNodes[i];
      const text = node.nodeValue;
      
      // Find the last space in the text node
      const lastSpace = text.lastIndexOf(' ');
      if (lastSpace !== -1) {
        node.nodeValue = 
          text.substring(0, lastSpace) + 
          '\u00A0' + 
          text.substring(lastSpace + 1);
        break; // Replaced the last space in the block, stop searching
      }
    }
  });
}
