import { motion } from "framer-motion";
import { useAtom, useSetAtom } from "jotai";
import { isMainMenuOpened, emitStartGameEvent } from "../../stores";

const variants = {
  open: { opacity: 1, scale: 1 },
  close: { opacity: 0, scale: 0.5 },
};
function MainMenuComponent() {
  const emit = useSetAtom(emitStartGameEvent);
  const [isVisible] = useAtom(isMainMenuOpened);

  return (
    isVisible && (
      <motion.div
        variants={variants}
        animate={isVisible ? "open" : "close"}
        transition={{ duration: 0.2 }}
        initial={{ opacity: 0, scale: 0.5 }}
        style={{ width: "100%", height: "100%" }}
      >
        <div data-ui="full">
          <div data-ui="center" style={{ width: 200 }}>
            <button onClick={() => emit()}>Novo Jogo</button>
          </div>
        </div>
      </motion.div>
    )
  );
}

export default MainMenuComponent;
