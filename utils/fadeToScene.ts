import * as ex from "excalibur";

export function fadeToScene(engine: ex.Engine, sceneName: string, duration = 1000): void {
    const overlay = new ex.Actor({
        z: 9999,
        pos: ex.vec(engine.halfDrawWidth, engine.halfDrawHeight),
        anchor: ex.vec(0.5, 0.5)
    });

    const rect = new ex.Rectangle({
        width: engine.drawWidth,
        height: engine.drawHeight,
        color: ex.Color.Black
    });
    rect.opacity = 0;
    overlay.graphics.use(rect);
    engine.currentScene.add(overlay);

    let elapsed = 0;
    overlay.on("postupdate", (evt) => {
        elapsed += evt.delta;
        rect.opacity = Math.min(1, elapsed / duration);

        if (elapsed >= duration) {
            overlay.kill();
            engine.goToScene(sceneName);

            // wait for next frame before fading in
            engine.once("postupdate", () => fadeInScene(engine, duration));
        }
    });
}

function fadeInScene(engine: ex.Engine, duration = 1000): void {
    if (!engine.currentScene) return;

    const overlay = new ex.Actor({
        z: 9999,
        pos: ex.vec(engine.halfDrawWidth, engine.halfDrawHeight),
        anchor: ex.vec(0.5, 0.5)
    });

    const rect = new ex.Rectangle({
        width: engine.drawWidth,
        height: engine.drawHeight,
        color: ex.Color.Black
    });
    rect.opacity = 1;
    overlay.graphics.use(rect);
    engine.currentScene.add(overlay);

    let elapsed = 0;
    overlay.on("postupdate", (evt) => {
        elapsed += evt.delta;
        rect.opacity = Math.max(0, 1 - elapsed / duration);
        if (elapsed >= duration) overlay.kill();
    });
}
