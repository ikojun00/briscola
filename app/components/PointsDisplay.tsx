import React from "react";
import Image from "next/image";

export default function PointsDisplay({ points }: { points: number }) {
  return (
    <div className="w-20 relative">
      <Image
        src="/back.webp"
        width={0}
        height={0}
        className="bg-black rounded-md"
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
        alt="Back of card"
      />
      <p className="absolute inset-0 flex items-center justify-center">
        <span className="bg-white text-black px-2 py-1 rounded-md">
          {points}
        </span>
      </p>
    </div>
  );
}
