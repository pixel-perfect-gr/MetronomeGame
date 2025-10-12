import type {Engine} from "excalibur";
import {Actor} from "excalibur";
import resources from "../resources.js";

export default class Arm extends Actor {
    private shake = 0;
    private tick = false;

    public constructor() {
        super({
            width: 118,
            height: 1046
        });

        this.graphics.add(resources.pp_metronome.toSprite());
    }

    public miss(): void {
        this.shake = (1 / 60) * 1000;
        resources.performanceMiss.play().then(
            () => void 0,
            reason => void console.error("", reason)
        );
    }

    public tickTock(): void {
        this.tick = !this.tick;
        (this.tick ? resources.performanceTick : resources.performanceTock).play().then(
            () => void 0,
            reason => void console.error("", reason)
        );
    }

    public override update(engine: Engine, delta: number): void {
        super.update(engine, delta);

        if (this.shake > 0) {
            this.scale.setTo(0.9, 1.02);
            this.shake -= delta;
        } else {
            this.scale.setTo(1, 1);
        }
    }

    public reset(): void {
        this.shake = 0;
        this.tick = false;
        this.beat(0, 0);
    }

    public beat(timeMs: number, bpm: number): void {
        const secondsPerBeat = 60 / bpm;
        const period = secondsPerBeat * 1000; // ms per full cycle

        // convert current time to phase [0..2π]
        const phase = (timeMs % period) / period * Math.PI * 2;

        // swing ±30°
        this.rotation = Math.sin(phase) * (50 * Math.PI / 180);
    }

}
