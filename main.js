// The function to add strings into the game's log
function addLog(string) {
	$("#log").append(string + "<br>");
	var scrollLog = document.getElementById("log");
	scrollLog.scrollTop = scrollLog.scrollHeight;
}

// The player object
var player = {
	health: 10,
	rowPos: 1,
	colPos: 4,
	prizes: [],
	attackPow: 3,
	halt: false,
	goDir: null,
	takeDamage: function(damage) {
		if((this.health -= damage) < 0) {
			this.health = 0;
		}
		this.printHealth();
	},
	attack: function(enemy) {
		if(Math.random() > 0.1) {
			var damage = Math.floor((Math.random() * player.attackPow) + 1);
			enemy.health -= damage;
			if(enemy.health < 0) {
				enemy.health = 0;
			}
			$("#eventText").html(enemy.name + " took " + damage + " points of damage. Remaining health: " + enemy.health + "<br>");
			addLog(enemy.name + " took " + damage + " points of damage. Remaining health: " + enemy.health);
		}
		else {
			$("#eventText").html("You missed! " + enemy.name + " still has " + enemy.health + " health remaining." + "<br>");
			addLog("You missed! " + enemy.name + " still has " + enemy.health + " health remaining.");
		}
	},
	setPrevHealth() {
		prevHealth = player.health;
	},
	printHealth() {
		$("#charHealth").text("Health: " + player.health);
	},
	printPrizes() {
		var prizeLine = "";
		for(var i = 0; i < player.prizes.length; i++) {
			if(i != player.prizes.length - 1) {
				prizeLine += (player.prizes[i] + ", ");
			}
			else {
				prizeLine += player.prizes[i];
			}
		}
		$("#prizes").text("Prizes: " + prizeLine);
	},
	addPrize: function(prize) {
		this.prizes.push(prize);
		addLog("You obtained " + prize + ".");
		this.printPrizes();
	},
	setDeathMessage: function(string) {
		addLog("<span style = \"color: red;\">" + string + "</span>");
	}
};

// A higher-order function that generates all enemies' attacking function
var generateEnemyAttackFunction = function(killMessage, missMessage, accuracy, attackPower) {
	return function() {
		if(Math.random() < accuracy) {
			var damage = Math.floor((Math.random() * attackPower) + 1);
			player.takeDamage(damage);
			$("#eventText").append("You have taken " + damage + " points of damage \nRemaining health: " + player.health);
			if(player.health <= 0) {
				$("#eventText").append("<br><span style = 'color:red;'>You have fallen in combat.</span");
				$("button").remove("#fight");
				$("button").remove("#run");
				player.setDeathMessage(killMessage);
			}
		}
		else {
			$("#eventText").append(missMessage + "\nRemaining health: " + player.health);
			addLog(missMessage + "\nRemaining health: " + player.health);
		}
	}
};

//The combat function, allowing the player to fight against a challenge monster
function combat(enemy) {
	var initCharHealth = player.health;
	var initEnemyHealth = enemy.health;
	$("#event").html("<p id = 'eventText'>" + enemy.name + "'s Health: " + enemy.health + "<br>Your Health: " + player.health + "</p>"
			+ "<button id = 'fight'>Fight</button>&nbsp;<button id = 'run'>Run</button>");
	$("#fight").click(function() {
		fight();
	});
	$("#run").click(function() {
		run();
	});
	function fight() {
		player.attack(enemy);
		if(enemy.health <= 0) {
			$("#eventText").append("You won. <br>Do you wish to battle again? <br>(Health will reset to how it was before the battle) <br>Previous Health: " + initCharHealth);
			$("#fight").text("Re-battle");
			$("#run").text("Conclude Battle");
			$("#fight").click(function() {
				reBattle();
			});
			$("#run").click(function() {
				enemy.playDeathMessage();
			});
		}
		else {
			enemy.attack();
		}
	}
	function reBattle() {
		enemy.health = initEnemyHealth;
		player.health = initCharHealth;
		player.printHealth();
		addLog("You fight the " + enemy.name + " again.");
		combat(enemy);
		return;
	}
	function run() {
		$("#event").html("<p id = 'eventText'>You ran away from the battle.</p>"
				+ "<button id = 'ok'>Run!</button>");
		$("#ok").click(function() {
			player.halt = false;
			$("#event").empty();
			moveReverse(player.goDir);
			map.print();
			addLog("You ran back to the coordinates [" + player.rowPos + "," + player.colPos + "].")
		});
	}
};

// The wall constructor (since this game will need to have multiples of these)
function Wall() {
	this.hidden = true;
}

// The goal
var goal = {
	hidden: true,
	play: function() {
		this.hidden = false;
		if(player.prizes.length >= 2) {
			player.halt = true;
			$("#event").html("<h2 style = 'color: green;'>You won!</h2>");
			addLog("<span style = 'color: green;'>You won!</span>");
		}
		else {
			$("#event").html("<p>You found the goal, but you lack the prizes needed to win.</p>");
			addLog("You found the goal at coordinates [" + player.rowPos + ", " + player.colPos + "], but you lack the prizes needed to win.");
		}
	}
}

//The movement function
var moveDirection = function(direction) {
	if(direction == 'n') {
		player.colPos--;
	}
	else if(direction == 's') {
		player.colPos++;
	}
	else if(direction == 'e') {
		player.rowPos++;
	}
	else if(direction == 'w') {
		player.rowPos--;
	}
};

// The movement function for going backwards if the player does not wish to face challenge events
var moveReverse = function(direction) {
	switch(direction) {
	case 'n':
		player.colPos++;
		break;
	case 's':
		player.colPos--;
		break;
	case 'w':
		player.rowPos++;
		break;
	case 'e':
		player.rowPos--;
		break;
	}
};

// A challenge event
var pitFall = {
		hidden: true,
		cleared: false,
		play: function() {
			if(this.cleared) {
				return;
			}
			$("#event").html("<p id = 'eventText'>Ouch! You fell into a pit fall and took 2 points of damage. <br>(This event cannot be re-challenged, and you get no reward)</p>"
					+ "<button id = 'ok'>Aww...</button>");
			$("#ok").click(function() {
				player.halt = false;
				$("#event").empty();
			});
			player.takeDamage(2);
			if(player.health <= 0) {
				$("#eventText").append("<br><span style = 'color:red;'>You have died.</span>");
				$("button").remove("#ok");
				player.setDeathMessage("You broke your legs. Stuck in the pit, you have no choice but to remain there until death comes for you.");
			}
			this.cleared = true;
		}
};

// A challenge event
var potion = {
		hidden: true,
		cleared: false,
		play: function() {
			if(this.cleared) {
				return;
			}
			$("#event").html("<p id = 'eventText'>You find a dusty bottle labeled \"Healthy\". Do you wish to drink it?</p>"
					+ "<button id = 'yes'>Yes</button>&nbsp;<button id = 'no'>No</button>");
			$("#yes").click(function() {
				player.health += 5;
				player.printHealth();
				$("#event").html("<p id = 'eventText'>You feel healthier. You gained 5 more health.</p>"
						+ "<button id = 'ok'>Nice!</button>");
				$("#ok").click(function() {
					player.halt = false;
					$("#event").empty();
				});
				this.cleared = true;
				addLog("You have gained 5 more hp from the potion. Health remaining: " + player.health);
			});
			$("#no").click(function() {
				$("#event").html("<p id = 'eventText'>You refused to drink the potion.</p>"
						+ "<button id = 'ok'>Okay</button>");
				$("#ok").click(function() {
					player.halt = false;
					$("#event").empty();
				});
				this.cleared = true;
				addLog("You refused to drink the potion.");
			});
		}
};

//A challenge event
var badPotion = {
		hidden: true,
		cleared: false,
		play: function() {
			if(this.cleared) {
				return;
			}
			$("#event").html("<p id = 'eventText'>You find a dusty bottle labeled \"Healthy.\" Do you wish to drink it?</p>"
					+ "<button id = 'yes'>Yes</button>&nbsp;<button id = 'no'>No</button>");
			$("#yes").click(function() {
				player.takeDamage(3);
				$("#event").html("<p id = 'eventText'>Blasphemy! Drinking the dirty liquid saps your health by 3!</p>"
						+ "<button id = 'ok'>Yuck!</button>");
				$("#ok").click(function() {
					player.halt = false;
					$("#event").empty();
				});
				if(player.health <= 0) {
					$("#eventText").append("<br><span style = 'color:red;'>You have died.</span>");
					$("button").remove("#ok");
					player.setDeathMessage("The liquid drains you of your remaining life. All that remains of you now is an unfortunate corpse.");
				}
				this.cleared = true;
			});
			$("#no").click(function() {
				$("#event").html("<p id = 'eventText'>You refused to drink the potion.</p>"
						+ "<button id = 'ok'>Okay</button>");
				$("#ok").click(function() {
					player.halt = false;
					$("#event").empty();
				});
				this.cleared = true;
				addLog("You refused to drink the potion.");
			});
		}
};

// A challenge event [PART I of healingFountain]
var healingFountain = {
		hidden: true,
		cleared: false,
		play: function() {
			if(this.cleared) {
				return;
			}
			$("#event").html("<p id = 'eventText'>You approach a large door with a huge textbox next to it. Perhaps the door is password-locked?</p>"
					+ "<button id = 'ok'>Okay</button>");
			$("#ok").click(function() {
				$("#event").html("<p id = 'eventText'>What do you think is the password?</p>"
						+ "<input type = 'text' id = 'textInput'>&nbsp;<button id = 'enter'>Enter</button>");
				$("#enter").click(function() {
					if ($("#textInput").prop("value") == "healing") {
						$("#event").html("<p id = 'eventText'>As you finish putting in the password, the door opens, revealing a huge healing fountain. <br>You drink everything in the fountain, and now you are fat with health. <br>You gained 40 points of health.</p>"
								+ "<button id = 'ok'>Wow!</button>");
						$("#ok").click(function() {
							player.halt = false;
							$("#event").empty();
						});
						player.health += 40;
						player.printHealth();
						addLog("You gained 40 points of health. Remaining health: " + player.health);
						this.cleared = true;
						healingFountainPassword.cleared = true;
					}
					else {
						$("#event").html("<p id = 'eventText'>You couldn't get the right password. You return to your previous location</p>"
								+ "<button id = 'ok'>Hmm...</button>");
						$("#ok").click(function() {
							$("#event").empty();
							moveReverse(player.goDir);
							map.print();
							player.halt = false;
						});
					}
				});
			});
		}
};

// A challenge event [PART II of healingFountain]
var healingFountainPassword = {
	hidden: true,
	cleared: false,
	play: function() {
		if(this.cleared) {
			return;
		}
		$("#event").html("<p id = 'eventText'>You see a scrap of paper that reads \"healing\".</p>"
				+ "<button id = 'ok'>Hmm?</button>");
		$("#ok").click(function() {
			$("#eventText").text("You leave the paper there since it doesn't seem to be important. (Nothing happened)");
			$("#ok").text("Okay...");
			$("#ok").click(function() {
				player.halt = false;
				$("#event").empty();
			});
		});
	}
};

// A challenge monster
var walkingCactus = {
		name: "Living Cactus",
		hidden: true,
		cleared: false,
		health: 4,
		attack: generateEnemyAttackFunction("You took a needle to the knee and died.", "The cactus is dancing. You take no damage.", 0.35, 2),
		play: function() {
			if(this.cleared) { // Play only if character has not defeated this monster
				return;
			}
			$("#event").html("<p id = 'eventText'>You see a cactus in the direction you are heading towards. As you are about to pass it, the cactus springs into life and attacks you! It's time to fight!</p>"
					+ "<button id = 'ok'>Okay</button>");
			$("#ok").click(function() {
				combat(walkingCactus);
			});
		},
		playDeathMessage: function() {
			$("#event").html("<p id = 'eventText'>You take a needle off of its head as a prize.</p> "
					+ "<button id = 'ok'>Okay</button>");
			$("#ok").click(function() {
				player.halt = false;
				$("#event").empty();
			});
			player.addPrize("Cactus Needle");
			this.cleared = true;
		}
};

// A challenge monster
var dragon = {
		name: "Dragon",
		hidden: true,
		cleared: false,
		health: 15,
		attack: generateEnemyAttackFunction("The dragon roasted you alive...", "A bug suddenly surprised the dragon, giving you an opportunity to strike!", 0.93, 5),
		play: function() {
			if(this.cleared) { // Play only if character has not defeated this monster
				return;
			}
			$("#event").html("<p id = 'eventText')You enter a dark room. Echoes are heard everywhere. <br>Suddenly, the room is briefly lit by a spew of flames. <br>Somehow, you realize that a dragon is approaching towards you.</p>"
					+ "<button id = 'ok'>Okay</button>");
			$("#ok").click(function() {
				combat(dragon);
			});
		},
		playDeathMessage: function() {
			$("#event").html("<p id = 'eventText'>With sheer luck, you walk away alive from the dragon with treasures in your arms. <br>You also feel quite invincible.</p> "
					+ "<button id = 'ok'>Okay</button>");
			$("#ok").click(function() {
				player.halt = false;
				$("#event").empty();
			});
			player.health = Infinity;
			player.printHealth();
			player.addPrize("Magical Crown");
			player.addPrize("Magical Sceptre");
			player.addPrize("Magical Armor");
			player.addPrize("Excalibur");
			player.attackPow = 10;
			this.cleared = true;
		}
};

// A challenge monster
var annoyingBoy = {
		name: "Annoying Boy",
		hidden: true,
		cleared: false,
		health: 7,
		attack: generateEnemyAttackFunction("The kid annoyed you to death (wha?)", "You told the kid to shut up, so he did nothing.", 0.5, 1),
		play: function() {
			if(this.cleared) {
				return;
			}
			$("#event").html("<p id = 'eventText'>You walk into a blank tile</p>"
					+ "<button id = 'ok'>Okay?</button>");
			$("#ok").click(function() {
				$("#eventText").text("Suddenly, a boy walks to you.");
				$("#ok").text("Huh?");
				$("#ok").click(function() {
					$("#eventText").text("He's yelling nothing but curse words at you.");
					$("#ok").text("Why?");
					$("#ok").click(function() {
						$("#eventText").text("He's annoying.");
						$("#ok").text("He sure is...");
						$("#ok").click(function() {
							$("#eventText").text("Let's silence him.");
							$("#ok").text("Uh...");
							$("#ok").click(function() {
								combat(annoyingBoy);
							})
						});
					});
				});
			});
		},
		playDeathMessage: function() {
			$("#event").html("<p id = 'eventText'>You silence the boy permanently... But he gives you no reward.</p>"
					+ "<button id = 'ok'>Oh...</button>");
			$("#ok").click(function() {
				$("#eventText").text("How annoying.");
				$("#ok").text(".....");
				$("#ok").click(function() {
					player.halt = false;
					$("#event").empty();
				});
			});
			this.cleared = true;
		}
}

// A challenge monster
var sadJurge = {
		name: "Sad Jurge",
		hidden: true,
		cleared: false,
		health: 1,
		attack: generateEnemyAttackFunction("The sadness got to you.", "He was too sad to attack.", 0.1, 1),
		play: function() {
			if(this.cleared) {
				return;
			}
			$("#event").html("<p id = 'eventText'>You walk into the next room, but an incredibly sad figure catches your eye. It's time to fight....?</p>"
					+ "<button id = 'ok'>For the happy people!</button>");
			$("#ok").click(function() {
				combat(sadJurge);
			});
		},
		playDeathMessage: function() {
			$("#event").html("<p id = 'eventText'>You defeat Sad Jurge, but his sadness is now with you (if you are carrying any prizes).</p>"
					+ "<button id = 'ok'>Man...</button>");
			$("#ok").click(function() {
				player.halt = false;
				$("#event").empty();
			});
			for(var i = 0; i < player.prizes.length; i++) {
				if(player.prizes[i] == "Excalibur") {
					player.prizes[i] = "Sadcalibur";
					player.attackPow = 5;
				}
				else {
					player.prizes[i] = "Sadness";
				}
			}
			player.printPrizes();
			this.cleared = true;
		}
};

// A challenge monster
var slime = {
		name: "Slime",
		hidden: true,
		cleared: false,
		health: 4,
		attack: generateEnemyAttackFunction("The slime gobbled you down, leaving only bones behind.", "The slime lunged at you, but you managed to dodge swiftly.", 0.75, 3),
		play: function() {
			if(this.cleared) {
				return;
			}
			$("#event").html("<p id = 'eventText'>A slime approaches you! It's time to battle!</p>"
					+ "<button id = 'ok'>Okay</button>");
			$("#ok").click(function() {
				combat(slime);
			});
		},
		playDeathMessage: function() {
			$("#event").html("<p id = 'eventText'>You defeated the slime! Obtained 50 G.</p> "
					+ "<button id = 'ok'>Okay</button>");
			$("#ok").click(function() {
				player.halt = false;
				$("#event").empty();
			});
			player.addPrize("50 G");
			this.cleared = true;
		}
};

var map = {
	layout: [
		     [sadJurge, " ", " ", " ", " ", " ", " ", " "],
		     [new Wall(), new Wall(), new Wall(), " ", " ", " ", walkingCactus, " "],
		     [pitFall, " ", " ", " ", " ", " ", " ", " "],
		     [new Wall(), new Wall(), " ", " ", new Wall(), " ", new Wall(), new Wall()],
		     [goal, "S", " ", annoyingBoy, new Wall(), healingFountainPassword, " ", dragon],
		     [new Wall(), new Wall(), " ", " ", new Wall(), " ", new Wall(), new Wall()],
		     [" ", " ", " ", " ", slime, " ", " ", potion],
		     [healingFountain, " ", " ", " ", " ", " ", " ", badPotion]
		     ],
	print: function() {
		var tableLayout = "";
		for(var i = 0; i < this.layout.length; i++) {
			tableLayout += "<tr>";
			for(var i2 = 0; i2 < this.layout[i].length; i2++) {
				if((i == player.colPos) && (i2 == player.rowPos)) {
					tableLayout += "<td style = 'background-color: red;'>A</td>";
				}
				else if(this.layout[i][i2] == "S") {
					tableLayout += "<td style = 'background-color: #6aa2fc;'>S</td>";
				}
				else if(this.layout[i][i2] == " ") {
					tableLayout += "<td>&nbsp;</td>";
				}
				else if(this.layout[i][i2] == goal) {
					if(this.layout[i][i2].hidden) {
						tableLayout += "<td>&nbsp;</td>";
					}
					else {
						tableLayout += "<td style = 'background-color: #31e820;'>G</td>";
					}
				}
				else if(this.layout[i][i2].constructor == Wall) {
					if(this.layout[i][i2].hidden) {
						tableLayout += "<td>&nbsp</td>";
					}
					else {
						tableLayout += "<td style = 'background-color: #726850;'>W</td>";
					}
				}
				else {
					if(this.layout[i][i2].hidden) {
						tableLayout += "<td>&nbsp;</td>";
					}
					else if(this.layout[i][i2].cleared) {
						tableLayout += "<td style = 'background-color: #777777;'>X</td>";
					}
					else {
						tableLayout += "<td style = 'background-color: #c18adb;'>C</td>";
					}
				}
			}
			tableLayout += "</tr>";
		}
		$("#map").html(tableLayout);
	}
}

//The function that handles movement and events
var executeTurn = function(chooseDir) {
	
	// If player is still alive and is not occupied, make a move
	if (player.health > 0 && !player.halt) {
		
		// Clear the event window
		$("#event").empty();
	
		// The movement module
		var validDir = false;
		if(chooseDir == "up") {
			if (player.colPos == 0) {
				$("#event").html("<p id = 'eventText'>There's a wall that way.</p>");
			}
			else if(map.layout[player.colPos - 1][player.rowPos].constructor == Wall) {
				$("#event").html("<p id = 'eventText'>There's a wall that way.</p>");
				map.layout[player.colPos - 1][player.rowPos].hidden = false;
				map.print();
			}
			else {
				validDir = true;
				player.goDir = 'n';
			}
		}
		else if(chooseDir == "right") {
			if (player.rowPos == map.layout[player.colPos].length - 1) {
				$("#event").html("<p id = 'eventText'>There's a wall that way.</p>");
			}
			else if(map.layout[player.colPos][player.rowPos + 1].constructor == Wall) {
				$("#event").html("<p id = 'eventText'>There's a wall that way.</p>");
				map.layout[player.colPos][player.rowPos + 1].hidden = false;
				map.print();
			}
			else {
				validDir = true;
				player.goDir = 'e';
			}
		}
		else if(chooseDir == "down") {
			if (player.colPos == map.length - 1) {
				$("#event").html("<p id = 'eventText'>There's a wall that way.</p>");
			}
			else if(map.layout[player.colPos + 1][player.rowPos].constructor == Wall) {
				$("#event").html("<p id = 'eventText'>There's a wall that way.</p>");
				map.layout[player.colPos + 1][player.rowPos].hidden = false;
				map.print();
			}
			else {
				validDir = true;
				player.goDir = 's';
			}
		}
		else if(chooseDir == "left") {
			if(player.rowPos == 0) {
				$("#event").html("<p id = 'eventText'>There's a wall that way.</p>");
			}
			else if(map.layout[player.colPos][player.rowPos - 1].constructor == Wall) {
				$("#event").html("<p id = 'eventText'>There's a wall that way.</p>");
				map.layout[player.colPos][player.rowPos - 1].hidden = false;
				map.print();
			}
			else {
				validDir = true;
				player.goDir = 'w';
			}
		}
	
		// If the user has input an invalid command
		if(validDir == false) {
			return;
		}

		// If the user has input a valid command
		moveDirection(player.goDir);
		
		// Update the map after the user makes the move
		map.print();
	
		// Detect when the user reaches the goal
		if(map.layout[player.colPos][player.rowPos] == goal) {
			map.layout[player.colPos][player.rowPos].play();
			return;
		}
	
		// Detect whether the user has entered an uneventful area on the map
		if((map.layout[player.colPos][player.rowPos] == " ") || (map.layout[player.colPos][player.rowPos] == "S")) {
			addLog("You moved to a blank space at coordinates [" + player.rowPos + "," + player.colPos + "].");
		}
		
		// Detect if the user has reached a challenge event
		if((typeof map.layout[player.colPos][player.rowPos]) == "object") {
			if(!map.layout[player.colPos][player.rowPos].cleared) {
				player.halt = true;
				if(map.layout[player.colPos][player.rowPos].hidden) {
					map.layout[player.colPos][player.rowPos].hidden = false;
					map.print();
				}
				$("#event").html("<h1 style = 'color: red;' id = 'eventText'>Incoming challenge! Do you wish to face this?</h1>" 
						+ "<button id = 'yes'>Yes</button>&nbsp;<button id = 'no'>No</button>");
				$("#yes").click(function() {
					addLog("You have entered a challenge event at the coordinates [" + player.rowPos + "," + player.colPos + "].");
					var outcome = map.layout[player.colPos][player.rowPos].play();
					if(outcome == "ran") {
						if(player.health > 0) {
							$("#event").empty();
							player.halt = false;
							moveReverse(player.goDir);
							map.print();
							addLog("You ran back to the coordinates [" + player.rowPos + "," + player.colPos + "].");
						}					
					}
				});
				$("#no").click(function() {
					if(player.health > 0) {
						$("#event").empty();
						player.halt = false;
						moveReverse(player.goDir);
						map.print();
						addLog("You ran back to the coordinates [" + player.rowPos + "," + player.colPos + "].");
					}
				});
			}
			else {
				addLog("You moved to a blank space at coordinates [" + player.rowPos + "," + player.colPos + "].");
			}
		}
	}

};

// When the page is loaded and ready
$(document).ready(function() {
	$("head").append("<style>th, td {border: 1px solid black; padding: .5em 3em;}</style>");
	player.printHealth();
	player.printPrizes();
	map.print();
	$("#moveUp").click(function() {executeTurn("up");});
	$("#moveDown").click(function() {executeTurn("down");});
	$("#moveLeft").click(function() {executeTurn("left");});
	$("#moveRight").click(function() {executeTurn("right");});
});