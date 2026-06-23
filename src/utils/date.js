export function formatDate(dateStr) {
  if (!dateStr) return '';
  
  // Check if it's already formatted (e.g. "May 20, 2025")
  if (isNaN(Date.parse(dateStr))) {
    return dateStr;
  }
  
  // Format YYYY-MM-DD to "MMM DD, YYYY"
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
