// create the Phaser game
var game = new Phaser.Game(720, 624, Phaser.AUTO, 'gameDiv');


// add the states to the game
game.state.add('load', loadState);
game.state.add('cutscene', cutsceneState);
game.state.add('intermediate', intermediateState);
game.state.add('game', gameState);

game.state.start('load');
