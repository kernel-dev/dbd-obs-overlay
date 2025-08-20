import React, { useState, useRef, useEffect } from "react";
import type { AppConfig } from "../types/config";
import "./Preview.css";
import { sendOverlayUpdate } from "../tauri-bridge";

interface PreviewProps {
  config: AppConfig;
  enableMovingObjects?: boolean;
  positionsToUse?: Positions;
  alignmentsToUse?: Alignment;
}

const Preview: React.FC<PreviewProps> = ({
  config,
  enableMovingObjects = true,
  positionsToUse = null,
  alignmentsToUse = null,
}) => {
  if (config == null) return;

  const {
    CategoryInit,
    Styles,
    Tournament,
    OneVOne: oneVOne,
    Scrims,
    Winstreak,
  } = config;

  const [internalPositions, setPositions] = useState({
    tourney: 0,
    winCon: 0,
  });

  const positions = positionsToUse ?? internalPositions;

  const [internalAlignment, setAlignment] = useState({
    tourney: "left",
    winCon: "left",
  });

  const alignment = alignmentsToUse ?? internalAlignment;

  const teamsRef = useRef<HTMLDivElement>(null);
  const tourneyRef = useRef<HTMLDivElement>(null);
  const winConRef = useRef<HTMLDivElement>(null);

  const dragState = useRef({
    startX: 0,
    startOffset: 0,
  });

  const checkAlignment = () => {
    if (teamsRef.current && tourneyRef.current) {
      const teamsWidth = teamsRef.current.offsetWidth;
      const tourneyWidth = tourneyRef.current.offsetWidth;

      let tourneyLargerClass = "";
      let shouldRemoveTourney = tourneyWidth < teamsWidth;
      if (tourneyWidth > teamsWidth) {
        tourneyLargerClass = "tourney-larger";
      }

      let winConLargerClass = "";
      let shouldRemoveWinCon = false;
      if (winConRef.current) {
        const winConWidth = winConRef.current.offsetWidth;
        shouldRemoveWinCon = winConWidth < teamsWidth;

        if (winConWidth > teamsWidth) {
          winConLargerClass = "winCon-larger";
        }
      }

      setAlignment((prevAlignment) => ({
        tourney: `${
          shouldRemoveTourney
            ? prevAlignment.tourney.split(" ")[0]
            : prevAlignment.tourney
        } ${tourneyLargerClass}`.trim(),
        winCon: `${
          shouldRemoveWinCon
            ? prevAlignment.winCon.split(" ")[0]
            : prevAlignment.winCon
        } ${winConLargerClass}`.trim(),
      }));
    }
  };

  useEffect(() => {
    checkAlignment();
  }, [config]);

  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    elementKey: "tourney" | "winCon"
  ) => {
    e.preventDefault();
    dragState.current.startX = e.clientX;
    dragState.current.startOffset = positions[elementKey];

    const handleDragMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragState.current.startX;
      let newPosition = dragState.current.startOffset + deltaX;

      const elementRef = elementKey === "tourney" ? tourneyRef : winConRef;
      if (!teamsRef.current || !elementRef.current) return;

      const teamsWidth = teamsRef.current.offsetWidth;
      const elementWidth = elementRef.current.offsetWidth;
      const isElementLarger = elementWidth > teamsWidth;
      const tolerance = 1;

      let newAlignment = "middle";

      if (isElementLarger) {
        const maxOffset = elementWidth - teamsWidth;
        if (newPosition > 0) newPosition = 0;
        else if (newPosition < -maxOffset) newPosition = -maxOffset;

        if (Math.abs(newPosition) <= tolerance) newAlignment = "left";
        else if (Math.abs(newPosition + maxOffset) <= tolerance)
          newAlignment = "right";

        newAlignment += ` ${elementKey}-larger`;
      } else {
        const maxOffset = teamsWidth - elementWidth;
        if (newPosition < 0) newPosition = 0;
        else if (newPosition > maxOffset) newPosition = maxOffset;

        if (Math.abs(newPosition) <= tolerance) newAlignment = "left";
        else if (Math.abs(newPosition - maxOffset) <= tolerance)
          newAlignment = "right";
      }

      setPositions((prev) => ({ ...prev, [elementKey]: newPosition }));
      setAlignment((prev) => ({ ...prev, [elementKey]: newAlignment }));
    };

    const handleDragEnd = () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);

      // This will ensure that we only update the
      // overlay once an element has been finished dragging.
      setPositions((latestPositions) => {
        setAlignment((latestAlignments) => {
          sendOverlayUpdate(config, latestPositions, latestAlignments);

          return latestAlignments;
        });
        return latestPositions;
      });
    };

    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
  };

  let data;
  switch (CategoryInit.DesiredCategory.toLowerCase()) {
    case "tournament":
      data = {
        name: Tournament.TournamentName,
        t1Name: Tournament.FirstTeamName,
        t1Score: Tournament.FirstTeamScore,
        t2Name: Tournament.SecondTeamName,
        t2Score: Tournament.SecondTeamScore,
        winCon: Tournament.WinCondition,
        staticWinCon: "Win Condition",
      };
      break;
    case "onevone":
      data = {
        name: "1v1",
        t1Name: oneVOne.FirstPlayerName,
        t1Score: oneVOne.FirstPlayerScore,
        t2Name: oneVOne.SecondPlayerName,
        t2Score: oneVOne.SecondPlayerScore,
        winCon: oneVOne.WinCondition,
        staticWinCon: "Win Condition",
      };
      break;
    case "scrims":
      data = {
        name: "Scrims",
        t1Name: Scrims.TeamOrKillerName,
        t1Score: "",
        t2Name: "",
        t2Score: "",
        winCon: "",
        staticWinCon: "",
      };
      break;
    case "winstreak":
      data = {
        name: Winstreak.TeamName,
        t1Name: "Current",
        t1Score: Winstreak.CurrentScore,
        t2Name: "",
        t2Score: "",
        winCon: Winstreak.PersonalBest,
        staticWinCon: "PB",
      };
      break;
    default:
      data = {
        name: "Unknown",
        t1Name: "Team 1",
        t1Score: "0",
        t2Name: "Team 2",
        t2Score: "0",
        winCon: "N/A",
        staticWinCon: "N/A",
      };
  }

  const teamsClasses = [
    "teams",
    `teams-tourney-align-${alignment.tourney}`,
    `teams-win-con-align-${alignment.winCon}`,
  ].join(" ");

  return (
    <div
      className="preview-scaler"
      style={{ "--preview-scale": config.Styles.scale } as React.CSSProperties}
    >
      <div
        className="overlay-wrapper"
        style={{ fontFamily: Styles.fontFamily }}
      >
        <div className="overlay">
          <div
            className={`tournament-name tourney-align-${alignment.tourney}`}
            ref={tourneyRef}
            style={{
              color: Styles.tournamentColor,
              backgroundColor: Styles.tournamentBgColor,
              borderColor: Styles.tournamentBorderColor,
              transform: `translateX(${positions.tourney}px)`,
            }}
            onMouseDown={(e) =>
              enableMovingObjects ? handleDragStart(e, "tourney") : null
            }
          >
            {data.name}
          </div>
          <div
            className={teamsClasses}
            ref={teamsRef}
            style={{
              backgroundColor: Styles.teamsBgColor,
              borderColor: Styles.teamsBorderColor,
            }}
          >
            <div
              className="team-wrapper"
              style={{ backgroundColor: Styles.teamsBgColor }}
            >
              <div
                className="team-name"
                style={{
                  color: Styles.teamsTextColor,
                  backgroundColor: Styles.teamsBgColor,
                }}
              >
                {data.t1Name}
              </div>
            </div>
            {data.t1Score && (
              <div
                className="scores-wrapper"
                style={{
                  backgroundColor: Styles.scoreBgColor,
                  borderColor: Styles.scoreBorderColor,
                }}
              >
                <div
                  className="score score1"
                  style={{
                    color: Styles.scoreTextColor,
                    backgroundColor: Styles.scoreBgColor,
                    borderRightColor: Styles.scoreBorderColor,
                  }}
                >
                  {data.t1Score}
                </div>
                {data.t2Name && (
                  <div
                    className="score score2"
                    style={{
                      color: Styles.scoreTextColor,
                      backgroundColor: Styles.scoreBgColor,
                      borderLeftColor: Styles.scoreBorderColor,
                    }}
                  >
                    {data.t2Score}
                  </div>
                )}
              </div>
            )}
            {data.t2Name && (
              <div className="team-wrapper">
                <div
                  className="team-name"
                  style={{ color: Styles.teamsTextColor }}
                >
                  {data.t2Name}
                </div>
              </div>
            )}
          </div>
          {data.winCon && (
            <div
              className={`win-condition-wrapper win-con-align-${alignment.winCon}`}
              ref={winConRef}
              style={{
                backgroundColor: Styles.winConditionBgColor,
                borderColor: Styles.winConditionBorderColor,
                transform: `translateX(${positions.winCon}px)`,
              }}
              onMouseDown={(e) =>
                enableMovingObjects ? handleDragStart(e, "winCon") : null
              }
            >
              <div
                className="win-con-static"
                style={{ color: Styles.winConditionColor }}
              >
                {data.staticWinCon}
              </div>
              <div
                className="win-condition"
                style={{ color: Styles.winConditionColor }}
              >
                {data.winCon}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;
