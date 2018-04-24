// This state is where the cutscene logic plays
var cutsceneState = {
    game_name: null,
    can_skip: false,
    skip_text: null,
    play_button: null,
    play_text: null,
    cursors: null,
    scene_state: -3,
    cloud: null,
    cloud_x: 3000,
    cloud_y: 624,
    cloud_speed: 5,
    plane_x: 480,
    plane_y: 208,
    max_hover: 5,
    hover_speed: 0.3,
    max_angle: -75,
    rotate_speed: 0.4,
    plane_go_up: true,
    airplane: null,
    smoketrail:null,
    skullexplosion: null,
    blacksquare: null,

    spawn_cloud: true,
    spawn_trail: true,
    keep_tilting: true,
    end_scene: false,

    create: function(){
        this.cloud = game.add.sprite(this.cloud_x, this.cloud_y, 'cloud');
        game.stage.backgroundColor = '208989';
        this.airplane = game.add.sprite(this.plane_x, this.plane_y, 'airplane');
        this.airplane.anchor.x = 0.9;
        this.airplane.anchor.y = 0.5;

        var fade_time = 1800;
        this.play_button = game.add.button(game.width / 2, game.height / 1.5, 'playframe', function(){
            if (this.scene_state !== -3) return;
            this.can_skip = true;

            game.add.tween(this.play_button).to( { alpha: 0 }, fade_time, Phaser.Easing.Linear.None, true);
            game.add.tween(this.play_text).to( { alpha: 0 }, fade_time, Phaser.Easing.Linear.None, true);
            this.scene_state = -2;

            game.time.events.add(Phaser.Timer.SECOND * (fade_time / 1000), function(){
                // Fade the text away
                this.play_button.destroy();
                this.play_text.destroy();
                this.game_name.destroy();
                this.skip_text = game.add.bitmapText(10, 10, 'evilgreenplant', 'Press Space to Skip', 24);
            }, this);
        }, this, 1, 0, 2, 0);

        this.play_text = game.add.bitmapText(game.width / 2, game.height / 1.5, 'evilgreenplant', "Play", 52);
        this.play_text.anchor.x = 0.5;
        this.play_text.anchor.y = 0.6;
        

        this.play_button.anchor.x = 0.5;
        this.play_button.anchor.y = 0.5;

        this.smoketrail = game.add.sprite(this.plane_x, this.plane_y, 'smoketrail');
        this.smoketrail.animations.add('trail', [4, 5, 6], 6, true);
        this.smoketrail.animations.add('flutter', [0, 1, 2, 3], 14, true);
        this.smoketrail.anchor.y = 0.5;
        this.smoketrail.angle = 90;
        this.smoketrail.alpha = 0;

        this.skullexplosion = game.add.sprite(0, 0, 'skullexplosion');
        this.skullexplosion.alpha = 0;
        this.skullexplosion.anchor.x = 0.9;
        this.skullexplosion.anchor.y = 0.3;
        this.skullexplosion.animations.add('explode', [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 6], 9, false);

        


        this.game_name = game.add.bitmapText(game.width / 2, game.height / 6, 'evilgreenplant', "Survivors' Journey", 68);
        this.game_name.anchor.x = 0.5;

        this.blacksquare = game.add.sprite(0, 0, 'blacksquare');
        this.blacksquare.scale.setTo(25, 25);
        this.blacksquare.alpha = 0;
        

        this.cursors = game.input.keyboard.createCursorKeys();
        this.cursors.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },

    update: function(){
        if (this.cursors.spacebar.isDown && this.can_skip) this.end_scene = true;
        

        // Cloud behaviour
        var cloud_xspeed = (this.scene_state <= 1) ? this.cloud_speed : this.cloud_speed / 2;
        var cloud_yspeed = (this.scene_state <= 1) ? 0 : -this.cloud_speed * 2;
        if (this.cloud.x > game.width || this.cloud.y < -this.cloud.height) {
            if (this.scene_state <= 1){
                // spawn from the left of the screen
                this.cloud.x = -100;
                this.cloud.y = Math.random() * (game.height - this.cloud.height);
            } else {
                // spawn from the bottom of the screen
                this.cloud.x = Math.random() * (game.width - this.cloud.width * 2);
                this.cloud.y = game.height + 90;
            }
        }
        // Slow the clouds down when the plane falls below the screen
        if(this.scene_state < 2){
            this.cloud.x += cloud_xspeed;
            this.cloud.y += cloud_yspeed;
        } else if (this.scene_state < 4){
            this.cloud.x += cloud_xspeed;
            this.cloud.y += cloud_yspeed * 2;
        } else {
            this.cloud.x += cloud_xspeed / 20;
            this.cloud.y += cloud_yspeed / 20;
        }

        // Plane behaviour

        if(Math.abs(this.plane_y - this.airplane.y) > this.max_hover) this.plane_go_up = !this.plane_go_up;
        this.airplane.y += this.hover_speed * (this.plane_go_up ? 1 : -1);
        this.smoketrail.y = this.airplane.y - 25;
        this.smoketrail.x = this.airplane.x;

        // plane is cruising through the skies
        if (this.scene_state === -2){
            audioEngine.planeatmosphereSound();
            this.scene_state === -1.5;
            game.time.events.add(Phaser.Timer.SECOND * 4, function(){
                cutsceneState.scene_state = -1;
            }, this);
        }

        if (this.scene_state === -1 && this.spawn_trail){
            this.spawn_trail = false;
            this.scene_state = 0;
            this.smoketrail.alpha = 0.65;
            this.smoketrail.animations.play('trail');

        }

        // smoke trails appear from the plane
        if (this.scene_state === 0) {
            this.scene_state = 0.5;
            game.time.events.add(Phaser.Timer.SECOND * 5, function(){
                cutsceneState.scene_state = 1;
            }, this);
        }

        if (this.scene_state === 1 && this.spawn_cloud){
            audioEngine.explosionSound();
            audioEngine.panicSound();
            this.spawn_cloud = false;
            this.scene_state = 2;
            this.hover_speed = 2;
            this.max_hover = 8;
            this.smoketrail.alpha = 0.85;
            this.smoketrail.animations.play('flutter');

            this.skullexplosion.alpha = 1;
            this.skullexplosion.x = cutsceneState.airplane.x;
            this.skullexplosion.y = cutsceneState.airplane.y;
            this.skullexplosion.animations.play('explode');
        }


        // plane is tilting downwards
        if (this.scene_state === 2){
            if (this.airplane.angle > this.max_angle) {
                this.max_hover = 10;
                this.hover_speed = 2;
                this.airplane.angle -= this.rotate_speed;
                this.smoketrail.angle -= this.rotate_speed;

                this.airplane.y += 0.2;
                this.airplane.x -= 0.1;
            } else {
                this.scene_state = 2.5;
                game.time.events.add(Phaser.Timer.SECOND * 3, function(){
                    cutsceneState.scene_state = 3;
                    
                }, this);
            }
        }

        if (this.scene_state === 3 && this.keep_tilting){
            this.keep_tilting = false;
            this.scene_state = 4;
        }

        // plane is falling off screen
        if (this.scene_state === 4){
            this.hover_speed = 2;
            this.max_hover = 8;
            this.airplane.y += 8;
            this.airplane.x -= 2;
            game.time.events.add(Phaser.Timer.SECOND * 4, function(){
                cutsceneState.end_scene = true;
            }, this);
        }

        if (this.end_scene){
            var blacksquare_duration = 800;
            game.add.tween(this.blacksquare).to( { alpha: 1 }, blacksquare_duration / 4, Phaser.Easing.Linear.None, true);
            game.time.events.add(Phaser.Timer.SECOND * blacksquare_duration / 1000, function(){
                cutsceneState.airplane.destroy();
                cutsceneState.smoketrail.destroy();
                cutsceneState.cloud.destroy();
                cutsceneState.skullexplosion.destroy();
                if (cutsceneState.skip_text) this.skip_text.destroy();
                game.sound.stopAll();
                game.state.start('game');
            }, this);
        }
    }
}