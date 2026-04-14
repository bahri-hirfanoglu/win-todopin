import { mount } from "svelte";
import Manager from "./Manager.svelte";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "../styles/global.css";
import "../styles/manager.css";

const target = document.getElementById("app");
if (!target) throw new Error("#app not found");

mount(Manager, { target });
