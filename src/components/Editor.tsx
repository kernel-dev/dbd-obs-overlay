import React, { useState } from 'react';
import type { AppConfig } from '../types/config';
import './Editor.css';

interface EditorProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig | null>>;
}

const Editor: React.FC<EditorProps> = ({ config, setConfig }) => {
  const [collapsed, setCollapsed] = useState({
    styling: true,
    data: false,
  });

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConfig(prev => prev ? { ...prev, CategoryInit: { DesiredCategory: e.target.value } } : null);
  };

  const handleDataChange = (section: keyof AppConfig, key: string, value: string) => {
    setConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      };
    });
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = e.target.value;
    setConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        Styles: {
          ...prev.Styles,
          scale: newScale,
        },
      };
    });
  };

  const toggleCollapse = (section: 'styling' | 'data') => {
    setCollapsed(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderStylingFields = () => {
    const category = config.CategoryInit.DesiredCategory.toLowerCase();

    switch (category) {
      case 'tournament':
        return (
          <>
            <label>
              Scale: {config.Styles.scale}x
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={config.Styles.scale}
                onChange={handleScaleChange}
              />
            </label>
            <label>Font Family <input type="text" value={config.Styles.fontFamily} onChange={e => handleDataChange('Styles', 'fontFamily', e.target.value)} /></label>
            <label>Tournament Color <input type="color" value={config.Styles.tournamentColor} onChange={e => handleDataChange('Styles', 'tournamentColor', e.target.value)} /></label>
            <label>Tournament Background Color <input type="color" value={config.Styles.tournamentBgColor} onChange={e => handleDataChange('Styles', 'tournamentBgColor', e.target.value)} /></label>
            <label>Tournament Border Color <input type="color" value={config.Styles.tournamentBorderColor} onChange={e => handleDataChange('Styles', 'tournamentBorderColor', e.target.value)} /></label>
            <label>Teams Text Color <input type="color" value={config.Styles.teamsTextColor} onChange={e => handleDataChange('Styles', 'teamsTextColor', e.target.value)} /></label>
            <label>Teams Background Color <input type="color" value={config.Styles.teamsBgColor} onChange={e => handleDataChange('Styles', 'teamsBgColor', e.target.value)} /></label>
            <label>Teams Border Color <input type="color" value={config.Styles.teamsBorderColor} onChange={e => handleDataChange('Styles', 'teamsBorderColor', e.target.value)} /></label>
            <label>Score Text Color <input type="color" value={config.Styles.scoreTextColor} onChange={e => handleDataChange('Styles', 'scoreTextColor', e.target.value)} /></label>
            <label>Score Background Color <input type="color" value={config.Styles.scoreBgColor} onChange={e => handleDataChange('Styles', 'scoreBgColor', e.target.value)} /></label>
            <label>Score Border Color <input type="color" value={config.Styles.scoreBorderColor} onChange={e => handleDataChange('Styles', 'scoreBorderColor', e.target.value)} /></label>
            <label>Win Condition Text Color <input type="color" value={config.Styles.winConditionColor} onChange={e => handleDataChange('Styles', 'winConditionColor', e.target.value)} /></label>
            <label>Win Condition Background Color <input type="color" value={config.Styles.winConditionBgColor} onChange={e => handleDataChange('Styles', 'winConditionBgColor', e.target.value)} /></label>
            <label>Win Condition Border Color <input type="color" value={config.Styles.winConditionBorderColor} onChange={e => handleDataChange('Styles', 'winConditionBorderColor', e.target.value)} /></label>
          </>
        );

      case 'scrims':
        return (
          <>
            <label>Font Family <input type="text" value={config.Styles.fontFamily} onChange={e => handleDataChange('Styles', 'fontFamily', e.target.value)} /></label>
            <label>Scrims Text Color <input type="color" value={config.Styles.tournamentColor} onChange={e => handleDataChange('Styles', 'tournamentColor', e.target.value)} /></label>
            <label>Scrims Background Color <input type="color" value={config.Styles.tournamentBgColor} onChange={e => handleDataChange('Styles', 'tournamentBgColor', e.target.value)} /></label>
            <label>Scrims Border Color <input type="color" value={config.Styles.tournamentBorderColor} onChange={e => handleDataChange('Styles', 'tournamentBorderColor', e.target.value)} /></label>
            <label>Team Or Killer Text Color <input type="color" value={config.Styles.teamsTextColor} onChange={e => handleDataChange('Styles', 'teamsTextColor', e.target.value)} /></label>
            <label>Team Or Killer Background Color <input type="color" value={config.Styles.teamsBgColor} onChange={e => handleDataChange('Styles', 'teamsBgColor', e.target.value)} /></label>
            <label>Team Or Killer Border Color <input type="color" value={config.Styles.teamsBorderColor} onChange={e => handleDataChange('Styles', 'teamsBorderColor', e.target.value)} /></label>
          </>
        );

      case 'onevone':
        return (
          <>
            <label>Font Family <input type="text" value={config.Styles.fontFamily} onChange={e => handleDataChange('Styles', 'fontFamily', e.target.value)} /></label>
            <label>1v1 Text Color <input type="color" value={config.Styles.tournamentColor} onChange={e => handleDataChange('Styles', 'tournamentColor', e.target.value)} /></label>
            <label>1v1 Background Color <input type="color" value={config.Styles.tournamentBgColor} onChange={e => handleDataChange('Styles', 'tournamentBgColor', e.target.value)} /></label>
            <label>1v1 Border Color <input type="color" value={config.Styles.tournamentBorderColor} onChange={e => handleDataChange('Styles', 'tournamentBorderColor', e.target.value)} /></label>
            <label>Players Text Color <input type="color" value={config.Styles.teamsTextColor} onChange={e => handleDataChange('Styles', 'teamsTextColor', e.target.value)} /></label>
            <label>Players Background Color <input type="color" value={config.Styles.teamsBgColor} onChange={e => handleDataChange('Styles', 'teamsBgColor', e.target.value)} /></label>
            <label>Players Border Color <input type="color" value={config.Styles.teamsBorderColor} onChange={e => handleDataChange('Styles', 'teamsBorderColor', e.target.value)} /></label>
            <label>Score Text Color <input type="color" value={config.Styles.scoreTextColor} onChange={e => handleDataChange('Styles', 'scoreTextColor', e.target.value)} /></label>
            <label>Score Background Color <input type="color" value={config.Styles.scoreBgColor} onChange={e => handleDataChange('Styles', 'scoreBgColor', e.target.value)} /></label>
            <label>Score Border Color <input type="color" value={config.Styles.scoreBorderColor} onChange={e => handleDataChange('Styles', 'scoreBorderColor', e.target.value)} /></label>
            <label>Win Condition Text Color <input type="color" value={config.Styles.winConditionColor} onChange={e => handleDataChange('Styles', 'winConditionColor', e.target.value)} /></label>
            <label>Win Condition Background Color <input type="color" value={config.Styles.winConditionBgColor} onChange={e => handleDataChange('Styles', 'winConditionBgColor', e.target.value)} /></label>
            <label>Win Condition Border Color <input type="color" value={config.Styles.winConditionBorderColor} onChange={e => handleDataChange('Styles', 'winConditionBorderColor', e.target.value)} /></label>
          </>
        );

      case 'winstreak':
        return (
          <>
            <label>Font Family <input type="text" value={config.Styles.fontFamily} onChange={e => handleDataChange('Styles', 'fontFamily', e.target.value)} /></label>
            <label>Winstreak Text Color <input type="color" value={config.Styles.tournamentColor} onChange={e => handleDataChange('Styles', 'tournamentColor', e.target.value)} /></label>
            <label>Winstreak Background Color <input type="color" value={config.Styles.tournamentBgColor} onChange={e => handleDataChange('Styles', 'tournamentBgColor', e.target.value)} /></label>
            <label>Winstreak Border Color <input type="color" value={config.Styles.tournamentBorderColor} onChange={e => handleDataChange('Styles', 'tournamentBorderColor', e.target.value)} /></label>
            <label>Current Text Color <input type="color" value={config.Styles.teamsTextColor} onChange={e => handleDataChange('Styles', 'teamsTextColor', e.target.value)} /></label>
            <label>Current Background Color <input type="color" value={config.Styles.teamsBgColor} onChange={e => handleDataChange('Styles', 'teamsBgColor', e.target.value)} /></label>
            <label>Current Border Color <input type="color" value={config.Styles.teamsBorderColor} onChange={e => handleDataChange('Styles', 'teamsBorderColor', e.target.value)} /></label>
            <label>Score Text Color <input type="color" value={config.Styles.scoreTextColor} onChange={e => handleDataChange('Styles', 'scoreTextColor', e.target.value)} /></label>
            <label>Score Background Color <input type="color" value={config.Styles.scoreBgColor} onChange={e => handleDataChange('Styles', 'scoreBgColor', e.target.value)} /></label>
            <label>Score Border Color <input type="color" value={config.Styles.scoreBorderColor} onChange={e => handleDataChange('Styles', 'scoreBorderColor', e.target.value)} /></label>
            <label>Personal Best Text Color <input type="color" value={config.Styles.winConditionColor} onChange={e => handleDataChange('Styles', 'winConditionColor', e.target.value)} /></label>
            <label>Personal Best Background Color <input type="color" value={config.Styles.winConditionBgColor} onChange={e => handleDataChange('Styles', 'winConditionBgColor', e.target.value)} /></label>
            <label>Personal Best Border Color <input type="color" value={config.Styles.winConditionBorderColor} onChange={e => handleDataChange('Styles', 'winConditionBorderColor', e.target.value)} /></label>
          </>
        );
    }
  }

  const renderCategoryFields = () => {
    const category = config.CategoryInit.DesiredCategory.toLowerCase();
    switch (category) {
      case 'tournament':
        const tourneyData = config.Tournament;
        return (
          <>
            <label>Tournament Name <input type="text" value={tourneyData.TournamentName} onChange={e => handleDataChange('Tournament', 'TournamentName', e.target.value)} /></label>
            <label>Team 1 Name <input type="text" value={tourneyData.FirstTeamName} onChange={e => handleDataChange('Tournament', 'FirstTeamName', e.target.value)} /></label>
            <label>Team 1 Score <input type="number" value={tourneyData.FirstTeamScore} onChange={e => handleDataChange('Tournament', 'FirstTeamScore', e.target.value)} /></label>
            <label>Team 2 Name <input type="text" value={tourneyData.SecondTeamName} onChange={e => handleDataChange('Tournament', 'SecondTeamName', e.target.value)} /></label>
            <label>Team 2 Score <input type="number" value={tourneyData.SecondTeamScore} onChange={e => handleDataChange('Tournament', 'SecondTeamScore', e.target.value)} /></label>
            <label>Win Condition (Optional) <input type="text" value={tourneyData.WinCondition} onChange={e => handleDataChange('Tournament', 'WinCondition', e.target.value)} /></label>
          </>
        );
      case 'onevone':
        const oneVOneData = config.OneVOne;
        return (
          <>
            <label>First Player Name <input type="text" value={oneVOneData.FirstPlayerName} onChange={e => handleDataChange('OneVOne', 'FirstPlayerName', e.target.value)} /></label>
            <label>First Player Score <input type="number" value={oneVOneData.FirstPlayerScore} onChange={e => handleDataChange('OneVOne', 'FirstPlayerScore', e.target.value)} /></label>
            <label>Second Player Name <input type="text" value={oneVOneData.SecondPlayerName} onChange={e => handleDataChange('OneVOne', 'SecondPlayerName', e.target.value)} /></label>
            <label>Second Player Score <input type="number" value={oneVOneData.SecondPlayerScore} onChange={e => handleDataChange('OneVOne', 'SecondPlayerScore', e.target.value)} /></label>
            <label>Win Condition (Optional) <input type="text" value={oneVOneData.WinCondition} onChange={e => handleDataChange('OneVOne', 'WinCondition', e.target.value)} /></label>
          </>
        );
      case 'scrims':
        const scrimsData = config.Scrims;
        return (
          <>
            <label>TeamOrKillerName <input type="text" value={scrimsData.TeamOrKillerName} onChange={e => handleDataChange('Scrims', 'TeamOrKillerName', e.target.value)} /></label>
          </>
        );
      case 'winstreak':
        const winstreakData = config.Winstreak;
        return (
          <>
            <label>TeamName <input type="text" value={winstreakData.TeamName} onChange={e => handleDataChange('Winstreak', 'TeamName', e.target.value)} /></label>
            <label>Current Score <input type="text" value={winstreakData.CurrentScore} onChange={e => handleDataChange('Winstreak', 'CurrentScore', e.target.value)} /></label>
            <label>Personal Best (Optional) <input type="text" value={winstreakData.PersonalBest} onChange={e => handleDataChange('Winstreak', 'PersonalBest', e.target.value)} /></label>
          </>
        );
      default:
        return <p>Select a category to edit its data.</p>;
    }
  };

  return (
    <div className="editor-panel">
      <h3>Overlay Editor</h3>
      <div className="card">
        <h4>General Settings</h4>
        <label>
          Active Category
          <select value={config.CategoryInit.DesiredCategory} onChange={handleCategoryChange}>
            <option value="Tournament">Tournament</option>
            <option value="OneVOne">1v1</option>
            <option value="Scrims">Scrims</option>
            <option value="Winstreak">Winstreak</option>
          </select>
        </label>
      </div>
      <div className="card">
        <h4 onClick={() => toggleCollapse('styling')} className="collapsible-header">
          <span>Styling</span> <span className={`caret ${!collapsed.styling ? 'expanded' : ''}`}></span>
        </h4>
        <div className={`collapsible-content-wrapper ${!collapsed.styling ? 'expanded' : ''}`}>
          <div className="collapsible-content">
             {renderStylingFields()}
          </div>
        </div>
      </div>
      <div className="card">
        <h4 onClick={() => toggleCollapse('data')} className="collapsible-header">
          <span>Data for: {config.CategoryInit.DesiredCategory}</span> <span className={`caret ${!collapsed.data ? 'expanded' : ''}`}></span>
        </h4>
        <div className={`collapsible-content-wrapper ${!collapsed.data ? 'expanded' : ''}`}>
          <div className="collapsible-content">
            {renderCategoryFields()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;