import { app } from "electron";
import { startApplication } from "./main/main";

process.env.NODE_ENV = "development";

app.whenReady().then(() => {
    startApplication();
});
