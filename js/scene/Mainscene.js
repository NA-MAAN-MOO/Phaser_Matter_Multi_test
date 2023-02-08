import OtherPlayer from "../objects/OtherPlayer.js";
import Player from "../objects/Player.js";
import Resource from "../objects/Resources.js";

export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    init() {
        // socket-io와 링크 스타~트!
        this.socket = io();

        this.playerId = null;
        this.x = null;
        this.y = null;
        this.socket.on("start", (payLoad) => {
            this.socketId = payLoad.socketId;
            this.x = payLoad.x;
            this.y = payLoad.y;
        });
    }

    preload() {
        // 미리 로드하는 메서드, 이미지 등을 미리 로드한다.
        Player.preload(this);
        Resource.preload(this);
        OtherPlayer.preload(this);
        this.load.image("tiles", "assets/images/tileset x1.png");
        this.load.tilemapTiledJSON("map", "assets/images/map.json");
    }
    create() {
        // 생성해야 하는 것, 게임 오브젝트 등
        const map = this.make.tilemap({ key: "map" });
        this.map = map;
        const tileset = map.addTilesetImage(
            "tileset x1",
            "tiles",
            32,
            32,
            0,
            0
        ); // 32x32 픽셀 타일
        const layer1 = map.createStaticLayer("Tile Layer 1", tileset, 0, 0);
        const layer2 = map.createStaticLayer("Tile Layer 2", tileset, 0, 0);
        layer2.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(layer2);

        this.map.getObjectLayer("Resources").objects.forEach((resource) => {
            new Resource({ scene: this, resource });
        });

        this.player = new Player({
            scene: this,
            x: this.y,
            y: this.x,
            texture: "dino", // 이미지 이름
            frame: "dinosprites_doux_0", // atlas.json의 첫번째 filename
        });
        this.player.inputKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
        let camera = this.cameras.main;
        camera.zoom = 1.5;
        camera.startFollow(this.player);
        camera.setLerp(0.1, 0.1);
        camera.setBounds(0, 0, this.game.config.width, this.game.config.height);

        this.otherPlayers = [];

        this.socket.emit("currentPlayers");

        this.socket.on("currentPlayers", (payLoad) => {
            const socketId = payLoad.socketId;
            const x = payLoad.x;
            const y = payLoad.y;
            this.addOtherPlayers({ x: x, y: y, socketId: socketId });
        });

        this.socket.on("newPlayer", (payLoad) => {
            this.addOtherPlayers({
                x: payLoad.x,
                y: payLoad.y,
                socketId: payLoad.socketId,
            });
        });

        this.socket.on("playerDisconnect", (socketId) => {
            this.removePlayer(socketId);
        });

        this.socket.on("updateLocation", (payLoad) => {
            this.updateLocation(payLoad);
        });
    }

    update() {
        this.player.update();
    }

    addOtherPlayers(playerInfo) {
        const otherPlayer = new OtherPlayer({
            // playerInfo를 바탕으로 새로운 플레이어 객체를 그려준다.
            // 해당 플레이어 객체를 움직이려면 어쩔까?
            scene: this,
            x: playerInfo.y,
            y: playerInfo.x,
            texture: "dino", // 이미지 이름
            frame: "dinosprites_doux_0", // atlas.json의 첫번째 filename
        });
        otherPlayer.socketId = playerInfo.socketId;
        this.otherPlayers.push(otherPlayer);
    }

    removePlayer(res) {
        this.otherPlayers.forEach((player) => {
            if (player.socketId === res) {
                return player.destroy();
            }
        });
        this.otherPlayers.filter((player) => player.socketId !== res);
    }

    updateLocation(payLoad) {
        this.otherPlayers.forEach((player) => {
            if (player.socketId === payLoad.socketId) {
                switch (payLoad.motion) {
                    case "walk":
                        player.anims.play("walk", true);
                        player.setPosition(payLoad.x, payLoad.y);
                        break;
                    case "idle":
                        player.anims.play("idle", true);
                        break;
                }
            }
        });
    }
}
