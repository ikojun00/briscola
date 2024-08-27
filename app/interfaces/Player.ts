import Card from "./Card";

export default interface Player {
  id: string;
  name: string;
  room: string;
  hand: Card[];
}
