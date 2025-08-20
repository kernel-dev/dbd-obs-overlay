export interface StyleConfig {
  scale: string;
  fontFamily: string;
  tournamentColor: string;
  tournamentBgColor: string;
  tournamentBorderColor: string;
  teamsTextColor: string;
  teamsBgColor: string;
  teamsBorderColor: string;
  scoreTextColor: string;
  scoreBgColor: string;
  scoreBorderColor: string;
  winConditionColor: string;
  winConditionBgColor: string;
  winConditionBorderColor: string;
}

export interface TournamentConfig {
  TournamentName: string;
  FirstTeamName: string;
  FirstTeamScore: string;
  SecondTeamName: string;
  SecondTeamScore: string;
  WinCondition: string;
}

export interface OneVOneConfig {
  FirstPlayerName: string;
  FirstPlayerScore: string;
  SecondPlayerName: string;
  SecondPlayerScore: string;
  WinCondition: string;
}

export interface ScrimsConfig {
  TeamOrKillerName: string;
}

export interface WinstreakConfig {
  TeamName: string;
  CurrentScore: string;
  PersonalBest: string;
}

export interface AppConfig {
  CategoryInit: {
    DesiredCategory: string;
  };
  Styles: StyleConfig;
  Tournament: TournamentConfig;
  OneVOne: OneVOneConfig;
  Scrims: ScrimsConfig;
  Winstreak: WinstreakConfig;
}

export type UniformConfig = TournamentConfig | OneVOneConfig | ScrimsConfig | WinstreakConfig;