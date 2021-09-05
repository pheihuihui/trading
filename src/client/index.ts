import { render } from "react-dom";
import { app } from "./App";

let div = document.createElement('div')

render(app, div)

document.body.appendChild(div)