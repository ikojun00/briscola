import React from "react";
import JoinRoom from "./components/icons/JoinRoom";
import CreateRoom from "./components/icons/CreateRoom";
import Link from "next/link";
import Image from "next/image";

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
            <button className="flex justify-center items-center w-full gap-2 p-4 rounded-md border-2 border-white hover:bg-green-700">
              <JoinRoom /> Join Room
            </button>
          </Link>
          <Link href="/create">
            <button className="flex justify-center items-center w-full gap-2 p-4 rounded-md border-2 border-white hover:bg-green-700">
              <CreateRoom /> Create Room
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
