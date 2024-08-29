import React from "react";
import Image from "next/image";
import Card from "../interfaces/Card";

interface BoardProps {
  displaySelectedCards: Card[];
  briscola: Card | null;
  cardsLength: number;
}

export default function Board({
  displaySelectedCards,
  briscola,
  cardsLength,
}: BoardProps) {
  return (
    <div className="flex justify-between items-center w-96">
      <div className="flex">
        {displaySelectedCards.map((card, index) => (
          <div key={index} className="w-20">
            <Image
              src={`/brescia/${card.suit}_${card.value}.svg`}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "auto" }}
              alt="Selected card"
            />
          </div>
        ))}
      </div>
      <div className="flex">
        {briscola ? (
          <div className="w-20 -rotate-90">
            <Image
              src={`/brescia/${briscola.suit}_${briscola.value}.svg`}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "auto" }}
              alt="Briscola"
            />
          </div>
        ) : (
          "No Briscola"
        )}
        <div className="w-20 z-10 relative mb-5">
          <Image
            src="/back.webp"
            width={0}
            height={0}
            sizes="100vw"
            className="bg-black rounded-md"
            style={{ width: "100%", height: "auto" }}
            alt="Deck"
          />
          <p className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white text-black px-2 py-1 rounded-md">
              {cardsLength}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
