var N_TEAMS = 2;

var TeamScore = [0, 0];

var base_agent0 = BaseLineAgent();
var base_agent1 = BaseLineAgent();

var policy_maker = [base_agent0[0], base_agent1[0]];
var evolve_func = [base_agent0[1], base_agent1[1]];

function getNewPolicy(team_id){
  return policy_maker[team_id]();
}

function evolve(team_id, team_snakes){
  return evolve_func[team_id](team_snakes);
}
