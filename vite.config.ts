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
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        res.setHeader("Access-Control-Allow-Headers", "Content-Type")

        if (req.method === "OPTIONS") {
          res.statusCode = 204
          res.end()
          return
        }

        if (req.url?.startsWith("/api/") && req.method === "POST") {
          const urlObj = new URL(req.url, "http://localhost")
          const methodName = urlObj.pathname.replace(/^\/api\//, "")

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

              let args: unknown[] = []
              if (Array.isArray(params)) {
                args = params
              } else if (params && typeof params === "object") {
                const p = params as Record<string, unknown>
                if (methodName === "getTorrents") {
                  args = [p.page, p.limit]
                } else if (methodName === "getTorrentDetails") {
                  args = [p.torrentId]
                } else if (methodName === "unrestrictLink") {
                  args = [p.link]
                } else if (methodName === "addMagnet") {
                  args = [p.magnet]
                } else if (methodName === "deleteTorrent") {
                  args = [p.torrentId]
                } else if (methodName === "selectFiles") {
                  args = [p.torrentId, p.files]
                } else if (methodName === "getStreamLink") {
                  args = [p.id]
                } else if (methodName === "getMediaInfo") {
                  args = [p.id]
                } else if (methodName === "setApiToken") {
                  args = [p.token]
                } else if (methodName === "testApiToken") {
                  args = [p.token]
                } else {
                  args = Object.values(p)
                }
              }

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
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname || __dirname, "./src"),
    },
  },
})
