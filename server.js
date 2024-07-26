import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const players = [];
const initialCards = [
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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_game", (playerName, roomName) => {
      const index = players.findIndex((player) => player.id === socket.id);
      let playersInRoom = [];
      console.log("Players length: ", players.length);

      playersInRoom = players.filter((player) => player.room === roomName);
      console.log("Player in room (filter): ", playersInRoom);

      if (playersInRoom.length < 2 && index === -1) {
        const player = {
          id: socket.id,
          name: playerName,
          room: roomName,
          hand: [],
        };
        socket.join(roomName);
        players.push(player);
        playersInRoom.push(player);
        console.log("Players: ", players);
        console.log("Players in room: ", playersInRoom);

        if (playersInRoom.length === 2) {
          const deck = [...initialCards];
          shuffleArray(deck);

          for (let i = 0; i < 3; i++) {
            playersInRoom.forEach((player) => {
              const card = deck.pop();
              if (card) {
                player.hand.push(card);
              }
            });
          }

          const briscola = deck.pop();
          io.to(roomName).emit("start_game", { playersInRoom, briscola, deck });
        }
      } else {
        socket.emit("game_full");
      }
    });

    socket.on("select_card", (playerIndex, cardIndex, roomName) => {
      io.to(roomName).emit("card_selected", { playerIndex, cardIndex });
    });

    // mora se emitati drugim korisnicima izlazak iz sobe
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);

      const index = players.findIndex((player) => player.id === socket.id);
      players.splice(index, 1);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
