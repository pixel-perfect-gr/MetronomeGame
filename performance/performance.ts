import type {Engine} from "excalibur";
import { Actor, Color, EasingFunctions, Scene, TextAlign, Vector, Rectangle } from "excalibur";
import type Game from "../game.js";
import resources from "../resources.js";
import Timer from "../metronome/timer.js";
import {textActor} from "../text-actor.js";
import {ColorLerp} from "./color.js";
import Floater from "./floater.js";
import Tween from "./tween.js";
import Arm from "./arm.js";

const introDuration = (30 / 60) * 1000;
const outroDuration = (50 / 60) * 1000;
const scoreThreshold3Star = 6000;
const scoreThreshold2Star = 2000;
const scoreThreshold1Star = 1;
const baseScore = 5;
const maxMissedBeats = 5;

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
    private static readonly ARM_CENTER = Math.PI * 2;
    private showInstructions = true;
    private readonly timer: Timer;
    private score = 0;
    private multiplier = 0;
    private missedBeats = 0;
    private beats = 0;
    private state = State.intro;
    private time = 0;
    private finalStars = 0;

    private meterValue = 0;        // current score of bar, -100..100
    private targetMeterValue = 0;  // smooth target
    private readonly meterBar: Actor;
    private readonly greenActor: Actor;
    private readonly redActor: Actor;
    private readonly meterFillGreen: Rectangle;
    private readonly meterFillRed: Rectangle;

    private readonly tempoText = textActor({
        pos: new Vector(22, 24),
        color: Color.fromHex("eeeeee"),
        fontSize: 36
    });
    private readonly bpmText = textActor({
        pos: new Vector(22, 58),
        color: Color.fromHex("eeeeee"),
        fontSize: 24
    });
    private readonly scoreText = textActor({
        pos: new Vector(618, 15),
        color: Color.fromHex("eeeeee"),
        fontSize: 48,
        textAlign: TextAlign.Right
    });
    private readonly multiplierText = textActor({
        pos: new Vector(618, 58),
        fontSize: 28,
        textAlign: TextAlign.Right
    });
    private readonly multiplierMissColorLerp = new ColorLerp(Color.fromHex("c41b18"), Color.White);
    private readonly multiplierMissTween = new Tween(
        (10 / 60) * 1000,
        f => (this.multiplierText[0].color = this.multiplierMissColorLerp.lerp(f))
    );
    private readonly multiplierPerfectColorLerp = new ColorLerp(
        Color.fromHex("d3cd08"),
        Color.White
    );
    private readonly multiplierPerfectTween = new Tween(
        (10 / 60) * 1000,
        f => (this.multiplierText[0].color = this.multiplierPerfectColorLerp.lerp(f))
    );
    private readonly messageText = textActor({
        text: "Press the button to Start",
        pos: new Vector(320, 167),
        color: Color.fromHex("eeeeee"),
        fontSize: 72,
        textAlign: TextAlign.Center
    });
    private readonly messageFadeIn = new Tween(
        (20 / 60) * 1000,
        f => (this.messageText[0].opacity = f)
    );
    private readonly messageFadeOut = new Tween(
        (20 / 60) * 1000,
        f => (this.messageText[0].opacity = 1 - f)
    );
    private readonly arm = new Arm();
    private readonly star1Blank = new Actor({pos: new Vector(180, 300), width: 158, height: 152});
    private readonly star2Blank = new Actor({pos: new Vector(320, 300), width: 158, height: 152});
    private readonly star3Blank = new Actor({pos: new Vector(460, 300), width: 158, height: 152});
    private readonly star1 = new Actor({pos: new Vector(180, 300), width: 120, height: 115});
    private readonly star2 = new Actor({pos: new Vector(320, 300), width: 120, height: 115});
    private readonly star3 = new Actor({pos: new Vector(460, 300), width: 120, height: 115});
    private readonly starBlankFadeIn = new Tween((30 / 60) * 1000, f => {
        this.star1Blank.graphics.opacity = f;
        this.star2Blank.graphics.opacity = f;
        this.star3Blank.graphics.opacity = f;
    });
    private readonly star1FadeIn = new Tween(
        (10 / 60) * 1000,
        f => {
            this.star1.graphics.opacity = f;
            const scale = 0.6 + 0.4 * f;
            this.star1.scale = new Vector(scale, scale);
        },
        EasingFunctions.Linear,
        () => {
            if (this.finalStars > 1) {
                resources.performanceStar2.play().then(
                    () => {},
                    reason => void console.error("", reason)
                );
                this.star2FadeIn.play().catch(reason => void console.error("", reason));
            } else {
                this.transition(State.done);
            }
        }
    );
    private readonly star2FadeIn = new Tween(
        (10 / 60) * 1000,
        f => {
            this.star2.graphics.opacity = f;
            const scale = 0.6 + 0.4 * f;
            this.star2.scale = new Vector(scale, scale);
        },
        EasingFunctions.Linear,
        () => {
            if (this.finalStars > 2) {
                resources.performanceStar3.play().then(
                    () => {},
                    reason => void console.error("", reason)
                );
                this.star3FadeIn.play().catch(reason => void console.error("", reason));
            } else {
                this.transition(State.done);
            }
        }
    );
    private readonly star3FadeIn = new Tween(
        (10 / 60) * 1000,
        f => {
            this.star3.graphics.opacity = f;
            const scale = 0.6 + 0.4 * f;
            this.star3.scale = new Vector(scale, scale);
        },
        EasingFunctions.Linear,
        () => {
            this.transition(State.done);
        }
    );
    private readonly instructionText = textActor({
        text: "Press the button to Start",
        pos: new Vector(320, 370),
        color: Color.fromHex("eeeeee"),
        fontSize: 32,
        textAlign: TextAlign.Center,
        opacity: 0
    });
    private readonly instructionFadeIn = new Tween(
        (30 / 60) * 1000,
        f => (this.instructionText[0].opacity = f)
    );
    private readonly instructionFadeOut = new Tween(
        (30 / 60) * 1000,
        f => (this.instructionText[0].opacity = 1 - f)
    );
    public constructor(private readonly game: Game) {
        super();
        this.timer = new Timer(0);



        const createZoneLine = (offset: number, color: Color, game: Game): Actor => {
            const line = new Actor({
                pos: new Vector(game.width / 2, game.height / 2),
                anchor: new Vector(0.5, 1),  // bottom center so the line points outward from center
                width: 4,
                height: game.height / 2,
                color
            });
            // Draw at ARM_CENTER ± offset
            line.rotation = Performance.ARM_CENTER + offset;
            line.graphics.opacity = 0.3;
            return line;
        };

        // Perfect borders
        this.add(createZoneLine( +0.05, Color.Yellow, this.game));
        this.add(createZoneLine( -0.05, Color.Yellow, this.game));
        // Good borders
        this.add(createZoneLine( +0.15, Color.Green,  this.game));
        this.add(createZoneLine( -0.15, Color.Green,  this.game));
        // Optional wider border
        this.add(createZoneLine( +0.25, Color.Green,  this.game));
        this.add(createZoneLine( -0.25, Color.Green,  this.game));


        // ====== BAR SETUP ======
        const barWidth  = 400;
        const barHeight = 30;
        const barPos    = new Vector(this.game.width / 2, this.game.height * 0.1);

        // Background
        const meterBg = new Actor({ pos: barPos, anchor: new Vector(0.5, 0.5) });
        meterBg.graphics.use(new Rectangle({ width: barWidth, height: barHeight, color: Color.fromHex("#333333") }));
        this.add(meterBg);

        // Container
        this.meterBar = new Actor({ pos: barPos, anchor: new Vector(0.5, 0.5) });
        this.add(this.meterBar);

        // Green (right side, half bar)
        this.meterFillGreen = new Rectangle({ width: barWidth / 2, height: barHeight, color: Color.Green });
        this.greenActor = new Actor({ pos: barPos.clone(), anchor: new Vector(0, 0.5) }); // left edge = center
        this.greenActor.graphics.use(this.meterFillGreen);
        this.add(this.greenActor);

        // Red (left side, half bar)
        this.meterFillRed = new Rectangle({ width: barWidth / 2, height: barHeight, color: Color.Red });
        this.redActor = new Actor({ pos: barPos.clone(), anchor: new Vector(1, 0.5) }); // right edge = center
        this.redActor.graphics.use(this.meterFillRed);
        this.add(this.redActor);


        // ====== END BAR SETUP ======

        this.add(this.arm);
        this.arm.pos = new Vector(this.game.width / 2, this.game.height / 2);

        const overlay = new Actor({
            pos: Vector.Zero,
            width: this.game.width,
            height: this.game.height,
            anchor: Vector.Zero
        });
        overlay.graphics.add(resources.performanceOverlay.toSprite());
        //this.add(overlay);

        const vignette = new Actor({
            pos: Vector.Zero,
            width: this.game.width,
            height: this.game.height,
            anchor: Vector.Zero
        });
        vignette.graphics.add(resources.performanceVignette.toSprite());
        //this.add(vignette);

        this.tempoText[1].pos      = new Vector(this.game.width * 0.05, this.game.height * 0.05);
        this.bpmText[1].pos        = new Vector(this.game.width * 0.05, this.game.height * 0.08);
        this.scoreText[1].pos      = new Vector(this.game.width * 0.95, this.game.height * 0.05);
        this.multiplierText[1].pos = new Vector(this.game.width * 0.95, this.game.height * 0.08);

        this.messageText[1].pos    = new Vector(this.game.width / 2, this.game.height * 0.25);
        this.instructionText[1].pos= new Vector(this.game.width / 2, this.game.height * 0.6);


        this.add(this.tempoText[1]);
        this.add(this.bpmText[1]);
        this.add(this.scoreText[1]);
        this.add(this.multiplierText[1]);
        this.add(this.multiplierMissTween);
        this.add(this.multiplierPerfectTween);
        this.add(this.messageText[1]);
        this.add(this.messageFadeIn);
        this.add(this.messageFadeOut);

        this.star1Blank.graphics.add(resources.performanceBigStarBlank.toSprite());
        this.add(this.star1Blank);
        this.star2Blank.graphics.add(resources.performanceBigStarBlank.toSprite());
        this.add(this.star2Blank);
        this.star3Blank.graphics.add(resources.performanceBigStarBlank.toSprite());
        this.add(this.star3Blank);
        this.star1.graphics.add(resources.performanceBigStar.toSprite());
        this.add(this.star1);
        this.star2.graphics.add(resources.performanceBigStar.toSprite());
        this.add(this.star2);
        this.star3.graphics.add(resources.performanceBigStar.toSprite());
        this.add(this.star3);

        this.star1.pos = new Vector(this.game.width / 2 - 200, this.game.height * 0.85);
        this.star2.pos = new Vector(this.game.width / 2,       this.game.height * 0.85);
        this.star3.pos = new Vector(this.game.width / 2 + 200, this.game.height * 0.85);


        this.add(this.starBlankFadeIn);
        this.add(this.star1FadeIn);
        this.add(this.star2FadeIn);
        this.add(this.star3FadeIn);

        this.add(this.instructionText[1]);
        this.add(this.instructionFadeIn);
        this.add(this.instructionFadeOut);
    }

    public override onActivate(): void {
        this.game.music.kill();
        this.add(this.game.music);
        this.game.music.stop();

        this.score = 0;
        this.multiplier = 0;
        this.game.stars = 0;
        this.missedBeats = 0;
        this.timer.reset(this.game.bpm);
        this.arm.reset();
        this.tempoText[0].text = this.game.tempo;
        this.bpmText[0].text = `${this.game.bpm}bpm`;
        this.beats = 16;
        this.state = State.intro;
        this.time = introDuration;

        // === Reset bar values ===
        this.meterValue = 0;
        this.targetMeterValue = 0;
        this.greenActor.scale = new Vector(0.001, 1);
        this.redActor.scale   = new Vector(0.001, 1);

        this.star1Blank.graphics.opacity = 0;
        this.star2Blank.graphics.opacity = 0;
        this.star3Blank.graphics.opacity = 0;
        this.star1.graphics.opacity = 0;
        this.star2.graphics.opacity = 0;
        this.star3.graphics.opacity = 0;
        this.star1.scale = new Vector(0.6, 0.6);
        this.star2.scale = new Vector(0.6, 0.6);
        this.star3.scale = new Vector(0.6, 0.6);

        this.updateScoreAndMultiplierText();
        this.multiplierText[0].color = Color.White;

        this.messageText[0].text = "Ready?";
        this.messageText[0].opacity = 0;
        void this.messageFadeIn.play();

        resources.performanceReady.play().then(
            () => void 0,
            reason => void console.error("", reason)
        );
    }

    public override update(engine: Engine, delta: number): void {
        super.update(engine, delta);

        this.timer.update(delta);

        switch (this.state) {
            case State.intro:
                // Pause a bit before starting
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
                // make the arm swing continuously
                this.arm.beat(engine.clock.now(), this.game.bpm);

                if (this.timer.isOffBeat) {
                    ++this.missedBeats;
                    --this.beats;
                }

                if (this.game.wasAnyKeyPressed()) {
                    if (this.showInstructions && this.instructionText[0].opacity === 1) {
                        void this.instructionFadeOut.play();
                        this.showInstructions = false;
                    }
                    this.add(this.createTriggerLine(this.arm.rotation));

                    const distance = this.angleDistance(this.arm.rotation, Performance.ARM_CENTER);

                    // "missed" means you pressed way outside the allowed window
                    const missed = distance > 0.5; // > ~28 degrees
                    if (missed) {
                        this.arm.miss();
                        this.multiplier = 0;
                        this.missedBeats++;
                        void this.multiplierMissTween.play();
                    } else {
                        this.arm.tickTock();
                        ++this.multiplier;
                        this.missedBeats = 0;
                    }

                    // What kind of hit did we register?
                    if (distance < 0.05) { // ~3°
                        this.add(new Floater("Perfect!", Color.fromHex("d3cd08")));
                        this.multiplier += 4;
                        void this.multiplierPerfectTween.play();
                        this.targetMeterValue = Math.min(100, this.targetMeterValue + 10);  // perfect
                        resources.performanceChime.play().catch(console.error);
                    } else if (distance < 0.15) { // ~8.5°
                        this.add(new Floater("Nice", Color.fromHex("d3cd08")));
                        this.targetMeterValue = Math.min(100, this.targetMeterValue + 7);  // perfect
                    } else if (distance < 0.25) { // ~14°
                        this.add(new Floater("Good", Color.fromHex("d3cd08")));
                        this.targetMeterValue = Math.min(100, this.targetMeterValue + 5);  // perfect
                    } else {
                        this.add(new Floater("Awful!", Color.fromHex("c41b18")));
                        this.targetMeterValue = Math.max(-100, this.targetMeterValue - 15); // awful
                    }

                    // Score some points if we hit (closer = higher factor)
                    if (!missed) {
                        const factor =
                            distance < 0.05 ? 4 :
                                distance < 0.15 ? 3 :
                                    distance < 0.25 ? 2 :
                                        1;
                        this.score += factor * this.multiplier * baseScore;
                    }
                }

                this.updateScoreAndMultiplierText();

                // Check to see if we should transition out of the play state.
                if (this.beats < 0 || this.missedBeats > maxMissedBeats) {
                    this.transition(State.outro);
                }
                break;
            case State.outro:
                // TODO: should arm return to center?

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

        // Smoothly move towards target
        const lerpSpeed = 5;
        this.meterValue += (this.targetMeterValue - this.meterValue) * (lerpSpeed * delta / 1000);

        // Clamp
        this.meterValue = Math.max(-100, Math.min(100, this.meterValue));

        // Scale relative to half width
        const fill = this.meterValue / 100; // -1..1

        if (fill >= 0) {
            this.greenActor.scale = new Vector(fill, 1);
            this.redActor.scale   = new Vector(0.001, 1);
        } else {
            this.greenActor.scale = new Vector(0.001, 1);
            this.redActor.scale   = new Vector(-fill, 1);
        }

        // BPM change
        if (this.meterValue >= 95) {
            this.game.bpm = Math.min(300, this.game.bpm + 10);
            this.bpmText[0].text = `${this.game.bpm}bpm`;
            this.targetMeterValue = 0;
            this.meterValue = 0;
        } else if (this.meterValue <= -95) {
            this.game.bpm = Math.max(40, this.game.bpm - 10);
            this.bpmText[0].text = `${this.game.bpm}bpm`;
            this.targetMeterValue = 0;
            this.meterValue = 0;
        }


    }

    private updateScoreAndMultiplierText(): void {
        this.scoreText[0].text = String(this.score).padStart(6, "0");
        this.multiplierText[0].text = String(this.multiplier).padStart(3, "0");
    }

    private transition(state: State): void {
        this.state = state;

        switch (state) {
            case State.countIn:
                this.timer.start();

                if (this.showInstructions) {
                    void this.instructionFadeIn.play();
                }
                break;
            case State.play:
                void this.messageFadeOut.play();
                break;
            case State.outro:
                this.messageText[0].text =
                    this.missedBeats <= maxMissedBeats ? "Great!" : "You Suck";
                void this.messageFadeIn.play();

                this.starBlankFadeIn.play().catch(reason => void console.error("", reason));

                this.time = outroDuration;

                (this.missedBeats <= maxMissedBeats
                    ? resources.performanceCheer
                    : resources.performanceBoo
                )
                    .play()
                    .then(
                        () => void 0,
                        reason => void console.error("", reason)
                    );
                break;
            case State.result:
                this.calculateFinalStars();
                if (this.finalStars > 0) {
                    resources.performanceStar1.play().then(
                        () => {},
                        reason => void console.error("", reason)
                    );
                    this.star1FadeIn.play().catch(reason => void console.error("", reason));
                } else {
                    this.transition(State.done);
                }
                break;
            case State.return:
                this.game.stars = this.finalStars;
                this.game.engine.goToScene("performance");
                break;
        }
    }

    private calculateFinalStars(): void {
        if (this.missedBeats > maxMissedBeats) {
            this.finalStars = 0;
        } else if (this.score > scoreThreshold3Star) {
            // TODO Really? Not >=?
            this.finalStars = 3;
        } else if (this.score > scoreThreshold2Star) {
            // TODO Really? Not >=?
            this.finalStars = 2;
        } else if (this.score > scoreThreshold1Star) {
            // TODO Really? Not >=?
            this.finalStars = 1;
        } else {
            this.finalStars = 0;
        }
    }

    private  createTriggerLine(rotation: number): Actor {
        const line = new Actor({
            pos: new Vector(this.game.width / 2, this.game.height / 2),
            anchor: new Vector(0.5, 1),        // bottom so it points away from center
            width: 4,
            height: this.game.height / 2,
            color: Color.Red
        });

        line.rotation = rotation;            // draw exactly at arm rotation
        line.graphics.opacity = 0.7;
        line.actions.delay(500).callMethod(() => {
            line.kill();
        });
        return line;
    }

    private angleDistance(a: number, b: number): number {
        let diff = a - b;
        while (diff < -Math.PI) {
            diff += Math.PI * 2;
        }
        while (diff > Math.PI)  {
            diff -= Math.PI * 2;
        }
        return Math.abs(diff);
    }
}
