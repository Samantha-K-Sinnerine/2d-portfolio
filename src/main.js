import { scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";
import { dialogueData } from "./constants";

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
k.loadSprite("map2", "./map2.png");

k.setBackground(k.Color.fromHex("#511047"));

k.scene("main", async () => {
    const mapData = await (await fetch("./map1.json")).json();
    const layers = mapData.layers;

    const map = k.add([
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
                    player.onCollide(boundary.name, () => {
                        player.isInDialog = true;
                        displayDialogue(dialogueData[boundary.name], () => player.isInDialog = false);
                    });
                }
            }
            continue;
        }
        if (layer.name === "spawnpoints") {
            for (const entity of layer.objects) {
                if (entity.name === "player") {
                    player.pos = k.vec2(
                        (map.pos.x + entity.x) * scaleFactor,
                        (map.pos.y + entity.y) * scaleFactor
                    );
                    k.add(player);
                    continue;
                }
            }
        }
    }

    setCamScale(k);

    k.onResize(() => {
        setCamScale(k);
    });

    k.onUpdate(() => {
        k.camPos(player.pos.x, player.pos.y + 100);
    });

    k.onMouseDown((mouseBtn) => {
        if (mouseBtn != "left" || player.isInDialog) return;

        const worldMousePos = k.toWorld(k.mousePos());
        player.moveTo(worldMousePos, player.speed);

        const mouseAngle = player.pos.angle(worldMousePos);

        const lowerBound = 50;
        const upperBound = 125;

        if (
            mouseAngle > lowerBound &&
            mouseAngle < upperBound &&
            player.curAnim() !== "walk-up"
        ) {
            player.play("walk-up");
            player.direction = "up";
            return;
        }
      
        if (
            mouseAngle < -lowerBound &&
            mouseAngle > -upperBound &&
            player.curAnim() !== "walk-down"
        ) {
            player.play("walk-down");
            player.direction = "down";
            return;
        }
      
        if (Math.abs(mouseAngle) > upperBound) {
            player.flipX = false;
            if (player.curAnim() !== "walk-side") player.play("walk-side");
            player.direction = "right";
            return;
        }
      
        if (Math.abs(mouseAngle) < lowerBound) {
            player.flipX = true;
            if (player.curAnim() !== "walk-side") player.play("walk-side");
            player.direction = "left";
            return;
        }
    });
});



// default scene to start with
k.go("main");