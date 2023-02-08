export default class OtherPlayer extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, id, frame } = data;
        super(scene.matter.world, x, y, texture, id, frame);

        this.playerTexture = texture;
        this.touching = [];
        this.scene.add.existing(this); // 플레이어 객체가 생기는 시점.

        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        let playerCollider = Bodies.circle(this.x, this.y, 12, {
            isSensor: false,
            label: "playerCollider",
        });
        let playerSensor = Bodies.circle(this.x, this.y, 24, {
            isSensor: true,
            label: "playerSensor",
        });
        const compoundBody = Body.create({
            parts: [playerCollider, playerSensor],
            frictionAir: 0.35,
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();
    }

    static preload(scene) {
        /* Characters */
        scene.load.atlas(
            "male1",
            "assets/images/villager-males.png",
            "assets/images/male1.json"
        );
    }

    get velocity() {
        return this.body.velocity;
    }
}
