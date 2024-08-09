"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Copy from "../components/icons/Copy";
import Success from "../components/icons/Success";
import { motion } from "framer-motion";

export default function Home() {
  const [username, setUsername] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [tooltipMessage, setTooltipMessage] = useState("Copy");
  const [showSuccessIcon, setShowSuccessIcon] = useState(false);
  const router = useRouter();

  const handleCopyClick = () => {
    const input = document.getElementById("roomName");
    if (input) {
      navigator.clipboard.writeText(input.innerText).then(() => {
        setShowSuccessIcon(true);
        setTooltipMessage("Copied!");
        setTimeout(() => {
          setShowSuccessIcon(false);
          setTooltipMessage("Copy");
        }, 2000);
      });
    } else {
      alert("Copy to clipboard does not work!");
    }
  };

  const handleCreateRoom = () => {
    if (username) {
      router.push(`/lobby?room=${roomName}&username=${username}`);
    } else alert("Username is empty.");
  };

  useEffect(() => {
    setRoomName((Math.random() + 1).toString(36).substring(2, 5));
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-green-700 text-white">
      <div className="flex flex-col rounded-md p-10 gap-14 border-4 bg-green-800 border-white">
        <h1 className="flex justify-center text-3xl">Create room</h1>
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <label className="text-md">Username:</label>
            <input
              id="username"
              name="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-black pl-2"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <label className="text-md">Room code:</label>
              <p id="roomName">{roomName}</p>
            </div>
            <button
              className="flex border-2 p-2 gap-2 bg-green-700 rounded-md items-center"
              onClick={handleCopyClick}
            >
              <span
                id="copy-icon"
                className={!showSuccessIcon ? "block" : "hidden"}
              >
                <Copy />
              </span>
              <span
                id="success-icon"
                className={showSuccessIcon ? "block" : "hidden"}
              >
                <Success />
              </span>
              {tooltipMessage}
            </button>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateRoom}
          className="flex justify-center items-center gap-2 w-full p-4 rounded-md border-2 border-white bg-green-700"
        >
          Create
        </motion.button>
      </div>
    </div>
  );
}
