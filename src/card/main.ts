import { mount } from "svelte";
import Card from "./Card.svelte";
import "../styles/global.css";
import "../styles/card.css";

const target = document.getElementById("app");
if (!target) throw new Error("#app not found");

mount(Card, { target });
