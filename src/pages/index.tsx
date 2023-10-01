import Image from "next/image";
import { Inter } from "next/font/google";
import Terminal from "@/components/Terminal";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main>
      <Terminal />
    </main>
  );
}
