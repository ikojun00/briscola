"use client";

import { useCallback, useEffect, useState } from "react";
import { socket } from "./socket.js";

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
  const [isConnected, setIsConnected] = useState(false);
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
      setIsConnected(true);
      socket.emit("join_game", "Player Name"); // Replace with actual player name
      console.log("Connected to the server");
    }

    function onDisconnect() {
      setIsConnected(false);
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
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      {players.map((player, playerIndex) => (
        <div key={player.id}>
          <h2>{player.id}</h2>
          {player.hand.map((card, cardIndex) => (
            <button
              disabled={socket.id !== player.id && true}
              key={cardIndex}
              onClick={() => {
                socket.emit("select_card", playerIndex, cardIndex);
              }}
            >
              {card.suit} {card.value}
            </button>
          ))}
          {selectedCards[playerIndex] && (
            <p>
              Selected Card: {selectedCards[playerIndex]?.suit}{" "}
              {selectedCards[playerIndex]?.value}
            </p>
          )}
        </div>
      ))}
      <h2>
        Briscola:{" "}
        {briscola ? `${briscola.suit} ${briscola.value}` : "No Briscola"}
      </h2>
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
