import { Pin, PinOff } from "lucide-react";
import { Language } from "../types";
import { t } from "../i18n";

interface PinButtonProps {
  isPinned: boolean;
  onToggle: () => void;
  language?: Language;
}

function PinButton({ isPinned, onToggle, language = "SimplifiedChinese" as Language }: PinButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-1.5 rounded-lg transition-colors ${
        isPinned 
          ? "bg-blue-500 text-white hover:bg-blue-600" 
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
      title={isPinned ? t("header.unpin", language) : t("header.pin", language)}
    >
      {isPinned ? <Pin size={14} /> : <PinOff size={14} />}
    </button>
  );
}

export default PinButton;
