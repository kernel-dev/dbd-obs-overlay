use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Positions {
    pub tourney: i32,
    pub winCon: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Alignment {
    pub tourney: String,
    pub winCon: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub CategoryInit: CategoryInit,
    pub Styles: Styles,
    pub Tournament: Tournament,
    pub OneVOne: OneVOne,
    pub Scrims: Scrims,
    pub Winstreak: Winstreak,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CategoryInit {
    pub DesiredCategory: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Styles {
    pub scale: String,
    pub fontFamily: String,
    pub tournamentColor: String,
    pub tournamentBgColor: String,
    pub tournamentBorderColor: String,
    pub teamsBgColor: String,
    pub teamsBorderColor: String,
    pub teamsTextColor: String,
    pub scoreBgColor: String,
    pub scoreBorderColor: String,
    pub scoreTextColor: String,
    pub winConditionBgColor: String,
    pub winConditionBorderColor: String,
    pub winConditionColor: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tournament {
    pub TournamentName: String,
    pub FirstTeamName: String,
    pub FirstTeamScore: String,
    pub SecondTeamName: String,
    pub SecondTeamScore: String,
    #[serde(default)]
    pub WinCondition: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OneVOne {
    pub FirstPlayerName: String,
    pub FirstPlayerScore: String,
    pub SecondPlayerName: String,
    pub SecondPlayerScore: String,
    #[serde(default)]
    pub WinCondition: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Scrims {
    pub TeamOrKillerName: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Winstreak {
    pub TeamName: String,
    pub CurrentScore: String,
    #[serde(default)]
    pub PersonalBest: Option<String>,
}
