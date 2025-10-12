import type Text from "@dcgw/excalibur-text";
import {Engine, TextAlign} from "excalibur";
import {Actor, Color, Vector} from "excalibur";
import {textGraphic} from "../text-graphic.js";

const speed = 2 * 60;

export default class Floater extends Actor {
    private readonly textGraphic: Text;

    public constructor(text: string, color: Color, position: Vector) {
        super({
            pos: position,
            vel: new Vector(0, -speed),
            z: 100,
        });

        this.textGraphic = textGraphic({
            text,
            color,
            textAlign: TextAlign.Center,
            fontSize: 82,
            outlineColor: Color.fromRGB(0, 0, 0, 0.6),
            shadowBlurRadius: 3
        });

        this.graphics.add(this.textGraphic);
    }

    public reset(text: string, color: Color, position: Vector): void {
        this.textGraphic.text = text;
        this.textGraphic.color = color;
        this.textGraphic.opacity = 1;
        this.textGraphic.textAlign = TextAlign.Center;
        this.z = 100;
        this.vel = new Vector(0, -speed);
        this.pos = position;
    }

    public override update(engine: Engine, delta: number): void {
        super.update(engine, delta);

        const opacity = Math.max(0, this.textGraphic.opacity - (0.01 * delta * 60) / 1000);
        this.textGraphic.opacity = opacity;

        if (opacity <= 0) {
            this.kill();
        }
    }
}
