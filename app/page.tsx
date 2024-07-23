"use client";

import { useCallback, useEffect, useState } from "react";
import { socket } from "./socket.js";
import Image from "next/image";

type CardSuit = "denari" | "spade" | "coppe" | "bastoni";

type Card = {
  suit: CardSuit;
  value: number;
};

type Player = {
  id: string;
  name: string;
  hand: Card[];
};

const rank = [1, 3, 13, 12, 11, 7, 6, 5, 4, 3, 2];
const points = [11, 10, 4, 3, 2, 0, 0, 0, 0, 0, 0];

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [briscola, setBriscola] = useState<Card | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [currentPoints, setCurrentPoints] = useState<number[]>([0, 0]);

  const handleBattle = useCallback(
    (newSelectedCards: Card[]) => {
      const [firstCard, secondCard] = newSelectedCards;
      const firstCardRank = rank.indexOf(firstCard.value);
      const secondCardRank = rank.indexOf(secondCard.value);

      let winnerIndex = currentTurn === 0 ? 1 : 0;

      if (firstCard.suit === secondCard.suit) {
        winnerIndex = firstCardRank < secondCardRank ? 0 : 1;
      } else if (firstCard.suit === briscola?.suit) {
        winnerIndex = 0;
      } else if (secondCard.suit === briscola?.suit) {
        winnerIndex = 1;
      }

      const newPoints = [...currentPoints];
      newPoints[winnerIndex] += points[firstCardRank] + points[secondCardRank];

      if (cards.length === 1) {
        const newCard = cards.pop();
        if (newCard) players[winnerIndex].hand.push(newCard);
        players[(winnerIndex + 1) % players.length].hand.push(briscola);
      }

      const updatedPlayers = [...players];
      updatedPlayers.forEach((player) => {
        if (cards.length > 1) {
          const newCard = cards.pop();
          if (newCard) player.hand.push(newCard);
        }
      });

      setPlayers(updatedPlayers);
      setCards(cards);
      setCurrentPoints(newPoints);
      setCurrentTurn(winnerIndex);
      setSelectedCards([]);
    },
    [briscola, cards, currentPoints, currentTurn, players]
  );

  const handleCardSelect = useCallback(
    (playerIndex: number, cardIndex: number) => {
      if (playerIndex !== currentTurn) return;

      const newSelectedCards = [...selectedCards];
      newSelectedCards[playerIndex] = players[playerIndex].hand.splice(
        cardIndex,
        1
      )[0];
      setSelectedCards(newSelectedCards);

      if (
        newSelectedCards.length === 2 &&
        newSelectedCards[0] &&
        newSelectedCards[1]
      ) {
        handleBattle(newSelectedCards);
      } else {
        setCurrentTurn((prevTurn) => (prevTurn + 1) % players.length);
      }
    },
    [currentTurn, handleBattle, players, selectedCards]
  );

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      socket.emit("join_game", "Player Name"); // Replace with actual player name
      console.log("Connected to the server");
    }

    function onDisconnect() {
      console.log("Disconnected from the server");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("start_game", ({ players, briscola, deck }) => {
      console.log("Game started", { players, briscola, deck });
      setPlayers(players);
      setBriscola(briscola);
      setCards(deck);
    });

    socket.on("card_selected", ({ playerIndex, cardIndex }) => {
      handleCardSelect(playerIndex, cardIndex);
    });

    socket.on("game_full", () => {
      console.log("Game is full");
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [handleCardSelect]);

  return (
    <div>
      {players.map((player, playerIndex) => (
        <div key={player.id}>
          <h2
            className={
              playerIndex === currentTurn ? "font-bold" : "text-slate-200"
            }
          >
            {player.id}
          </h2>

          <div className="flex">
            {player.hand.map((card, cardIndex) =>
              socket.id === player.id ? (
                <button
                  key={cardIndex}
                  className="w-20 h-40 p-1 rounded-md border-black border-2 relative hover:transform hover:-translate-y-4"
                  onClick={() => {
                    socket.emit("select_card", playerIndex, cardIndex);
                  }}
                >
                  <div className="h-full flex flex-col justify-between items-center rounded-md border-black border-2">
                    <p className="text-xs self-start p-0.5">{card.value}</p>
                    <p className="flex items-center justify-center">
                      {card.suit}
                    </p>
                    <p className="text-xs self-end p-0.5">{card.value}</p>
                  </div>
                </button>
              ) : (
                <div
                  key={cardIndex}
                  className="w-20 rounded-md border-2 border-black"
                >
                  <Image
                    src="/back.webp"
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                    alt="Back of card"
                  />
                </div>
              )
            )}
          </div>
          {selectedCards[playerIndex] && (
            <div className="w-20 h-40 p-1 rounded-md border-black border-2">
              <div className="h-full flex flex-col justify-between items-center rounded-md border-black border-2">
                <p className="text-xs self-start p-0.5">
                  {selectedCards[playerIndex].value}
                </p>
                <p className="flex items-center justify-center">
                  {selectedCards[playerIndex].suit}
                </p>
                <p className="text-xs self-end p-0.5">
                  {selectedCards[playerIndex].value}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
      {briscola ? (
        <div className="w-20 h-40 p-1 rounded-md border-black border-2">
          <div className="h-full flex flex-col justify-between items-center rounded-md border-black border-2">
            <p className="text-xs self-start p-0.5">{briscola.value}</p>
            <p className="flex items-center justify-center">{briscola.suit}</p>
            <p className="text-xs self-end p-0.5">{briscola.value}</p>
          </div>
        </div>
      ) : (
        "No Briscola"
      )}
      <h2>
        Points:{" "}
        {players.length > 0
          ? `${players[0].id} ${currentPoints[0]} - ${players[1].id} ${currentPoints[1]}`
          : "N/A"}
      </h2>
      <br />
      {cards.map((card, index) => (
        <p key={index}>
          {card.suit} {card.value}
        </p>
      ))}
      {currentPoints[0] > 60 && <p>{players[0].name} won!</p>}
      {currentPoints[1] > 60 && <p>{players[1].name} won!</p>}
    </div>
  );
}
