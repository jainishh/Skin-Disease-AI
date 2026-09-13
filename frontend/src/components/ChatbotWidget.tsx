import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../api/client";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  { label: "Accuracy & Trust", query: "How accurate is this app?" },
  { label: "What is Grad-CAM?", query: "What does the Grad-CAM heatmap show?" },
  { label: "Skincare Guidelines", query: "Daily skincare recommendations" },
  { label: "Diet & Food rules", query: "What foods should I eat or avoid?" },
  { label: "Warning & Danger signs", query: "When should I see a doctor?" },
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! I am your DermaScan AI clinical assistant. 🌿\nHow can I help you understand your scan results, skincare routines, or explainable AI metrics today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  async function handleSend(text: string) {
    if (!text.trim()) return;
    
    // Add user message
    const userMsg: Message = { sender: "user", text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiClient.post<{ reply: string }>("/chatbot/query", { message: text });
      const botMsg: Message = { sender: "bot", text: res.data.reply, timestamp: new Date() };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        sender: "bot",
        text: "I am having trouble connecting to my clinical knowledge base. Please check your network connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-body">
      {/* Floating Launcher Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform focus:outline-none bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] shadow-blue-500/25"
        title="DermaScan AI Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-16 right-0 w-[90vw] sm:w-[390px] h-[520px] flex flex-col rounded-3xl overflow-hidden border border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="px-5 py-4 text-white flex items-center justify-between bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    DermaScan AI <Sparkles size={13} className="text-cyan-200 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-white/80">Certified Diagnostic FAQ Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="rounded-full p-1 text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                      m.sender === "user"
                        ? "bg-[var(--brand-primary)] text-white"
                        : "bg-[var(--brand-secondary)] text-white"
                    }`}
                  >
                    {m.sender === "user" ? <User size={13} /> : <Bot size={13} />}
                  </div>

                  {/* Text Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs max-w-[78%] leading-relaxed whitespace-pre-line shadow-xs border ${
                      m.sender === "user"
                        ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] rounded-tr-none"
                        : "bg-[var(--brand-bg)] text-[var(--brand-text)] border-[var(--brand-border)] rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-2.5 flex-row">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center bg-[var(--brand-secondary)] text-white shrink-0">
                    <Loader2 size={13} className="animate-spin" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-[var(--brand-bg)] text-[var(--brand-text-muted)] border border-[var(--brand-border)] px-4 py-2.5 text-xs italic">
                    Analyzing clinical query...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Questions Grid */}
            <div className="px-4 py-2.5 border-t border-[var(--brand-border)] bg-[var(--brand-bg)]/50">
              <p className="text-[10px] font-bold text-[var(--brand-text-muted)] uppercase tracking-wider mb-1.5">
                Suggested Topics
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q.query)}
                    className="whitespace-nowrap rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-1 text-[10px] font-medium text-[var(--brand-text)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all shadow-xs"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 border-t border-[var(--brand-border)] flex gap-2 items-center bg-[var(--brand-surface)]"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about skin conditions or metrics..."
                className="flex-1 rounded-full border border-[var(--brand-border)] bg-[var(--brand-bg)] px-4 py-2 text-xs text-[var(--brand-text)] focus:border-[var(--brand-primary)] focus:outline-none placeholder-[var(--fg-faint)]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="rounded-full p-2 bg-[var(--brand-primary)] text-white disabled:opacity-40 hover:bg-[var(--brand-primary-hover)] transition shadow-sm"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
