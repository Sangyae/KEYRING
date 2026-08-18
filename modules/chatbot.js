// modules/chatbot.js

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('chat-toggle-btn');
  const closeBtn = document.getElementById('chat-close-btn');
  const chatWindow = document.getElementById('chat-window');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const messagesContainer = document.getElementById('chat-messages');

  if (!toggleBtn || !chatWindow) return;

  // Toggle open/close
  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    toggleBtn.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
      chatInput.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
    toggleBtn.classList.remove('hidden');
  });

  // Handle form submission
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userText = chatInput.value.trim();
    if (!userText) return;

    // 1. Render User Message
    appendMessage(userText, 'user');
    chatInput.value = '';

    // 2. Render Loading State
    const loadingEl = appendMessage('...', 'bot');

    try {
      // 3. Send request to Node.js backend
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();
      loadingEl.textContent = data.reply || "Sorry, I couldn't process that.";
    } catch (err) {
      console.error('Chat error:', err);
      loadingEl.textContent = 'Oops! Something went wrong. Please try again.';
    }
  });

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `chat-message ${sender}`;
    msg.textContent = text;
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return msg;
  }
});