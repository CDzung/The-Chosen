import { GameConfig } from "../components/game-config.js";
import { StatsEntity } from "../stats/stats-entity.js";
import { Weapon } from "../weapon/weapon.js";
import { Enemy } from "./enemy.js";

export class Endurance extends Enemy {

    /**
     * Endurance.init
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {StatsEntity} stats 
     */
    constructor(scene, x, y, stats) {
        stats = Object.assign({}, GameConfig.entities.endurance, stats);
        super(scene, x, y, stats);

        this.weapon = new Weapon(scene, x, y, "", GameConfig.weapons.punch).setVisible(false);
        this.weapon.owner = this;

        this.randomVelocity = { x: 0, y: 0 };
        this.lastTime = 0;
        this.setBodySize(30,37).setOffset(15,15);

        this.isSeeingPlayer = false;
    }

    movement() {
        const vecx = this.player.x - this.x;
        const vecy = this.player.y - this.y;
        const len = Math.sqrt(vecx * vecx + vecy * vecy);

        if (len <= 300)
            return { x: vecx / len * this.stats.cur.runningSpeed, y: vecy / len * this.stats.cur.runningSpeed };

        if (450 >= len && len >= 300){
            this.isSeeingPlayer = true;
            return { x: this.randomVelocity.x * this.stats.cur.speed, y: this.randomVelocity.y * this.stats.cur.speed };
        }

        if(!this.isSeeingPlayer)
            return { x: 0, y: 0 };

        if (len > 450) {
            return { x: this.randomVelocity.x * this.stats.cur.speed, y: this.randomVelocity.y * this.stats.cur.speed };
        }

        return { x: 0, y: 0 };
    }

    create_anims() {
        this.animations.idle = this.scene.anims.create({
            key: "anims-enemy-endurance-idle",
            frameRate: 10,
            repeat: -1,
            frames: this.scene.anims.generateFrameNumbers("spritesheet-enemy-endurance-move", { start: 0, end: 4 })
        });

        this.animations.move = this.scene.anims.create({
            key: "anims-enemy-endurance-move",
            frameRate: 10,
            repeat: -1,
            frames: this.scene.anims.generateFrameNumbers("spritesheet-enemy-endurance-move", { start: 0, end: 9 })
        });

        this.animations.die = this.scene.anims.create({
            key: "anims-enemy-endurance-die",
            frameRate: 10,
            repeat: 0,
            frames: this.scene.anims.generateFrameNumbers("spritesheet-enemy-endurance-die", { start: 0, end: 4 })
        });

        this.animations.attack = this.scene.anims.create({
            key: "anims-enemy-endurance-attack",
            frameRate: 10,
            repeat: -1,
            frames: this.scene.anims.generateFrameNumbers("spritesheet-enemy-endurance-attack", { start: 0, end: 6 })
        });

        // console.log(this.animations.idle);
    }

    static preload(scene) {
        if (scene instanceof Phaser.Scene) {
            scene.load.spritesheet("spritesheet-enemy-endurance-move", "./assets/images/enemy/endurance/endurance-move.png", { frameWidth: 64, frameHeight: 64 });
            scene.load.spritesheet("spritesheet-enemy-endurance-attack", "./assets/images/enemy/endurance/endurance-attack.png", { frameWidth: 64, frameHeight: 64 });
            scene.load.spritesheet("spritesheet-enemy-endurance-die", "./assets/images/enemy/endurance/endurance-die.png", { frameWidth: 128, frameHeight: 64 });
        }
    }

    update() {
        // super.update();

        // weapon fire
        if (this.isAlive) {
            if (!this.isStunning) {
                let vec = this.movement();

                this.setVelocity(vec.x, vec.y);

                // flip sprite
                if (vec.x > 0) {
                    this.setFlipX(false);
                } else if (vec.x < 0) {
                    this.setFlipX(true);
                }
            }
            
            const vecx = this.player.x - this.x;
            const vecy = this.player.y - this.y;
            const len = Math.sqrt(vecx * vecx + vecy * vecy);

            if (len > 60 && this.isAlive) {
                this.play(this.animations.move, true);
            }

            if (this.weapon.isFireable && len < 60 && this.player.isAlive && this.isAlive) { 
                this.play(this.animations.attack, true);
                if (len < 40) {
                    this.player.take_damage(this.weapon.stats.damage);
                    this.weapon.fire();   
                }    
            } 

        } else {
            // this.weapon.destroy(this.scene);
            if (!this.isDieAnimationPlayed) {
                this.play(this.animations.die, true);
                this.isDieAnimationPlayed = true;
            }
            // this.setDepth(this.player.setDepth - 1);
            this.setVelocity(0);
            this.body.destroy();
        }

        if (this.scene.time.now - this.lastTime > 500) {
            this.lastTime = this.scene.time.now;
            this.randomVelocity.x = Math.random() * 2 - 1;
            this.randomVelocity.y = Math.random() * 2 - 1;
        }
    }

}