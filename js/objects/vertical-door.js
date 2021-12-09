import { Entity } from "../entity/entity.js";

export class VerticalDoor extends Phaser.Physics.Arcade.Sprite {
    /**
     * init 
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {boolean} isAutoDoor
     */
    constructor(scene, x, y, isAutoDoor) {
        super(scene, x, y, null);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.add.collider(this, Entity.instances);


        this.setPushable(false).setImmovable(true)

        this.anims.create({
            key: "anims.vertical-door-open",
            frameRate: 10,
            frames: this.anims.generateFrameNumbers("spritesheet.vertical-door", { frames: [0, 1, 2, 3, 4] }),
        });

        this.anims.create({
            key: "anims.vertical-door-close",
            frameRate: 10,
            frames: this.anims.generateFrameNumbers("spritesheet.vertical-door", { frames: [4, 3, 2, 1, 0] }),
        });

        this.isopen = true;
        this.setBodySize(32, 160).setOffset(0).setDepth(-1).close();

        if (isAutoDoor) {
            const sensor = scene.physics.add.image(x, y, null).setVisible(false).setBodySize(64, 160);
            this.scene.time.addEvent({
                loop: true,
                delay: 100,
                callback: () => {
                    const isoverlap = this.scene.physics.overlap(sensor, Entity.instances);
                    if (isoverlap) this.open();
                    else this.close();
                }
            });
        }
    }

    /**
     * Vertical Door preload resources
     * @param {Phaser.Scene} scene 
     */
    static preload(scene) {
        scene.load.spritesheet("spritesheet.vertical-door", "./assets/images/vertical-door.png", { frameWidth: 32, frameHeight: 160 });
    }

    open() {
        if (this.isopen) return this;
        this.play("anims.vertical-door-open", true).on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.body.setEnable(false));
        this.isopen = true;
        return this;
    }

    close() {
        if (!this.isopen) return this;
        this.play("anims.vertical-door-close", true).on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.body.setEnable(true));
        this.isopen = false;
        return this;
    }
}