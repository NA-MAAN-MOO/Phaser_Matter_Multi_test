export default class Player extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, frame, socketId } = data;
        super(scene.matter.world, x, y, texture, frame);
        this.socketId = socketId;
        this.touching = [];
        this.scene.add.existing(this); // 플레이어 객체가 생기는 시점.
        // icons
        // this.spriteIcon = new Phaser.GameObjects.Sprite(
        //     this.scene,
        //     0,
        //     0,
        //     "items",
        //     5
        // );
        // this.spriteIcon.setScale(0.8);
        // this.spriteIcon.setOrigin(0.25, 0.75);
        // this.scene.add.existing(this.spriteIcon);

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
        // this.CreateMiningCollisions(playerSensor);
        // this.scene.input.on("pointermove", (pointer) =>
        //     this.setFlipX(pointer.worldX < this.x)
        // );

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

    update() {
        // 초마다 60프레임마다(?) 호출되는 것, 매 틱마다 업데이트 되야하는 것인듯.

        const speed = 2;
        let playerVelocity = new Phaser.Math.Vector2(); //  2D 벡터
        if (this.inputKeys.left.isDown) {
            playerVelocity.x = -1;
            // this.x -= speed;
        } else if (this.inputKeys.right.isDown) {
            playerVelocity.x = 1;
            // this.x += speed;
        }
        if (this.inputKeys.up.isDown) {
            playerVelocity.y = -1;
            // this.y -= speed;
        } else if (this.inputKeys.down.isDown) {
            playerVelocity.y = 1;
            // this.y += speed;
        }
        playerVelocity.normalize(); // 대각선인 경우 1.4의 속도이기 때문에 정규화(normalize)를 통해 속도를 1로 만든다. 이 주석에서 속도란, speed가 아니라 좌표 변화량을 뜻한다.
        playerVelocity.scale(speed);
        this.setVelocity(playerVelocity.x, playerVelocity.y); // 실제로 player오브젝트를 움직인다.
        let motion = "";
        if (
            Math.abs(this.velocity.x) > 0.1 ||
            Math.abs(this.velocity.y) > 0.1
        ) {
            this.anims.play("walk", true); // anim.json 에 설정된 key 값
            motion = "walk";
        } else {
            this.anims.play("idle", true); // anim.json 에 설정된 key 값
            motion = "idle";
        }
        this.scene.socket.emit("movement", {
            x: this.x,
            y: this.y,
            motion: motion,
        });
        // this.spriteIcon.setPosition(this.x, this.y);
        // this.showIcon();
    }

    showIcon() {
        let pointer = this.scene.input.activePointer;
        if (pointer.isDown) {
            this.showingIcon += 6;
        } else {
            this.showingIcon = 0;
        }
        if (this.showingIcon > 100) {
            this.showingIcon = 0;
        }
        if (this.flipX) {
            this.spriteIcon.setAngle(-this.showingIcon);
        } else {
            this.spriteIcon.setAngle(this.showingIcon);
        }
    }

    CreateMiningCollisions(playerSensor) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: (other) => {
                // console.log("from player: ", other);
                if (other.bodyB.isSensor) return;
                this.touching.push(other.gameObjectB);
                // console.log(this.touching.length, other.gameObjectB.name);
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideEnd({
            objectA: [playerSensor],
            callback: (other) => {
                this.touching = this.touching.filter(
                    (gameObject) => gameObject != other.gameObjectB
                );
                // console.log(this.touching.length);
            },
            context: this.scene,
        });
    }

    MoveOtherPlayer(x, y) {}
}
