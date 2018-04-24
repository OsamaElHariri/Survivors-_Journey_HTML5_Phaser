var loadState = {
    loadingLabel: null,
    preload: function(){
        // call this.fileComplete when an asset is loaded
        game.load.onFileComplete.add(this.fileComplete, this);

        game.stage.backgroundColor = '208989';

        // enable Arcade physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.loadingLabel = game.add.text(230, 240, 'Loading 0%',
                        {font:'30px Courier', fill: '#eeffcc'});


        game.load.bitmapFont('evilgreenplant', 'assets/Font/evilgreenplant.png', 'assets/Font/evilgreenplant.fnt');
        game.load.bitmapFont('evilgreenplantgreen', 'assets/Font/evilgreenplantgreen.png', 'assets/Font/evilgreenplantgreen.fnt');
         
        for (var i = 1; i <= 11; i++) {
            game.load.tilemap('map' + i, 'assets/Level' + i + '.json', null, Phaser.Tilemap.TILED_JSON);
        }

        game.load.image('tiles', 'assets/BasicTiles.png');
        game.load.spritesheet('person1', 'assets/SpritesAndBackground/Claire.png', 36, 48); 
        game.load.spritesheet('person2', 'assets/SpritesAndBackground/LittleMay.png', 36, 48);
        game.load.spritesheet('person3', 'assets/SpritesAndBackground/Bruce.png', 36, 48);
        game.load.spritesheet('person4', 'assets/SpritesAndBackground/Arlo.png', 36, 48);
        game.load.spritesheet('person5', 'assets/SpritesAndBackground/Sally.png', 36, 48);
        game.load.spritesheet('exclamation', 'assets/SpritesAndBackground/ExclamationMark.png', 48, 48);
        game.load.spritesheet('trampoline', 'assets/SpritesAndBackground/GreenGeyser.png', 48, 48);
        game.load.spritesheet('smokecloud', 'assets/SpritesAndBackground/PurpleSmokeCloud.png', 48, 48);
        game.load.spritesheet('slimefloor', 'assets/SpritesAndBackground/SlimeFloor.png', 48, 48);
        game.load.spritesheet('skeletonhorizontal', 'assets/SpritesAndBackground/HalfSkeletonHorizontal.png', 48, 6);
        game.load.spritesheet('skeletonvertical', 'assets/SpritesAndBackground/HalfSkeletonVertical.png', 6, 48);
        game.load.spritesheet('button', 'assets/SpritesAndBackground/WoodenLever.png', 48, 48);
        game.load.spritesheet('gate', 'assets/SpritesAndBackground/SpearGate.png', 48, 96);
        game.load.spritesheet('hand', 'assets/SpritesAndBackground/PurpleHand.png', 48, 48);
        game.load.spritesheet('spawnpoint', 'assets/SpritesAndBackground/TotemGreenFire.png', 144, 144);
        game.load.spritesheet('voodoomushroom', 'assets/SpritesAndBackground/VoodooMushroomCloud248x331.png', 248, 331);
        game.load.spritesheet('spacebarsign', 'assets/SpritesAndBackground/SpacebarSign.png', 48, 144);
        game.load.spritesheet('signs', 'assets/SpritesAndBackground/Signs.png', 48, 96);
        game.load.spritesheet('spaceup', 'assets/SpritesAndBackground/SpaceUpSign.png', 144, 96);
        game.load.spritesheet('planecrash', 'assets/SpritesAndBackground/PlaneCrash.png', 576, 480);
        game.load.spritesheet('portal', 'assets/SpritesAndBackground/CyanPortal.png', 96, 624);
        game.load.image('platform', 'assets/SpritesAndBackground/Platform.png');
        game.load.image('dust', 'assets/SpritesAndBackground/Dust.png');
        game.load.image('background', 'assets/SpritesAndBackground/WarmBackground.png');
        game.load.image('creditsbackground', 'assets/SpritesAndBackground/BuildingsBackground.png');
        game.load.image('greenrect', 'assets/SpritesAndBackground/GreenRect.png');
        game.load.image('lock', 'assets/SpritesAndBackground/LockBackground.png');
        
        game.load.spritesheet('playframe', 'assets/SpritesAndBackground/PlayFrame.png', 144, 72);
        game.load.image('airplane', 'assets/SpritesAndBackground/Airplane.png');
        game.load.image('cloud', 'assets/SpritesAndBackground/PixelCloud.png');
        game.load.image('blacksquare', 'assets/SpritesAndBackground/BlackSquare.png');
        game.load.spritesheet('smoketrail', 'assets/SpritesAndBackground/SmokeTrail.png', 66, 132);
        game.load.spritesheet('skullexplosion', 'assets/SpritesAndBackground/SkullExplosion.png', 96, 96);

        // audio
        game.load.audio('flute', 'assets/Audio/Native_American_Flute_Ephemeral_Rift(SlightlyShorter).mp3');
        game.load.audio('planeatmosphere', 'assets/Audio/airplane-inflight-internal-atmos_alex-vsi-tv.mp3');
        game.load.audio('bongo', 'assets/Audio/bongo-hubertmichel.mp3');
        game.load.audio('panic', 'assets/Audio/crowd-screaming_multimax2121.mp3');
        game.load.audio('explosion', 'assets/Audio/explosionbombblastambient2_zimbot.mp3');
        game.load.audio('thud', 'assets/Audio/osvaduthdustthrowthud_the-sean.mp3');
        game.load.audio('jump', 'assets/Audio/woosh_lebcraftlp.mp3');
        game.load.audio('cinematicloop', 'assets/Audio/99sounds loop_049.mp3');
        game.load.audio('punch', 'assets/Audio/GDYN_Punching_Perc_PRO_BD - 6.mp3');
        game.load.audio('poof', 'assets/Audio/magic-smite_spookymodem.mp3');
        game.load.audio('portal', 'assets/Audio/magical-portal-open_alanmcki.mp3');
        game.load.audio('lever', 'assets/Audio/lever-latch-open-03_glitchedtones.mp3');
    },

    create: function(){
        // Everything is loaded, start the next state
        game.state.start('cutscene');
    },

    // update the loading percent to reflect the percent of assets loaded
    fileComplete: function(progress, cacheKey, success, totalLoaded, totalFiles){
        this.loadingLabel.setText('Loading ' + progress + '%');
    }
};