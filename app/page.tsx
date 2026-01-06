"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Token } from "@/types";
import { DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [shakeId, setShakeId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "tokens"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tokensList: Token[] = [];
      snapshot.forEach((doc) => {
        tokensList.push({ id: doc.id, ...doc.data() } as Token);
      });
      setTokens(tokensList);
      setLoading(false);
      
      if (!snapshot.metadata.hasPendingWrites && snapshot.docChanges().length > 0) {
        const change = snapshot.docChanges()[0];
        if (change.type === "modified") {
          setShakeId(change.doc.id);
          setTimeout(() => setShakeId(null), 500);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-matrix-green text-xl animate-pulse">Loading tokens...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-matrix-green mb-2">
          Live Token Feed
        </h1>
        <p className="text-gray-400">Real-time updates - No refresh needed</p>
      </div>

      {tokens.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">No tokens launched yet</p>
          <Link href="/create" className="btn-primary inline-block">
            Be the first to launch!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <Link
              key={token.id}
              href={`/token/${token.id}`}
              className={`card hover:scale-105 transition-transform ${
                shakeId === token.id ? "animate-shake" : ""
              }`}
            >
              <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-black">
                {token.imageUrl ? (
                  <Image
                    src={token.imageUrl}
                    alt={token.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {token.ticker.charAt(0)}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-matrix-green">
                    ${token.ticker}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {token.bondingCurveProgress.toFixed(1)}%
                  </span>
                </div>

                <h4 className="text-white font-semibold">{token.name}</h4>

                <p className="text-gray-400 text-sm line-clamp-2">
                  {token.description}
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <DollarSign className="w-4 h-4 text-matrix-green" />
                  <span className="text-matrix-green font-bold">
                    {token.marketCap.toLocaleString()} SOL
                  </span>
                </div>

                <div className="w-full bg-black rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-matrix-green h-full transition-all duration-500"
                    style={{ width: `${token.bondingCurveProgress}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
