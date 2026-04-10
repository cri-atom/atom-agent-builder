import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './Button';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
}

export const ChatSimulator: React.FC<ChatSimulatorProps> = ({ isOpen, onClose, agentName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `¡Hola! Soy ${agentName}. ¿En qué puedo ayudarte hoy?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Esta es una respuesta simulada del agente. En una integración real, aquí verías la respuesta procesada por el LLM según el flujo diseñado.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="fixed right-[var(--spacing-l)] z-50 flex h-[min(600px,calc(100vh-var(--spacing-l)*2-6rem))] w-[min(380px,calc(100vw-var(--spacing-l)*2))] max-w-full flex-col overflow-hidden rounded-3xl border border-border-tertiary bg-bg-primary shadow-2xl"
          style={{
            bottom:
              'calc(var(--spacing-s) + 2.5rem + var(--spacing-s) + var(--spacing-s) + var(--spacing-m))',
          }}
        >
          <div className="flex items-center justify-between border-b border-border-tertiary bg-bg-inverse-secondary p-4 text-fg-inverse-primary">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Bot className="h-6 w-6 text-fg-inverse-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">{agentName}</p>
                <p className="text-[10px] text-fg-inverse-tertiary">Simulador de Agente</p>
              </div>
            </div>
            <Button
              variant="Tertiary"
              size="s"
              onClick={onClose}
              className="p-1 text-fg-inverse-primary hover:bg-bg-inverse-tertiary"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto bg-bg-secondary p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                    msg.sender === 'user'
                      ? 'rounded-tr-none bg-primary text-fg-inverse-primary'
                      : 'rounded-tl-none border border-border-tertiary bg-bg-primary text-fg-primary shadow-sm'
                  }`}
                >
                  {msg.text}
                  <p
                    className={`mt-1 text-[9px] opacity-60 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 border-t border-border-tertiary bg-bg-primary p-4"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 rounded-xl border border-border-tertiary bg-bg-secondary px-4 py-2 text-sm text-fg-primary transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
            <Button
              type="submit"
              variant="Primary"
              size="m"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full !p-0"
              disabled={!inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
