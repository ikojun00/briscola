type CardSuit = "denari" | "spade" | "coppe" | "bastoni";

export default interface Card {
  suit: CardSuit;
  value: number;
}
