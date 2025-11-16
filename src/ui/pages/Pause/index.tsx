import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { isPausedAtom, store } from "../../../stores";
import { useState, useEffect } from "react";

import { Button } from "../../components/Button";

import "./index.scss";

const menuVariants = {
  enter: { opacity: 0, y: -20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

const containerVariants = {
  open: { opacity: 1, scale: 1 },
  close: { opacity: 0, scale: 0.5 },
};

export function Pause() {
  const [isVisible] = useAtom(isPausedAtom);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentMenu, setCurrentMenu] = useState<"main" | "options">("main");

  const mainButtons = [
    { label: "Continuar", action: () => { store.set(isPausedAtom, false) } },
    { label: "Opcoes", action: () => setCurrentMenu("options") },
    { label: "Sair para o Menu", action: () => {} },
  ];

  const optionsButtons = [
    { label: "Configuracao 1", action: () => {} },
    { label: "Configuracao 2", action: () => {} },
    { label: "Voltar", action: () => setCurrentMenu("main") },
  ];

  const buttons = currentMenu === "main" ? mainButtons : optionsButtons;

  const getTitle = () => {
    if (currentMenu === "main") return "Pause";
    if (currentMenu === "options") return "Opcoes";
    return "";
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isVisible) return;
      if (e.key === "ArrowDown")
        setSelectedIndex((prev) => (prev + 1) % buttons.length);
      if (e.key === "ArrowUp")
        setSelectedIndex(
          (prev) => (prev - 1 + buttons.length) % buttons.length
        );
      if (e.key === "Enter") buttons[selectedIndex].action();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isVisible, selectedIndex, buttons]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [currentMenu]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="pause"
          variants={containerVariants}
          animate="open"
          exit="close"
          initial="close"
          transition={{ duration: 0.2 }}
          style={{ width: "100%", height: "100%" }}
        >
          <div data-ui="full">
            <div data-ui="center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMenu}
                  variants={menuVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="submenu"
                >
                  <h1>{getTitle()}</h1>
                  <p>Arrow keys to navigate</p>
                  {buttons.map((btn, index) => (
                    <Button
                      key={btn.label}
                      label={btn.label}
                      selected={selectedIndex === index}
                      onClick={btn.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
