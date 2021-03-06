import { StatsEntity } from "../stats/stats-entity.js";
import { Gun } from "../weapon/gun.js";
import { Melee } from "../weapon/melee.js";
import { Weapon } from "../weapon/weapon.js";
import { Entity } from "./entity.js";

export class Player extends Entity {

    /**
     * constructor
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {StatsEntity} stats 
     */
    constructor(scene, x, y, stats) {
        super(scene, x, y, stats);

        window.player = this;

        scene.scene.launch("PlayerUI", { player: this });

        // camera config
        this.cameras = {
            "zoom": 4,
            "zoomSpeed": 2,
            "currentZoom": 3,
            "smoothSpeed": 0.07,
            "zoomRange": { min: 2.25, max: 4 },

            "dummy": this.scene.physics.add.sprite(x, y, null).setVisible(false).setBodySize(1, 1),
            "follow": this,
            "followSpeed": 2
        };

        this.scene.cameras.main.startFollow(this.cameras.dummy);

        // zoom by mouse wheel
        this.scene.input.addListener(Phaser.Input.Events.POINTER_WHEEL, ({ deltaY }) => {
            this.cameras.zoom -= this.cameras.zoomSpeed * deltaY * 0.001;
            if (this.cameras.zoom < this.cameras.zoomRange.min) this.cameras.zoom = this.cameras.zoomRange.min;
            if (this.cameras.zoom > this.cameras.zoomRange.max) this.cameras.zoom = this.cameras.zoomRange.max;
        });

        //add key control
        this.controller = {
            "up": this.scene.input.keyboard.addKey("W"),
            "down": this.scene.input.keyboard.addKey("S"),
            "right": this.scene.input.keyboard.addKey("D"),
            "left": this.scene.input.keyboard.addKey("A"),
            "run": this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
            "swapWeapon": this.scene.input.keyboard.addKey("Q"),
            "lootWeapon": this.scene.input.keyboard.addKey("F"),
        }

        // weapons
        this.weapons = {
            "pri": null,
            "sec": null,
            "idx": null,

            get active() {
                return this.idx == 0 ? this.pri : this.sec;
            }
        };

        // isplayer = true
        this.isPlayer = true;

        this.timeout = 4000;

        this.COOLDOWN_SWAP_TIME = 600;
        this.nextSwapTime = this.scene.time.now;

        this.COOLDOWN_LOOT_TIME = 600;
        this.nextLootTime = this.scene.time.now;

        // sounds
        this.hurtSound = null;
        this.deathSound = null;
        this.isDeathSoundPlayed = false;
        this.changeGunSound = this.scene.sound.add("sounds.changegun");


    }

    take_damage(dmg) {
        this.hurtSound?.play();
        super.take_damage(dmg);
        return this;
    }

    /**
     * get player velocity vector
     * @returns {x: number, y: number}
     */
    movement() {
        let vec = { x: 0, y: 0 };

        const speed = this.controller.run.isDown ? this.stats.cur.runningSpeed : this.stats.cur.speed;
        const sqrt2 = 1.414213;

        if (this.controller.up.isDown) vec.y -= 1;
        if (this.controller.down.isDown) vec.y += 1;
        if (this.controller.left.isDown) vec.x -= 1;
        if (this.controller.right.isDown) vec.x += 1;

        if (vec.x * vec.x + vec.y * vec.y == 2) {
            vec.x /= sqrt2;
            vec.y /= sqrt2;
        }

        return {
            x: vec.x * speed,
            y: vec.y * speed,
        }
    }

    /**
     * set weapon for player
     * @param {Weapon} weapon 
     * @returns {Player} this
     */
    setWeapon(weapon) {

        if (weapon instanceof Gun) {
            if (this.weapons.pri)
                this.weapons.pri.owner = null;
            this.weapons.pri = weapon;
            this.weapons.idx = 0;
        } else if (weapon instanceof Melee) {
            if (this.weapons.sec)
                this.weapons.sec.owner = null;
            this.weapons.sec = weapon;
            this.weapons.idx = 1;
        }

        weapon.owner = this;
        this.changeGunSound.play();
        return this;
    }

    /**
     * swap between gun and melee
     * @returns {Player} this
     */
    swapWeapon() {
        this.weapons.idx = (this.weapons.idx == 0 ? 1 : 0);
        this.changeGunSound.play();
        return this;
    }

    /**
     * loot an weapon from scene
     * swap to the weapon that have same type to the looted weapon then drop current weapon to scene
     * @param {Weapon} weapon 
     * @returns {Player} this
     */
    lootWeapon(weapon) {
        if (weapon instanceof Gun) {
            if (this.weapons.pri) {
                this.weapons.pri.owner = null;
                this.weapons.pri.setPosition(this.x, this.y).setDepth(this.depth - 1);
                this.weapons.pri.setVisible(true);
            }

            this.weapons.pri = weapon;
            this.weapons.pri.setDepth(this.depth + 1);
            this.weapons.idx = 0;
        } else if (weapon instanceof Melee) {
            if (this.weapons.sec) {
                this.weapons.sec.owner = null;
                this.weapons.sec.setPosition(this.x, this.y).setDepth(this.depth - 1);
                this.weapons.sec.setVisible(true);
            }

            this.weapons.sec = weapon;
            this.weapons.sec.setDepth(this.depth + 1);
            this.weapons.idx = 1;
        }
        weapon.owner = this;
        this.changeGunSound.play();
        return this;
    }


    update() {
        super.update();

        if (this.isAlive) {
            if (this.controller["swapWeapon"].isDown && this.nextSwapTime < this.scene.time.now) {
                this.swapWeapon();
                this.nextSwapTime = this.scene.time.now + this.COOLDOWN_SWAP_TIME;
            }

            if (this.controller["lootWeapon"].isDown && this.nextLootTime < this.scene.time.now) {
                this.scene.sys.displayList.getAll().filter(e => e instanceof Weapon && e.isLootable).forEach(e => {
                    const vecx = e.x - this.x;
                    const vecy = e.y - this.y;
                    const range = 20;
                    if (vecx * vecx + vecy * vecy <= range * range) {
                        this.lootWeapon(e);
                    }
                });
                this.nextLootTime = this.scene.time.now + this.COOLDOWN_LOOT_TIME;
            }

            // set weapons's visibility
            this.weapons.pri?.setVisible(this.weapons.idx == 0);
            this.weapons.sec?.setVisible(this.weapons.idx == 1);

            if (this.weapons.active instanceof Gun) {
                // set weapon's position, direction
                this.weapons.active?.setPosition(this.x, this.y + 5);
                this.weapons.active?.pointTo(this.scene.input.activePointer);

                // fire
                if (this.weapons.active?.isFireable && this.scene.input.activePointer.isDown) {
                    this.weapons.active?.fire();
                }
            } else if (this.weapons.active instanceof Melee) {

                // set weapon's position, direction
                this.weapons.active?.setPosition(this.x, this.y + 5);

                // fire
                if (this.scene.input.activePointer.isDown) {
                    this.weapons.active?.fire();
                } else {
                    this.weapons.active?.pointTo(this.scene.input.activePointer);
                }
            }

        } else {
            if (!this.isDeathSoundPlayed) {
                this.isDeathSoundPlayed = true;
                this.deathSound?.play();
            }

        }


        if (!this.isStunning) {
            this.cameras.follow = this;
        }

        // set weapon's owner
        if (this.weapons.active != null) {
            this.weapons.active.owner = this.isAlive ? this : null;
        }

        // smooth camera for player
        if (Math.abs(this.cameras.dummy.x - this.cameras.follow.x) + Math.abs(this.cameras.dummy.y - this.cameras.follow.y) > 0.1) {
            this.cameras.dummy.setVelocity(-(this.cameras.dummy.x - this.cameras.follow.x) * this.cameras.followSpeed, -(this.cameras.dummy.y - this.cameras.follow.y) * this.cameras.followSpeed);
        }

        if (Math.abs(this.cameras.currentZoom - this.cameras.zoom) > 0.1)
            this.cameras.currentZoom += (this.cameras.zoom - this.cameras.currentZoom) * this.cameras.smoothSpeed;

        this.scene.cameras.main.setZoom(this.cameras.currentZoom);
    }
}