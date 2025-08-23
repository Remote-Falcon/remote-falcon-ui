import React, { useEffect, useRef, useState } from 'react';
import {useLazyQuery} from "@apollo/client";
import {ASK_WATTSON} from "../../../../utils/graphql/controlPanel/queries";
import {showAlert} from "../../globalPageHelpers";
import { useDispatch, useSelector } from '../../../../store';
import {gridSpacing} from "../../../../store/constant";
import {Box, Grid} from "@mui/material";
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import remarkBreaks from "remark-breaks";
import {useFeatureFlagPayload} from "posthog-js/react";
import mixpanel from "mixpanel-browser";

// Storage key for chat history
const STORAGE_KEY = 'wattson_chat_history';

const AskWattson = () => {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const { show } = useSelector((state) => state.show);

  const askWattsonPayload = useFeatureFlagPayload('ask-wattson');

  // Storage key (no user-specific partitioning)
  const getUserStorageKey = () => STORAGE_KEY;

  // Initialize messages from localStorage or use default welcome message
  const [messages, setMessages] = useState(() => {
    const storedMessages = typeof window !== 'undefined' ? localStorage.getItem(getUserStorageKey()) : null;

    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        return parsedMessages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (e) {
        console.error('Error parsing stored messages:', e);
      }
    }

    return [
      {
        id: 'welcome',
        role: 'assistant',
        content:
          `Hey, ${show.showName}! I'm Wattson, your light show assistant. You can ask me anything about Remote Falcon, FPP, or xLights!`,
        timestamp: new Date()
      }
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [askWattsonQuery] = useLazyQuery(ASK_WATTSON);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(getUserStorageKey(), JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  }, [messages]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-focus input field on component mount
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Function to clear chat history
  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the entire chat history?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            `Hey, ${show.showName}! I'm Wattson, your light show assistant. You can ask me anything about Remote Falcon, FPP, or xLights!`,
          timestamp: new Date()
        }
      ]);
    }
  };

  // Adjust textarea height based on content
  const adjustTextareaHeight = (element) => {
    if (!element) return;
    element.style.height = '24px'; // Reset height to minimum
    const newHeight = Math.min(element.scrollHeight, 120);
    element.style.height = `${newHeight}px`;
    const parent = element.parentElement;
    const sendButton = parent ? parent.querySelector('.send-button') : null;
    if (sendButton && newHeight > 40) {
      sendButton.classList.add('align-top');
    } else if (sendButton) {
      sendButton.classList.remove('align-top');
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    adjustTextareaHeight(e.target.value.length > 0 ? e.target : inputRef.current);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    if (inputRef.current) {
      inputRef.current.style.height = '24px'; // Reset height
    }

    await askWattsonQuery({
      context: {
        headers: {
          Route: 'Control-Panel'
        }
      },
      variables: {
        prompt: inputValue.trim()
      },
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        const agentResponse =
          data && data.askWattson && data.askWattson.choices && data.askWattson.choices[0] &&
          data.askWattson.choices[0].message && data.askWattson.choices[0].message.content;

        mixpanel.track('Ask Wattson', {
          Prompt: inputValue.trim(),
          Response: agentResponse || 'No response received.'
        });

        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: agentResponse || 'No response received.',
          timestamp: new Date()
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      },
      onError: () => {
        showAlert(dispatch, { alert: 'error', message: 'Error getting response from Wattson.' });
        mixpanel.track('Ask Wattson Error', {
          Prompt: inputValue.trim()
        });
        setIsLoading(false);
      }
    });
  };

  return (
    <Box sx={{ mt: 0, height: 'calc(100vh - 130px)', overflow: 'hidden' }}>
      {askWattsonPayload?.includes(show?.showSubdomain) ? (
        <Grid container spacing={gridSpacing} sx={{ height: '100%', overflow: 'hidden' }}>
          <Grid item xs={12} sx={{ height: '100%', overflow: 'hidden' }}>
            <div className="wattson-chat">
              <style>{`
                :root {
                  /* Light show inspired color palette */
                  --bg-dark: #0a0e17;
                  --bg-medium: #111827;
                  --primary: #f59e0b;
                  --primary-glow: rgba(245, 158, 11, 0.4);
                  --secondary: #8b5cf6;
                  --secondary-glow: rgba(139, 92, 246, 0.4); 
                  --accent1: #ec4899;
                  --accent2: #06b6d4;
                  --accent3: #10b981;
                  --text: #f3f4f6;
                  --text-muted: #9ca3af;
                  --card-bg: rgba(30, 41, 59, 0.7);
                  --card-stroke: rgba(255, 255, 255, 0.12);
                  --shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                  --user-msg-bg: rgba(245, 158, 11, 0.15);
                  --user-msg-border: rgba(245, 158, 11, 0.3);
                  --bot-msg-bg: rgba(139, 92, 246, 0.15);
                  --bot-msg-border: rgba(139, 92, 246, 0.3);
                }
                html, body { margin: 0; padding: 0; height: 100%; width: 100%; overflow-x: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
                body { background-color: var(--bg-dark); }
                .wattson-chat { position: relative; inset: 0; width: 100%; height: 100%; min-height: 100%; display: flex; flex-direction: column; color: var(--text); background: radial-gradient(circle at 15% 30%, var(--secondary-glow), transparent 35%), radial-gradient(circle at 85% 20%, var(--primary-glow), transparent 40%), radial-gradient(circle at 75% 80%, rgba(6, 182, 212, 0.25), transparent 30%), radial-gradient(circle at 25% 70%, rgba(236, 72, 153, 0.2), transparent 35%), linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-medium) 100%); overflow: hidden; }
                .light-beams { position: absolute; inset: 0; pointer-events: none; overflow: hidden; opacity: 0.5; mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 70%); z-index: 0; }
                .beam { position: absolute; width: 3px; top: 0; bottom: 0; background: linear-gradient(to bottom, transparent, currentColor, transparent); opacity: 0; animation: beam-move 8s infinite ease-in-out; }
                .beam:nth-child(1) { left: 15%; color: var(--primary); animation-delay: 0s; }
                .beam:nth-child(2) { left: 30%; color: var(--secondary); animation-delay: 1.2s; }
                .beam:nth-child(3) { left: 45%; color: var(--accent1); animation-delay: 2.4s; }
                .beam:nth-child(4) { left: 60%; color: var(--accent2); animation-delay: 3.6s; }
                .beam:nth-child(5) { left: 75%; color: var(--accent3); animation-delay: 4.8s; }
                .beam:nth-child(6) { left: 85%; color: var(--primary); animation-delay: 6s; }
                @keyframes beam-move { 0% { opacity: 0; transform: translateX(-50px) rotate(12deg); } 20% { opacity: 0.6; } 40% { opacity: 0.3; } 60% { opacity: 0.7; } 100% { opacity: 0; transform: translateX(50px) rotate(12deg); } }
                .grid { position: absolute; inset: 0; width: 100%; height: 100%; background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 40px 40px; transform: perspective(500px) rotateX(60deg); transform-origin: center bottom; opacity: 0.2; animation: grid-pulse 5s infinite alternate; z-index: 0; }
                @keyframes grid-pulse { 0% { opacity: 0.1; } 100% { opacity: 0.25; } }
                .chat-container { display: flex; flex-direction: column; width: 100%; max-width: 900px; height: 100%; margin: 0 auto; padding: 20px 20px 20px; z-index: 1; position: relative; box-sizing: border-box; overflow-x: hidden; }
                .chat-header { position: sticky; top: 0; z-index: 5; display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; margin-bottom: 20px; background: var(--card-bg); backdrop-filter: blur(12px); border-radius: 16px; border: 1px solid var(--card-stroke); box-shadow: var(--shadow); }
                .header-brand { display: flex; align-items: center; gap: 12px; }
                .header-logo { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--secondary)); box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4); position: relative; overflow: hidden; }
                .header-logo::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4)); }
                .header-title { font-size: 22px; font-weight: 700; background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; background-clip: text; color: transparent; }
                .header-title-wrap { display: flex; flex-direction: column; line-height: 1; }
                .beta-badge { align-self: flex-start; margin-top: 10px; font-size: 10px; letter-spacing: 0.6px; padding: 2px 6px; border-radius: 999px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.25); color: var(--text-muted); }
                .header-actions { display: flex; align-items: center; gap: 16px; }
                .clear-chat-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 12px; border-radius: 8px; background: rgba(236, 72, 153, 0.15); border: 1px solid rgba(236, 72, 153, 0.3); color: var(--text-muted); font-size: 14px; cursor: pointer; transition: all 0.15s ease; }
                .clear-chat-button:hover { background: rgba(236, 72, 153, 0.25); color: var(--text); }
                .clear-chat-button svg { color: var(--accent1); }
                .messages-container { flex: 1; overflow-y: auto; padding: 0 10px; margin-bottom: 20px; scroll-behavior: smooth; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
                .messages-container::-webkit-scrollbar { width: 6px; }
                .messages-container::-webkit-scrollbar-track { background: transparent; }
                .messages-container::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
                .message { display: flex; flex-direction: column; margin-bottom: 20px; max-width: 90%; animation: message-fade-in 0.3s ease; }
                @keyframes message-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .message.user { align-self: flex-end; margin-left: auto; }
                .message.assistant { align-self: flex-start; margin-right: auto; }
                .message-bubble { padding: 14px 18px; border-radius: 18px; line-height: 1.5; font-size: 15px; max-width: 100%; word-wrap: break-word; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                .message.user .message-bubble { background: var(--user-msg-bg); border: 1px solid var(--user-msg-border); border-bottom-right-radius: 4px; text-align: left; }
                .message.assistant .message-bubble { background: var(--bot-msg-bg); border: 1px solid var(--bot-msg-border); border-bottom-left-radius: 4px; text-align: left; }
                .message-time { font-size: 12px; color: var(--text-muted); margin-top: 5px; opacity: 0.7; }
                .message.user .message-time { text-align: right; }
                .message.assistant .message-time { text-align: left; }
                .typing-indicator { display: flex; align-items: center; gap: 5px; padding: 10px 18px; border-radius: 18px; background: var(--bot-msg-bg); border: 1px solid var(--bot-msg-border); width: fit-content; border-bottom-left-radius: 4px; margin-bottom: 20px; }
                .typing-dot { width: 8px; height: 8px; background: var(--secondary); border-radius: 50%; opacity: 0.6; animation: typing-dot 1.4s infinite ease-in-out; }
                .typing-dot:nth-child(1) { animation-delay: 0s; }
                .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes typing-dot { 0%, 100% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(-5px); opacity: 1; } }
                .input-container { position: relative; margin-bottom: 20px; z-index: 10; }
                .input-wrapper { display: flex; align-items: flex-start; background: var(--card-bg); border: 1px solid var(--card-stroke); backdrop-filter: blur(12px); border-radius: 16px; padding: 10px 15px; box-shadow: var(--shadow); position: relative; min-height: 56px; transition: height 0.15s ease; }
                .input-wrapper::before { content: ''; position: absolute; inset: -1px; background: linear-gradient(90deg, var(--primary-glow), var(--secondary-glow), var(--primary-glow)); border-radius: 16px; z-index: -1; opacity: 0.5; filter: blur(8px); }
                .message-input { flex: 1; background: transparent; border: none; color: var(--text); font-size: 15px; resize: none; min-height: 48px; max-height: 120px; padding: 8px 10px; line-height: 1.5; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; outline: none; font-family: inherit; margin-top: 4px; white-space: normal; }
                .message-input::placeholder { color: var(--text-muted); opacity: 0.7; }
                .send-button.align-top { align-self: flex-start; margin-top: 8px; }
                .send-button { display: flex; align-items: center; justify-content: center; width: 58px; height: 58px; border-radius: 12px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; cursor: pointer; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3); transition: all 0.15s ease; flex-shrink: 0; margin-left: 8px; position: relative; }
                .send-button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); }
                .send-button:active { transform: translateY(0); }
                .send-button svg { width: 24px; height: 24px; fill: white; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); }
                .send-button:disabled { opacity: 0.6; cursor: not-allowed; }
                @media (max-width: 768px) {
                  .message-input::placeholder { color: var(--text-muted); opacity: 0.7; font-size: 12px; }
                  .chat-header { width: 100%; box-sizing: border-box; padding: 12px 10px; }
                  .chat-container { padding: 10px 10px 10px; width: 100%; max-width: 100%; box-sizing: border-box; }
                  .header-title { font-size: 18px; }
                  .message { max-width: 85%; }
                  .messages-container { padding: 0 5px; }
                  .message-bubble { max-width: 100%; box-sizing: border-box; word-break: break-word; }
                  .input-container { width: 100%; box-sizing: border-box; }
                  .input-wrapper { width: 100%; box-sizing: border-box; }
                  * { box-sizing: border-box; }
                  .header-actions { gap: 8px; }
                  .clear-chat-button span { display: none; }
                  .clear-chat-button { padding: 8px; }
                  .markdown-content { margin: 0; padding: 0; color: inherit; font-size: inherit; }
                  .markdown-content p { margin: 0 0 12px 0; }
                  .markdown-content p:last-child { margin-bottom: 0; }
                  .markdown-content ul, .markdown-content ol { margin: 0 0 12px 0; padding-left: 20px; }
                  .markdown-content li { margin-bottom: 4px; }
                  .markdown-content code { background: rgba(0, 0, 0, 0.1); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
                  .markdown-content pre { background: rgba(0, 0, 0, 0.15); padding: 10px; border-radius: 6px; overflow-x: auto; margin: 12px 0; }
                  .markdown-content pre code { background: transparent; padding: 0; }
                  .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6 { margin: 16px 0 8px 0; font-weight: 600; }
                  .markdown-content h1 { font-size: 1.4em; }
                  .markdown-content h2 { font-size: 1.3em; }
                  .markdown-content h3 { font-size: 1.2em; }
                  .markdown-content h4, .markdown-content h5, .markdown-content h6 { font-size: 1.1em; }
                  .markdown-content a { color: var(--accent2); text-decoration: none; }
                  .markdown-content a:hover { text-decoration: underline; }
                  .markdown-content blockquote { border-left: 3px solid var(--secondary); padding-left: 12px; margin: 0 0 12px 0; color: var(--text-muted); }
                  .markdown-content img { max-width: 100%; border-radius: 6px; }
                  .markdown-content table { border-collapse: collapse; width: 100%; margin: 12px 0; }
                  .markdown-content table th, .markdown-content table td { border: 1px solid rgba(255, 255, 255, 0.1); padding: 8px; text-align: left; }
                  .markdown-content table th { background: rgba(0, 0, 0, 0.1); }
                }
              `}</style>

              {/* Light beam effects */}
              <div className="light-beams" aria-hidden="true">
                <div className="beam"></div>
                <div className="beam"></div>
                <div className="beam"></div>
                <div className="beam"></div>
                <div className="beam"></div>
                <div className="beam"></div>
              </div>

              {/* Grid floor background */}
              <div className="grid" aria-hidden="true"></div>

              <div className="chat-container">
                {/* Header with branding and logout */}
                <div className="chat-header">
                  <div className="header-brand">
                    <div className="header-logo">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.5C8.41 2.5 5.5 5.41 5.5 9C5.5 11.08 6.43 12.93 8 14.12V16.5C8 17.05 8.45 17.5 9 17.5H15C15.55 17.5 16 17.05 16 16.5V14.12C17.57 12.93 18.5 11.08 18.5 9C18.5 5.41 15.59 2.5 12 2.5Z" fill="rgba(255,255,255,0.15)" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M10 20.5V19.5H14V20.5C14 21.05 13.55 21.5 13 21.5H11C10.45 21.5 10 21.05 10 20.5Z" fill="#FFFFFF"/>
                        <path d="M9 17.5H15V19.5H9V17.5Z" fill="#FFFFFF"/>
                        <path d="M9 9L10 13L12 7L14 13L15 9" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    </div>
                    <div className="header-title-wrap">
                      <div className="header-title">Ask Wattson</div>
                      <div className="beta-badge" title="This feature is in beta">BETA</div>
                    </div>
                  </div>

                  <div className="header-actions">
                    <button className="clear-chat-button" onClick={handleClearChat} title="Clear chat history">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H21M19 6L18.73 18.62C18.7 19.38 18.11 20 17.35 20H6.65C5.89 20 5.3 19.38 5.27 18.62L5 6M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 11V17M14 11V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Clear Chat</span>
                    </button>
                  </div>
                </div>

                {/* Messages area */}
                <div className="messages-container">
                  {messages.map((message) => (
                    <div key={message.id} className={`message ${message.role}`}>
                      <div className="message-bubble">
                        {message.role === 'assistant' ? (
                          <ReactMarkdown remarkPlugins={[remarkBreaks]}>{message.content}</ReactMarkdown>
                        ) : (
                          message.content
                        )}
                      </div>
                      <div className="message-time">
                        {message.timestamp && new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="input-container">
                  <div className="input-wrapper">
                    <textarea
                      ref={inputRef}
                      className="message-input"
                      placeholder="Ask about xLights, FPP, or Remote Falcon..."
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      disabled={isLoading}
                    />
                    <button
                      className="send-button"
                      onClick={handleSubmit}
                      disabled={isLoading || inputValue.trim() === ''}
                      aria-label="Send message"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      ) : (<></>)}
    </Box>
  );
};

export default AskWattson;
