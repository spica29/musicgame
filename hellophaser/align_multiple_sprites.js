
var width = 1200;
var height = 600;
var game = new Phaser.Game(1200, 600, Phaser.CANVAS, 'phaser-example', {preload: preload, create: create, update: update, render: render});

var text = '';
var spriteInFocus = null;
var listOfNotes = [];
var listOfTupleHandlers = [];

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
        listOfTupleHandlers.push(handle);
    }

}


function clickedSprite (sprite) {

    text = sprite.name;

    sprite.y -= 16;
}

function update() {
    for (var i = 0; i < 5; i++) {
        console.log("0 " + listOfTupleHandlers[i].handle1);
        listOfNotes[i].fromSprite(listOfTupleHandlers[i].handle1, listOfTupleHandlers[i].handle2, false);
    }
}

function render() {

    if (text === '')
    {
        game.debug.text("Click the Sprites", 32, 32);
    }
    else
    {
        game.debug.text("You clicked: " + text, 32, 32);
    }

    for (var i = 0; i < 5; i++) {
        game.debug.geom(listOfNotes[i]);
        game.debug.lineInfo(listOfNotes[i], 32, 32);
        game.debug.text("Drag the handles", 32, 550);
    }
}