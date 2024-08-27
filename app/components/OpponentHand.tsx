import React from "react";
import Image from "next/image";
import Player from "../interfaces/Player";
import PointsDisplay from "./PointsDisplay";

interface OpponentCardsProps {
  players: Player[];
  socket: any;
  currentTurn: number;
  opponentIndex: number;
  points: number;
}

export default function OpponentHand({
  players,
  socket,
  currentTurn,
  opponentIndex,
  points,
}: OpponentCardsProps) {
  return (
    <div className="flex justify-between w-96">
      {players
        .filter((player: Player) => player.id !== socket.id)
        .map((player: Player) => (
          <div key={player.id} className="mb-4">
            <h2
              className={
                opponentIndex === currentTurn ? "font-bold" : "text-slate-200"
              }
            >
              {players[opponentIndex].name}
            </h2>
            <div className="flex">
              {player.hand.map((card, cardIndex) => (
                <div key={cardIndex} className="w-20 bg-black rounded-md">
                  <Image
                    src="/back.webp"
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                    alt="Back of card"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      <PointsDisplay points={points || 0} />
    </div>
  );
}
