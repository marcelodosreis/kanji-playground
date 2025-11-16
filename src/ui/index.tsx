import ReactDOM from "react-dom/client";
import { StrictMode } from "react";

import Components from "./components";
import { useGameScale } from "./hooks/use-game-scale";
import { Provider } from "jotai";
import { store } from "../stores";

export function Root() {
  useGameScale();
  return <Components />;
}

ReactDOM.createRoot(document.getElementById("ui")!).render(
  <StrictMode>
    <Provider store={store}>
      <Root />
    </Provider>
  </StrictMode>
);
