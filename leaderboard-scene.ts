import type { Engine } from "excalibur";
import { Scene, Actor, Color, Vector } from "excalibur";
import * as ex from "excalibur";
import resources from "./resources.js";
import type Game from "./game.js";
import Leaderboard from "./leaderboard.js";
import { fadeToScene } from "./utils/fadeToScene.js";

export class LeaderboardScene extends Scene {
    private idleTime = 0;

    public constructor(private readonly game: Game) {
        super();
    }

    public override onActivate(): void {
        console.log("[Leaderboard] Activated");
        this.idleTime = 0;
        // Call async loader
        this.drawLeaderboard().catch(err => console.error("[Leaderboard] Error:", err));
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

    private async drawLeaderboard(): Promise<void> {
        console.log("[Leaderboard] Drawing leaderboard...");

        // clear old
        this.actors.forEach(a => a.kill());

        // === Background & Logo ===
        const bg = new Actor({ pos: Vector.Zero, anchor: Vector.Zero });
        const bgSprite = resources.pp_leaderboard_bg.toSprite();
        bgSprite.width = this.game.width;
        bgSprite.height = this.game.height;
        bg.graphics.use(bgSprite);
        this.add(bg);

        const iqos_logo = new Actor({
            pos: new Vector(this.game.width / 2, 100),
            anchor: new Vector(0.5, 0),
        });
        const iqosLogoSprite = resources.pp_iqos_logo.toSprite();
        iqos_logo.graphics.use(iqosLogoSprite);
        this.add(iqos_logo);

        const leaderboardFrame = new Actor({
            pos: new Vector(this.game.width / 2, 300),
            anchor: new Vector(0.5, 0),
        });
        const leaderboardSprite = resources.pp_leaderboard.toSprite();
        leaderboardFrame.graphics.use(leaderboardSprite);
        this.add(leaderboardFrame);

        const position = new Actor({
            pos: new Vector(this.game.width / 2 - 350, 450),
            anchor: new Vector(0.5, 0),
        })
        const positionSprite = resources.pp_position.toSprite();
        position.graphics.use(positionSprite);
        this.add(position);

        const name = new Actor({
            pos: new Vector(this.game.width / 2 - 225, 450),
            anchor: new Vector(0.5, 0),
        })
        const nameSprite = resources.pp_name.toSprite();
        name.graphics.use(nameSprite);
        this.add(name);

        const score = new Actor({
            pos: new Vector(this.game.width / 2 + 300, 450),
            anchor: new Vector(0.5, 0),
        })
        const scoreeSprite = resources.pp_scoree.toSprite();
        score.graphics.use(scoreeSprite);
        this.add(score);

        // === Fetch entries from local DB ===
        const entries = await Leaderboard.getAll();
        console.log(`[Leaderboard] Loaded ${entries.length} entries from local DB`);

        const startY = 560;
        const rowHeight = 100;
        const rowSpacing = 20;
        const maxRows = 10;

        const playerName = localStorage.getItem("playerName");
        const playerIndex = entries.findIndex(e => e.name === playerName);

        // === Draw Top 10 (always purple) ===
        entries.slice(0, maxRows).forEach((e, i) => {
            const y = startY + i * (rowHeight + rowSpacing);

            const rowBg = new Actor({
                pos: new Vector(this.game.width / 2, y),
                width: 800,
                height: rowHeight - 10,
                anchor: new Vector(0.5, 0.5),
                color: Color.fromHex("#602bb1"), // always purple
            });
            this.add(rowBg);

            // === Rank Text ===
            const rankText = new ex.Text({
                text: `${(i + 1).toString().padStart(2, "0")}.`,
                color: Color.fromHex("#00c7e6"),
                font: new ex.Font({
                    family: "Geologica",
                    size: 40,
                    textAlign: ex.TextAlign.Left,
                }),
            });
            const rankActor = new Actor({
                pos: new Vector(this.game.width / 2 - 360, y+30),
                anchor: new Vector(0, 0.5),
                z: 5,
            });
            rankActor.graphics.use(rankText);
            this.add(rankActor);

            // === Name Text ===
            const nameText = new ex.Text({
                text: e.name,
                color: Color.White,
                font: new ex.Font({
                    family: "Geologica",
                    size: 40,
                    textAlign: ex.TextAlign.Left,
                }),
            });
            const nameActor = new Actor({
                pos: new Vector(this.game.width / 2 - 280, y+30),
                anchor: new Vector(0, 0.5),
                z: 5,
            });
            nameActor.graphics.use(nameText);
            this.add(nameActor);

            // === Score Text ===
            const scoreText = new ex.Text({
                text: `${e.score}`,
                color: Color.fromHex("#00c7e6"),
                font: new ex.Font({
                    family: "Geologica",
                    size: 40,
                    textAlign: ex.TextAlign.Left,
                }),
            });
            const scoreActor = new Actor({
                pos: new Vector(this.game.width / 2 + 350, y+30),
                anchor: new Vector(1, 0.5),
                z: 5,
            });
            scoreActor.graphics.use(scoreText);
            this.add(scoreActor);
        });

        // === Draw player's own row (below the visible ones) ===
        if (playerIndex !== -1) {
            const myEntry = entries[playerIndex];
            if (!myEntry) return; // ✅ prevents "possibly undefined"

            // find where to place it: just below the last drawn entry
            const visibleCount = Math.min(entries.length, maxRows);
            const y = startY + (visibleCount + 1) * (rowHeight + rowSpacing) - 50;

            const rowBg = new Actor({
                pos: new Vector(this.game.width / 2, y),
                width: 800,
                height: rowHeight - 10,
                anchor: new Vector(0.5, 0.5),
                color: Color.fromHex("#10d0d1"), // cyan
            });
            this.add(rowBg);

            const text = new ex.Text({
                text: `${(playerIndex + 1).toString().padStart(2, "0")}. ${myEntry.name}`,
                color: Color.fromHex("#602bb1"),
                font: new ex.Font({
                    family: "Geologica",
                    size: 40,
                    textAlign: ex.TextAlign.Left,
                }),
            });

            const scoreText = new ex.Text({
                text: `${myEntry.score}`,
                color: Color.fromHex("#602bb1"),
                font: new ex.Font({
                    family: "Geologica",
                    size: 40,
                    textAlign: ex.TextAlign.Left,
                }),
            });

            const textActor = new Actor({
                pos: new Vector(this.game.width / 2 - 280, y+30),
                anchor: new Vector(0, 0.5),
                z: 5,
            });
            textActor.graphics.use(text);
            this.add(textActor);

            const scoreActor = new Actor({
                pos: new Vector(this.game.width / 2 + 350, y+30),
                anchor: new Vector(1, 0.5),
                z: 5,
            });
            scoreActor.graphics.use(scoreText);
            this.add(scoreActor);
        }
    }


}
