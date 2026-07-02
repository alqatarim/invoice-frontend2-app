const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const formatChatDate = (value = new Date(), toTimeForCurrentDay = true) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  let formatting = { month: 'short', day: 'numeric' };
  if (toTimeForCurrentDay && isToday(date)) {
    formatting = { hour: 'numeric', minute: 'numeric', hour12: true };
  }

  return new Intl.DateTimeFormat('en-US', formatting).format(date);
};

export const getSessionPreview = (session = {}) => {
  const messages = Array.isArray(session.messages) ? session.messages : [];
  if (!messages.length) return 'Ask about sales, margins, or stock';

  const last = messages[messages.length - 1];
  if (last.role === 'user') return last.content;
  const textBlock = (last.blocks || []).find((block) => block.type === 'text');
  return textBlock?.content || 'Report generated';
};
