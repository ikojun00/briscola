import React from "react";
import JoinRoom from "./components/icons/JoinRoom";
import CreateRoom from "./components/icons/CreateRoom";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen bg-green-700 text-white">
      <div className="flex flex-col rounded-md p-10 gap-14 border-4 bg-green-800 border-white">
        <h1 className="flex justify-center text-3xl">Briscola</h1>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/join">
              <button className="flex justify-center items-center gap-2 w-full bg-green-700 p-4 rounded-md border-2 border-white hover:bg-green-400 hover:text-green-800">
                <JoinRoom /> Join Room
              </button>
            </Link>
            <Link href="/create">
              <button className="flex justify-center items-center gap-2 w-full bg-green-700 p-4 rounded-md border-2 border-white hover:bg-green-400">
                <CreateRoom /> Create Room
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
