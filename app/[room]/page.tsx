"use client";

import { useCallback, useEffect, useState } from "react";
import { socket } from "../socket.js";
import { useSearchParams } from "next/navigation";
import Player from "../interfaces/Player";
import Card from "../interfaces/Card";
import OpponentHand from "../components/OpponentHand";
import Deck from "../interfaces/Deck";
import Board from "../components/Board";
import PlayerHand from "../components/PlayerHand";

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
        <OpponentHand
          player={players[opponentIndex]}
          currentTurn={currentTurn}
          opponentIndex={opponentIndex}
          points={players[opponentIndex].deck.points}
        />

        <Board
          displaySelectedCards={displaySelectedCards}
          briscola={briscola}
          cardsLength={cards.length}
        />

        <PlayerHand
          player={players[youIndex]}
          currentTurn={currentTurn}
          youIndex={youIndex}
          points={players[youIndex].deck.points}
          roomName={roomName}
        />
      </div>
    </div>
  );
}
