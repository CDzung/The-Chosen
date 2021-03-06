import { Enemy } from '../entity/enemy.js';
import { Entity } from '../entity/entity.js';
import { StatsWeapon } from '../stats/stats-weapon.js';

export class Weapon extends Phaser.Physics.Arcade.Sprite {

    /**
     * Weapon.init
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {string} texture 
     * @param {StatsWeapon} stats 
     */
    constructor(scene, x, y, texture, stats) {
        super(scene, x, y, texture);

        // add this sprite to scene
        this.scene.add.existing(this);

        // add physics to this game object
        this.scene.physics.add.existing(this);

        // create stats of a weapon
        this.stats = new StatsWeapon(stats);

        // cooldown
        this.cooldown = {
            reload: 0,
            fire: 0
        };

        // add event for cooldown system
        this.cooldownEvent = this.scene.time.addEvent({
            loop: true,
            delay: 10,
            callback: () => {
                if (this.cooldown.fire > 0) this.cooldown.fire -= 10;
                if (this.cooldown.reload > 0) this.cooldown.reload -= 10;
            }
        });

        // set weapon collision
        this.setBodySize(1, 1);

        // owner
        this.owner = null;
    }

    // collision group
    get collision() {
        return Entity.instances.concat(Entity.collision);
    }

    /**
     * override destroy
     * @param {boolean} fromScene 
     */
    destroy(fromScene) {
        this.cooldownEvent.destroy();
        super.destroy(fromScene);
    }


    /**
     * point this weapon to point (on viewport)
     * @param {Phaser.Input.Pointer} pointer 
     * @returns {Weapon} this
     */
    pointTo(pointer) {
        if (pointer.x > this.owner.vpos.x) this.setFlipX(false);
        else if (pointer.x < this.owner.vpos.x) this.setFlipX(true);

        if (this.owner instanceof Enemy) {
            if (pointer.x < this.owner.x) this.setFlipX(true);
            else if (pointer.x > this.owner.x) this.setFlipX(false);
            pointer = pointer.vpos;
        }

        this.setAngle(Math.atan2(pointer.y - this.vpos.y, pointer.x - this.vpos.x) / Math.PI * 180 + (this.flipX ? 180 : 0));
        return this;
    }


    /**
     * fire method
     * @returns {Weapon} this
     */
    fire() {
        this.cooldown.fire = this.stats.fireTime;
        return this;
    }


    /**
     * check if a weapon is able to loot
     */
    get isLootable() {
        return this.owner == null;
    }


    /**
     * check if a weapon is able to fire
     */
    get isFireable() {
        return this.cooldown.reload <= 0 && this.cooldown.fire <= 0;
    }


    /**
     * get weapon's position on viewport
     */
    get vpos() {
        return {
            x: (this.x - this.scene.cameras.main.worldView.x) * this.scene.cameras.main.zoom,
            y: (this.y - this.scene.cameras.main.worldView.y) * this.scene.cameras.main.zoom
        }
    }
}