
var width = 1200;
var height = 600;
var notesOnScreen = 7;
var unit = height / 21; //number of tones
var minUnit = 0;
var maxUnit = 600 - 2 * unit;
var text;
//up to two sharp/flat 
var chordsEasy = [["c-major", ["c", "e", "g"]], ["a-minor", ["a", "c", "e"]], 
                ["g-major", ["g", "b", "d"]], ["e-minor", ["e", "g", "b"]], 
                ["f-major", ["f", "a", "c"]], ["d-minor", ["d", "f", "a"]], 
                ["d-major", ["d", "f-sharp", "a"]], ["b-minor", ["b", "d", "f-sharp"]], 
                ["b-flat-major", ["b-flat", "d", "f"]], ["g-minor", ["g", "b-flat", "d"]]];
//up to 4 sharp/flat
var chordsMedium = [["a-major", ["a", "c-sharp", "e"]], ["f-sharp-minor", ["f-sharp", "a", "c-sharp"]], 
                    ["e-flat-major", ["e-flat", "g", "b-flat"]],  ["c-minor", ["c", "e-flat", "g"]],
                    ["e-major", ["e", "g-sharp", "b"]], ["c-sharp-minor", ["c-sharp", "e", "g-sharp"]], 
                    ["a-flat-major", ["a-flat", "c", "e-flat"]], ["f-minor", ["f", "a-flat", "c"]]];
//up to 6 sharp/flat 
var chordsHard = [["b-major", ["b", "d-sharp", "f-sharp"]], ["g-sharp-minor", ["g-sharp", "b", "d-sharp"]],
                    ["d-flat-major", ["d-flat", "f", "a-flat"]], ["b-flat-minor", ["b-flat", "d-flat", "f"]],
                    ["f-sharp-major", ["f-sharp", "a-sharp", "c-sharp"]], ["d-sharp-minor", ["d-sharp", "f-sharp", "a-sharp"]],
                    ["g-flat-major", ["g-flat", "b-flat", "d-flat"]], ["e-flat-minor", ["e-flat", "g-flat", "b-flat"]]]
var notes = []

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
var horizontalLines;
var sharp, flat;
/* state */

var keys = {
    up: false,
    down: false,
    left: false,
    right: false
};

//mistake strings
var mistake1, mistake2, mistake3;

var activeNote = 0;
var text = null;
var time = null;
var textTime = null;
var correctChords = 0;
var grd;
//count notes in one bar
var countNote = 0;
var countBars = 0;
var activeChord = chordsEasy[0];

function preload() {
	game.stage.backgroundColor = "#FFF";
    game.load.image('circle', 'assets/circle.png');

	game.load.image('g-clef', 'assets/g-clef.png');
    game.load.image('note', 'assets/note.png');
    game.load.image('sharp', 'assets/sharp-sign.png');
    game.load.image('flat', 'assets/flat-sign.png');
    game.load.image('noteActive', 'assets/noteActive.png');
    game.load.image('verticalLine', 'assets/vertical-line.png');
    game.load.image('horizontalLine', 'assets/horizontal-line.png')

    //text
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
}
var circle;

function create() {
    //set up camera to follow circle
    game.physics.startSystem(Phaser.Physics.P2JS);

    circle = game.add.sprite(game.world.centerX, game.world.centerY, 'circle');

    game.physics.p2.enable(circle);
    //circle.visible=false;

    game.camera.follow(circle);

    game.world.setBounds(0, 0, this.game.width, this.game.height);
    //game.camera.setSize(this.game.width, this.game.height);

    lines = game.add.group();
    notes = game.add.group();
    clef = game.add.group();
    sharps = game.add.group();
    flats = game.add.group();
    verticalLines = game.add.group();
    horizontalLines = game.add.group();

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
        verticalLines.create(485 + i * 150 * 3,  unit*7, 'verticalLine');
    }


    //draw notes
    for (var i = 0; i < notesOnScreen; i += 1) {
        notes.create(150 + i * 150, 400, 'note').data = "e";
        //sprite.data = "e"; //set all notes on e
    }

    writeText(chordsEasy[0][0]);
    //mistake 
    mistake1 = game.add.text(0, unit*17, "");
    mistake1.anchor.setTo(0.5);
    mistake1.font = 'Revalia';
    mistake1.fontSize = 12;

    mistake2 = game.add.text(0, unit*18, "");
    mistake2.anchor.setTo(0.5);
    mistake2.font = 'Revalia';
    mistake2.fontSize = 12;

    mistake3 = game.add.text(0, unit*19, "");
    mistake3.anchor.setTo(0.5);
    mistake3.font = 'Revalia';
    mistake3.fontSize = 12;
}

function writeText(text1) {
    text = game.add.text(550, unit*3 , text1);
    text.anchor.setTo(0.5);

    time = game.add.text(1150, unit*3 , this.game.time.totalElapsedSeconds());
    time.anchor.setTo(0.5);
    textTime = game.add.text(1150, unit*2 , "Time");
    textTime.anchor.setTo(0.5);

    text.font = 'Revalia';
    text.fontSize = 40;
}

function update() {
    //circle.body.setZeroVelocity();
    circle.body.moveRight(100);

    notes.children.forEach(function (sprite) {
        sprite.loadTexture('note');
    })
    var active = notes.children[activeNote];
    active.loadTexture('noteActive');


    if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        keys.spacebar = true;
    } else {
        if (keys.spacebar) {
            //sharp, flat or nothing
            //check what is drawn in front of note
            if(active.data.indexOf("sharp") == -1 && active.data.indexOf("flat") == -1){
                //change to sharp
                sharp = sharps.create(active.x - 70, active.y - 20, 'sharp');
                active.data = active.data + "-sharp";
                console.log("Change to sharp, active note data " + active.data);
            }
            else if (active.data.indexOf("sharp") !== -1){
                //change to sharp
                flat = flats.create(active.x - 90, active.y - 35, 'flat');
                active.data = active.data.substring(0,1) + "-flat";
                console.log("Change to flat, active note data " + active.data);
                //remove sharp
                sharps.remove(sharp);
            } else {
                active.data = active.data.substring(0,1);
                console.log("Change to nothing, active note data " + active.data);
                //remove flat
                flats.remove(flat);
            }
        }
        keys.spacebar = false;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
        keys.up = true;
    } else {
        if (keys.up) {
            active.y -= unit;
            active.y = Math.min(Math.max(minUnit, active.y), maxUnit);
            active.data = changeNoteUp(active);
            if(active.y > 428 & active.y < 457){
                if(keys.up){
                    for (var i = 0; i < horizontalLines.length; i += 1) {
                        if(horizontalLines.children[i].data === "line1"){
                            horizontalLines.children[i].destroy();
                        }
                    }
                }
            }
            if(active.y > 485 & active.y < 514){
                if(keys.up){
                    for (var i = 0; i < horizontalLines.length; i += 1) {
                        if(horizontalLines.children[i].data === "line2"){
                            horizontalLines.children[i].destroy();
                        }
                    }
                }
            }
            if(active.y < 28){
                for (var i = 0; i < horizontalLines.length; i += 1){
                    var check = false;
                    if(horizontalLines.children[i].data === "line5"){
                        check = true;
                        break;
                    }
                }
                if(check === false){
                    horizontalLines.create(active.x-12, active.y, 'horizontalLine').data = "line5";}
                }


            if(active.y > 57 & active.y < 85){
                horizontalLines.create(active.x-12, active.y, 'horizontalLine').data = "line4";
            }

            if(active.y > 114 & active.y < 142){
                    horizontalLines.create(active.x-12, active.y, 'horizontalLine').data = "line3";
            }
        }
        keys.up = false;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
        keys.down = true;
    } else {
        if (keys.down) {
            active.y += unit;
            active.y = Math.min(Math.max(minUnit, active.y), maxUnit);
            active.data = changeNoteDown(active);
            if(active.y > 429 & active.y < 458){
                horizontalLines.create(active.x-12, active.y+3, 'horizontalLine').data = "line1";
            }
            if(active.y > 486 & active.y < 515){
                horizontalLines.create(active.x-12, active.y+3, 'horizontalLine').data = "line2";
            }

            if(active.y > 58 & active.y < 86){
                if(keys.down){
                    for (var i = 0; i < horizontalLines.length; i += 1) {
                        if(horizontalLines.children[i].data === "line4"){
                            horizontalLines.children[i].destroy();
                        }
                    }
                }
            }

            if(active.y < 29 & active.y > 0){
                if(keys.down){
                    for (var i = 0; i < horizontalLines.length; i += 1) {
                        if(horizontalLines.children[i].data === "line5"){
                            horizontalLines.children[i].destroy();
                        }
                    }
                }
            }

            if(active.y > 115 & active.y < 143){
                if(keys.down){
                    for (var i = 0; i < horizontalLines.length; i += 1) {
                        if(horizontalLines.children[i].data === "line3"){
                            horizontalLines.children[i].destroy();
                        }
                    }
                }
            }

        } 
        keys.down = false;
    }
    if(game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        keys.left = true;
    } else {
        if (keys.left && countNote > 0) {
            activeNote -= 1;
            countNote -= 1;
            activeNote = Math.min(Math.max(0, activeNote), notes.children.length - 1);
        }
        keys.left = false;
    }
    if(game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        keys.right = true;
    } else {
        if (keys.right) {
        	countNote += 1;
            activeNote += 1;
            activeNote = Math.max(0, activeNote);
            console.log("active note: " + activeNote);
            console.log("active " + active.data);
            if (activeNote > notes.children.length - 5) {
                activeNote = notes.children.length - 4;
                game.world.setBounds(0, 0, game.world.bounds.width + 150, game.height);
                game.world.bounds.width += 150;
                notes.create(150 + (150 * notes.children.length), 400, 'note').data = "e";
        		verticalLines.create(150 + notes.children.length * 150 * 3, unit*7, 'verticalLine');
                //game.camera.x += 150;
                text.x += 150;
                time.x += 150;
                textTime.x += 150;
            }
            console.log("y coordinate of note " + notes.children[activeNote-1].y);
            console.log("size of first chord " +  chordsEasy[countBars][1].length);
            //check if next is bar
            if(countNote == chordsEasy[countBars][1].length){
        		//check past notes
        		console.log("NEXT BAR, chord length" + activeChord[1].length);
        		
        		//check if it was chord or interval before - different sizes
        		if(activeChord[1].length == 2) //interval
        		{

        		}
        		else //chord
        		{
        		    var correctNotes = 0;
        			//get notes from given chord
        			var firstNote = chordsEasy[countBars][1][0];
        			var secondNote = chordsEasy[countBars][1][1];
        			var thirdNote = chordsEasy[countBars][1][2];

        			//get positions from notes in game
        			var firstNotePlayed = notes.children[activeNote-3];
        			var secondNotePlayed = notes.children[activeNote-2];
        			var thirdNotePlayed = notes.children[activeNote-1];
                    console.log("Played notes: " + firstNotePlayed.data + secondNotePlayed.data+ thirdNotePlayed.data);

        			var position = 0;

                    var endGame = "";
                    if(firstNote == firstNotePlayed.data){
                        console.log("first note ok ");
                        mistake1.setText("first note ok ");
                        mistake1.x += 265;
                        correctNotes += 1;
                    }else {
                        endGame += "first note bad \n";
                        console.log("first note bad");
                        mistake1.setText("first note bad");
                        mistake1.x += 265;
                    }

                    if(secondNote == secondNotePlayed.data){
                        console.log("second note ok ");
                        mistake2.setText("second note ok ");
                        mistake2.x += 265;
                        correctNotes += 1;
                    } else {
                        endGame += "second note bad\n";
                        console.log("second note bad");
                        mistake2.setText("second note bad ");
                        mistake2.x += 265;
                    }

                    if(thirdNote == thirdNotePlayed.data){
                        console.log("third note ok ");
                        mistake3.setText("third note ok ");
                        mistake3.x += 265;
                        correctNotes += 1;
                    } else {
                        endGame += "third note bad\n";
                        console.log("third note bad");
                        mistake3.setText("third note bad ");
                        mistake3.x += 265;
                    }
                    if (correctNotes === 3){
                        correctChords += 1;
                    }
                    /*
                    if(endGame != "") alert(endGame);
                    else alert("BRAVO!");
                    */
                    if(endGame != "") {
                        alert((correctChords * this.game.time.totalElapsedSeconds().toFixed(2)) + " points");
                        this.game.state.restart();
                        game.destroy();
                        game = new Phaser.Game(
                            1200,
                            600,
                            Phaser.CANVAS,
                            'phaser-example',
                            {preload: preload, create: create, update: update, render: render}, correctChords=0, countNote=0, countBars=0,
                            activeChord = chordsEasy[0], activeNote=0
                        );

                    }

        		}


                if(endGame == ""){
                    //start counting notes in bar from beginning
                    countNote = 0;
                    //go to next bar
                    countBars += 1;
                    //update active chord
                    activeChord = chordsEasy[countBars];
                    text.setText(chordsEasy[countBars][0]);
        		}

                //text.setText(chordsEasy[countBars][0] + correctChords);
                
            }
        }
        keys.right = false;
    }
}

function render() {
    time.setText(this.game.time.totalElapsedSeconds().toFixed(2));
}

/*var  = ([
	"c-major" : ["c", "e", "g"],
	"g-major" : ["g", "b", "d"],
	"d-major" : ["d", "f-sharp", "a"],
	"e-major" : ["e", "g-sharp", "b"],
	"f-major" : ["f", "a", "c"],
	"a-major" : ["a", "c-sharp", "e"],
	"b-flat-major" : ["b-flat", "d", "f"]
])*/

function changeNoteUp(activeNote) {
    switch(activeNote.data) {
        case "c":
            return "d";
        case "d":
            return "e";
        case "e":
            return "f";
            break;
        case "f":
            return "g";
            break;
        case "g":
            return "a";
        case "a":
            return "b";
        case "b":
            return "c";
        default:
            return "e";
    }   
}

function changeNoteDown(activeNote) {
    switch(activeNote.data) {
        case "c":
            return "b";
        case "d":
            return "c";
        case "e":
            return "d";
            break;
        case "f":
            return "e";
            break;
        case "g":
            return "f";
        case "a":
            return "g";
        case "b":
            return "a";
        default:
            return "e";
    }   
}