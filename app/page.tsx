"use client";

import { useEffect, useState } from "react";

type CardSuit = "denari" | "spade" | "coppe" | "bastoni";

type Card = {
  suit: CardSuit;
  value: number;
};

type Player = {
  name: string;
  hand: Card[];
};

const rank = [1, 3, 13, 12, 11, 7, 6, 5, 4, 3, 2];
const points = [11, 10, 4, 3, 2, 0, 0, 0, 0, 0, 0];
const initialCards: Card[] = [
  { suit: "denari", value: 1 },
  { suit: "denari", value: 2 },
  { suit: "denari", value: 3 },
  { suit: "denari", value: 4 },
  { suit: "denari", value: 5 },
  { suit: "denari", value: 6 },
  { suit: "denari", value: 7 },
  { suit: "denari", value: 11 },
  { suit: "denari", value: 12 },
  { suit: "denari", value: 13 },
  { suit: "spade", value: 1 },
  { suit: "spade", value: 2 },
  { suit: "spade", value: 3 },
  { suit: "spade", value: 4 },
  { suit: "spade", value: 5 },
  { suit: "spade", value: 6 },
  { suit: "spade", value: 7 },
  { suit: "spade", value: 11 },
  { suit: "spade", value: 12 },
  { suit: "spade", value: 13 },
  { suit: "coppe", value: 1 },
  { suit: "coppe", value: 2 },
  { suit: "coppe", value: 3 },
  { suit: "coppe", value: 4 },
  { suit: "coppe", value: 5 },
  { suit: "coppe", value: 6 },
  { suit: "coppe", value: 7 },
  { suit: "coppe", value: 11 },
  { suit: "coppe", value: 12 },
  { suit: "coppe", value: 13 },
  { suit: "bastoni", value: 1 },
  { suit: "bastoni", value: 2 },
  { suit: "bastoni", value: 3 },
  { suit: "bastoni", value: 4 },
  { suit: "bastoni", value: 5 },
  { suit: "bastoni", value: 6 },
  { suit: "bastoni", value: 7 },
  { suit: "bastoni", value: 11 },
  { suit: "bastoni", value: 12 },
  { suit: "bastoni", value: 13 },
];

export default function Home() {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [briscola, setBriscola] = useState<Card>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [currentPoints, setCurrentPoints] = useState<number[]>([0, 0]);

  useEffect(() => {
    const initializePlayers = () => {
      return [
        { name: "lolek", hand: [] },
        { name: "bolek", hand: [] },
      ];
    };

    const shuffleArray = (array: Card[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    const shuffleAndDealCards = (players: Player[], deck: Card[]) => {
      shuffleArray(deck);
      setCards(deck);

      for (let i = 0; i < 3; i++) {
        players.forEach((player) => {
          const card = deck.pop();
          if (card) {
            player.hand.push(card);
          }
        });
      }
      setBriscola(deck.pop());
      return players;
    };

    const newPlayers = shuffleAndDealCards(initializePlayers(), [...cards]);
    setPlayers(newPlayers);
  }, []);

  const handleBattle = (newSelectedCards: Card[]) => {
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
  };

  const handleCardSelect = (playerIndex: number, cardIndex: number) => {
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
  };

  return (
    <div>
      {players.map((player, playerIndex) => (
        <div key={player.name}>
          <h2>{player.name}</h2>
          {player.hand.map((card, cardIndex) => (
            <button
              key={cardIndex}
              onClick={() => handleCardSelect(playerIndex, cardIndex)}
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
        Points: Lolek {currentPoints[0]} - Bolek {currentPoints[1]}
      </h2>
      <br />
      {cards.map((card, index) => (
        <p key={index}>
          {card.suit} {card.value}
        </p>
      ))}
      {currentPoints[0] > 60 && <p>Lolek won!</p>}
      {currentPoints[1] > 60 && <p>Bolek won!</p>}
    </div>
  );
}
