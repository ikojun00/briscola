"use client";

import { useCallback, useEffect, useState } from "react";
import { socket } from "../socket.js";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

type CardSuit = "denari" | "spade" | "coppe" | "bastoni";

type Card = {
  suit: CardSuit;
  value: number;
};

type Player = {
  id: string;
  name: string;
  room: string;
  hand: Card[];
};

const rank = [1, 3, 13, 12, 11, 7, 6, 5, 4, 3, 2];
const points = [11, 10, 4, 3, 2, 0, 0, 0, 0, 0, 0];

export default function Briscola() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [briscola, setBriscola] = useState<Card | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [currentPoints, setCurrentPoints] = useState<number[]>([0, 0]);
  const [result, setResult] = useState<number[]>([0, 0]);
  const searchParams = useSearchParams();

  const roomName = searchParams.get("room");
  const username = searchParams.get("username");
  const youIndex = players.findIndex((e) => e.id === socket.id);
  const opponentIndex = players.findIndex((e) => e.id !== socket.id);

  const handleWin = useCallback(
    (winnerIndex: number) => {
      setBriscola(null);
      setCards([]);
      setSelectedCards([]);
      setCurrentTurn(winnerIndex);
      setCurrentPoints([0, 0]);

      const newResult = [...result];
      newResult[winnerIndex] += 1;
      setResult(newResult);

      socket.emit("new_game", players, roomName);
    },
    [players, result, roomName]
  );

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

      if (newPoints[winnerIndex] > 60) {
        handleWin(winnerIndex);
        return;
      }

      if (cards.length === 1 && briscola) {
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
    [briscola, cards, currentPoints, currentTurn, handleWin, players]
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
        setTimeout(() => {
          handleBattle(newSelectedCards);
        }, 1000);
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
      socket.emit("join_game", username, roomName);
      console.log("Connected to the room");
    }

    function onDisconnect() {
      console.log("Disconnected from the room");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("start_game", ({ playersInRoom, briscola, deck }) => {
      console.log("Game started", { playersInRoom, briscola, deck });
      setPlayers(playersInRoom);
      setBriscola(briscola);
      setCards(deck);
    });

    socket.on("card_selected", ({ playerIndex, cardIndex }) => {
      handleCardSelect(playerIndex, cardIndex);
    });

    socket.on("player_left", () => {
      console.log("Player left");
      setPlayers([]);
      setBriscola(null);
      setCards([]);
      setSelectedCards([]);
      setCurrentTurn(0);
      setCurrentPoints([0, 0]);
    });

    socket.on("game_full", () => {
      console.log("Game is full");
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [handleCardSelect, roomName, username]);

  return players.length === 0 ? (
    <div className="flex h-screen justify-center items-center">
      Waiting other players...
    </div>
  ) : (
    <div className="flex flex-col h-screen">
      <div className="flex justify-end">
        {players[youIndex].name} {result[0]} - {result[1]}{" "}
        {players[opponentIndex].name}
      </div>
      <div className="flex flex-col h-full justify-between items-center py-6">
        {/* Opponents' Cards at the Top */}
        <div className="flex gap-20">
          {players
            .filter((player) => player.id !== socket.id)
            .map((player) => (
              <div key={player.id} className="mb-4">
                <h2
                  className={
                    opponentIndex === currentTurn
                      ? "font-bold"
                      : "text-slate-200"
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
          <div className="w-20 mt-6 relative mb-4">
            <Image
              src="/back.webp"
              width={0}
              height={0}
              className="bg-black rounded-md"
              sizes="100vw"
              style={{ width: "100%", height: "auto" }}
              alt="Back of card"
            />
            <p className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white text-black px-2 py-1 rounded-md">
                {currentPoints[opponentIndex]}
              </span>
            </p>
          </div>
        </div>

        {/* Selected Cards in the Middle */}
        <div className="flex justify-center">
          {selectedCards.map((card, index) => (
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
          <div className="w-20 z-10 relative">
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
                {cards.length}
              </span>
            </p>
          </div>
        </div>

        {/* Current Player's Cards at the Bottom */}
        <div className="flex gap-20 items-center justify-end">
          {players
            .filter((player) => player.id === socket.id)
            .map((player) => (
              <div key={player.id}>
                {player.hand.map((card, cardIndex) => (
                  <button
                    key={cardIndex}
                    className="w-20 h-40 relative hover:transform hover:-translate-y-4"
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
                  className={
                    youIndex === currentTurn ? "font-bold" : "text-slate-200"
                  }
                >
                  {player.name}
                </h2>
              </div>
            ))}
          <div className="w-20 relative mb-5">
            <Image
              src="/back.webp"
              width={0}
              height={0}
              className="bg-black rounded-md"
              sizes="100vw"
              style={{ width: "100%", height: "auto" }}
              alt="Back of card"
            />
            <p className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white text-black px-2 py-1 rounded-md">
                {currentPoints[youIndex]}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
