import { motion } from "framer-motion";
import "./index.scss";

type ButtonProps = {
  label: string;
  selected?: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
};

export function Button({
  label,
  selected,
  onClick,
  onMouseEnter,
}: ButtonProps) {
  return (
    <motion.button
      className={selected ? "button selected" : "button"}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      animate={{
        scale: selected ? 1.05 : 1,
        backgroundColor: selected ? "var(--primary)" : "rgba(0,0,0,0.3)",
        color: selected ? "var(--accent)" : "var(--text)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {label}
    </motion.button>
  );
}
