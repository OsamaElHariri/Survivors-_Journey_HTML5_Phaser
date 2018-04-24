This is a little 2D platformer made with PhaserJS.

It's on Kongregate.com if you want to check it out:
https://www.kongregate.com/games/yamsandbread/survivors-journey


The main file to look at is game.js.

The way it is structured is as follows:

The top half, which is mostly composed of methods with 'initialize' in their name is used in the Phaser's create method.
This initiates the objects, like the player's characters, the purple hands, additional sprites, etc.

The bottom half is mostly used for checking and handling collisions between the player and the various objects.


The levels are created using Tiled, and the JSON files are included. 
THE LEVEL IDs ARE NOT IN ORDER OF APPEARANCE.
The level structure is in levels.js, and it is like a linked list of levels, where each level points to the next one.