import MainScene from "./scene/Mainscene.js";

const config = {
    width: "50%", //  scene이 그려지는 canvas의 width 값
    height: "50%", //  scene이 그려지는 canvas의 height 값
    backgroundColor: "#999999", //  scene이 그려지는 canvas의 backgroundColor 값
    type: Phaser.AUTO,
    parent: "codeuk",
    scene: [MainScene],
    scale: {
        zoom: 2,
    },
    physics: {
        default: "matter",
        matter: {
            debug: true, // 이 설정때문에 오브젝트에 이미지를 추가하지 않아도 대체되는 도형이 그려진다.
            gravity: { y: 0 },
        },
    },
    plugins: {
        scene: [
            {
                plugin: PhaserMatterCollisionPlugin.default,
                key: "matterCollision",
                mapping: "matterCollision",
            },
        ],
    },
};

new Phaser.Game(config);
