import { mount } from "svelte";
import Card from "./Card.svelte";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "../styles/global.css";
import "../styles/card.css";

const target = document.getElementById("app");
if (!target) throw new Error("#app not found");

mount(Card, { target });
