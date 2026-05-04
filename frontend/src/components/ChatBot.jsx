import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sprout } from 'lucide-react';
import { useTranslation } from '../lib/TranslationContext';
import './ChatBot.css';

function ChatBot() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t("Namaste! 🌱 I'm your KrishiMitra farming assistant. Ask me anything about crops, soil, irrigation, pest control, or farming techniques!"),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || t('Sorry, I could not process your request.') },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('Sorry, I could not connect to the server. Please try again.') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'chatbot-toggle--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
        id="chatbot-toggle"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      <div className={`chatbot ${isOpen ? 'chatbot--open' : ''}`} id="chatbot-window">
        <div className="chatbot__header">
          <div className="chatbot__header-info">
            <div className="chatbot__avatar">
              <Sprout size={20} />
            </div>
            <div>
              <h3>{t('KrishiMitra AI')}</h3>
              <span className="chatbot__status">
                <span className="chatbot__status-dot"></span>
                {t('Online')}
              </span>
            </div>
          </div>
          <button className="chatbot__close" onClick={() => setIsOpen(false)} id="chatbot-close">
            <X size={18} />
          </button>
        </div>

        <div className="chatbot__messages" id="chatbot-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chatbot__message chatbot__message--${msg.role}`}
            >
              {msg.role === 'assistant' && (
                <div className="chatbot__message-avatar">
                  <Sprout size={14} />
                </div>
              )}
              <div className="chatbot__message-bubble">
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chatbot__message chatbot__message--assistant">
              <div className="chatbot__message-avatar">
                <Sprout size={14} />
              </div>
              <div className="chatbot__message-bubble chatbot__message-bubble--typing">
                <div className="chatbot__typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chatbot__input-form" onSubmit={sendMessage} id="chatbot-form">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("Ask about farming...")}
            className="chatbot__input"
            disabled={loading}
            id="chatbot-input"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="chatbot__send"
            id="chatbot-send"
          >
            {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </>
  );
}

export default ChatBot;
