// components/SupportPopover.jsx
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { HelpCircle } from "lucide-react";
import SupportChat from "./SupportChat";
// 👈 Create this next

export default function SupportPopover() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition"
            aria-label="Open Support"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-[350px] p-0 border-none shadow-2xl rounded-xl overflow-hidden"
        >
          <SupportChat />
        </PopoverContent>
      </Popover>
    </div>
  );
}
