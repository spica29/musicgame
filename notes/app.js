
var width = 1200;
var height = 600;
var notesOnScreen = 18;
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

/* layers */

var lines;
var notes;

/* state */

var keys = {
    up: false,
    down: false,
    left: false,
    right: false
};

var activeNote = 0;

function preload() {
	game.stage.backgroundColor = "#FFF";
    game.load.image('note', 'assets/note.png');
    game.load.image('noteActive', 'assets/noteActive.png');
}

function create() {
    game.world.setBounds(0, 0, this.game.width, this.game.height);
    game.camera.setSize(this.game.width, this.game.height);

    lines = game.add.group();
    notes = game.add.group();

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
        notes.create(64 + i * 64, 400, 'note');
    }
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
                game.world.setBounds(0, 0, game.world.bounds.width + 64, game.height);
                game.world.bounds.width += 64;
                notes.create(64 + (64 * notes.children.length), 400, 'note');
                game.camera.x += 64;
            }
        }
        keys.right = false;
    }
}

function render() {}