import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { RealDebridClient } from "./client.js";
import { handleMagnetLink, handleTorrentFile } from "./services.js";
import { API_TOKEN_ENV_VAR } from "./config.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const apiToken = process.env[API_TOKEN_ENV_VAR];

if (!apiToken) {
    console.error(`Error: ${API_TOKEN_ENV_VAR} environment variable not set.`);
    process.exit(1);
}

const client = new RealDebridClient(apiToken);

app.get("/api/data", (req, res) => {
    res.json({ message: "Hello from Node.js!", status: "success" });
});

app.get("/api/torrents", async (req, res) => {
    try {
        const { page, limit, status } = req.query;
        const torrents = await client.listTorrents(page, limit, status);
        res.json(torrents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/torrents/:id", async (req, res) => {
    try {
        const info = await client.getTorrentInfo(req.params.id);
        res.json(info);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/unrestrict", async (req, res) => {
    try {
        const { link } = req.body;
        if (!link) {
            return res.status(400).json({ error: "Link is required" });
        }
        const result = await client.unrestrictLink(link);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/magnets", async (req, res) => {
    try {
        const { magnet } = req.body;
        if (!magnet) {
            return res.status(400).json({ error: "Magnet link is required" });
        }
        const downloadLinks = await handleMagnetLink(client, magnet);
        res.json({ downloadLinks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/torrents", upload.single("torrent"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Torrent file is required" });
        }
        const downloadLinks = await handleTorrentFile(
            client,
            req.file.buffer,
            req.file.originalname,
        );
        res.json({ downloadLinks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
