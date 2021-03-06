import { GameScene } from "../components/game-scene.js";

export class ChooseStage extends GameScene {
    constructor() {
        super("ChooseStage");
    }

    /**
     * 
     * @param {Phaser.Scene} scene 
     */
    static preload(scene) {
        scene.load.image("images.choose-stage-bg", "./assets/ui/choose-stages.png");
        scene.load.image("images.choose-stage1", "./assets/ui/btn-stage1.png");
        scene.load.image("images.choose-stage2", "./assets/ui/btn-stage2.png");
    }

    create() {
        super.create();

        this.buttonSound = this.sound.add("sounds.button");

        //background
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "images.choose-stage-bg").setOrigin(0.5, 0.5).setScale(1.2);

        //button to stage 1
        this.buttonStage1 = this.add.image(555, 805, "images.choose-stage1").setOrigin(0.5, 0.5).setScale(0.7);
        this.buttonStage1.setInteractive()
            .on("pointerdown", () => {
                this.buttonSound.play();
                this.scene.start("Stage01");
            }
            ).on("pointermove", () => {
                this.buttonStage1.setScale(0.8);
            }).on("pointerout", () => {
                this.buttonStage1.setScale(0.7);
            })

        //button to stage 2
        this.buttonStage2 = this.add.image(1383, 805, "images.choose-stage2").setOrigin(0.5, 0.5).setScale(0.7);
        this.buttonStage2.setInteractive()
            .on("pointerdown", () => {
                this.buttonSound.play();
                this.scene.start("Stage02");
            }
            ).on("pointermove", () => {
                this.buttonStage2.setScale(0.8);
            }).on("pointerout", () => {
                this.buttonStage2.setScale(0.7);
            })
    }
}