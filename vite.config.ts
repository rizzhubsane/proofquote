import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { geminiExtractPlugin } from "./server/geminiPlugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      geminiExtractPlugin({
        openai: env.OPENAI_API_KEY || "",
        gemini: env.GEMINI_API_KEY || "",
      }),
    ],
    server: { port: 5173, strictPort: true },
  };
});
