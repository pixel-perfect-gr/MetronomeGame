import type {Engine} from "excalibur";
import { Actor, Color, Scene, TextAlign, Vector, Rectangle, Polygon } from "excalibur";
import type Game from "../game.js";
import resources from "../resources.js";
import Timer from "../metronome/timer.js";
import {textActor} from "../text-actor.js";
import Floater from "./floater.js";
import Arm from "./arm.js";

const introDuration = 1;
const outroDuration = 1;
const baseScore = 5;

enum State {
    intro = "intro",
    countIn = "count-in",
    play = "play",
    outro = "outro",
    result = "result",
    done = "done",
    return = "return"
}

export class Performance extends Scene {
    private static readonly ARM_CENTER = 0; // το "κέντρο" της φάσης
    private readonly timer: Timer;
    private score = 0;
    private multiplier = 0;
    private state = State.intro;
    private time = 0;

    private readonly lastHitLine?: Actor;
    private readonly pivot!: Actor;

    private readonly newpivot!: Actor;

    private readonly lerpSpeed = 0.002;
    private beatsPerMs = 0;
    private drainRate = 0;

    private musicAttached = false;
    private readonly floaterPool: Floater[] = [];


    private meterValue = 100;
    private readonly greenActor: Actor;
    private readonly meterFillGreen: Rectangle;
    private readonly startColor = Color.fromHex("#4fd51a");
    private readonly endColor = Color.fromHex("#ff0449");

    private readonly Floaters = new Vector(this.game.width / 2, this.game.height - 200);

    // BPM handling
    private bpmTarget = 30;
    private bpmCurrent = 30;
    private bpmTimer = 0;

    // Arm phase accumulator
    private armPhase = 0;

    // Texts
    private readonly tempoText = textActor({
        pos: new Vector(22, 24),
        color: Color.fromHex("eeeeee"),
        fontSize: 36
    });
    private readonly bpmText = textActor({
        pos: new Vector(150, 105),
        color: Color.fromHex("eeeeee"),
        textAlign: TextAlign.Center,
        fontSize: 62
    });
    private readonly bpmTextStatic = new Actor({
        pos: new Vector(150, 70),
        anchor: new Vector(0.5, 0.5)
    });
    private readonly scoreText = textActor({
        pos: new Vector(this.game.width / 2, 105),
        text: "SCORE",
        textAlign: TextAlign.Center,
        fontSize: 62,
        color: Color.White
    });
    private readonly scoreTextStatic = new Actor({
        pos: new Vector(this.game.width / 2, 70),
        anchor: new Vector(0.5, 0.5)
    });
    private readonly multiplierText = textActor({
        pos: new Vector(this.game.width - 150, 105),
        fontSize: 62,
        textAlign: TextAlign.Center
    });
    private readonly multiplierTextStatic = new Actor({
        pos: new Vector(this.game.width - 150, 70),
        anchor: new Vector(0.5, 0.5)
    });
    private readonly messageText = textActor({
        text: "Press the button to Start",
        pos: new Vector(this.game.width / 2, this.game.height - 250),
        color: Color.fromHex("eeeeee"),
        outlineColor: Color.fromHex("#8d2391"),
        outlineWidth: 4,
        fontSize: 150,
        textAlign: TextAlign.Center
    });

    private readonly arm = new Arm();

    // debug overlay
    private readonly debugText = textActor({
        pos: new Vector(20, 100),
        color: Color.Yellow,
        fontSize: 20,
        textAlign: TextAlign.Left
    });
    public constructor(private readonly game: Game) {
        super();
        this.timer = new Timer(0);

        //Background Color
        const bg = new Actor({
            pos: new Vector(this.game.width / 2, this.game.height / 2),
            anchor: new Vector(0.5, 0.5)
        });

        // apply your resource sprite
        bg.graphics.use(resources.pp_bg.toSprite());
        bg.graphics.opacity = 0.5;

        // make sure it sits *behind* everything
        bg.z = -100;

        //Horizontal box
        const bg2 = new Actor({
            pos: new Vector(this.game.width / 2, this.game.height),
            anchor: new Vector(0.5, 1)
        })
        bg2.graphics.use(resources.pp_base.toSprite());
        bg2.z = 50;

        //MetronomeBackground
        const bg3 = new Actor({
            pos: new Vector(this.game.width / 2, this.game.height / 2 + 100),
            scale: new Vector(1.1, 1.15),
            anchor: new Vector(0.5, 0.5)
        })
        bg3.graphics.use(resources.pp_m_bg.toSprite());

        //Range
        const bg4 = new Actor({
            pos: new Vector(this.game.width / 2, this.game.height / 2),
            anchor: new Vector(0.5, 0.5)
        })
        bg4.graphics.use(resources.pp_range.toSprite());

        //this.add(bg);
        this.add(bg2);
        this.add(bg3);
        this.add(bg4);

        this.scoreTextStatic.graphics.use(resources.pp_score.toSprite());
        this.bpmTextStatic.graphics.use(resources.pp_bpm.toSprite());
        this.multiplierTextStatic.graphics.use(resources.pp_streak.toSprite());
        this.add(this.multiplierTextStatic);
        this.add(this.bpmTextStatic);
        this.add(this.scoreTextStatic);



        // ====== BAR SETUP ======

        const barWidth  = this.game.width - 160;
        const barHeight = 70;
        const barPos    = new Vector(this.game.width / 2, 259);

        const meterBg = new Actor({ pos: barPos, anchor: new Vector(0.5, 0.5) });
        meterBg.graphics.use(new Rectangle({ width: barWidth, height: barHeight, color: Color.fromHex("#6b3cbd") }));
        this.add(meterBg);

        this.meterFillGreen = new Rectangle({ width: barWidth, height: barHeight, color: Color.fromHex("#4fd51a") });
        this.greenActor = new Actor({ pos: barPos.clone(), anchor: new Vector(0.5, 0.5) });
        this.greenActor.graphics.use(this.meterFillGreen);
        this.add(this.greenActor);

        this.add(this.arm);
        //this.arm.pos = new Vector(this.game.width / 2, this.game.height / 2);

        // texts
        this.add(this.tempoText[1]);
        this.add(this.bpmText[1]);
        this.add(this.scoreText[1]);
        this.add(this.multiplierText[1]);
        this.messageText[1].z = 51;
        this.add(this.messageText[1]);

        this.pivot = new Actor({
            pos: new Vector(this.game.width / 2, this.game.height / 2),
            anchor: new Vector(0.5, 0.5)
        });
        this.add(this.pivot);

        this.newpivot = new Actor({
            pos: new Vector(this.game.width / 2, this.game.height - 250),
            anchor: new Vector(0.5, 0.5)
        })

        // Ensure the arm rotates around its own anchor at the pivot
        this.arm.anchor = new Vector(0.5, 1); // bottom-center pivot (adjust to your sprite)
        this.arm.pos = Vector.Zero;           // relative to pivot
        this.newpivot.addChild(this.arm);

        this.arm.z = 10; // ensure arm is drawn above arcs

        // debug
        this.add(this.debugText[1]);
    }

    public override onActivate(): void {
        if (!this.musicAttached) {
            this.add(this.game.music);
            this.musicAttached = true;
        }
        this.game.music.stop();
        this.game.music.stop();

        this.score = 0;
        this.multiplier = 0;
        this.timer.reset(30);
        this.arm.reset();

        this.tempoText[0].text = this.game.tempo;
        this.bpmText[0].text = `30.0`;
        this.scoreText[0].text = "000";
        this.multiplierText[0].text = "00";
        this.state = State.intro;
        this.time = introDuration;

        this.meterValue = 100;
        this.meterFillGreen.color = Color.fromHex("#4fd51a");
        this.greenActor.scale = new Vector(1, 1);

        this.messageText[0].text = "Ready?";
        this.messageText[0].opacity = 1;

        this.bpmTarget = 30;
        this.bpmCurrent = 30;
        this.armPhase = 0;
        this.bpmTimer = 0;

        resources.performanceReady.play().catch(console.error);
    }

    public override onDeactivate(): void {
        // Stop any playing music or sounds
        this.game.music.stop();

        // Kill all transient actors (Floaters, debug, etc.)
        for (const a of this.actors) {
            if (a instanceof Floater) {a.kill()}
        }

        // Clear timers, if any
        this.timer.reset(0);

        // Remove any references to help GC
        this.actors.forEach(actor => {
            actor.events.clear(); // removes lingering event listeners
        });

        console.log("[Performance] Scene deactivated and cleaned.");
    }


    public override update(engine: Engine, delta: number): void {
        super.update(engine, delta);
        this.timer.update(delta);

        switch (this.state) {
            case State.intro:
                this.time -= delta;
                if (this.game.wasAnyKeyPressed()) {
                    this.transition(State.play);
                } else if (this.time <= 0) {
                    this.transition(State.countIn);
                }
                break;

            case State.countIn:
                if (this.game.wasAnyKeyPressed()) {
                    this.transition(State.play);
                }
                break;

            case State.play:
                // κάθε 8s ανεβάζουμε target BPM
                this.bpmTimer += delta;
                if (this.bpmTimer >= 8000) {
                    this.bpmTarget = Math.min(150, this.bpmTarget + 5);
                    this.bpmTimer = 0;
                }

                // Smooth approach: lerp bpmCurrent προς bpmTarget

                this.bpmCurrent += (this.bpmTarget - this.bpmCurrent) * this.lerpSpeed * delta;

                // Phase accumulator για το Arm
                this.beatsPerMs = this.bpmCurrent / 60000;
                this.armPhase += this.beatsPerMs * delta;
                this.armPhase %= 1;
                this.arm.rotation = Math.sin(this.armPhase * Math.PI * 2) * (30 * Math.PI / 180);

                // meter drains
                this.drainRate = 10;
                this.meterValue -= this.drainRate * (delta / 1000);


                if (this.game.wasAnyKeyPressed()) {
                    const distance = this.angleDistance(this.arm.rotation, Performance.ARM_CENTER);
                    const missed = distance > 0.5;

                    if (missed) {
                        this.meterValue -= 10;
                        this.multiplier = 0;
                    } else {
                        this.arm.tickTock();
                        this.multiplier++;
                    }

                    const normRot = this.normalizeAngle(this.arm.rotation);
                    const distance1 = this.angleDistance(normRot, Performance.ARM_CENTER);



                    if (this.lastHitLine != null){
                        this.lastHitLine.kill();
                    } 


                    if (distance1 < 0.1) {
                        this.spawnFloater("Perfect!", Color.Green, this.Floaters);
                        this.meterValue = Math.min(100, this.meterValue + 8);
                        this.score += baseScore * this.multiplier * 4;
                        resources.performanceChime.play().catch(console.error);
                    } else if (distance1 < 0.20) {
                        this.spawnFloater("Nice", Color.fromHex("d3cd08"), this.Floaters);
                        this.meterValue = Math.min(100, this.meterValue + 5);
                        this.score += baseScore * this.multiplier * 3;
                    } else if (distance1 < 0.30) {
                        this.spawnFloater("Good", Color.LightGray, this.Floaters);
                        this.meterValue = Math.min(100, this.meterValue + 3);
                        this.score += baseScore * this.multiplier * 2;
                    } else {
                        this.spawnFloater("Awful!", Color.Red, this.Floaters);
                        this.meterValue = Math.max(0, this.meterValue - 6);
                        this.score += baseScore * this.multiplier;
                    }
                }
                this.meterValue = Math.max(0, Math.min(100, this.meterValue));
                this.greenActor.scale.x = this.meterValue / 100;

                // Interpolate color based on meter level (0..1)
                const ratio = 1 - this.meterValue / 100; // 0 = full green, 1 = full red

                // Linear interpolation between green and red
                const r = this.startColor.r + (this.endColor.r - this.startColor.r) * ratio;
                const g = this.startColor.g + (this.endColor.g - this.startColor.g) * ratio;
                const b = this.startColor.b + (this.endColor.b - this.startColor.b) * ratio;

                // Apply new color
                this.meterFillGreen.color = new Color(r, g, b);

                if (this.meterValue <= 0) {
                    this.meterValue = 0;
                    this.transition(State.outro);
                }

                this.bpmText[0].text = `${this.bpmCurrent.toFixed(1)}`;
                this.scoreText[0].text = String(this.score).padStart(3, "0");
                this.multiplierText[0].text = String(this.multiplier).padStart(3, "0");
                break;

            case State.outro:
                this.time -= delta;
                if (this.time <= 0) {
                    this.transition(State.result);
                }
                break;

            case State.done:
                if (this.game.wasAnyKeyPressed()) {
                    this.transition(State.return);
                }
                break;
        }

        // clamp + update bar
        //this.meterValue = Math.max(0, Math.min(100, this.meterValue));
        //this.greenActor.scale = new Vector(this.meterValue / 100, 1);

    }

    private transition(state: State): void {
        this.state = state;
        switch (state) {
            case State.play:
                this.messageText[0].opacity = 0;
                break;
            case State.outro:
                this.messageText[0].text = "Game Over";
                this.messageText[0].opacity = 1;
                this.time = outroDuration;
                resources.performanceBoo.play().catch(console.error);
                break;
            case State.result:
                this.transition(State.done);
                break;
            case State.return:
                this.game.engine.goToScene("performance");
                break;
        }
    }

    private angleDistance(a: number, b: number): number {
        let diff = a - b;
        while (diff < -Math.PI) {diff += Math.PI * 2}
        while (diff > Math.PI) {diff -= Math.PI * 2}
        return Math.abs(diff);
    }




    private normalizeAngle(angle: number): number {
        while (angle <= -Math.PI) {angle += Math.PI * 2}
        while (angle > Math.PI) {angle -= Math.PI * 2}
        return angle;
    }

    private spawnFloater(text: string, color: Color, position: Vector): void {
        let floater = this.floaterPool.pop();

        if (!floater) {
            floater = new Floater(text, color, position);
        } else {
            floater.reset(text, color, position); // we'll add reset() next
        }

        this.add(floater);
        floater.on('kill', () => {
            this.floaterPool.push(floater!);
        });
    }





}
