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

export default function Home() {
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

  const [cards, setCards] = useState<Card[]>(initialCards);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const initializePlayers = () => {
      const newPlayers: Player[] = [
        {
          name: "lolek",
          hand: [],
        },
        {
          name: "bolek",
          hand: [],
        },
      ];
      return newPlayers;
    };

    const shuffleArray = (array: Card[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    const shuffleAndDealCards = (players: Player[], deck: Card[]) => {
      shuffleArray(deck);

      for (let i = 0; i < 3; i++) {
        players.forEach((player) => {
          const card = deck.pop();
          if (card) {
            player.hand.push(card);
          }
        });
      }

      return players;
    };

    let newPlayers = initializePlayers();
    newPlayers = shuffleAndDealCards(newPlayers, [...cards]);
    setPlayers(newPlayers);
    setCards(cards);
  }, [cards]);

  return (
    <div>
      {players.map((player) => (
        <div key={player.name}>
          <h2>{player.name}</h2>
          {player.hand.map((card, index) => (
            <p key={index}>
              {card.suit}: {card.value}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
