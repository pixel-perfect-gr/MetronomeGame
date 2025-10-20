import domready from "domready";
import Game from "./game.js";
import pkg from "./package.json";

console.log("Super Metronome Hero v" + pkg.version);



domready(() => {
    const game = new Game();
    const engine = game.engine;

    engine.screen.canvas.style.position = "absolute";

    // Work around Firefox not supporting image-rendering: pixelated
    // See https://github.com/excaliburjs/Excalibur/issues/1676
    if (engine.canvas.style.imageRendering === "") {
        engine.canvas.style.imageRendering = "crisp-edges";
    }



    const scale = (): void => {
        const dpr = Math.max(1, Math.min(4, window.devicePixelRatio || 1));

        const targetW = game.width;   // logical width  (1280)
        const targetH = game.height;  // logical height (720)
        const targetAspect = targetW / targetH;
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const winAspect = winW / winH;

        // Letterbox to preserve aspect (no stretch)
        let vpW: number;
        let vpH: number;
        if (winAspect > targetAspect) {
            // window is wider than game: fit by height
            vpH = winH;
            vpW = Math.round(vpH * targetAspect);
        } else {
            // window is taller/narrower: fit by width
            vpW = winW;
            vpH = Math.round(vpW / targetAspect);
        }

        // CSS size (viewport) in CSS pixels
        engine.screen.viewport = { width: vpW, height: vpH };

        // Backbuffer resolution in *device* pixels for crispness
        engine.screen.resolution = { width: Math.round(vpW * dpr), height: Math.round(vpH * dpr) };

        engine.screen.applyResolutionAndViewport();

        // Center the canvas and ensure CSS size matches the viewport
        const left = Math.floor((winW - vpW) * 0.5);
        const top  = Math.floor((winH - vpH) * 0.5);

        engine.screen.canvas.style.position = "absolute";
        engine.screen.canvas.style.left = `${left}px`;
        engine.screen.canvas.style.top  = `${top}px`;
        engine.screen.canvas.style.width  = `${vpW}px`;
        engine.screen.canvas.style.height = `${vpH}px`;

        // Focusable for keyboard
        engine.screen.canvas.tabIndex = 0;
    };

    const onKey = (event: KeyboardEvent): void => {
        engine.screen.canvas.focus();

        switch (event.code) {
            case "ArrowUp":
            case "ArrowDown":
            case "ArrowLeft":
            case "ArrowRight":
            case "KeyX":
            case "Space":
            case "Enter":
            case "NumpadEnter":
                event.preventDefault();
        }
    };

    let clicked = false;

    const onClick = (): void => {
        clicked = true;
        hidePointer();
        game.active = true;
    };

    let pointerTimeout: number | null = null;

    const onMouseMove = (): void => {
        showPointer();

        if (pointerTimeout != null) {
            clearTimeout(pointerTimeout);
        }

        pointerTimeout = window.setTimeout(() => {
            if (game.active) {
                hidePointer();
            }
        }, 500);
    };

    const onFocus = (): void => {
        if (clicked) {
            hidePointer();
            game.active = true;
        }
    };

    const onBlur = (): void => {
        showPointer();
        game.active = false;
    };

    const hidePointer = (): void => {
        engine.canvas.style.cursor = "none";
    };

    const showPointer = (): void => {
        engine.canvas.style.cursor = "auto";
    };

    //scale();

    window.addEventListener("resize", scale);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keypress", onKey);
    window.addEventListener("keyup", onKey);
    window.addEventListener("click", onClick, true);
    window.addEventListener("mousemove", onMouseMove, true);
    window.addEventListener("focus", onFocus, true);
    window.addEventListener("blur", onBlur, true);



    game.start();
    document.documentElement.style.background = '#000';
    document.body.style.background = '#000';
    document.body.style.margin = '0';
    document.body.style.height = '100%';
    engine.screen.canvas.style.background = 'black';
});
