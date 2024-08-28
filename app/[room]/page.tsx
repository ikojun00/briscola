"use client";

import { useCallback, useEffect, useState } from "react";
import { socket } from "../socket.js";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Player from "../interfaces/Player";
import Card from "../interfaces/Card";
import OpponentHand from "../components/OpponentHand";
import Deck from "../interfaces/Deck";

const rank = [1, 3, 13, 12, 11, 7, 6, 5, 4, 3, 2];
const points = [11, 10, 4, 3, 2, 0, 0, 0, 0, 0, 0];

export default function Briscola() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [briscola, setBriscola] = useState<Card | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [displaySelectedCards, setDisplaySelectedCards] = useState<Card[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [result, setResult] = useState<number[]>([0, 0]);
  const [rounds, setRounds] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const searchParams = useSearchParams();

  const roomName = searchParams.get("room");
  const username = searchParams.get("username");
  const youIndex = players.findIndex((e) => e.id === socket.id);
  const opponentIndex = players.findIndex((e) => e.id !== socket.id);

  const handleWinOrDraw = useCallback(
    (winnerIndex: number | null) => {
      setBriscola(null);
      setCards([]);
      setSelectedCards([]);
      setDisplaySelectedCards([]);
      setCurrentTurn((rounds + 1) % players.length);
      setRounds(rounds + 1);
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) => ({
          ...player,
          deck: { points: 0, cards: [] },
        }))
      );

      if (winnerIndex !== null) {
        alert(players[winnerIndex].name + " won!");
        const newResult = [...result];
        newResult[winnerIndex] += 1;
        setResult(newResult);
      } else {
        alert("Draw!");
      }

      socket.emit("new_game", players, roomName);
    },
    [players, result, roomName, rounds]
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

      const newPoints =
        players[winnerIndex].deck.points +
        points[firstCardRank] +
        points[secondCardRank];

      const updatedPlayers = players.map((player, index) => {
        if (index === winnerIndex) {
          const updatedDeck: Deck = {
            points: newPoints,
            cards: [...player.deck.cards, firstCard, secondCard],
          };
          return { ...player, deck: updatedDeck };
        }
        return player;
      });

      if (newPoints > 60) {
        handleWinOrDraw(winnerIndex);
        return;
      }

      if (cards.length === 1 && briscola) {
        const newCard = cards.pop();
        if (newCard) updatedPlayers[winnerIndex].hand.push(newCard);
        updatedPlayers[(winnerIndex + 1) % updatedPlayers.length].hand.push(
          briscola
        );
        setBriscola(null);
      }

      updatedPlayers.forEach((player) => {
        if (cards.length > 1) {
          const newCard = cards.pop();
          if (newCard) player.hand.push(newCard);
        }
      });

      if (
        newPoints === 60 &&
        updatedPlayers[0].hand.length === 0 &&
        updatedPlayers[1].hand.length === 0
      ) {
        handleWinOrDraw(null);
        return;
      }

      setPlayers(updatedPlayers);
      setCards(cards);
      setCurrentTurn(winnerIndex);
      setSelectedCards([]);
      setDisplaySelectedCards([]);
    },
    [briscola, cards, currentTurn, handleWinOrDraw, players]
  );

  const handleCardSelect = useCallback(
    (playerIndex: number, cardIndex: number) => {
      if (playerIndex !== currentTurn) return;

      const newSelectedCards = [...selectedCards];
      const newDisplaySelectedCards = [...displaySelectedCards];
      const selectedCard = players[playerIndex].hand.splice(cardIndex, 1)[0];
      newSelectedCards[playerIndex] = selectedCard;
      newDisplaySelectedCards.push(selectedCard);
      setSelectedCards(newSelectedCards);
      setDisplaySelectedCards(newDisplaySelectedCards);

      if (newSelectedCards[0] && newSelectedCards[1]) {
        setTimeout(() => {
          handleBattle(newSelectedCards);
        }, 1000);
      } else {
        setCurrentTurn((prevTurn) => (prevTurn + 1) % players.length);
      }
    },
    [currentTurn, displaySelectedCards, handleBattle, players, selectedCards]
  );

  useEffect(() => {
    if (!isConnected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
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
      setDisplaySelectedCards([]);
      setCurrentTurn(0);
    });

    socket.on("game_full", () => {
      console.log("Game is full");
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [handleCardSelect, isConnected, roomName, username]);

  return players.length === 0 ? (
    <div className="flex h-screen justify-center items-center">
      Waiting other players...
    </div>
  ) : (
    <div className="flex flex-col h-screen">
      <div className="flex justify-end p-4 pb-0">
        {players[youIndex].name} {result[0]} - {result[1]}{" "}
        {players[opponentIndex].name}
      </div>
      <div className="flex flex-col h-full justify-between items-center py-6">
        {/* Opponent's cards at the top */}
        <OpponentHand
          players={players}
          socket={socket}
          currentTurn={currentTurn}
          opponentIndex={opponentIndex}
          points={players[opponentIndex].deck.points}
        />

        {/* Selected cards in the middle */}
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
                  {cards.length}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Current player's cards at the bottom */}
        <div className="flex justify-between items-center w-96">
          {players
            .filter((player) => player.id === socket.id)
            .map((player) => (
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
                {players[youIndex].deck.points}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
