
var width = 1200;
var height = 600;
var notesOnScreen = 12;
var unit = height / 21; //number of tones
var minUnit = 0;
var maxUnit = 600 - 2 * unit;

var game = new Phaser.Game(
    1200,
    600,
    Phaser.CANVAS,
    'phaser-example',
    {preload: preload, create: create, update: update, render: render}
);

WebFontConfig = {
    active: function() { game.time.events.add(Phaser.Timer.SECOND, createText, this); },
    google: {
      families: ['Revalia']
    }
};

/* layers */

var lines;
var notes;
var clef;
var verticalLines;

/* state */

var keys = {
    up: false,
    down: false,
    left: false,
    right: false
};

var activeNote = 0;
var text = null;
var grd;

function preload() {
	game.stage.backgroundColor = "#FFF";
	game.load.image('g-clef', 'assets/g-clef.png');
    game.load.image('note', 'assets/note.png');
    game.load.image('noteActive', 'assets/noteActive.png');
    game.load.image('verticalLine', 'assets/vertical-line.png');

    //text
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
}

function create() {
    game.world.setBounds(0, 0, this.game.width, this.game.height);
    game.camera.setSize(this.game.width, this.game.height);

    lines = game.add.group();
    notes = game.add.group();
    clef = game.add.group();
    verticalLines = game.add.group();

    //draw clef
    clef.create(0, unit*6, 'g-clef');

    //draw lines
    for (var i = 0; i < 5; i += 1) {
        var lineHeight = unit * (7 + i * 2);
        var graphics = game.add.graphics(0, 0);
        var rect = new Phaser.Rectangle(0, lineHeight, width, 1);
        
        graphics
            .lineStyle(1, 0x000000)
            .drawShape(rect);
        graphics.fixedToCamera = true;
        lines.add(graphics);
    }

    for (var i = 0; i < notesOnScreen; i += 1) {
        verticalLines.create(350 + i * 90 * 3,  unit*7, 'verticalLine');
    }


    //draw notes
    for (var i = 0; i < notesOnScreen; i += 1) {
        notes.create(150 + i * 90, 400, 'note');
    }

    //var obj = JSON.parse(chordsEasy);
    text = game.add.text(200, unit*3 , chordsEasy[0][0]);
    text.anchor.setTo(0.5);

    text.font = 'Revalia';
    text.fontSize = 30;
}

function update() {

    notes.children.forEach(function (sprite) {
        sprite.loadTexture('note');
    })
    var active = notes.children[activeNote];
    active.loadTexture('noteActive');

    if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
        keys.up = true;
    } else {
        if (keys.up) {
            active.y -= unit;
            active.y = Math.min(Math.max(minUnit, active.y), maxUnit);
        }
        keys.up = false;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
        keys.down = true;
    } else {
        if (keys.down) {
            active.y += unit;
            active.y = Math.min(Math.max(minUnit, active.y), maxUnit);
        } 
        keys.down = false;
    }
    if(game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        keys.left = true;
    } else {
        if (keys.left) {
            activeNote -= 1;
            activeNote = Math.min(Math.max(0, activeNote), notes.children.length - 1);
        }
        keys.left = false;
    }
    if(game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        keys.right = true;
    } else {
        if (keys.right) {
            activeNote += 1;
            activeNote = Math.max(0, activeNote);
            if (activeNote > notes.children.length - 1) {
                activeNote = notes.children.length;
                game.world.setBounds(0, 0, game.world.bounds.width + 90, game.height);
                game.world.bounds.width += 90;
                notes.create(150 + (90 * notes.children.length), 400, 'note');
        		verticalLines.create(90 + notes.children.length * 90 * 3, unit*7, 'verticalLine');
                game.camera.x += 90;
            }
        }
        keys.right = false;
    }
}

function render() {}

var chordsEasy = [["c-major", ["c", "e", "g"]], ["g-major", ["g", "b", "d"]]];
/*var  = ([
	"c-major" : ["c", "e", "g"],
	"g-major" : ["g", "b", "d"],
	"d-major" : ["d", "f-sharp", "a"],
	"e-major" : ["e", "g-sharp", "b"],
	"f-major" : ["f", "a", "c"],
	"a-major" : ["a", "c-sharp", "e"],
	"b-flat-major" : ["b-flat", "d", "f"]
])*/