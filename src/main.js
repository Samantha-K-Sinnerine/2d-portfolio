import { scaleFactor } from "./constants";
import { k } from "./kaboomCtx";

k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 39, //length of image divided by size of frame = # of frams
    sliceY: 31,
    anims: {
        "idle-down": 936,
        "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
        "idle-side": 975,
        "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
        "idle-up": 1014,
        "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },      
    },
});

k.loadSprite("map1", "./map1.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => {
    const mapData = await (await fetch("./map1.json")).json();
    const layers = mapData.layers;

    const map = k.make([
        k.sprite("map1"),
        //position game object will display on screen
        k.pos(0),
        k.scale(scaleFactor)
    ]); //scale the map to fit the screen
    
    const player = k.make([
        k.sprite("spritesheet", {anim: "idle-down"}), 
        k.area({
            //hitbox for player
            shape: new k.Rect(k.vec2(0, 3), 10, 10)
        }),
        k.body(),
        k.anchor("center"),
        k.pos(),
        k.scale(scaleFactor),
        {
            speed: 250,
            direction: "down",
            isInDialog: false,
        },
        "player",
    ]);

    for (const layer of layers) {
        if (layer.name === "boundaries") {
            for (const boundary of layer.objects) {
                map.add([
                    k.area({
                        shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),                       
                    }),
                    // isStatic: true means the player can't overlap with the boundary
                    k.body({ isStatic: true }),
                    k.pos(boundary.x, boundary.y),
                    boundary.name, //tag of game object
                ]);
                
                if (boundary.name) {
                    player
                }
            }
        }
    }
});



// default scene to start with
k.go("main");