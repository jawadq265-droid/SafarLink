import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import chatbot1 from "../../../assets/images/chatbot1.jpg"
import { MessageSquare, X, Send } from "lucide-react";
import botSound from "../../../assets/sound/botsound.mp3";
import sendsound from "../../../assets/sound/botsound.mp3";


const sendSound = new Audio(sendsound);
const receiveSound = new Audio(botSound);


const FloatingBotButton = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Welcome to SafarLink Concierge. How may I assist your journey today?" }
  ]);
  const [input, setInput] = useState("");

  const chatRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;

      if (chatRef.current && target && !chatRef.current.contains(target)) {
        setOpen(false);
      }
    };


    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const [typing, setTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;

    sendSound.currentTime = 0;
    sendSound.play();

    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInput("");

    try {
      setTyping(true);

      const res = await fetch("http://localhost:5000/api/v1/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();

      setTyping(false);

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: data?.reply || "I apologize, I am unable to process that request at the moment. Please contact our support team." }
      ]);

      receiveSound.currentTime = 0;
      receiveSound.play();

    } catch (err) {
      console.error("Chat fetch error:", err);
      setTyping(false);

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Our concierge system is temporarily offline. Please try again shortly." }
      ]);
    }
  };

  return (
    <>
      {/* FLOATING BOT BUTTON */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        {/* Tooltip */}
        <motion.div
          variants={{
            rest: { opacity: 0, scale: 0.8, x: 20 },
            hover: { opacity: 1, scale: 1, x: 0 },
          }}
          className="absolute right-24 bottom-4 bg-[#1b1b1b] border border-[#aa8453]/30 text-white text-[10px] tracking-[0.3em] font-condensed uppercase px-5 py-3 shadow-2xl whitespace-nowrap"
        >
          Concierge Chat
        </motion.div>

        {/* Button */}
        <motion.button
          onClick={() => setOpen(!open)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-16 h-16 bg-[#aa8453] text-white shadow-2xl flex items-center justify-center relative overflow-hidden group rounded-full"
        >
          <div className="absolute inset-0 bg-[#1b1b1b] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <div className="relative z-10 w-full h-full transition-transform duration-500 group-hover:scale-110 flex items-center justify-center">
            {open ? (
              <X size={28} className="text-white" />
            ) : (
              <img src={chatbot1} className="w-full h-full object-cover rounded-full" alt="Concierge" />
            )}
          </div>
        </motion.button>
      </motion.div>

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed bottom-28 right-8 w-[380px] bg-white shadow-[-20px_20px_60px_rgba(0,0,0,0.2)] overflow-hidden z-50 border border-gray-100"
          >
            {/* HEADER */}
            <div className="px-8 py-6 bg-[#1b1b1b] text-white relative border-b border-[#aa8453]/30">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-serif text-white opacity-[0.03] whitespace-nowrap pointer-events-none">
                SAFARLINK
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-[#aa8453]/50 p-1">
                    <img
                      src={chatbot1}
                      alt="bot"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-serif tracking-widest uppercase">Digital Concierge</div>
                    <div className="text-[9px] text-[#aa8453] tracking-[0.3em] uppercase font-condensed mt-0.5 flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-[#aa8453] rounded-full animate-pulse"></span>
                      Operational
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="h-[400px] overflow-y-auto px-8 py-8 bg-[#fcfbf9] space-y-6 scrollbar-hide">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.sender === "bot" ? "justify-start" : "justify-end"
                    }`}
                >
                  <div
                    className={`max-w-[85%] px-5 py-4 text-sm leading-relaxed ${m.sender === "bot"
                      ? "bg-white text-gray-800 border-l-2 border-[#aa8453] shadow-sm"
                      : "bg-[#1b1b1b] text-white font-light"
                      }`}
                  >
                    <div className="whitespace-pre-line font-light">
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white text-[#aa8453] px-5 py-4 text-[10px] tracking-widest uppercase font-condensed border-l-2 border-[#aa8453] shadow-sm"
                  >
                    Concierge is typing...
                  </motion.div>
                </div>
              )}
            </div>

            {/* INPUT */}
            <div className="p-6 bg-white border-t border-gray-100">
              <div className="flex items-center gap-4">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="How can we assist you?"
                  className="flex-1 bg-transparent py-2 text-sm outline-none font-serif placeholder:text-gray-300 placeholder:italic"
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="text-[#aa8453] hover:text-[#1b1b1b] transition-colors"
                >
                  <Send size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingBotButton;
