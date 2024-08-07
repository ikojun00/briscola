"use client";

import React from "react";
import JoinRoom from "./components/icons/JoinRoom";
import CreateRoom from "./components/icons/CreateRoom";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen bg-green-700 text-white">
      <div className="flex flex-col rounded-md p-10 border-4 bg-green-800 border-white">
        <Image
          src="/logo.webp"
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
          alt="Logo"
        />
        <div className="flex px-14 flex-col gap-4">
          <Link href="/join">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex justify-center items-center w-full gap-2 p-4 rounded-md border-2 border-white bg-green-700"
            >
              <JoinRoom /> Join Room
            </motion.button>
          </Link>
          <Link href="/create">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex justify-center items-center w-full gap-2 p-4 rounded-md border-2 border-white bg-green-700"
            >
              <CreateRoom /> Create Room
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}
