var gameState = {
    // Game Variables
    level: 5, 
    level_name: '',
    people_count: 1,
    level_object: null,
    map: null,
    background: null,
    groundLayer: null,
    cam_lerp: 0.045, 
    cam_direction: RIGHT,
    portal_group: null,
    right_portal: null,
    left_portal: null,
    sprites: [],
    platforms: [],
    trampolines: [],
    spawnpoints: [],
    buttongates: [],
    slimefloors:[],
    skeletons: [],
    hands:[],
    texts: [],
    cursors: null,
    handGroup: null,
    checkpoint: null,
    move_cam: true,
    spawn_them_back: false,
    mushcloud: null,
    exclamation: null,
    black_square: null,
    menu_items: [],
    menu_btn: null,
    menu_txt: null,
    display_menu: false,
    mute: false,
    mute_btn: null,
    mute_txt: null,

    debug: false,

    // Physics Controls
    gravity: 400,
    velocity_x: 100,
    speed_multiplier: 8,
    climb_y: 70,
    jump_y: 210,

    // People Behavious Controls
    people: [], 
    graveyard: [],
    can_jump: [],
    random_move_speed: 30,
    lead_person: null,
    pixel_padding: 1,
    jump_chance: 0.02,
    uniqueness_range: 50,
    dust_duration:230,

    create: function(){
        
        this.cleanUp();
        this.getLevel();

        audioEngine.backgroundMusic();

        this.map = game.add.tilemap('map' + this.level);
        this.map.addTilesetImage('BasicTiles', 'tiles');

        // The background image 
        if (!this.level_object.end) {
            this.background = game.add.tileSprite(0, 0, 2160, 624, "background");
        } else {
            this.background = game.add.tileSprite(0, 0, 900, 624, "creditsbackground");
        }
        
        this.handGroup = game.add.group();
        this.portal_group = game.add.group();
        this.initializeSprites();

        this.groundLayer = this.map.createLayer('GroundLayer');
        this.groundLayer.resizeWorld();
        this.map.setCollisionBetween(0, 14, true, 'GroundLayer');

        // Reveal the level name
        this.level_name.alpha = 1;
        this.level_name = game.add.bitmapText(300, game.height / 6, 'evilgreenplant', this.level_name, 54);
        game.time.events.add(Phaser.Timer.SECOND * 4, function(){
            // Fade the text away
            game.add.tween(gameState.level_name).to( { alpha: 0 }, 1700, Phaser.Easing.Linear.None, true);
        }, this);

        
        this.placePortals();

        this.initializeSpawnPoints();
        this.checkpoint = this.spawnpoints[0];
        this.addPlayerSprites();

        this.initializePlatforms();
        this.initializeTrampolines();
        this.initializeButtongates();
        this.initializeHands();
        this.initializeSlimefloor();

        this.exclamation = game.add.sprite(0, 0, 'exclamation');
        this.exclamation.alpha = 0;
        this.exclamation.animations.add('blink', [0, 1], 5, true);
        this.exclamation.animations.play('blink');

        this.mushcloud = game.add.sprite(0, game.height, 'voodoomushroom');
        this.mushcloud.animations.add('explode', [0, 1, 2, 3, 4, 5, 6, 7], 9, false);
        
        this.inializeTexts();

        this.cursors = game.input.keyboard.createCursorKeys();
        this.cursors.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.cursors.m = game.input.keyboard.addKey(Phaser.Keyboard.M);
        this.cursors.q = game.input.keyboard.addKey(Phaser.Keyboard.Q);
        this.cursors.e = game.input.keyboard.addKey(Phaser.Keyboard.E);
        this.cursors.w = game.input.keyboard.addKey(Phaser.Keyboard.W);
        this.cursors.a = game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.cursors.s = game.input.keyboard.addKey(Phaser.Keyboard.S);
        this.cursors.d = game.input.keyboard.addKey(Phaser.Keyboard.D);

        // one way platforms
        setTileCollision(this.groundLayer, [15, 16], {top: true, bottom: false,left:false, right:false});

        this.black_square = game.add.sprite(0, 0, 'blacksquare');
        this.black_square.scale.setTo(25, 25);
        this.black_square.alpha = 0;
        
        this.initializeMenu();
        

        this.gridCoords();
    },

    update: function(){
        
        // Set the camera to follow the first in line        
        if (this.move_cam) this.moveCamera();

        if (this.background.width < game.world.width) {
            // Move the background with the player to give the illusion of depth
            // Equation = (world_width - background_width) * camera_x / (world_width - screan_width)
            this.background.x = (game.world.width - this.background.width) * game.camera.x / (game.world.width - game.width);
        }
        
        // Move the text with the camera
        this.level_name.x = 150 + game.camera.x;

        // move the menu buttons with the camera
        this.menuMovement()

        this.resetPeopleBehaviourControls();

        this.terrainCollision(this.people, this.groundLayer);

        this.platformCollisionAndMovement(this.people, this.platforms);
        this.trampolineOverlap(this.people, this.trampolines);
        this.spawnpointOverlap(this.people, this.spawnpoints);
        this.buttongateOverlap(this.people, this.buttongates);
        this.handCollisionAndMovement(this.people, this.hands);
        this.skeletonOverlap(this.people, this.skeletons);
        this.slimefloorCollision(this.people, this.slimefloors);
        this.textTrigger(this.texts);

        
        // Various checks
        if (!this.cursors.up.isDown && !this.cursors.w.isDown && Math.random() < 0.01){
            this.people = shuffle(this.people);
        }


        for (var person of this.people) {
            if (person.body.blocked.up || person.body.touching.up){
                person.can_rope = true;
            }

            if (person.body.x <= 0) {
                person.body.x = 0;
            } else if (person.body.x + person.width >= game.world.width){
                person.body.x = game.world.width - person.width;
            }

            if (person.body.y >= game.world.height) {
                this.death(person);
            }
        }
        
        this.checkKeyboardInputs();

        if (this.people.length <= 0 && !this.spawn_them_back){
            gameState.mushcloud.x = this.checkpoint.body.x - tile_size;
            gameState.mushcloud.y = this.checkpoint.body.y - tile_size * 4;
            gameState.mushcloud.animations.play('explode');
            audioEngine.poofSound();

            gameState.reviveAll(gameState.checkpoint.x_pos + tile_size, gameState.checkpoint.y_pos + tile_size);
            this.spawn_them_back = true;
            this.move_cam = false;
            game.time.events.add(Phaser.Timer.SECOND * 0.6, function(){
                gameState.move_cam = true;
            }, this)
        }

        this.checkAnimations();

        this.checkWin();
    },


    // Menu

    // initialize the menu items
    initializeMenu: function() {
        this.menu_items = [];
        this.display_menu = false;

        this.menuInitHelper(10, 20, 1);
        this.menuInitHelper(10, 135, 2);
        this.menuInitHelper(10, 250, 3);
        this.menuInitHelper(10, 365, 10);
        this.menuInitHelper(10, 480, 4);

        var menu_x = 660;
        this.menu_btn = game.add.button(menu_x, 10, 'playframe', function(){
            this.toggleMenu();
        }, this, 1, 0, 2, 0);
        this.menu_btn.scale.setTo(0.37, 0.4);

        this.menu_btn.initial_x = menu_x;

        this.menu_txt = game.add.bitmapText(menu_x + 5, 13, 'evilgreenplant', 'Menu', 20);
        this.menu_txt.initial_x = menu_x + 5;


        var mute_x = 580;
        this.mute_btn = game.add.button(mute_x, 10, 'playframe', function(){
            this.muteToggle();
        }, this, 1, 0, 2, 0);
        this.mute_btn.scale.setTo(0.47, 0.4);

        this.mute_btn.initial_x = mute_x;

        this.mute_txt = game.add.bitmapText(mute_x + 5, 13, 'evilgreenplant', 'Mute', 20);
        this.mute_txt.initial_x = mute_x + 5;

        this.mute_btn.alpha = 0;
        this.mute_txt.alpha = 0;
        this.menu_items.push(this.mute_btn);
        this.menu_items.push(this.mute_txt);
        
    },

    // helper method to initialize the menu
    // displays the button of lvl_id
    menuInitHelper: function(x, y, lvl_id) {
        var btn = null
        var lvl = this.getLevelId(lvl_id);
        if (lvl.solved) {
            // display the level buttons if the level is solved
            btn = game.add.button(x, y, 'playframe', function(){
                this.level = lvl_id;
                game.state.start('intermediate');
            }, this, 1, 0, 2, 0);

            btn.is_button = true;
            btn.inputEnabled = false;

            var txt = game.add.bitmapText(x + 20, y + 25, 'evilgreenplant', lvl.level_name, 24);
            txt.initial_x = x + 20;
            txt.alpha = 0;
            this.menu_items.push(txt);

        } else {
            // display the locked level sprite
            btn = game.add.sprite(x, y, 'lock');
        }
        btn.scale.setTo(1.5, 1.5);

        // append properties for movement with the camera
        btn.initial_x = x;
        btn.alpha = 0;

        this.menu_items.push(btn);
    },

    // show the menu if it is hidden, and hide it if it is shown
    toggleMenu: function() {
        this.display_menu = !this.display_menu;

        if (this.display_menu) {
            // Show the menu
            this.black_square.alpha = 0.4;
            for (var i = 0; i < this.menu_items.length; i++) {
                this.menu_items[i].alpha = 1;
                if (this.menu_items[i].is_button) this.menu_items[i].inputEnabled = true;
            }
        } else {
            // Hide the menu
            this.black_square.alpha = 0;
            for (var i = 0; i < this.menu_items.length; i++) {
                this.menu_items[i].alpha = 0;
                if (this.menu_items[i].is_button) this.menu_items[i].inputEnabled = false;
            }
        }
    },

    menuMovement: function() {
        this.black_square.x = game.camera.x - 5;
        this.menu_btn.x = game.camera.x + this.menu_btn.initial_x;
        this.menu_txt.x = game.camera.x + this.menu_txt.initial_x;

        for (var i = 0; i < this.menu_items.length; i++) {
            this.menu_items[i].x = this.menu_items[i].initial_x + game.camera.x;
        }
    },

    muteToggle: function() {
        this.mute = !this.mute;
        if (this.mute) {
            audioEngine.mute()
            this.mute_txt.setText("Unmute");
        }
        else {
            audioEngine.unmute()
            this.mute_txt.setText("Mute");
        }
    },

    // Methods

    // returns the level with id of this.level
    getLevel: function(){

        this.level_object = this.getLevelId(this.level);

        if (this.level_object === null) {
            Console.log('Error Getting the level');
            return;
        }

        this.level_object.solved = true;
        this.level_name = this.level_object.level_name;
        this.people_count = this.level_object.people_count;
    },

    // returns the level with the id of lvl_id
    getLevelId: function(lvl_id) {
        for (var lvl of levels) {
            if (lvl.level_id === lvl_id){
                return lvl;
            }
        }
        return null;
    },

    // Adds the people that the player controls
    addPlayerSprites: function(){
        this.people = [];
        this.graveyard = [];

        for (i = 0; i < this.people_count; i++){
            // Add the sprite to the game and push it into the array
            this.people.push(game.add.sprite(this.level_object.spawn_x * tile_size, this.level_object.spawn_y * tile_size, 'person' + (i+ 1)));
            
            //Physics behavious
            game.physics.arcade.enable(this.people[i]);
            this.people[i].body.gravity.y = 300;
            //this.people[i].body.collideWorldBounds = true;

            // Animations (frames 5 and 6 are for jumping and falling respectively)
            this.people[i].animations.add('idle', [0, 1, 2], 3, true);
            this.people[i].animations.add('special', [3, 4, 3, 4, 0], 2, false);
            this.people[i].animations.add('up', [7, 8], 2, true);
            this.people[i].animations.add('right', [9, 10], 3, true);
            this.people[i].animations.add('left', [11, 12], 3, true);
            this.people[i].animations.add('monkeybarsright', [14, 13], 2, true);
            this.people[i].animations.add('monkeybarsleft', [16, 15], 2, true);
            
            // These are used to enable the 'up.isDown' functionality
            this.people[i].overlaps_with = -1;
            this.people[i].number_of_overlaps = 0;

            // Used for the dust animation
            this.people[i].on_ground = true;

            // Used for the behaviour on platforms
            this.people[i].on_platform = null;

            // Used for the rope functionality
            this.people[i].can_rope = false;

            // Used for the slime floor functionality
            this.people[i].on_skeleton = false;
            
            // initial animation
            this.people[i].animations.play('idle');
        }

        if (this.level_object.initial_spawn) {
            var length = this.people.length
            for (var i = 0; i < this.people_count - this.level_object.initial_spawn; i++) {
                this.death(this.people[this.people.length - 1]);
            }
        }

    },

    initializeSprites: function(){
        this.sprites = [];
        var counter = 0;
        for (let sprite of this.level_object.sprites){
            this.sprites.push(game.add.sprite(sprite[0] * tile_size, sprite[1] * tile_size, sprite[2]));
            this.sprites[counter].angle = sprite[3];
            if (sprite[4].constructor === Array){
                this.sprites[counter].animations.add('anim', sprite[4], sprite[5], true);
                this.sprites[counter].animations.play('anim');
            } else {
                this.sprites[counter].frame = sprite[4];
            }

            counter++;
        }
    },

    initializePlatforms: function(){
        this.platforms = [];
        var counter = 0;
        for (let platform of this.level_object.platform_locations){
            this.platforms.push(game.add.sprite(platform[0] * tile_size, platform[1] * tile_size, 'platform'));
            this.platforms[counter].scale.setTo(platform[7], platform[8]);
            this.platforms[counter].x_pos = platform[0] * tile_size;
            this.platforms[counter].y_pos = platform[1] * tile_size;
            this.platforms[counter].start_x = platform[2] * tile_size;
            this.platforms[counter].start_y = platform[3] * tile_size;
            this.platforms[counter].end_x = platform[4] * tile_size;
            this.platforms[counter].end_y = platform[5] * tile_size;
            this.platforms[counter].speed = platform[6];
            this.platforms[counter].scale_x = platform[7];
            this.platforms[counter].scale_y = platform[8];
            this.platforms[counter].direction_x = platform[9];
            this.platforms[counter].direction_y = platform[10];
            this.platforms[counter].enableBody = true;
            game.physics.arcade.enable(this.platforms[counter]);
            this.platforms[counter].body.immovable = true;

            counter++;
        }
    },

    initializeTrampolines: function(){
        this.trampolines = [];
        var counter = 0;
        for (let trampoline of this.level_object.trampoline_locations){
            this.trampolines.push(game.add.sprite(trampoline[0] * tile_size, trampoline[1] * tile_size, 'trampoline'));
            this.trampolines[counter].x_pos = trampoline[0] * tile_size;
            this.trampolines[counter].y_pos = trampoline[1] * tile_size;
            this.trampolines[counter].angle_pos = trampoline[2];
            this.trampolines[counter].force = trampoline[3];
            game.physics.arcade.enable(this.trampolines[counter]);
            this.trampolines[counter].body.immovable = true;
            this.trampolines[counter].animations.add('hover', [0, 1, 2], 3, true);
            this.trampolines[counter].animations.add('bounce', [3, 4, 5, 6, 7], 20, false);

            this.trampolines[counter].animations.play('hover');

            this.trampolines[counter].events.onAnimationComplete.add(function(sprite){
                if (sprite.animations.currentAnim.frame === 7) {
                    sprite.animations.play('hover');
                }
            }, this); 

            counter++;
        }
    },

    initializeSpawnPoints: function(){
        this.spawnpoints = [];
        var counter = 0;

        for (let spawn_point of this.level_object.spawnpoints_locations){
            // the +5 is so that it overlaps the ground and looks like it is on the ground
            this.spawnpoints.push(game.add.sprite(spawn_point[0] * tile_size, spawn_point[1] * tile_size + 7, 'spawnpoint'));
            this.spawnpoints[counter].x_pos = spawn_point[0] * tile_size;
            this.spawnpoints[counter].y_pos = spawn_point[1] * tile_size;
            game.physics.arcade.enable(this.spawnpoints[counter]);
            this.spawnpoints[counter].body.immovable = true;
            this.spawnpoints[counter].animations.add('firedance', [0, 1, 2, 3], 8, true);
            this.spawnpoints[counter].animations.play('firedance');

            counter++;
        }
    },

    initializeButtongates: function(){
        this.buttongates= [];

        var counter = 0;
        for (let bgate of this.level_object.buttongate_locations){
            this.buttongates.push(game.add.sprite(bgate[0] * tile_size, bgate[1] * tile_size, 'button'));
            this.buttongates[counter].is_pressed = false;
            this.buttongates[counter].gate = game.add.sprite(bgate[3] * tile_size, bgate[4] * tile_size + 3, 'gate')
            this.buttongates[counter].frame = bgate[2];
            this.buttongates[counter].gate.scale.setTo(1, bgate[5]);
            this.buttongates[counter].gate.animations.add('open', [0, 1, 2, 3], 17, false);
            game.physics.arcade.enable(this.buttongates[counter]);
            game.physics.arcade.enable(this.buttongates[counter].gate);
            this.buttongates[counter].gate.body.immovable = true;

            counter++;
        }
    },

    initializeHands: function(){
        this.hands = [];

        var counter = 0;
        for (let hand of this.level_object.hand_locations){
            this.hands.push({
                x_pos: hand[0] * tile_size,
                y_pos: hand[1] * tile_size,
                direction: hand[2],
                max_length: hand[3],
                speed: hand[4],
                rectangle_collider: game.add.sprite(0, 0, null),
                shifted: 0, // How much the hand shifted while retracting
                triggered: false,   // Whether or not the hand has grabbed someone
                retract: false,     // Whether the hand should start retracting after grabbing someone
                repel: true,        // Whether or not to repel the people away from the area that the hand occupies
                segments:[]
            });
            game.physics.enable(this.hands[counter].rectangle_collider, Phaser.Physics.ARCADE);
            this.hands[counter].rectangle_collider.body.immovable = true;
            counter++;
        }
    },

    initializeSlimefloor: function(){
        this.slimefloors = [];
        this.skeletons = [];
        
        var counter = 0;

        for (let slimefloor of this.level_object.slimefloor_locations){
            this.slimefloors.push({
                x_pos: slimefloor[0],
                y_pos: slimefloor[1],
                direction: slimefloor[2],
                tile_length: slimefloor[3],
                tile_sprites: []
            });

            var sf = this.slimefloors[counter]; // just to shorten the reference

            // construct the collision rectangle
            sf.rectangle_collider = game.add.sprite(sf.x_pos * tile_size, sf.y_pos * tile_size, null)
            game.physics.enable(sf.rectangle_collider, Phaser.Physics.ARCADE);
            sf.rectangle_collider.body.immovable = true;
            if (sf.direction === UP || sf.direction === DOWN) {
                sf.rectangle_collider.body.setSize(tile_size * sf.tile_length, tile_size, 0, 0);
            } else {
                sf.rectangle_collider.body.setSize(tile_size, tile_size * sf.tile_length, 0, 0);
            }

            // draw the tile sprites
            for (var i = 0; i < sf.tile_length; i++){
                var temp_tile;
                if (sf.direction === LEFT || sf.direction === RIGHT){
                    temp_tile = game.add.sprite(sf.x_pos * tile_size, sf.y_pos * tile_size + i * tile_size, 'slimefloor');
                    temp_tile.frame = Math.floor(Math.random() * 4);
                    if (sf.direction === LEFT){
                        temp_tile.angle = -90;
                        temp_tile.y += tile_size;
                    } else {
                        temp_tile.angle = 90;
                        temp_tile.x += tile_size;
                    }
                } else if (sf.direction === DOWN || sf.direction === UP) {
                    temp_tile = game.add.sprite(sf.x_pos * tile_size + i * tile_size, sf.y_pos * tile_size, 'slimefloor');
                    temp_tile.frame = Math.floor(Math.random() * 4);
                    if (sf.direction === DOWN){
                        temp_tile.angle = 180;
                        temp_tile.x += tile_size;
                        temp_tile.y += tile_size;
                    }
                }
                sf.tile_sprites.push(temp_tile);
            }
            counter++;
        }
    },


    inializeTexts: function(){
        this.texts = [];
        var counter = 0;

        for (var text of this.level_object.texts) {
            this.texts.push(game.add.bitmapText(text[0] * tile_size, text[1] * tile_size, 'evilgreenplantgreen', text[2], 22));
            this.texts[counter].anchor.x = 0.5;
            this.texts[counter].anchor.y = 0.5;
            this.texts[counter].alpha = 0;
            this.texts[counter].x_pos = text[0] * tile_size;
            this.texts[counter].y_pos = text[1] * tile_size;
            this.texts[counter].text = text[2];
            this.texts[counter].radius = text[3] * tile_size;
            this.texts[counter].prev_trigger = false;
            this.texts[counter].trigger = false;

            counter++;
        }
    },


    // add the left and/or right level portals
    placePortals: function(){
        if (this.level_object.right_portal) {
            this.right_portal = game.add.sprite(game.world.width - 2 * tile_size, 0, 'portal');
            this.right_portal.animations.add('swirl', [0, 1, 2], 8, true);
            this.right_portal.animations.play('swirl');
            this.portal_group.add(this.right_portal);
        }

        if (this.level_object.left_portal) {
            this.left_portal = game.add.sprite(0, 0, 'portal');
            this.left_portal.animations.add('swirl', [3, 4, 5], 8, true);
            this.left_portal.animations.play('swirl');
            this.portal_group.add(this.left_portal);
        } 
    },

    // Gets the person with the maximum x-axis value
    getLeader: function(people){
        var max_x = -Infinity;
        var head = people.length - 1;
        for (var i = 0; i < people.length; i++){
            if (people[i].body.x > max_x){
                max_x = people[i].body.x;
                head = i;
            }
        }
    return people[head];
    },

    // Resets the People Behaviour Control variables
    resetPeopleBehaviourControls: function(){
        for (i = 0; i < this.people.length; i++){
            this.people[i].body.gravity.y = this.gravity;
            this.people[i].number_of_overlaps = 0;
            this.people[i].overlaps_with = -1;
            this.can_jump[i] = false;
            this.people[i].can_rope = false;
            this.people[i].on_platform = null;
            this.people[i].on_skeleton = false;
        }
    },

    // Moves the camera towards the leader of the group
    moveCamera: function(){
        if (this.people.length <= 0) return;

        var shift = 2.7;

        if (this.cursors.left.isDown || this.cursors.a.isDown) this.cam_direction = LEFT;
        if (this.cursors.right.isDown || this.cursors.d.isDown) this.cam_direction = RIGHT;

        var desired_x = this.cam_direction === LEFT ? this.getLeader(this.people).body.x - (game. width - game.width / shift) : this.getLeader(this.people).body.x - game.width / shift;
        game.camera.x = game.camera.x + (desired_x - game.camera.x) * this.cam_lerp;
    },

    // collide everyone in the people array with the layer
    terrainCollision: function(people, layer){
        for (i = 0; i < people.length; i++){
            game.physics.arcade.collide(people[i], layer);
        }
    },

    // Move the platforms and setup the collision with the people
    platformCollisionAndMovement: function(people, platforms){
        for (var platform of platforms){
            // x axis movement
            if (platform.x < platform.start_x){
                platform.direction_x = platform_right_up;

            } else if (platform.x > platform.end_x){
                platform.direction_x = platform_left_down;
            }
            if (platform.end_x != platform.start_x) platform.body.x += platform.direction_x == platform_right_up ? platform.speed : -platform.speed;

            // y axis movement
            if (platform.y < platform.start_y){
                platform.direction_y = platform_left_down;

            } else if (platform.y > platform.end_y){
                platform.direction_y = platform_right_up;
            }
            if (platform.end_y != platform.start_y) platform.body.y += platform.direction_y == platform_left_down ? platform.speed : -platform.speed;

            for (var i = 0; i < people.length; i++){
                game.physics.arcade.collide(people[i], platform, function(){
                    people[i].on_platform = platform;
                }, null, this);
            }
        }
    },

    // Push the people when they collide with the trampoline
    trampolineOverlap: function(people, trampolines){
        for (var trampoline of trampolines){
            for (var i = 0; i < people.length; i++){
                game.physics.arcade.overlap(people[i], trampoline, function(){
                    audioEngine.jumpSound();
                    trampoline.animations.play('bounce');
                    people[i].body.velocity.x = Math.cos(trampoline.angle_pos * Math.PI / 180) * trampoline.force;
                    people[i].body.velocity.y = -Math.sin(trampoline.angle_pos * Math.PI / 180) * trampoline.force;
                });
            }
        }

    },

    // Open the gate when its corresponding button is pressed
    buttongateOverlap: function(people, buttongates){
        for (var bgate of buttongates){
            for (var i = 0; i < people.length; i++){
                game.physics.arcade.overlap(people[i], bgate, function(){
                    if (bgate.is_pressed) return;
                    bgate.is_pressed = true;
                    bgate.frame += 4;
                    bgate.gate.animations.play('open');
                    audioEngine.leverSound();
                });

                if (bgate.is_pressed) continue;
                game.physics.arcade.collide(people[i], bgate.gate);
            }

        }
    },

    // Collide the hand with the players and retract it
    handCollisionAndMovement: function(people, hands){
        for (var hand of hands){
            
            // Construct the rectangle that the hand should trigger in if a person is within it
            var left_wall = hand.direction === LEFT ? hand.x_pos - (hand.max_length - 1) * tile_size : hand.x_pos;
            var right_wall = hand.direction === RIGHT ? hand.x_pos + hand.max_length * tile_size : hand.x_pos + tile_size;
            var up_wall = hand.direction === UP ? hand.y_pos - (hand.max_length - 1) * tile_size : hand.y_pos;
            var down_wall = hand.direction === DOWN ? hand.y_pos + hand.max_length * tile_size : hand.y_pos + tile_size;

            
            if (!hand.triggered){
                
                // Check if a person should trigger the hand
                for (var person of people){
                    if (person.body.x + person.width > left_wall && person.body.x < right_wall && person.body.y + person.height > up_wall && person.body.y < down_wall){
                        // If the hand is not triggered, trigger it, otherwise shift the person position so that they do not overlap with the hand
                        if (!hand.triggered){
                            hand.triggered = true;
                            this.spawnHand(hand);
                            
                            var time_hand = hand;
                            
                            hand.repel = true;

                            // retract the hand after 1 second
                            game.time.events.add(Phaser.Timer.SECOND, function(){
                                time_hand.retract = true;
                            }, this);

                            // Illusion of camera shake
                            game.camera.x -= 20;

                            audioEngine.punchSound();
                            
                            this.death(person);

                        } else {
                            person.body.velocity.y = 0;
                            if (hand.direction === UP || hand.direction === DOWN) {
                                person.body.x = person.body.x > hand.x_pos ? hand.x_pos + tile_size : hand.x_pos - tile_size;
                                person.body.velocity.x = 0;
                            } else if (hand.direction === LEFT || hand.direction === RIGHT) {
                                person.body.y = person.body.y - tile_size / 2 > hand.y_pos ? hand.y_pos + tile_size : hand.y_pos - tile_size;
                                person.body.velocity.y = 0;
                            }
                        }
                    }
                }
            }

            if (!hand.triggered) continue;

            // Get the people out of the way of the hand, ie repel them
            if (hand.repel){
                for (var person of people){
                    if (person.body.x + person.width >= left_wall && person.body.x <= right_wall && person.body.y + person.height >= up_wall && person.body.y <= down_wall){
                        person.body.velocity.y = 0;
                        if (hand.direction === UP || hand.direction === DOWN) {
                            // if th person is touching right, move them to the left, unless they are also touching left, in that case kill them
                            if (person.body.touching.right || person.body.blocked.right){
                                if (person.body.touching.left || person.body.blocked.left) {
                                    this.death(person);
                                } else {
                                    person.body.x = hand.x_pos - tile_size;
                                }
                            // if the person is touching left, move them to the right
                            } else if (person.body.touching.left || person.body.blocked.left) {
                                person.body.x = hand.x_pos + tile_size;
                            } else {
                                // otherwise, move the person to the side they are closer to
                                person.body.x = person.body.x > hand.x_pos ? hand.x_pos + tile_size : hand.x_pos - tile_size;
                            }
                            
                        } else if (hand.direction === LEFT || hand.direction === RIGHT) {
                            // if th person is touching up, move them down, unless they are also touching down, in that case kill them
                            if (person.body.touching.up || person.body.blocked.up){
                                person.body.y = hand.y_pos + tile_size;
                            } else {
                                // otherwise, move the person to the side they are closer to
                                person.body.y = person.body.y > hand.y_pos ? hand.y_pos + tile_size : hand.y_pos - tile_size;
                            }
                        }
                    }
                }
                hand.repel = false;
            }

            // if hand.shifted >= tile_size, that means a segment is behind the wall, meaning it should be removed
            if (hand.shifted >= tile_size) {
                hand.segments[hand.segments.length - 1].destroy();
                hand.segments.pop();
                hand.shifted = 0;
            }

            if (hand.segments.length == 0){
                hand.triggered = false;
                hand.retract = false;
            }

            // Collide the people with the rectangle that the hand occupies;
            for (var i = 0; i < people.length; i++){
                game.physics.arcade.collide(people[i], hand.rectangle_collider);
            }

            if (!hand.retract) continue;

            hand.shifted += hand.speed;

            var width = hand.direction == LEFT || hand.direction == RIGHT ? (hand.segments.length - 1) * tile_size + (tile_size - hand.shifted): tile_size;
            var height = hand.direction == UP || hand.direction == DOWN ? (hand.segments.length - 1) * tile_size + (tile_size - hand.shifted) : tile_size;
            hand.rectangle_collider.body.setSize(width, height, 0, 0);

            // Since the rectangle starts at the top left corner, it should be shifted if the hand opens up to the left or up
            if (hand.direction === LEFT){
                hand.rectangle_collider.body.x += hand.speed;
            } else if (hand.direction === UP){
                hand.rectangle_collider.body.y += hand.speed;
            }
            
            // Move the segments
            for (var segment of hand.segments){
                if (hand.direction === RIGHT){
                    segment.x -= hand.speed;
                    
                } else if (hand.direction === LEFT){
                    segment.x += hand.speed;

                } else if (hand.direction === DOWN){
                    segment.y -= hand.speed;
                    
                } else if (hand.direction === UP){
                    segment.y += hand.speed;
                }
            }
        }
    },

    // Adds the segments to the hand, representing the arm
    spawnHand: function(hand){
        var left_wall = hand.direction === LEFT ? hand.x_pos - (hand.max_length - 1) * tile_size : hand.x_pos;
        var up_wall = hand.direction === UP ? hand.y_pos - (hand.max_length - 1) * tile_size : hand.y_pos;
        var hand_frame = 0;
        for (var i = 0; i < hand.max_length; i++){
            var displace = (hand.max_length - 1 - i) * tile_size;
            var temp_sprite;
            if (hand.direction === RIGHT){
                temp_sprite = game.add.sprite(hand.x_pos + displace, hand.y_pos, 'hand');
                temp_sprite.frame = 0;
                hand_frame = 2;

            } else if (hand.direction === LEFT){
                temp_sprite = game.add.sprite(hand.x_pos - displace, hand.y_pos, 'hand');
                temp_sprite.frame = 0;
                hand_frame = 3;

            } else if (hand.direction === DOWN){
                temp_sprite = game.add.sprite(hand.x_pos, hand.y_pos + displace, 'hand');
                temp_sprite.frame = 1;
                hand_frame = 4;
                
            } else if (hand.direction === UP){
                temp_sprite = game.add.sprite(hand.x_pos , hand.y_pos - displace, 'hand');
                temp_sprite.frame = 1;
                hand_frame = 5;
            }
            hand.segments.push(temp_sprite);
            this.handGroup.add(temp_sprite);
        }
        
        hand.segments[0].frame = hand_frame;
        hand.rectangle_collider.body.x = left_wall;
        hand.rectangle_collider.body.y = up_wall;
        var width = hand.direction == LEFT || hand.direction == RIGHT ? (hand.max_length) * tile_size : tile_size;
        var height = hand.direction == UP || hand.direction == DOWN ? (hand.max_length) * tile_size : tile_size;
        hand.rectangle_collider.body.setSize(width, height, 0, 0);
    },

    killed: false,
    killed_prev_frame: false,
    // collide the people with the slime floor. The slimefloor is fatal if the person is not on a skeleton
    slimefloorCollision: function(people, slimefloors){
        this.killed_prev_frame = this.killed; // killed2 saves the state of the previous state of killed. This is to insure that there is t least one frame between killing people, because sometimes two people are killed even though only one should be killed, and the other stands on their skeleton
        this.killed = false;
        for (var slimefloor of slimefloors){
            for (var i = 0; i < people.length; i++){
                game.physics.arcade.collide(people[i], slimefloor.rectangle_collider, function(){
                    if(this.killed || this.killed_prev_frame) return;
                    if (people[i].on_skeleton) return;
                    // Kill person if they are on the fatal side of the slimefloor
                    if (slimefloor.direction === UP && people[i].body.y + people[i].height <= slimefloor.rectangle_collider.y){
                        // spawn skeleton
                        // this puts the skeleton's midpoint on the person's midpoint
                        var x = people[i].body.x + people[i].body.width / 2 - skeleton_width / 2;
                        var y = people[i].body.y + people[i].body.height - skeleton_height;
                        gameState.spawnSkeleton(x, y, 'skeletonhorizontal', 0);

                        gameState.death(people[i]);
                    } else if (slimefloor.direction === DOWN && people[i].body.y >= slimefloor.rectangle_collider.y + slimefloor.rectangle_collider.height){
                        
                        // spawn skeleton
                        var x = people[i].body.x + people[i].body.width / 2 - skeleton_width / 2;
                        var y = people[i].body.y;
                        gameState.spawnSkeleton(x, y, 'skeletonhorizontal', 1);

                        gameState.death(people[i]);
                    } else if (slimefloor.direction === LEFT && people[i].body.x + people[i].width <= slimefloor.rectangle_collider.x){
                        
                        // spawn skeleton
                        var x = people[i].body.x + people[i].body.width - skeleton_height;
                        var y = people[i].body.y;
                        gameState.spawnSkeleton(x, y, 'skeletonvertical', 0);

                        gameState.death(people[i]);
                    } else if (slimefloor.direction === RIGHT && people[i].body.x >= slimefloor.rectangle_collider.x + slimefloor.rectangle_collider.width){
                        
                        // spawn skeleton
                        var x = people[i].body.x;
                        var y = people[i].body.y;
                        gameState.spawnSkeleton(x, y, 'skeletonvertical', 1);

                        gameState.death(people[i]);
                    } else {
                        return;
                    }
                    this.killed = true;
                    // if someone died here, re-check if the people overlap with skeletons
                    gameState.skeletonOverlap(people, gameState.skeletons);
                }, null, this);
            }
        }
    },

    // Overlap the people with the skeletons so that if they overlap, the can safely step on the slime floor
    skeletonOverlap: function(people, skeletons){
        for (var skeleton of skeletons){
            for (var i = 0; i < people.length; i++){
                game.physics.arcade.overlap(people[i], skeleton, function(){
                    people[i].on_skeleton = true;
                });
            }
        }
    },

    spawnSkeleton(x, y, sprite, frame){
        var skeleton = game.add.sprite(x, y, sprite);
        skeleton.frame = frame;
        game.physics.arcade.enable(skeleton);
        this.skeletons.push(skeleton);
    },

    // Resurrect dead people and teleport all the people to the spawn point if down key is pressed
    spawnpointOverlap: function(people, spawnpoints){
        for (var spawn_point of spawnpoints){
            for (var i = 0; i < people.length; i++){
                game.physics.arcade.overlap(people[i], spawn_point, function(){
                    if (gameState.graveyard.length > 0) {
                        gameState.mushcloud.x = spawn_point.body.x - tile_size;
                        gameState.mushcloud.y = spawn_point.body.y - tile_size * 4;
                        gameState.mushcloud.animations.play('explode');
                        audioEngine.poofSound();
                    }
                    if (gameState.checkpoint !== spawn_point) {
                        audioEngine.bongoSound();
                    }
                    gameState.checkpoint = spawn_point;
                    gameState.reviveAll(spawn_point.x_pos + tile_size, spawn_point.y_pos + tile_size * 2);
                });
            }
        }
    },

    // cause the text to appear or disappear based on the proximity of the player
    textTrigger: function(texts) {
        if (this.people.length <= 0) return;
        var leader = this.getLeader(this.people);
        for (var text of texts) {
            text.prev_trigger = text.trigger;
            text.trigger = leader.body.x > text.x_pos - text.radius && leader.body.x + leader.width < text.x_pos + text.radius;

            var fade_time = 200;
            if (!text.prev_trigger && text.trigger) {
                // on enter
                game.add.tween(text).to( { alpha: 1 }, fade_time, Phaser.Easing.Linear.None, true);

            } else if (text.prev_trigger && !text.trigger) {
                // on exit
                game.add.tween(text).to( { alpha: 0 }, fade_time, Phaser.Easing.Linear.None, true);
            }
        }
    },

    checkKeyboardInputs: function(){
        this.checkMKey();
        this.checkQEKey();

        if (this.people.length <= 0) return;

        // this.people is passed as an argument to avoid writing this.people in the methods
        this.checkUpKey(this.people);
        this.checkSpaceKey(this.people);
        this.checkHorizontalAndDownKeys(this.people);
    },

    // Random Tests Method
    checkMKey:function(){
        if (!this.cursors.m.isDown) return;
        this.muteToggle();
    },

    checkQEKey: function(){
        if (!this.debug) return;
        if (this.cursors.q.isDown){
            this.move_cam = false;
            game.camera.x -= 10;
        } else if (this.cursors.e.isDown){
            this.move_cam = false;
            game.camera.x += 10;
        } else if(this.cursors.w.isDown) {
            this.move_cam = true;
        }
    },

    // Allow the people to act as a ladder and lift each other up on Up Key press
    checkUpKey: function(people){
        // Do nothing if up is not pressed
        if (!this.cursors.up.isDown && !this.cursors.w.isDown) return;

        // Check overlaps
        for (var i = 0; i < people.length; i++){
            for (var j = i + 1; j < people.length; j++){
                game.physics.arcade.overlap(people[i], people[j], function(){
                    // Record how many people j overlaps with, and who is the immidiate person behind j
                    // if i is the base and is not on the ground, then i cannot carry anyone, so j should not record i
                    if (people[i].overlaps_with == -1 && !(people[i].body.blocked.down || people[i].body.touching.down) && !people[j].can_rope) return;
                    if (people[j].overlaps_with === -1) people[j].overlaps_with = i;
                    people[j].number_of_overlaps += 1;
                });
            }
        }
        
        for (var i = people.length - 1; i >= 0; i--){
            if (people[i].can_rope && people[i].overlaps_with !== -1){ 
                people[people[i].overlaps_with].can_rope = true;
            }
        }

        for (var i = 0; i < people.length; i++){
            if (people[i].overlaps_with !== -1) people[i].on_platform = people[people[i].overlaps_with].on_platform;
        }

        // Climb up
        for (var i = 0; i < people.length; i++){
            if (people[i].body.velocity.y < -this.climb_y) continue;
            if (people[i].can_rope){
                // the less velocity is to prevent the people from keeping a high velocity when they get off the ledge they are hanging on to
                people[i].body.velocity.y = (people[i].body.blocked.up) ? -this.climb_y / 2 :-this.climb_y * 2;
                continue;
            }
            if (people[i].overlaps_with !== -1){

                // If there is a person behind i, then they are carrying i, hence no gravity
                // unless i is travelling faster than the climb speed, so gravity must apply
                people[i].body.gravity.y = 0;
                //if (people[i].body.velocity.y > -this.climb_y) people[i].body.gravity.y = this.gravity;

                // Only set the y velocity to 0 if the person behind i has y velocity 0
                // this is to ensure that y velocity is not set to 0 unless the person at the 'base' of the ladder is on the ground
                if (people[people[i].overlaps_with].body.velocity.y === 0) people[i].body.velocity.y = 0;
                
                // if i's y pos is greater (because 0, 0 is at top left) than the minimum height of the ladder
                // i.e. visually, i is still lower than the highest point it can reach,
                // then i can go up
                if (people[i].body.y > people[people[i].overlaps_with].body.y - people[i].number_of_overlaps * (people[i].height - this.pixel_padding)){
                    if (people[i].body.velocity.y > -this.climb_y) {
                        people[i].body.velocity.y = -this.climb_y;

                        // slow down when almost to maximum height
                        if (people[people[i].overlaps_with].body.y - people[i].body.y > people[0].height * 0.75) people[i].body.velocity.y = -this.climb_y * 0.75;
                    } else {
                        people[i].body.gravity.y = this.gravity;
                    }
                }

                if (!people[i].body.touching.down && !people[i].body.touching.up && people[i].on_platform) people[i].body.x += people[i].on_platform.deltaX;
            }
        }
    },

    // Allow the people to jump
    checkSpaceKey: function(people){
        // Do nothing if space is not pressed
        if (!this.cursors.spacebar.isDown) return;
        
        // First, determine who can jump by manipulating the can_jump array
        for (var i = 0; i < people.length; i++){
            if (people[i].body.velocity.y < -this.climb_y) continue;
            // if the person is on the ground, they can jump
            if ((people[i].body.blocked.down || people[i].body.touching.down) && people[i].overlaps_with === -1){
                 this.can_jump[i] = true;
                 continue;
            }
            // otherwise, the person can jump only if their base can jump
            else if (people[i].overlaps_with > -1){
                this.can_jump[i] = this.can_jump[people[i].overlaps_with];
            }
        }
        
        // push up people who can jump
        for (var i = 0; i < people.length; i++){
            if (this.can_jump[i]){
                audioEngine.jumpSound();
                people[i].body.velocity.y = -this.jump_y;
            }
        }
    },

    checkHorizontalAndDownKeys: function(people){
        if (this.cursors.left.isDown || this.cursors.a.isDown){
            // Move to the left
            var epsilons = this.getAllEpsilon(people);
            
            for (var i = 0; i < people.length; i++){

                // Dont keep trying to go through the wall
                if (people[i].body.touching.left){
                    people[i].body.velocity.x = 0;
                    continue;
                }

                var speed_up = (1 + epsilons[i]) ** 1/4 * this.speed_multiplier;
                people[i].body.velocity.x = -this.velocity_x * speed_up;
                // add some randomness
                people[i].body.velocity.x += (Math.random() * this.uniqueness_range - this.uniqueness_range / 2)
                
            }
        }
        else if (this.cursors.right.isDown || this.cursors.d.isDown){
            // Move to the right
            var epsilons = this.getAllEpsilon(people);
            this.eps = epsilons;
            for (i = 0; i < people.length; i++){

                // Dont keep trying to go through the wall
                if (people[i].body.touching.right){
                    people[i].body.velocity.x = 0;
                    continue;
                }

                var speed_up = (1 + epsilons[i]) ** 1/4 * this.speed_multiplier;
                people[i].body.velocity.x = this.velocity_x * speed_up;
                // add some randomness
                people[i].body.velocity.x += (Math.random() * this.uniqueness_range - this.uniqueness_range / 2)
                    
                }
        }
        else if(this.cursors.down.isDown || this.cursors.s.isDown){
            // All the people move towards the person at the front of the line
            this.lead_person = this.getLeader(people);
    
            for (i = 0; i < people.length; i++){
                if (people[i] === this.lead_person) {
                    people[i].body.velocity.x = 0;
                    continue;
                }
                // Stop if close to the leader x
                if (people[i].body.x < this.lead_person.body.x + 3 && people[i].body.x > this.lead_person.body.x - 3) {
                    people[i].body.velocity.x = 0;
                    continue;
                }

                var speed_up = this.speed_multiplier / 4;

                // Move all the people that are not in the lead to the right
                people[i].body.velocity.x = this.velocity_x * speed_up;
                if (people[i].body.blocked.right && (!this.cursors.up.isDown && !this.cursors.w.isDown) && Math.random() < (this.jump_chance * 1.5) && people[i].body.blocked.down) people[i].body.velocity.y = -this.jump_y;
            }
        }
        else {
            
            //  Stand still (play the idle animation if player is not pressing up)
            for (i = 0; i < people.length; i++){
                // Do not stop the person if they are moving slower than this.random_move_speed
                if (Math.abs(people[i].body.velocity.x) > this.random_move_speed || (this.cursors.up.isDown || this.cursors.w.isDown)) people[i].body.velocity.x = 0;
            }
            
            if (this.cursors.up.isDown || this.cursors.w.isDown) return;
            
            // random movement when idle, up is not pressed, and the player is on the ground
            // Choose a random person
            var temp_person = people[Math.floor(Math.random() * people.length)];
            if (Math.random() < 0.1){
                // Change the person's velocity
                temp_person.body.velocity.x = Math.random() < 0.5 ? -this.random_move_speed : this.random_move_speed;
            } else{
                temp_person.body.velocity.x = 0;
            }
        }

    },

    // check that the correct animations are playing
    checkAnimations: function(){
        this.exclamation.alpha = 0;

        if (this.people.length <= 0) return;

        // Exclamation mark animation
        if (this.cursors.down.isDown || this.cursors.s.isDown) {
            var lead = this.getLeader(this.people);
            this.exclamation.x = lead.body.x;
            this.exclamation.y = lead.body.y - this.exclamation.height;
            this.exclamation.alpha = 1;
        }

        for (var person of this.people){
            // Check which animation should be playing
            if ((this.cursors.up.isDown || this.cursors.w.isDown) && !(person.body.touching.up || person.body.blocked.up) && person.overlaps_with != -1) {
                person.animations.play('up');
            } else if((person.body.touching.up || person.body.blocked.up) && !(person.body.touching.down || person.body.blocked.down) && person.body.velocity.y < 0){
                if (person.body.velocity.x < -this.random_move_speed) {
                    person.animations.play('monkeybarsleft');
                } else if (person.body.velocity.x > this.random_move_speed) {
                    person.animations.play('monkeybarsright');
                } else {
                    person.frame = 5;
                }
            } else if (person.body.velocity.y <= 0 && !person.body.touching.down && !person.body.blocked.down && !(person.body.touching.up || person.body.blocked.up)) {
                // jumping
                person.animations.stop();
                person.frame = 5;
            }else if (person.body.velocity.y > 0 && !person.body.touching.down && !person.body.blocked.down){
                // falling
                person.animations.stop();
                person.frame = 6;
            } else if ((this.cursors.left.isDown || this.cursors.a.isDown) || person.body.velocity.x < -this.random_move_speed){
                person.animations.play('left');
            } else if ((this.cursors.right.isDown || this.cursors.d.isDown) || person.body.velocity.x > this.random_move_speed){
                person.animations.play('right');
            } else {
                // idle
                if (Math.random() < 0.0015) {
                    person.animations.play('special');
                } else {
                    if (person.animations.currentAnim.name !== 'special' || person.animations.currentAnim.frame === 0) person.animations.play('idle');
                    
                }
            }


            // Spawn dust when the player lands on the ground
            if (person.body.blocked.down && !person.on_ground ){
                // person just landed
                audioEngine.thudSound();
                var dust = gameState.add.sprite(person.body.x, person.body.y + (person.height - dust_height), 'dust');
                game.add.tween(dust).to( { alpha: 0 }, gameState.dust_duration, Phaser.Easing.Linear.None, true);

                // kill the sprite after t seconds
                game.time.events.add(Phaser.Timer.SECOND * gameState.dust_duration / 1000, function(){
                    dust.destroy();
                }, this);
                person.on_ground = true;
            } else if (!person.body.blocked.down){
                person.on_ground = false;
            }

        }
    },

    checkWin: function() {
        for (var person of this.people) {
            if (person.body.x > game.world.width - tile_size * 2) {
                this.level = this.level_object.next_level;
                var blacksquare_duration = 800;
                game.add.tween(this.black_square).to( { alpha: 1 }, blacksquare_duration / 4, Phaser.Easing.Linear.None, true);
                game.time.events.add(Phaser.Timer.SECOND * blacksquare_duration / 1000, function(){
                    game.state.start('intermediate');
                    audioEngine.portalSound();
                }, gameState);
            }
        }
    },

    // Move the person to the graveyard
    death: function(person) {
        person.body.x = tile_size;
        person.body.y = 0;
        person.body.gravity.y = 0;
        person.body.velocity.y = 0;
        person.body.velocity.x = 0;
        person.alpha = 0;
        remove(this.people, person);
        this.graveyard.push(person);
    },

    // Move everyone in the given people array to the graveyard
    massDeath: function(people){
        for (var person of people) {
            this.death(person);
        }
    },

    // Spawn the people in the graveyard at the given x y position
    reviveAll: function(x_pos, y_pos) {
        this.spawn_them_back = false;

        for (var i = 0; i < this.graveyard.length;){
            var temp_person = this.graveyard.pop();
            if (!temp_person.body) continue;
            temp_person.body.x = x_pos;
            temp_person.body.y = y_pos;
            temp_person.body.velocity.y = 0;
            temp_person.alpha = 1;
            this.people.push(temp_person);
        }
    },

    // Helper method for the horizontal movement functionality
    // The higher the person is on the ladder, the higher there epsilon
    getAllEpsilon: function(people){
        if (people.length === 0) return [];
        var epsilons = [];

    for (var i = 0; i < people.length; i++){
        epsilons.push(0);
        if (people[i].overlaps_with !== -1){
            // previous person's epsilon represents the hight of the tower under them, h_tower. So, this person's height is h_tower + the
            // height of the previous person - this person.body.y, because conceptually, 0 is when on the ground,
            // so we do not use the top left corner, but the bottom corner.
            var total_height = epsilons[people[i].overlaps_with] + people[people[i].overlaps_with].body.y - people[i].body.y;
            epsilons[i] = total_height || 0;
        }
    }

    var max_height = people.length * (people[0].height - this.pixel_padding);
    for (var i = 0; i < epsilons.length; i++){
        epsilons[i] /= max_height;
    }

    return epsilons;
    },

    // Destroy the objects of a level to free up memory
    cleanUp: function(){

        if (this.right_portal) this.right_portal.destroy();
        if (this.left_portal) this.left_portal.destroy();

        for (var i = this.hands.length - 1; i >= 0; i--){
            this.hands[i].rectangle_collider.destroy();
            for (var j = this.hands[i].segments.length - 1; j >= 0; j--){
                this.hands[i].segments[j].destroy();
            }
        }

        for (var i = this.slimefloors.length - 1; i >= 0; i--){
            this.slimefloors[i].rectangle_collider.destroy();
            for (var j = this.slimefloors[i].tile_sprites.length - 1; j >= 0; j--){
                this.slimefloors[i].tile_sprites[j].destroy();
            }
        }

        for (var i = this.spawnpoints.length - 1; i >= 0; i--){
            this.spawnpoints[i].destroy();
        }

        for (var i = this.trampolines.length - 1; i >= 0; i--){
            this.trampolines[i].destroy();
        }

        for (var i = this.graveyard.length - 1; i >= 0; i--){
            this.graveyard[i].destroy();
        }

        for (var i = this.people.length - 1; i >= 0; i--){
            this.people[i].destroy();
        }

        for (var i = this.buttongates.length - 1; i >= 0; i--){
            this.buttongates[i].gate.destroy()
            this.buttongates[i].destroy();
        }

        for (var i = this.skeletons.length - 1; i >= 0; i--){
            this.skeletons[i].destroy();
        }

        for (var i = this.sprites.length - 1; i >= 0; i--) {
            this.sprites[i].destroy();
        }

        for (var i = this.texts.length - 1; i >= 0; i--) {
            this.texts[i].destroy();
        }

        this.menuClean();
    },

    // clean up the menu
    menuClean: function() {
        if (this.black_square) this.black_square.destroy();
        
        if (this.menu_btn) this.menu_btn.destroy();
        if (this.menu_txt) this.menu_txt.destroy();

        for (var i = this.menu_items.length - 1; i >= 0; i--) {
            this.menu_items[i].destroy();
        }
    },


    // Show the x y positions of the squares on the screen (used to debug and check positions of various objects)
    gridCoords: function(){
        if (!this.debug) return;
        var i = 0;
        var j = 0;
        var style = { font: "8px Arial", fill: "#000000", align: "center" };
        while (i < game.world.width){
            while(j < game.world.height){
                game.add.text(i + tile_size / 4, j + tile_size / 4, '(' + i / tile_size + ', ' + j / tile_size + ')', style);

                j += tile_size;
            }
            j = 0;
            i += tile_size;
        }
    }
}