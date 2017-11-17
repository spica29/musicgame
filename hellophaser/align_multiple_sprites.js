
var width = 1200;
var height = 600;
var game = new Phaser.Game(1200, 600, Phaser.CANVAS, 'phaser-example', {preload: preload, create: create, update: update, render: render});

var text = '';
var spriteInFocus = null;
var listOfNotes = [];
var handlersList = [];

function preload() {
	game.stage.backgroundColor = "#124184";
    game.load.image('note', 'assets/sprites/WholeNote.svg.png');
}

function create() {

    var group = game.add.group();

    //  This will automatically inputEnable all children added to the Group
    group.inputEnableChildren = true;

    for (var i = 0; i < 10; i++)
    {
        var sprite = group.create(64 + (64 * i), 400, 'note');

        sprite.name = 'note' + i;
        
        sprite.events.onInputDown.add(clickedSprite, this);
    }

    var handle1;
    var handle2;
    var line1;
    for (var i = 0; i < 5; i++) {
        var unit = height/21;
        var lineHeight = unit * (7 + i*2);
        handle1 = game.add.sprite(0, lineHeight, 0);
        handle1.anchor.set(0.5);
        handle1.inputEnabled = true;
        handle1.input.enableDrag(true);

        handle2 = game.add.sprite(width, lineHeight, 0);
        handle2.anchor.set(0.5);
        handle2.inputEnabled = true;
        handle2.input.enableDrag(true);
        line1 = new Phaser.Line(handle1.x, handle1.y, handle2.x, handle2.y);
        listOfNotes.push(line1);
        var handle = {handle1: handle1, handle2: handle2};
        handlersList.push(handle);
    }

}


function clickedSprite (sprite) {

    text = sprite.name;

    sprite.y -= 16;
}

function update() {
    for (var i = 0; i < 5; i++) {
        listOfNotes[i].fromSprite(handlersList[i].handle1, handlersList[i].handle2, false);
    }
}

function render() {
    for (var i = 0; i < 5; i++) {
        game.debug.geom(listOfNotes[i]);
    }
}