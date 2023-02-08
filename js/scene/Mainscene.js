import { createCharacterAnims } from "../anims/CharacterAnims.js";
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
    this.load.image("ground", "assets/images/ground.png");
    this.load.tilemapTiledJSON("groundTile", "assets/images/ground.json");
  }
  create() {
    // 생성해야 하는 것, 게임 오브젝트 등

    this.map = this.make.tilemap({ key: "groundTile" });
    const tileset = this.map.addTilesetImage("ground", "ground");

    const floorLayer = this.map.createStaticLayer("tilelayer", tileset, 0, 0);
    floorLayer.setCullPadding(8, 8);
    floorLayer.setCollisionByProperty({ collides: true });
    this.matter.world.convertTilemapLayer(floorLayer);

    // this.map.getObjectLayer("Resources").objects.forEach((resource) => {
    //     new Resource({ scene: this, resource });
    // });

    this.player = new Player({
      scene: this,
      x: this.map.widthInPixels / 1.4,
      y: this.map.heightInPixels / 3.5,
      texture: "male1", // 이미지 이름
      id: this.socketId,
      frame: "down-1", // atlas.json의 첫번째 filename
    });
    this.player.inputKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    let camera = this.cameras.main;
    camera.zoom = 0.8;
    camera.startFollow(this.player);
    camera.setLerp(0.1, 0.1);
    // camera.setBounds(0, 0, this.game.config.width, this.game.config.height);

    createCharacterAnims(this.anims);

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
    // if (!this.player) {
    //     return;
    // }
    this.player.update();
  }

  addOtherPlayers(playerInfo) {
    const otherPlayer = new OtherPlayer({
      // playerInfo를 바탕으로 새로운 플레이어 객체를 그려준다.
      // 해당 플레이어 객체를 움직이려면 어쩔까?
      scene: this,
      x: playerInfo.y,
      y: playerInfo.x,
      texture: "male1", // 이미지 이름
      id: playerInfo.socketId,
      frame: "down-1", // atlas.json의 첫번째 filename
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
          case "left":
            player.play(`${player.playerTexture}-walk-left`, true);
            player.setPosition(payLoad.x, payLoad.y);
            break;
          case "right":
            player.play(`${player.playerTexture}-walk-right`, true);
            player.setPosition(payLoad.x, payLoad.y);
            break;
          case "up":
            player.play(`${player.playerTexture}-walk-up`, true);
            player.setPosition(payLoad.x, payLoad.y);
            break;
          case "down":
            player.play(`${player.playerTexture}-walk-down`, true);
            player.setPosition(payLoad.x, payLoad.y);
            break;
          case "idle":
            player.play(`${player.playerTexture}-walk-idle`, true);
            player.setPosition(payLoad.x, payLoad.y);
            break;
        }
      }
    });
  }
}
