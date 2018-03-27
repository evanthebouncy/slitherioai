// agent.js

var best_weights = [];
for (var j = 0; j < 5; j++){
  best_weights.push([0,
                    [randomV(W*W*4+2), randomV(W*W*4+2),randomV(W*W*4+2), randomV(W*W*4+2)]]);
    };

function randomV(lenn) {
  var ret = [];
  for (i = 0; i < lenn; i++) {
    ret.push(2 * Math.random() - 1.0);
  }
  return ret;
}

function perturb_weight(w) {
  var ret = [];
  for (i = 0; i < w.length; i++){
    ret.push(w[i] + Math.random() * 0.01);
  }
  return ret;
}

function getNewPolicy() {
  if (Math.random() < 0.1){
    return randomPolicy();
  } else {
    var best_weight = best_weights[0][1];
    var new_weights = [perturb_weight(best_weight[0]),
                       perturb_weight(best_weight[1]),
                       perturb_weight(best_weight[2]),
                       perturb_weight(best_weight[3])];
    return [Policy(new_weights), new_weights];
  }
}

function randomPolicy() {
  // for each input in sliding window, 4 possible values:
  // empty, self, enemy, food
  var lenn = W * W * 4 + 2;
  var weight0 = randomV(lenn);
  var weight1 = randomV(lenn);
  var weight2 = randomV(lenn);
  var weight3 = randomV(lenn);
  var weights = [weight0, weight1, weight2, weight3];
  return [Policy(weights), weights];
}

function Policy(weights) {
  // function policy(snake, snakes, foods) {
  function policy(sl_window){
    // console.log(sl_window);
    var dir0_str = dotprod(sl_window, weights[0]);
    var dir1_str = dotprod(sl_window, weights[1]);
    var dir2_str = dotprod(sl_window, weights[2]);
    var dir3_str = dotprod(sl_window, weights[3]);
    // var dir = Math.floor(Math.random() * 4);
    // var dir = soft_arg_max(dir0_str, dir1_str, dir2_str, dir3_str);
    var dir = arg_max(dir0_str, dir1_str, dir2_str, dir3_str);
    return dir;
  }
  return policy;
}

function dotprod(x,y){
  var ret = 0.0;
  for (i = 0; i < x.length; i++) {
    ret += x[i] * y[i];
  }
  return ret;
}

function arg_max(a,b,c,d) {
  var maxxx = Math.max(a,b,c,d);
  if (maxxx == a) {
    return 0;
  }
  if (maxxx == b) {
    return 1;
  }
  if (maxxx == c) {
    return 2;
  }
  if (maxxx == d) {
    return 3;
  }
}
