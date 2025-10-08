import {values} from "@softwareventures/dictionary";
import {DisplayMode, Engine, Loader} from "excalibur";
import Music from "./music/music.js";
import {Performance} from "./performance/performance.js";
import resources from "./resources.js";

export default class Game {
    public readonly width = 1080;
    public readonly height = 1920;

    public readonly music = new Music();

    public active = false;
    public tempo = "";
    public bpm = 30;
    public stars = 0;

    public readonly engine = new Engine({
        viewport: { width: this.width, height: this.height },
        resolution: { width: this.width, height: this.height },
        displayMode: DisplayMode.FitScreen,
        antialiasing: true,
        suppressHiDPIScaling: false,
        suppressPlayButton: true
    });

    private anyKeyPressed = false;

    public start(): void {
        const loader = new Loader(values(resources));

        this.engine.start(loader).then(
            () => {
                this.engine.input.keyboard.on("press", () => (this.anyKeyPressed = true));
                this.engine.on("postframe", () => (this.anyKeyPressed = false));

                this.engine.addScene("performance", new Performance(this));
                this.engine.goToScene("performance");

            },
            reason => void console.error("", reason)
        );
    }

    public wasAnyKeyPressed(): boolean {
        return this.anyKeyPressed;
    }
}
