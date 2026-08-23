import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { mainAPI } from "./src/services/mainAPI"

function apiServerPlugin(): Plugin {
  return {
    name: "api-server-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith("/api/") && req.method === "POST") {
          const methodName = req.url.replace("/api/", "")
          let body = ""
          req.on("data", (chunk) => {
            body += chunk
          })
          req.on("end", async () => {
            try {
              const params = body ? JSON.parse(body) : {}
              const apiObj = mainAPI as unknown as Record<string, (...args: unknown[]) => Promise<unknown>>
              const method = apiObj[methodName]
              if (typeof method !== "function") {
                res.statusCode = 404
                res.setHeader("Content-Type", "application/json")
                res.end(JSON.stringify({ error: `Method ${methodName} not found` }))
                return
              }
              const args = Object.values(params)
              const result = await method.apply(mainAPI, args)
              res.statusCode = 200
              res.setHeader("Content-Type", "application/json")
              res.end(JSON.stringify({ result }))
            } catch (err: unknown) {
              const errorMessage = err instanceof Error ? err.message : "API Error"
              res.statusCode = 500
              res.setHeader("Content-Type", "application/json")
              res.end(JSON.stringify({ error: errorMessage }))
            }
          })
        } else {
          next()
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiServerPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname || __dirname, "./src"),
    },
  },
})
