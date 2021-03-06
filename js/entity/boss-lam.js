import { GameConfig } from "../components/game-config.js";
import { AK47 } from "../weapon/ak47.js";
import { Enemy } from "./enemy.js";

export class BossLam extends Enemy {
    /**
    * Pirate.init
    * @param {Phaser.Scene} scene 
    * @param {number} x 
    * @param {number} y 
    * @param {StatsEntity} stats 
    */
    constructor(scene, x, y, stats) {
        stats = Object.assign({}, GameConfig.entities["boss_lam"], stats);
        super(scene, x, y, stats);

        this.weapon = new AK47(scene, x, y, {
            baseDMG: 200,
            fireTime: 250,
        }).setVisible(false);
        this.weapon.owner = this;

        this.phase = 0;

        // add event for cooldown system
        this.cooldownEvent = this.scene.time.addEvent({
            loop: true,
            delay: 1000,
            callback: () => {
                this.phase += 1000;
                if (this.phase >= 10000) this.phase = 0;
            }
        });

        this.setTexture("images.enemy.boss-lam").setScale(0.6).setCircle(100, 35, 90);

        this.healthbar = this.scene.add.container(0, 0, [
            this.scene.add.rectangle(0, 0, 1, 1, 0xff0000).setOrigin(0, 0.5),
            this.scene.add.rectangle(0, 0, 1, 1, 0x00ff00).setOrigin(0, 0.5)
        ]);
    }

    static preload(scene) {
        if (scene instanceof Phaser.Scene) {
            scene.load.image("images.enemy.boss-lam", "./assets/images/enemy/boss-lam.png");
        }
    }

    update() {
        if (this.isAlive) {

            this.setAngle(30 * Math.sin(this.scene.time.now / 50));
            this.weapon.setPosition(this.x, this.y);
            if (this.phase < 5000) {
                // attack phase
                if (this.weapon.isFireable) {
                    this.weapon.pointTo(this.player).fire();
                }
            } else if (this.phase < 7000) {
                // health phase
                this.stats.cur.hp += 1;
            } else {
                // stun phase
            }

            this.setVelocity(0);

            this.healthbar.setPosition(this.x - this.width / 2, this.y - 16);
            this.healthbar.getAt(0).setDisplaySize(this.width, 4);
            this.healthbar.getAt(1).setDisplaySize(this.width * (this.stats.cur.hp / this.stats.max.hp), 4);
        } else {
            this.scene.game.events.emit("youwin");
            this.scene.scene.pause();
            this.destroy();
            this.weapon.destroy();
            this.healthbar.destroy();
        }
    }

    /**
     * override destroy
     * @param {boolean} fromScene 
     */
    destroy(fromScene) {
        this.cooldownEvent.destroy();
        super.destroy(fromScene);
    }
}