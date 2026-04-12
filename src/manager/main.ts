import { mount } from "svelte";
import Manager from "./Manager.svelte";
import "../styles/global.css";
import "../styles/manager.css";

const target = document.getElementById("app");
if (!target) throw new Error("#app not found");

mount(Manager, { target });
