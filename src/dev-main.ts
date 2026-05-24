import { app } from "electron";
import { startApplication } from "./main/main";

app.whenReady().then(() => {
    startApplication();
});
