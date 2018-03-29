N_TEAMS = 2;

base_agent0 = BaseLineAgent();
var policy_maker0 = base_agent0[0];
var evolve0 = base_agent0[1];

base_agent1 = BaseLineAgent();
var policy_maker1 = base_agent1[0];
var evolve1 = base_agent1[1];

function getNewPolicy(team_id){
  if (team_id == 0){
    return policy_maker0();
  }
  if (team_id == 1){
    return policy_maker1();
  }

  console.log("something wrong with team_id ", team_id);
}

function evolve(team_id, team_snakes){
  if (team_id == 0){
    evolve0(team_snakes);
    return;
  }
  if (team_id == 1){
    // evolve0(team_snakes);
    return;
  }

  console.log("something wrong with team_id ", team_id);
}
