import type { Engine } from "excalibur";
import { Scene, Actor, Color, Text, Vector } from "excalibur";
import * as ex from "excalibur";
import type Game from "./game.js"; // 👈 make sure you import your Game class
import Leaderboard from "./leaderboard.js";
import { fadeToScene } from "./utils/fadeToScene.js";

export class LeaderboardScene extends Scene {
    private idleTime = 0;

    // 👇 receive the main Game instance
    public constructor(private readonly game: Game) {
        super();
    }

    public override onActivate(): void {
        console.log("[Leaderboard] Activated");
        this.drawLeaderboard();
        this.idleTime = 0;
    }

    public override onDeactivate(): void {
        console.log("[Leaderboard] Deactivated – clearing actors");
        for (const a of [...this.actors]) a.kill();
        this.idleTime = 0;
        const overlay = this.actors.find(a => a.z === 9999);
        if (overlay) overlay.kill();
    }

    public override update(engine: Engine, delta: number): void {
        super.update(engine, delta);
        this.idleTime += delta;

        if (engine.input.keyboard.wasPressed(ex.Input.Keys.Space)) {
            console.log("[Leaderboard] SPACE pressed – going to performance scene");
            fadeToScene(engine, "name-input", 1000);
        }
    }

    private drawLeaderboard(): void {
        console.log("[Leaderboard] Drawing leaderboard...");

        // clear old
        this.actors.forEach(a => a.kill());

        const entries = Leaderboard.getAll();
        console.log(`[Leaderboard] Found ${entries.length} entries`);
        console.table(entries);

        const text = entries
            .map((e, i) => `${i + 1}. ${e.name.padEnd(10)} ${e.score}`)
            .join("\n\n");

        const finalText = `TOP 10\n\n${text || "(No scores yet)"}`;
        console.log("[Leaderboard] Final text to render:\n", finalText);

        const actor = new Actor({
            pos: new Vector(this.game.width / 2, this.game.height / 2),
            anchor: new Vector(0.5, 0.5),
            z: 5,
        });

        const textGraphic = new Text({
            text: finalText,
            color: Color.White,
            font: new ex.Font({
                size: 48,
                family: "Arial",
                textAlign: ex.TextAlign.Left,
            }),
        });

        actor.graphics.use(textGraphic);
        this.add(actor);

        console.log("[Leaderboard] Actor added to scene:", actor);
    }
}
