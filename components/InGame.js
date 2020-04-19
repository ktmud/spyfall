import React, { useState, useEffect } from "react";
import Router from "next/router";
import { withTranslation } from "../i18n";

import StrikeableBox from "./StrikeableBox";

const InGame = ({ t, gameState, socket }) => {
	const {
		me,
		location,
		locationList,
		players,
		timeLeft: latestServerTimeLeft,
		timePaused,
		settings,
	} = gameState;

	const [timeLeft, setTimeLeft] = useState(latestServerTimeLeft);

	useEffect(() => {
		let interval = null;
		if (!timePaused) {
			interval = setInterval(() => {
				if (timeLeft <= 0) {
					clearInterval(interval);
					setTimeLeft(0);
					return;
				}
				setTimeLeft((timeLeft) => timeLeft - 1);
			}, 1000);
		} else if (timePaused && timeLeft !== 0) {
			clearInterval(interval);
		}
		return () => clearInterval(interval);
	}, [timePaused, timeLeft]);

	const gamePaused = true;
	const isSpy = me.role === "spy";
	const isFirstPlayer = true;

	const timeExpired = timeLeft <= 0;
	const minutesLeft = Math.floor(timeLeft / 60);
	const secondsLeft = ((timeLeft % 60) + "").padStart(2, "0");

	return (
		<div name="gameView">
			<h4>
				<a
					className={
						"game-countdown " +
						(timeExpired ? "finished " : " ") +
						(timePaused ? "paused" : "")
					}
					onClick={() => socket.emit("togglePause")}
				>
					{minutesLeft}:{secondsLeft}
				</a>
			</h4>
			{gamePaused && <div className="red-text"></div>}

			<div className="status-container">
				<button className="btn-toggle-status">{t("ui.show hide")}</button>

				<div className="status-container-content">
					{isSpy && (
						<div className="player-status player-status-spy">
							{t("ui.you are the spy")}
						</div>
					)}
					{!isSpy && (
						<>
							<div
								className="player-status player-status-not-spy"
								dangerouslySetInnerHTML={{
									__html: t("ui.you are not the spy"),
								}}
							></div>

							<div className="current-location">
								<div className="current-location-header">
									{t("ui.the location")}:{" "}
								</div>
								<div className="current-location-name">{t(location.name)}</div>
							</div>

							<div className="current-role">
								<div className="current-role-header">{t("ui.your role")}: </div>
								<div className="current-role-name">{t(me.role)}</div>
							</div>
						</>
					)}
				</div>
			</div>

			<h5>{t("ui.players")}</h5>
			<ul className="ingame-player-list">
				{players.map((player) => (
					<StrikeableBox>
						{player.name}
						{isFirstPlayer && (
							<div
								className="first-player-indicator"
								dangerouslySetInnerHTML={{ __html: t("ui.first") }}
							></div>
						)}
					</StrikeableBox>
				))}
			</ul>

			<div className="u-cf"></div>

			<h5>{t("ui.location reference")}</h5>
			<ul className="location-list">
				{locationList.map((name) => (
					<StrikeableBox>{t(name)}</StrikeableBox>
				))}
			</ul>

			<hr />

			<div className="button-container">
				<button className="btn-end" onClick={() => socket.emit("endGame")}>
					{t("ui.end game")}
				</button>
				<button
					className="btn-leave"
					onClick={() => {
						//prevents a redirect back to /[gameCode]
						socket.off("disconnect");

						Router.push("/");
					}}
				>
					{t("ui.leave game")}
				</button>
			</div>
		</div>
	);
};

export default withTranslation("common")(InGame);
