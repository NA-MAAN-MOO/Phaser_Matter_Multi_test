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
        scene.load.atlas(
            "dino",
            "assets/images/dino.png",
            "assets/images/dino_atlas.json"
        );
        scene.load.animation("human01_anim", "assets/images/dino_anim.json");
        scene.load.spritesheet("items", "assets/images/1bit 16px icons.png", {
            frameWidth: 24.8,
            frameHeight: 32,
        }); // phaser가 알아서 잘라서 쓸거다. 스프라이트 시트의 셀 수를 세기만 하면 된다.
    }

    get velocity() {
        return this.body.velocity;
    }
}
