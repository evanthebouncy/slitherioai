// --------------------------- THE GAEM ENGINE -------------------------------
// AKA game.js

// -------------------------- GAME RULE -----------------------------
//
// mostly resembles slither.io
// objective is to eat as many food pellets as possible
// each snake starts out with  50 hp
// each turn cost 1 hp
// each food grants 20 hp
// if you reach 0 hp you die
// crashing your head on an enemy snake instantly kills you

// --------------------------- GAME PARAMETERS -------------------------
//
// grid size of the board
var L = 80;
// how much HP a food pellet gives
var FOOD_HP = 20;
// how much HP you start with
var START_HP = 50;
// how much lose per turn
var HP_LOSS = 1;
// spawn food pellet when total food on the board falls below this
var PASSIVE_FOOD_RATIO = 0.02;
// simulation frame rate
var SIM_FR = 10;
// how long a snake is
var SNEK_L = 10;
// how many snake per team
var N_SNEKS = 10;
// animate ?
var RENDER = true;

// -------------------------- GAME STATES ---------------------------
// a list of snakes, each snake contains:
// a ''unique'' color
// a list of coordinates it currently occupies. first coordinate is head
// a policy telling the snake how to move on a perception
var snakes = [];
// a food is simply a list of coordinates
var foods = [];
// a board_render is an intermediate state, which is a list of tuples of
// (x,y,color) to be rendered. derived from the snakes and the foods 
var board_render = [];


// --------------------------- RENDERING ----------------------------
var cv = document.getElementById('myCanvas');
var ctx = cv.getContext('2d');
cv.width = 10 * L;
cv.height = 10 * L;
var cvWidth = cv.width;
var cvHeight = cv.height;

// a coord is a list of (x, y, color)
function draw_coord(ctx, coord) {
  var x = coord[0];
  var y = coord[1];
  var c = coord[2];
  ctx.beginPath();
  ctx.fillStyle = c;
  ctx.fillRect(x*10, y*10, 10, 10)
  ctx.fill();
  ctx.closePath();
}

function to_board(snakes, foods) {
  var new_board_render = [];
  snakes.forEach(function(snake) {
    var colr = snake.color;
    snake.body.forEach(function(coord) {
    new_board_render.push([coord[0], coord[1], colr])
    });
  });
  foods.forEach(function(food) {
    var colr = food.color;
    new_board_render.push([food.position[0], food.position[1], colr])
  });
  return new_board_render;
}

// -------------------------- GAME MECHANICS ------------------------------

// move the head of the snake in one of 4 possible directions (L/R/U/D)
// perception stuff policy stuff . . .
function move_head(snake, snakes, foods) {
  var perception = perceive(snake, snakes, foods);
  var dir = snake.policy[0](perception);

  var head = snake.body[0];
  var xx = head[0];
  var yy = head[1];
  if (dir == 0) {return [(L + xx - 1) % L, yy];}
  if (dir == 1) {return [(L + xx + 1) % L, yy];}
  if (dir == 2) {return [xx, (L + yy - 1) % L];}
  if (dir == 3) {return [xx, (L + yy + 1) % L];}
}

// check if a snake has deaded BibleThump
function dead(snake, head_coord, other_snakes){
  var color = snake.color;
  var x = head_coord[0];
  var y = head_coord[1];
  var cur_snake_dead = false;
  other_snakes.forEach(function(other_snake) {
    // other snake is different if it has different color
    other_snake.body.forEach(function(crd) {
      if (crd[0] == x && crd[1] == y && other_snake.color != color) {
        cur_snake_dead = true;
      }
      if (snake.hp <= 0) {
        cur_snake_dead = true;
      }
    });
  });
  return cur_snake_dead;
}

// makek the snake eat the food and return new list of food
function eat_food(head_coord, foods) {
  var new_foods = [];
  var x = head_coord[0];
  var y = head_coord[1];
  foods.forEach(function(food) {
    var pos = food.position;
    if (!(pos[0] == x && pos[1] == y)) {
      new_foods.push(food);
    }
  });
  return new_foods;
}

// takes in the current state of snakes and foods
// produces the next state of snakes and foods
function update(snakes, foods) {
  var new_snakes = [];
  var foods = foods;
  // move the snake along their directions
  snakes.forEach(function(snake) {
    var new_head = move_head(snake, snakes, foods);
    var new_body = []
    new_body[0] = new_head;
    for (i = 1; i < SNEK_L; i++) { 
      new_body[i] = snake.body[i-1];
    }
    snake.body = new_body

    // each turn snake loses some HP
    snake.hp = snake.hp - HP_LOSS;

    // SNEK ATE ?! PogChamp
    var new_foods = eat_food(new_head, foods);
    // food length decrease == this snake ate a food Poggers
    if (new_foods.length < foods.length) {
      foods = new_foods;
      snake.hp = snake.hp + FOOD_HP;
      snake.max_score = snake.max_score + 1;
      // bonus team score
      TeamScore[snake.team_id] += 1;
    }

    // SNEK DED ?! monkaS
    var cur_snake_dead = dead(snake, new_head, snakes);
    // If not dead, add it to next list of snakes
    if (!cur_snake_dead) {
      new_snakes.push(snake);
    } else {
      // if dead, turn its body into foods (how morbid!)
      snake.body.forEach(function(bb) {
        var bbx = bb[0];
        var bby = bb[1];
        foods = spawnFood(foods, bbx,bby);
      });
    }
  });
  return [new_snakes, foods];
}

function getRandomColor() {
  // ignoring color E and F here, well use those for food
  var letters = '456789ABCD';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 10)];
  }
  return color;
}

// spawn a snake for team team_id
function spawnSnek(team_id) {
  var randColor = getRandomColor();
  var rand_x = Math.floor(Math.random() * L);
  var rand_y = Math.floor(Math.random() * L);
  var body = [];
  for (var ii = 0; ii < SNEK_L; ii++){
    body.push([rand_x, rand_y]);
  }
  snakes.push(
     {color : randColor,
      body : body,
      hp : START_HP,
      max_score : 0,
      team_id : team_id,   
      policy : getNewPolicy(team_id),
     }
  );
}

function spawnFood(foods, x, y) {
  var randColor = "#000000"
  foods.push(
    {color : randColor,
     position : [x, y],
    }
  );
  return foods;
}

function spawnRandFood() {
  var rand_x = Math.floor(Math.random() * L);
  var rand_y = Math.floor(Math.random() * L);
  spawnFood(foods, rand_x, rand_y);
}

// Calculate the leader board
function show_leaderboard() {
  var div = document.getElementById("allhititle");
  div.style.fontSize = "xx-large";
  div.innerHTML = "TEAM SCORES";
  
  var div = document.getElementById("allhi");
  div.style.fontSize = "xx-large";
  div.innerHTML = String(TeamScore);
}

// ------------------------------ GAME LOOP -------------------------------
// animation : always running loop.
function animate() {
  setTimeout(function (){
    // call again next time we can draw
    requestAnimationFrame(animate);

    // RENDER BOARD
    if (RENDER) {
      ctx.clearRect(0, 0, cvWidth, cvHeight);
      board_render.forEach(function(o) {
        draw_coord(ctx, o)
      });
    }

    // UPDATE
    // update takes in old snakes, old foods
    // and produce new snakes and new foods
    var snakes_foods = update(snakes, foods);
    snakes = snakes_foods[0];
    foods = snakes_foods[1];
    
    board_render = to_board(snakes, foods);

    // SPAWN IF LESS THAN DISRED AMOUNT
    // spawn snakes for each team
    for (var t_id = 0; t_id < N_TEAMS; t_id++){
      var team_n_snek = 0;
      snakes.forEach(function(snek) {
        if(snek.team_id == t_id){
          team_n_snek += 1;
        }
      });
      if (team_n_snek < N_SNEKS) {
        spawnSnek(t_id);
      }
    }
    if (foods.length < PASSIVE_FOOD_RATIO * L * L) {
      spawnRandFood();
    }

    // UPDATE LEADER BOARD
    show_leaderboard();

    // evolve the snakes for each team
    for (var t_id = 0; t_id < N_TEAMS; t_id++){
      var team_sneks = [];
      snakes.forEach(function(snek) {
        if(snek.team_id == t_id){
          team_sneks.push(snek);
        }
      });
      evolve(t_id, team_sneks);
    }
  }, SIM_FR);
}

// add in toggle speed and render buttons
document.getElementById('toggle_render').onclick = function() {
  if (RENDER) {
    RENDER = false;
    SIM_FR = 0; 
  } else {
    RENDER = true;
    SIM_FR = 10;
  }
};

document.getElementById('toggle_speed').onclick = function() {
  if (SIM_FR < 100) {
    SIM_FR = SIM_FR + 20
  } else {
    SIM_FR = 1;
  }
};


animate();

