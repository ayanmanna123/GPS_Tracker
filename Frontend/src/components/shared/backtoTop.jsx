import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const BackToTop = ({ darktheme }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-32 right-8 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 z-50 group ${
        darktheme
          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      }`}
      aria-label="Back to top"
    >
      <ArrowUp className="w-6 h-6 text-white group-hover:animate-bounce" />
    </button>
  );
};

export default BackToTop;