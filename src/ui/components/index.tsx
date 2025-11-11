import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { isPausedAtom } from "../../store";

const variants = {
  open: { opacity: 1, scale: 1 },
  close: { opacity: 0, scale: 0.5 },
};
function Component() {
  const [isVisible] = useAtom(isPausedAtom);

  return (
    isVisible && (
      <motion.div
        variants={variants}
        animate={isVisible ? "open" : "close"}
        transition={{ duration: 0.2 }}
        initial={{ opacity: 0, scale: 0.5 }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* <div data-ui="top-left">🏀</div>
        <div data-ui="top-right">⚡</div>
        <div data-ui="bottom-left">❤️</div>
        <div data-ui="bottom-right">⭐</div>
        <div data-ui="center">🎮</div> */}
        <div data-ui="full">PAUSED</div>
      </motion.div>
    )
  );
}

export default Component;
