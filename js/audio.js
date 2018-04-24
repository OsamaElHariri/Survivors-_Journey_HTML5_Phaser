audioEngine = {
    muted: false,
    background: [],

    mute: function(){
        audioEngine.muted = true;
        if (audioEngine.background.length <= 0) return;

        audioEngine.background[0].pause();
        audioEngine.background[1].pause();
    },

    unmute: function(){
        audioEngine.muted = false;
        if (audioEngine.background.length <= 0) return;

        audioEngine.background[0].resume();
        audioEngine.background[1].resume();
    },

    backgroundMusic: function() {
        if (audioEngine.background.length >= 1 || audioEngine.muted) return;

        audioEngine.background.push(game.add.audio('flute'));
        audioEngine.background.push(game.add.audio('cinematicloop'));
        audioEngine.background[0].volume -= 0.7;
        audioEngine.background[1].volume -= 0.96;

        audioEngine.background[0].loopFull();
        audioEngine.background[1].loopFull();
    },

    planeatmosphereSound: function() {
        if (audioEngine.planeatmosphere || audioEngine.muted) return;
        audioEngine.planeatmosphere = game.add.audio('planeatmosphere');
        audioEngine.planeatmosphere.volume -= 0.45;
        audioEngine.planeatmosphere.play();
    },

    panicSound: function() {
        if (audioEngine.panic || audioEngine.muted) return;
        audioEngine.panic = game.add.audio('panic');
        audioEngine.panic.volume -= 0.45;
        audioEngine.panic.play();
    },

    explosionSound: function() {
        if (audioEngine.explosion || audioEngine.muted) return;
        audioEngine.explosion = game.add.audio('explosion');
        audioEngine.explosion.volume -= 0.9;
        audioEngine.explosion.play();
    },

    punchSound: function() {
        if (audioEngine.muted) return;

        if (!audioEngine.punch) {
            audioEngine.punch = game.add.audio('punch');
            audioEngine.punch.allowMultiple = true;
            audioEngine.punch.volume -= 0.8;
        }
        audioEngine.punch.play();
    },

    bongoSound: function(){
        if (audioEngine.muted) return;

        if (!audioEngine.bongo) {
            audioEngine.bongo = game.add.audio('bongo');
            audioEngine.bongo.allowMultiple = true;
            audioEngine.bongo.volume -= 0.6;
        }
        audioEngine.bongo.play();
    },

    poofSound: function(){
        if (audioEngine.muted) return;

        if (!audioEngine.poof) {
            audioEngine.poof = game.add.audio('poof');
            audioEngine.poof.volume -= 0.1;
        }
        audioEngine.poof.play();
    },

    portalSound: function(){
        if (audioEngine.muted) return;

        if (!audioEngine.portal) {
            audioEngine.portal = game.add.audio('portal');
            audioEngine.portal.volume -= 0.75;
        }
        audioEngine.portal.play();
    },

    leverSound: function(){
        if (audioEngine.muted) return;

        if (!audioEngine.lever) {
            audioEngine.lever = game.add.audio('lever');
            audioEngine.lever.volume -= 0.6;
        }
        audioEngine.lever.play();
    },


    jumpSoundsMaxLimit: 3,
    jumpLimit: 3,
    thudLimit: 3,
    
    jumpSound: function() {
        if (audioEngine.muted) return;

        if (!audioEngine.jump) {
            audioEngine.jump = game.add.audio('jump');
            audioEngine.jump.allowMultiple = true;
            audioEngine.jump.volume -= 0.85;
        }

      if (audioEngine.jumpLimit > 0) {
          audioEngine.jump.play();
          audioEngine.jumpLimit -= 1;

          game.time.events.add(Phaser.Timer.SECOND * 0.4, function(){
            audioEngine.jumpLimit += 1;
            if (audioEngine.jumpLimit > audioEngine.jumpSoundsMaxLimit){
                audioEngine.jumpLimit = audioEngine.jumpSoundsMaxLimit;
            } 
        }, gameState);
      } 
    },

    thudSound: function() {
        if (audioEngine.muted) return;

        if (!audioEngine.thud) {
            audioEngine.thud = game.add.audio('thud');
            audioEngine.thud.allowMultiple = true;
            audioEngine.thud.volume -= 0.85;
        }

      if (audioEngine.thudLimit > 0) {
          audioEngine.thud.play();
          audioEngine.thudLimit -= 1;

          game.time.events.add(Phaser.Timer.SECOND * 0.2, function(){
            audioEngine.thudLimit += 1;
            if (audioEngine.thudLimit > audioEngine.thudSoundsMaxLimit){
                audioEngine.thudLimit = audioEngine.thudSoundsMaxLimit;
            } 
        }, gameState);
      } 
    }
}