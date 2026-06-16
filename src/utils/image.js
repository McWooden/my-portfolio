/**
 * Resolves an image value from Keystatic schema fields.
 * Handles string paths (from fields.image()), null/undefined, and 
 * legacy object formats for backward compatibility.
 * 
 * @param {string | object | null} imageField - The image field value from Keystatic
 * @returns {string | null} The resolved image URL or path, null if none
 */
export function getImageUrl(imageField) {
  if (!imageField) return null;
  
  // Direct string path (from fields.image() or plain URL)
  if (typeof imageField === 'string') {
    return imageField;
  }
  
  // Legacy support: handle old { discriminant, value } format
  if (typeof imageField === 'object' && imageField.value) {
    return imageField.value;
  }
  
  return null;
}
