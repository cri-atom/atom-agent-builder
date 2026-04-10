import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Bot, Smartphone } from 'lucide-react';
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

    // Simulate bot response
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
          className="fixed right-6 bottom-24 w-[380px] h-[600px] max-h-[calc(100vh-760px)] bg-white rounded-3xl shadow-2xl border border-border-tertiary flex flex-col overflow-hidden z-50"
        >
          {/* Header */}
          <div className="bg-[#4A4A4A] p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">{agentName}</p>
                <p className="text-[10px] opacity-80">Simulador de Agente</p>
              </div>
            </div>
            <Button variant="Tertiary" size="s" onClick={onClose} className="text-white hover:bg-white/10 p-1">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F9FA] custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white text-fg-primary border border-border-tertiary rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                  <p className={`text-[9px] mt-1 opacity-60 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-border-tertiary flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-bg-secondary border border-border-tertiary rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <Button
              type="submit"
              variant="Primary"
              size="m"
              className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
              disabled={!inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
