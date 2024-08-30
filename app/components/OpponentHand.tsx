import React from "react";
import Image from "next/image";
import Player from "../interfaces/Player";
import PointsDisplay from "./PointsDisplay";

interface OpponentCardsProps {
  player: Player;
  currentTurn: number;
  opponentIndex: number;
  points: number;
}

export default function OpponentHand({
  player,
  currentTurn,
  opponentIndex,
  points,
}: OpponentCardsProps) {
  return (
    <div>
      <h2
        className={
          opponentIndex === currentTurn ? "font-bold" : "text-slate-200"
        }
      >
        {player.name}
      </h2>
      <div className="flex justify-between w-96">
        <div key={player.id}>
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
        <PointsDisplay points={points || 0} />
      </div>
    </div>
  );
}
