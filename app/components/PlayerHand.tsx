import React from "react";
import Image from "next/image";
import Player from "../interfaces/Player";
import PointsDisplay from "./PointsDisplay";
import { socket } from "../socket";

interface PlayerHandProps {
  player: Player;
  currentTurn: number;
  youIndex: number;
  points: number;
  roomName: string;
}

export default function PlayerHand({
  player,
  currentTurn,
  youIndex,
  points,
  roomName,
}: PlayerHandProps) {
  return (
    <div className="flex justify-between items-center w-96">
      <div key={player.id}>
        {player.hand.map((card, cardIndex) => (
          <button
            key={cardIndex}
            className="w-20 relative hover:transform hover:-translate-y-4"
            onClick={() => {
              socket.emit("select_card", youIndex, cardIndex, roomName);
            }}
          >
            <Image
              src={`/brescia/${card.suit}_${card.value}.svg`}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "auto" }}
              alt="Player's card"
            />
          </button>
        ))}
        <h2
          className={youIndex === currentTurn ? "font-bold" : "text-slate-200"}
        >
          {player.name}
        </h2>
      </div>
      <PointsDisplay points={points || 0} />
    </div>
  );
}
