import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { isScreenFadeOnAtom } from "../../stores";

const variants = {
  on: { width: "100%" },
  off: { width: "0%" },
};

export function ScreenFadeComponent() {
  const [isOn] = useAtom(isScreenFadeOnAtom);

  return (
    <motion.div
      variants={variants}
      animate={isOn ? "on" : "off"}
      initial="off"
      transition={{ duration: 0.4 }}
      style={{
        position: "absolute",
        inset: 0,
        background: "#442b40",
        pointerEvents: "none",
        transformOrigin: "left",
      }}
    />
  );
}
