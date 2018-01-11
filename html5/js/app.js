
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
var speed = 20;
var points = 0;

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
var time = null, displayPoints = null;
var textTime = null;
var correctChords = 0;
var grd;
var circle;
//count notes in one bar
var countNote = 0;
var countBars = 0;
var activeChord, chordsList, numberOfChordsInGame = 3;

function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function calculatePoints(numberOfMistakes) {
    if(numberOfMistakes == 0)
        points += 5*Math.sqrt(speed);
    else points -= 5*numberOfMistakes;
}

function preload() {
	//game.stage.backgroundColor = "#FFF";
    game.load.image('circle', 'assets/images/empty.png');
    game.load.image('background1', 'assets/images/background.png');
    game.load.image('background2', 'assets/images/background2.png');
    game.load.image('background3', 'assets/images/background3.png');
    game.load.image('background4', 'assets/images/background4.jpg');
    game.load.image('background5', 'assets/images/background5.jpg');

    game.load.image('g-clef', 'assets/images/g-clef.png');
    game.load.image('note', 'assets/images/note.png');
    game.load.image('sharp', 'assets/images/sharp-sign.png');
    game.load.image('flat', 'assets/images/flat-sign.png');
    game.load.image('noteActive', 'assets/images/noteActive.png');
    game.load.image('verticalLine', 'assets/images/vertical-line.png');
    game.load.image('horizontalLine', 'assets/images/horizontal-line.png')

    //text
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
}

function setLevel(setLevel){
    level = setLevel;
    console.log("set level " + level); 
}

function setActiveChords(times){
    chordsList = [];
    if(level == 'easy'){
        for(var i = 0; i < times; i++){
            Array.prototype.push.apply(chordsList, shuffleArray(chordsEasy));
        }
    } else if(level == 'medium'){
        for(var i = 0; i < times; i++){
            Array.prototype.push.apply(chordsList, shuffleArray(chordsMedium));
        }
    } else {
        for(var i = 0; i < times; i++){
            Array.prototype.push.apply(chordsList, shuffleArray(chordsHard));
        }
    }

    activeChord = chordsList[0];
}


function p(pointer) {

    // console.log(pointer.);
    console.log(pointer.event);

}

function create() {
    game.add.tileSprite(0, 0, 1000, 600, 'background5');

    var location = window.location.href;
    var addedLevel = location.split('level=')[1];
    console.log("level " + addedLevel);
    setLevel(addedLevel);
    setActiveChords(numberOfChordsInGame);
    //
    
    /*
    time = game.add.text(1150, unit*3 , this.game.time.totalElapsedSeconds());
    time.anchor.setTo(0.5);
    textTime = game.add.text(1150, unit*2 , "Time");
    textTime.anchor.setTo(0.5);
    */

    //set up camera to follow circle
    game.physics.startSystem(Phaser.Physics.P2JS);

    circle = game.add.sprite(game.world.centerX, game.world.centerY, 'circle');

    game.physics.p2.enable(circle);
    //circle.visible=false;

    game.camera.follow(circle);

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

    for (var i = 0; i < chordsList.length; i += 1) {
        verticalLines.create(485 + i * 150 * 3,  unit*7, 'verticalLine');
    }

    //console.log("ver lines " + verticalLines.children[verticalLines.children.length-1].x);
    game.world.setBounds(0, 0, verticalLines.children[verticalLines.children.length-1].x + 95, this.game.height);
    //draw notes
    for (var i = 0; i < chordsList.length*3; i += 1) {
        var addedNote = notes.create(150 + i * 150, 400, 'note');
        addedNote.data = "e";
        //addedNote.alpha = 0.5;
        //addedNote.anchor.set(0.5);

        //addedNote.inputEnabled = true;

        //game.input.addMoveCallback(p, this);
        //sprite.data = "e"; //set all notes on e
    }

    writeText(chordsList[0][0]);
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


    displayPoints = game.add.text(width - 200, 50, "Points: " + points, { font: "42px Revalia", fill: "black", align: "center"});
    displayPoints.fixedToCamera = true;
    displayPoints.cameraOffset.setTo(width - 200, 50);
}

function writeText(text1) {
    text = game.add.text(550, unit*3 , text1);
    text.anchor.setTo(0.5);

    /*
    time = game.add.text(1150, unit*3 , this.game.time.totalElapsedSeconds());
    time.anchor.setTo(0.5);
    textTime = game.add.text(1150, unit*2 , "Time");
    textTime.anchor.setTo(0.5);
    */
    text.font = 'Revalia';
    text.fontSize = 40;
    text.fixedToCamera = true;
    text.cameraOffset.setTo(550, unit*3);
}

function flash() {
    //  You can set your own flash color and duration
    game.camera.flash(0xff0000, 500);
    game.camera.x = 0;
    speed = 0;
    //stopGame();
}

function stopGame() {
    alert((correctChords * this.game.time.totalElapsedSeconds().toFixed(2)) + " points");
    this.game.state.restart();
    game.destroy();
    game = new Phaser.Game(
        1200,
        600,
        Phaser.CANVAS,
        'phaser-example',
        {preload: preload, create: create, update: update, render: render}, correctChords=0, countNote=0, countBars=0,
        activeChord = chordsList[0], activeNote=0
    );
}

function update() {
    circle.body.moveRight(speed);
    speed += 0.05;
    //console.log("speed " + speed);
    notes.children.forEach(function (sprite) {
        sprite.loadTexture('note');
        /*
        //change transparency over mouse pointer
        if (sprite.input.pointerOver())
        {
            sprite.alpha = 1;
                //  only move when you click
                /*
            if (game.input.mousePointer.isDown)
            {
                sprite.y -= unit;
                sprite.y = Math.min(Math.max(minUnit, sprite.y), maxUnit);
                sprite.data = changeNoteUp(sprite);
            }*/
/*
            if (game.input.mousePointer.isDown) {
                keys.up = true;
            } else {
                if (keys.up) {
                    sprite.y -= unit;
                    sprite.y = Math.min(Math.max(minUnit, sprite.y), maxUnit);
                    sprite.data = changeNoteUp(sprite);
                }
                keys.up = false;
            }
        }
        else
        {
            sprite.alpha = 0.5;
        }
*/

    });
    var active = notes.children[activeNote];
    active.loadTexture('noteActive');

    //check if active note is in camera bounds
    var distance = game.physics.arcade.distanceBetween(circle, active);
    if(distance >= width/2 + 45) {
        flash();
        game.paused = true;
    }

    if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        keys.spacebar = true;
    } else {
        if (keys.spacebar) {
            //sharp, flat or nothing
            //check what is drawn in front of note
            if(active.data.indexOf("sharp") == -1 && active.data.indexOf("flat") == -1){
                //change to sharp
                sharp = sharps.create(active.x - 80, active.y - 20, 'sharp');
                active.data = active.data + "-sharp";
                console.log("Change to sharp, active note data " + active.data);
            }
            else if (active.data.indexOf("sharp") !== -1){
                //change to sharp
                flat = flats.create(active.x - 100, active.y - 35, 'flat');
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
                game.camera.x += 150;
                text.x += 150;
                time.x += 150;
                textTime.x += 150;
            }
            console.log("y coordinate of note " + notes.children[activeNote-1].y);
            console.log("size of first chord " +  chordsList[countBars][1].length);
            //check if next is bar
            if(countNote == chordsList[countBars][1].length){
        		//check past notes
        		console.log("NEXT BAR, chord length" + chordsList[1].length);
        		
        		//check if it was chord or interval before - different sizes
        		if(activeChord[1].length == 2) //interval
        		{

        		}
        		else //chord
        		{
        		    var correctNotes = 0;
        			//get notes from given chord
        			var firstNote = chordsList[countBars][1][0];
        			var secondNote = chordsList[countBars][1][1];
        			var thirdNote = chordsList[countBars][1][2];

        			//get positions from notes in game
        			var firstNotePlayed = notes.children[activeNote-3];
        			var secondNotePlayed = notes.children[activeNote-2];
        			var thirdNotePlayed = notes.children[activeNote-1];
                    console.log("Played notes: " + firstNotePlayed.data + secondNotePlayed.data+ thirdNotePlayed.data);

        			var position = 0;

                    var numberOfMistakes = checkPlayedNotes(firstNote, secondNote, thirdNote, firstNotePlayed.data, secondNotePlayed.data, thirdNotePlayed.data);
                    console.log("number of mistakes: " + numberOfMistakes);
                    
                    calculatePoints(numberOfMistakes);
                    displayPoints.setText("Points: " + points);
                    correctChords += 1;
                    

                    if(false) {
                        stopGame();
                    }

        		}


                //if(endGame == ""){
                    //start counting notes in bar from beginning
                    countNote = 0;
                    //go to next bar
                    countBars += 1;
                    //update active chord
                    activeChord = chordsList[countBars];
                    text.setText(chordsList[countBars][0]);
        		//}
            }
        }
        keys.right = false;
    }
}

function checkPlayedNotes(firstNote, secondNote, thirdNote, firstNotePlayed, secondNotePlayed, thirdNotePlayed) {
    /*return((firstNotePlayed == firstNote && secondNotePlayed == secondNote && thirdNotePlayed == thirdNote) ||
        (firstNotePlayed == secondNote && secondNotePlayed == thirdNote && thirdNotePlayed == firstNote) ||
        (firstNotePlayed == thirdNote && secondNotePlayed == firstNote && thirdNotePlayed == secondNote))*/

    if(firstNotePlayed == firstNote) {
        if(secondNotePlayed == secondNote) {
            if(thirdNotePlayed == thirdNote) return 0;
            else return 1; //third wrong
        } else {
            if(thirdNotePlayed == thirdNote) return 1;  //second wrong
            else return 2; //second and third wrong
        } 
    } else if(firstNotePlayed == secondNote) {
        if(secondNotePlayed == thirdNote) {
            if(thirdNotePlayed == firstNote) return 0;
            else return 1; 
        } else {
            if(thirdNotePlayed == firstNote) return 1; 
            else return 2;
        } 
    } else if(firstNotePlayed == thirdNote) {
        if(secondNotePlayed == firstNote) {
            if(thirdNotePlayed == secondNote) return 0;
            else return 1; 
        } else {
            if(thirdNotePlayed == secondNote) return 1; 
            else return 2;
        } 
    } else return 3; //all three wrong
}

function render() {
    //time.setText(this.game.time.totalElapsedSeconds().toFixed(2));
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