import { Scene, Actor, Color, Vector, Text, Input, Font } from "excalibur";
import * as ex from "excalibur";
import { fadeToScene } from "./utils/fadeToScene.js";

export class NameInputScene extends Scene {
    private currentName = "";
    private nameActor!: Actor;

    private keyMap: any = {
        [Input.Keys.A]: "A",
        [Input.Keys.B]: "B",
        [Input.Keys.C]: "C",
        [Input.Keys.D]: "D",
        [Input.Keys.E]: "E",
        [Input.Keys.F]: "F",
        [Input.Keys.G]: "G",
        [Input.Keys.H]: "H",
        [Input.Keys.I]: "I",
        [Input.Keys.J]: "J",
        [Input.Keys.K]: "K",
        [Input.Keys.L]: "L",
        [Input.Keys.M]: "M",
        [Input.Keys.N]: "N",
        [Input.Keys.O]: "O",
        [Input.Keys.P]: "P",
        [Input.Keys.Q]: "Q",
        [Input.Keys.R]: "R",
        [Input.Keys.S]: "S",
        [Input.Keys.T]: "T",
        [Input.Keys.U]: "U",
        [Input.Keys.V]: "V",
        [Input.Keys.W]: "W",
        [Input.Keys.X]: "X",
        [Input.Keys.Y]: "Y",
        [Input.Keys.Z]: "Z",
        [Input.Keys.Space]: " ",
        [Input.Keys.Digit0]: "0",
        [Input.Keys.Digit1]: "1",
        [Input.Keys.Digit2]: "2",
        [Input.Keys.Digit3]: "3",
        [Input.Keys.Digit4]: "4",
        [Input.Keys.Digit5]: "5",
        [Input.Keys.Digit6]: "6",
        [Input.Keys.Digit7]: "7",
        [Input.Keys.Digit8]: "8",
        [Input.Keys.Digit9]: "9",
    };

    public override onInitialize(engine: ex.Engine): void {
        console.log("[NameInput] Scene initialized");

        // --- Prompt ---
        const prompt = new Actor({
            pos: new Vector(engine.drawWidth /2 , engine.drawHeight / 2 - 100),
            anchor: new Vector(0, 0.5),
        });

        prompt.graphics.use(
            new Text({
                text: "ENTER YOUR NAME",
                color: Color.White,
                font: new Font({
                    size: 48,
                    family: "Geologica",
                    textAlign: ex.TextAlign.Center,
                }),
            })
        );
        this.add(prompt);

        // --- Player input text ---
        this.nameActor = new Actor({
            pos: new Vector(engine.drawWidth / 2, engine.drawHeight / 2),
            anchor: new Vector(0.5, 0.5),
        });
        this.add(this.nameActor);

        this.updateNameText();

        // --- Key listener ---
        engine.input.keyboard.on("press", (evt) => {
            const key = evt.key;

            if (this.keyMap[key] && this.currentName.length < 12) {
                this.currentName += this.keyMap[key];
                this.updateNameText();
            }

            if (key === Input.Keys.Backspace && this.currentName.length > 0) {
                this.currentName = this.currentName.slice(0, -1);
                this.updateNameText();
            }

            if (key === Input.Keys.Enter) {
                const finalName = this.currentName.trim() || "Unknown";
                console.log("[NameInput] Confirmed name:", finalName);
                localStorage.setItem("playerName", finalName);
                fadeToScene(engine, "performance", 1000);
            }
        });
    }

    public override onActivate(): void {
        console.log("[NameInput] Scene activated — resetting name");
        this.currentName = "";
        this.updateNameText();
    }

    private updateNameText(): void {
        const textGraphic = new Text({
            text: this.currentName || "_",
            color: Color.Yellow,
            font: new Font({
                size: 64,
                family: "Geologica",
                textAlign: ex.TextAlign.Left,
            }),
        });
        this.nameActor.graphics.use(textGraphic);
    }
}
