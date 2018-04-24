var tile_size = 48;
var platform_speed = 0.7;
var trampoline_force = 340;
var dust_height = 16;
var hand_speed = 0.7;
var platform_right_up = true;
var platform_left_down = false;
var skeleton_width = 48;
var skeleton_height = 6;
var button_bottom = 0;
var button_right = 1;
var button_top = 2;
var button_left = 3;
var RIGHT = 0;
var LEFT = 1;
var UP = 2;
var DOWN = 3;



// Remove an element from an array
function remove(array, element) {
    const index = array.indexOf(element);
    
    if (index !== -1) {
        array.splice(index, 1);
    }
}

// Shuffle the elements in an array
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }



// One way collision on a Tile map. Source: http://thoughts.amphibian.com/2015/11/single-direction-collision-for-your.html
// Example use, where collisions are only checked from up:
// setTileCollision(layer, [3354, 3355, 3356, 2900, 2901, 2902, 2903, 3714, 3715, 3716], {
//        top: true,
//        bottom: false,
//        left: false,
//        right: false
//    });
function setTileCollision(mapLayer, idxOrArray, dirs) {

    var mFunc; // tile index matching function
    if (idxOrArray.length) {
        // if idxOrArray is an array, use a function with a loop
        mFunc = function(inp) {
            for (var i = 0; i < idxOrArray.length; i++) {
                if (idxOrArray[i] === inp) {
                    return true;
                }
            }
            return false;
        };
    } else {
        // if idxOrArray is a single number, use a simple function
        mFunc = function(inp) {
            return inp === idxOrArray;
        };
    }

    // get the 2-dimensional tiles array for this layer
    var d = mapLayer.map.layers[mapLayer.index].data;
    
    for (var i = 0; i < d.length; i++) {
        for (var j = 0; j < d[i].length; j++) {
            var t = d[i][j];
            if (mFunc(t.index)) {
                
                t.collideUp = dirs.top;
                t.collideDown = dirs.bottom;
                t.collideLeft = dirs.left;
                t.collideRight = dirs.right;
                
                t.faceTop = dirs.top;
                t.faceBottom = dirs.bottom;
                t.faceLeft = dirs.left;
                t.faceRight = dirs.right;
                
            }
        }
    }
}