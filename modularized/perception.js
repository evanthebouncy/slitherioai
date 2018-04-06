// perception.js

// window size
var W = 5;

// augment a coordinate for the sliding window on a torus
function aug(x,y) {
  var ret = [[x,y],
             [x-L,y-L],
             [x-L,y+0],
             [x-L,y+L],
             [x+0,y-L],
             [x+0,y+0],
             [x+0,y+L],
             [x+L,y-L],
             [x+L,y+0],
             [x+L,y+L],
             ];
  return ret;
}

function nearest_food(headxy, foods){
  var headx = headxy[0];
  var heady = headxy[1];
  var min_x = 0;
  var min_y = 0;
  var min_dist = 9999;
  foods.forEach(function(food){
    var foodx = food.position[0];
    var foody = food.position[1];
    var foodxy_aug = aug(foodx, foody);
    foodxy_aug.forEach(function(augxy) {
      var augx = augxy[0];
      var augy = augxy[1];
      var xydist = Math.abs(augx - headx) + Math.abs(augy - heady);
      if (xydist < min_dist) {
        min_dist = xydist
        min_x = augx;
        min_y = augy;
      }

      }
    );

  });

  var diffx = min_x - headx;
  var diffy = min_y - heady;
  var totall = Math.abs(diffx) + Math.abs(diffy) + 0.1;
  return [diffx / totall, diffy / totall];
}

// coordinate transform in aug torus space to sliding window
// return [x, y] if has transform, return [] if there is no transform
function win_xform(Ox, Oy, x, y) {
  // sliding window bounds
  var halfW = Math.floor(W/2);
  var x_l = Ox - halfW;
  var x_u = Ox + halfW;
  var y_l = Oy - halfW;
  var y_u = Oy + halfW;

  var aug_xy = aug(x,y);
  var ret = [];
  aug_xy.forEach(function(xy) {
    aug_x = xy[0];
    aug_y = xy[1];
    if (x_l <= aug_x && aug_x <= x_u && y_l <= aug_y && aug_y <= y_u) {
      ret.push(aug_x - Ox + halfW);
      ret.push(aug_y - Oy + halfW);
    }
  });
  return ret ;
}

// the perception is
// the sliding window of the snake head and put into a feature space
function perceive(snake, snakes, foods) {
  var Ox = snake.body[0][0];
  var Oy = snake.body[0][1];

  // initialize a matrix of empty spaces
  var matrix = [];
  for(var i=0; i<W; i++) {
    matrix[i] = [];
    for (var j=0; j<W; j++){
      matrix[i].push(0);
    }
  }
  // add the foods
  foods.forEach(function(food) {
    var fxfy = win_xform(Ox, Oy, food.position[0], food.position[1]);
    if (fxfy.length > 0) {
      var fx = fxfy[0];
      var fy = fxfy[1];
      matrix[fx][fy] = 1;
    }
  });
  // add the enemies
  snakes.forEach(function(other_snake){
    other_snake.body.forEach(function(seg) {
      var fxfy = win_xform(Ox, Oy, seg[0], seg[1]);
      if (fxfy.length > 0) {
        var fx = fxfy[0];
        var fy = fxfy[1];
        matrix[fx][fy] = 2;
      }
    });
  });
  // add the selfs
  snake.body.forEach(function(selfseg) {
    var fxfy = win_xform(Ox, Oy, selfseg[0], selfseg[1]);
    if (fxfy.length > 0) {
      var fx = fxfy[0];
      var fy = fxfy[1];
      matrix[fx][fy] = 3;
    }
  });

  // linearize the matrix and 1-hot encode it
  var transformed_mat = Array.apply(null, Array(W*W*4)).map(Number.prototype.valueOf,0);
  for(var i=0; i<W; i++) {
    for(var j=0; j<W; j++) {
      transformed_mat[i * W * 4 + j * 4 + matrix[i][j]] = 1.0;
    }
  }
  var food_vect = nearest_food([Ox, Oy], foods);
  // return the snake's local perception, plus food vector, plus hunger level
  var hunger = 1.0 / (snake.hp / 100 + 1.0)
  return transformed_mat.concat(food_vect).concat(hunger);
}

