import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence} from "framer-motion";
import chatbot1 from "../../../assets/images/chatbot1.png"
import botSound from "../../../assets/sound/botsound.mp3";
import sendsound from "../../../assets/sound/botsound.mp3";


const sendSound = new Audio(sendsound);
const receiveSound = new Audio(botSound);


const FloatingBotButton = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today regarding SafarLink or any of our services?" }
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
  console.log("Sending:", userMsg);

  sendSound.currentTime = 0;
  sendSound.play();

  setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
  setInput("");

  try {
    setTyping(true);

    console.log("Calling API...");
    const res = await fetch("http://localhost:5000/api/v1/chatbot/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMsg }),
    });

    console.log("Response status:", res.status);

    const data = await res.json();
    console.log("API data:", data);

    setTyping(false);

    setMessages(prev => [
      ...prev,
      { sender: "bot", text: data?.reply || "No reply field" }
    ]);

    receiveSound.currentTime = 0;
    receiveSound.play();

  } catch (err) {
    console.error("Chat fetch error:", err); 
    setTyping(false);

    setMessages(prev => [
      ...prev,
      { sender: "bot", text: "Sorry, AI is unavailable right now." }
    ]);
  }
};

  return (
    <>
      {/* FLOATING BOT */}
      <motion.div
        className="fixed bottom-13 right-15 z-50"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        {/* Tooltip */}
        <motion.div
          variants={{
            rest: { opacity: 0, y: 10, pointerEvents: "none" },
            hover: { opacity: 1, y: 0, pointerEvents: "auto" },
          }}
          transition={{ duration: 0.25 }}
          className="absolute right-0 bottom-20 font-semibold bg-blue-500 text-white text-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap"
        >
          👋 Ask About SafarLink!
        </motion.div>

        {/* Button */}
        <motion.button
          onClick={() => setOpen(!open)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-16 rounded-full shadow-2xl shadow-black flex items-center justify-center"
        >
          <motion.img
            src={chatbot1}
            alt="Chat Bot"
            className="w-full object-contain rounded-full  "
            animate={{ x: [0, -6, 6, -6, 6, 0] }}
            transition={{
              duration: 0.6,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 7,
            }}
          />
        </motion.button>
      </motion.div>

      {/* CHAT WINDOW */}
     {open && (
  <div
    ref={chatRef}
    className="fixed bottom-32 right-15 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-50"
  >
    {/* HEADER */}
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
      <div className="flex items-center gap-2">
        <img
          src={chatbot1}
          alt="bot"
          className="w-8 h-8 rounded-full"
        />
        <div>
          <div className="text-sm font-semibold">SafarLink Assistant</div>
          <div className="text-[11px] opacity-80">Online</div>
        </div>
      </div>

      <button
        onClick={() => setOpen(false)}
        className="text-white/80 hover:text-white text-lg"
      >
        ×
      </button>
    </div>

    {/* MESSAGES */}
    <div className="h-72 overflow-y-auto px-3 py-3 bg-gray-50 space-y-2">
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex ${
            m.sender === "bot" ? "justify-start" : "justify-end"
          }`}
        >
          <div
            className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
              m.sender === "bot"
                ? "bg-white text-gray-800 rounded-bl-sm"
                : "bg-blue-600 text-white rounded-br-sm"
            }`}
          >
            <div className="whitespace-pre-line">
  {m.text}
</div>
          </div>
        </div>
      ))}
   <AnimatePresence mode="wait">
  {typing ? (
    <div className="flex justify-start" key="typing-wrap">
      <motion.div
        key={`typing-${Date.now()}`}
        initial={{ opacity: 0, scale: 0.2, y: 50, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.3, y: 20 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 18,
        }}
        className="bg-white text-gray-500 px-3 py-2 rounded-2xl rounded-bl-sm text-sm border border-blue-200 shadow-2xl"
      >
        SafarLink is typing…
      </motion.div>
    </div>
  ) : null}
</AnimatePresence>




    </div>

    {/* INPUT */}
    <div className="p-3 border-t bg-white">
      <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-transparent px-2 py-2 text-sm outline-none"
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 text-sm transition"
        >
          Send
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default FloatingBotButton;
