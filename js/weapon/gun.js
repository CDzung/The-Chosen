import { StatsWeapon } from '../stats/stats-weapon.js';
import { Weapon } from './weapon.js';

export class Gun extends Weapon {
    static bullets = []

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {string} gunTexture 
     * @param {string} bulletTexture 
     * @param {StatsWeapon} stats 
     */
    constructor(scene, x, y, gunTexture, bulletTexture, stats) {
        super(scene, x, y, gunTexture, stats);

        this.bulletTexture = bulletTexture;

        // set angle for weapon
        this.scene.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer) => this.setAngle(Math.atan2(pointer.y - this.vpos.y, pointer.x - this.vpos.x) / Math.PI * 180));

        // fire system
        this.scene.time.addEvent({
            loop: true,
            delay: 10,
            callback: () => {
                if (this.isFireable && this.scene.input.activePointer.isDown) {
                    this.fire();
                }

                // remove bullet after timeout
                Gun.bullets.forEach((value) => {
                    if (value.timeout > 0) value.timeout -= 10;
                    else value.destroy();
                });
            }
        });
    }

    /**
     * fire method
     * @returns {Gun} this
     */
    fire() {
        const pointer = this.scene.input.activePointer;
        const vpos = this.vpos;

        const vec = {
            x: pointer.x - vpos.x,
            y: pointer.y - vpos.y,
        }
        const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

        //add new bullet
        const bullet = this.scene.physics.add.sprite(this.x, this.y, this.bulletTexture);

        //set angle for bullet
        bullet.setAngle(Math.atan2(pointer.y - vpos.y, pointer.x - vpos.x) / Math.PI * 180);
        bullet.setVelocity(vec.x / len * this.stats.speed, vec.y / len * this.stats.speed);
        bullet.setDepth(this.depth - 1);

        // set timeout for bullet
        bullet.timeout = 5000;

        // set collide with
        this.scene.physics.add.collider(bullet, this.collision, (o1, o2) => {
            o1.destroy();
        });

        // add to list of bullets
        Gun.bullets = Gun.bullets.filter((value) => value.active);
        Gun.bullets.push(bullet);

        this.cooldown.fire = this.stats.fireRate;
        // this.cooldown.reload = this.stats.reloadTime;

        return this;
    }

    get vpos() {
        return {
            x: (this.x - this.scene.cameras.main.worldView.x) * this.scene.cameras.main.zoom,
            y: (this.y - this.scene.cameras.main.worldView.y) * this.scene.cameras.main.zoom
        }
    }
}