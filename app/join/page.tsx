"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Join() {
  const [username, setUsername] = useState<string>("");
  const [roomName, setRoomName] = useState<string>();
  const router = useRouter();

  const handleJoinRoom = () => {
    if (username && roomName) {
      router.push(`/lobby?room=${roomName}&username=${username}`);
    } else alert("Username and/or room code is empty.");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-green-700 text-white">
      <div className="flex flex-col rounded-md p-10 gap-14 border-4 bg-green-800 border-white">
        <h1 className="flex justify-center text-3xl">Join room</h1>
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <label className="text-md">Username:</label>
            <input
              id="username"
              name="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-black pl-2 placeholder:text-gray-40"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-md">Room code:</label>
            <input
              id="roomName"
              name="roomName"
              required
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="rounded-md border-0 py-1.5 text-black pl-2 placeholder:text-gray-40"
            />
          </div>
        </div>
        <button
          onClick={handleJoinRoom}
          className="flex justify-center items-center gap-2 w-full p-4 rounded-md border-2 border-white hover:bg-green-700"
        >
          Join
        </button>
      </div>
    </div>
  );
}
