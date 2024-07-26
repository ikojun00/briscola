"use client";

import React, { useState } from "react";
import JoinRoom from "./components/icons/JoinRoom";
import CreateRoom from "./components/icons/CreateRoom";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState<string>("");
  const [roomName, setRoomName] = useState<string>();
  const router = useRouter();

  const handleJoinRoom = () => {
    if (username && roomName) {
      router.push(`/lobby?room=${roomName}&username=${username}`);
    } else console.log("Username is empty");
  };

  const handleCreateRoom = () => {
    if (username) {
      router.push(
        `/lobby?room=${(Math.random() + 1)
          .toString(36)
          .substring(2, 5)}&username=${username}`
      );
    } else console.log("Username is empty");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-green-700 text-white">
      <div className="flex flex-col rounded-md p-10 gap-14 border-4 bg-green-500 border-white">
        <h1 className="text-3xl">Traditional Card Games</h1>
        <div className="flex flex-col gap-8">
          <div>
            <label className="block text-sm font-medium leading-6">
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-black pl-2 placeholder:text-gray-40"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium leading-6">
              Room code:
            </label>
            <div className="mt-2">
              <input
                id="roomName"
                name="roomName"
                required
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-black pl-2 placeholder:text-gray-40"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleJoinRoom}
              className="flex justify-center items-center gap-2 w-full bg-green-600 p-4 rounded-md border-2 border-white hover:bg-green-700"
            >
              <JoinRoom /> Join Room
            </button>
            <button
              onClick={handleCreateRoom}
              className="flex justify-center items-center gap-2 w-full bg-green-600 p-4 rounded-md border-2 border-white hover:bg-green-700"
            >
              <CreateRoom /> Create Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
