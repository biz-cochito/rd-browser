import { app } from 'electron';
import { startApplication } from './Main/main';

app.whenReady().then(() => {
    startApplication();
});
