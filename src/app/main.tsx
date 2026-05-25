import { render } from "preact";
import "material-symbols/rounded.css";
import "mini.css/dist/mini-nord.css";
import "../styles/torrents.css";
import "./App.css";
import { App } from "./App";

render(<App />, document.getElementById("app")!);
