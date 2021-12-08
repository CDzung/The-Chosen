import { GameConfig } from '../components/game-config.js';
import { StatsWeapon } from '../stats/stats-weapon.js';
import { Gun } from './gun.js';

export class Pistol extends Gun {
    /**
     * Pistol.init
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {StatsWeapon} stats 
     */
    constructor(scene, x, y, stats) {
        stats = Object.assign({}, GameConfig.weapons["pistol"], stats);
        super(scene, x, y, "images.Pistol", "images.bullet", stats);
    }

    fire() {
        const bullet = this.scene.physics.add.sprite(this.x, this.y, "images.bullet").setScale(2);
        super.fire(bullet);
    }

    /**
     * load game resources
     * @param {Phaser.Scene} scene 
     */
    static preload(scene) {
        if (scene instanceof Phaser.Scene) {
            scene.load.image("images.Pistol", "./assets/images/weapon/guns/pistol/pistol.png");
            scene.load.image("images.bullet", "./assets/images/weapon/guns/pistol/pistol-bullet.png");
        }
    }
}