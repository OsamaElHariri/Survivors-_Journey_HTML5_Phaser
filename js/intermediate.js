// This state exists to add a state between the gameState and the gameState of the next level.
var intermediateState = {
    create: function(){
        game.state.start('game');
    },
}