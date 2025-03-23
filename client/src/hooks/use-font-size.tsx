import { createContext, useContext, useState, ReactNode } from "react";

interface FontSizeContextProps {
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
}

const FontSizeContext = createContext<FontSizeContextProps | undefined>(undefined);

interface FontSizeProviderProps {
  children: ReactNode;
}

export function FontSizeProvider({ children }: FontSizeProviderProps) {
  // Initialize with default font size (1.125rem = text-lg)
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== "undefined") {
      const savedSize = localStorage.getItem("fontSize");
      return savedSize ? parseFloat(savedSize) : 1.125;
    }
    return 1.125;
  });

  const increaseFontSize = () => {
    if (fontSize < 1.5) { // Max 1.5rem (24px)
      const newSize = fontSize + 0.0625; // Increase by 1px
      setFontSize(newSize);
      localStorage.setItem("fontSize", newSize.toString());
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 0.875) { // Min 0.875rem (14px)
      const newSize = fontSize - 0.0625; // Decrease by 1px
      setFontSize(newSize);
      localStorage.setItem("fontSize", newSize.toString());
    }
  };

  const resetFontSize = () => {
    const defaultSize = 1.125;
    setFontSize(defaultSize);
    localStorage.setItem("fontSize", defaultSize.toString());
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, increaseFontSize, decreaseFontSize, resetFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error("useFontSize must be used within a FontSizeProvider");
  }
  return context;
}