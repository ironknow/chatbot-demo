import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider } from "@/contexts";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
