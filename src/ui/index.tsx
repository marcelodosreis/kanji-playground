import ReactDOM from "react-dom/client";
import { StrictMode } from "react";

import Pages from "./pages";
import { useGameScale } from "./hooks/use-game-scale";
import { Provider } from "jotai";
import { store } from "../stores";

import "./styles/global.scss";

export function Root() {
  useGameScale();
  return <Pages />;
}

ReactDOM.createRoot(document.getElementById("ui")!).render(
  <StrictMode>
    <Provider store={store}>
      <Root />
    </Provider>
  </StrictMode>
);
