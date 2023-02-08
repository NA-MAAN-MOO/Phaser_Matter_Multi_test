export default class OtherPlayer extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, frame, socketId } = data;
        super(scene.matter.world, x, y, texture, frame);
        this.socketId = socketId;
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

        this.playerFacing = {
            left: "LEFT",
            right: "RIGHT",
        };
        this.currentFacing = this.playerFacing.right;
    }

    static preload(scene) {
        /* Characters */
        scene.load.atlas(
            "male1",
            "assets/villager-males.png",
            "assets/male1.json"
        );
    }

    get velocity() {
        return this.body.velocity;
    }
}
