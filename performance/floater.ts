import { Engine, Actor, Color, Vector, Sprite } from "excalibur";
import resources from "../resources.js"; // adjust path if needed

const speed = 2 * 60;

export default class Floater extends Actor {
    private sprite: Sprite;
    private currentOpacity = 1;

    public constructor(text: string, color: Color, position: Vector) {
        super({
            pos: position,
            vel: new Vector(0, -speed),
            z: 100,
        });

        this.sprite = this.selectSprite(text);
        this.sprite.scale = new Vector(1, 1);
        this.sprite.opacity = 1;
        this.graphics.use(this.sprite);
    }

    public reset(text: string, color: Color, position: Vector): void {
        this.sprite = this.selectSprite(text);
        //this.sprite.scale = new Vector(1.5, 1.5);
        this.sprite.opacity = 1;
        this.graphics.use(this.sprite);

        this.currentOpacity = 1;
        this.pos = position;
        this.sprite.scale = new Vector(1, 1);
        this.vel = new Vector(0, -speed);
    }

    public override update(engine: Engine, delta: number): void {
        super.update(engine, delta);

        // fade out gradually
        this.currentOpacity = Math.max(0, this.currentOpacity - (0.0015 * delta));
        this.sprite.opacity = this.currentOpacity;

        // kill when fully invisible
        if (this.currentOpacity <= 0) {
            this.kill();
        }
    }

    private selectSprite(text: string): Sprite {
        switch (text.toLowerCase()) {
            case "perfect!":
                return resources.pp_perfect.toSprite();
            case "nice":
                return resources.pp_nice.toSprite();
            case "good":
                return resources.pp_good.toSprite();
            case "awful!":
            default:
                return resources.pp_miss.toSprite();
        }
    }
}
