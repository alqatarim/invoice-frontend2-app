export const groupChatMessages = (messages = []) => {
  const groups = [];

  messages.forEach((message) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.role === message.role) {
      lastGroup.messages.push(message);
      return;
    }
    groups.push({ role: message.role, messages: [message] });
  });

  return groups;
};
