import kaboom from "kaboom";

export const k = kaboom({
    global: false,
    touchToMouse: true, //translate touch events to mouse events
    canvas: document.getElementById("game"),
});

