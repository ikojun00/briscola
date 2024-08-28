import Card from "./Card";
import Deck from "./Deck";

export default interface Player {
  id: string;
  name: string;
  room: string;
  deck: Deck;
  hand: Card[];
}
