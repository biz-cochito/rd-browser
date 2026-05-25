import { app } from "electron";
import { startApplication } from "./main/main";

process.env.NODE_ENV = "production";

app.whenReady().then(() => {
    startApplication();
});
