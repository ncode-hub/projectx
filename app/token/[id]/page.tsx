"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot, collection, addDoc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Token, Trade, Comment } from "@/types";
import { TrendingUp, TrendingDown, MessageCircle, Send } from "lucide-react";
import Image from "next/image";

export default function TokenDetailPage() {
  const params = useParams();
  const tokenId = params.id as string;
  const [token, setToken] = useState<Token | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradeAmount, setTradeAmount] = useState("");
  const [commentText, setCommentText] = useState("");
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!tokenId) return;
    const tokenRef = doc(db, "tokens", tokenId);
    const unsubToken = onSnapshot(tokenRef, (doc) => {
      if (doc.exists()) {
        setToken({ id: doc.id, ...doc.data() } as Token);
        setLoading(false);
      }
    });
    const tradesQ = query(collection(db, "tokens", tokenId, "trades"), orderBy("timestamp", "desc"));
    const unsubTrades = onSnapshot(tradesQ, (snap) => {
      const list: Trade[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Trade));
      setTrades(list);
    });
    const commentsQ = query(collection(db, "tokens", tokenId, "comments"), orderBy("timestamp", "asc"));
    const unsubComments = onSnapshot(commentsQ, (snap) => {
      const list: Comment[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Comment));
      setComments(list);
    });
    return () => {
      unsubToken();
      unsubTrades();
      unsubComments();
    };
  }, [tokenId]);

  const handleTrade = async () => {
    if (!token || !tradeAmount || processing) return;
    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount");
      return;
    }
    setProcessing(true);
    try {
      const impact = amount * 100;
      const newCap = activeTab === "buy" ? token.marketCap + impact : Math.max(1000, token.marketCap - impact);
      const newProg = Math.min(100, (newCap / 100000) * 100);
      await updateDoc(doc(db, "tokens", tokenId), {
        marketCap: newCap,
        bondingCurveProgress: newProg,
      });
      await addDoc(collection(db, "tokens", tokenId, "trades"), {
        type: activeTab,
        amountSol: amount,
        timestamp: serverTimestamp(),
        userAddress: "USER_" + Math.random().toString(36).substr(2, 9),
      });
      setTradeAmount("");
      setProcessing(false);
    } catch (e) {
      alert("Trade failed");
      setProcessing(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || processing) return;
    setProcessing(true);
    try {
      await addDoc(collection(db, "tokens", tokenId, "comments"), {
        text: commentText,
        userAddress: "ANON_" + Math.random().toString(36).substr(2, 9),
        timestamp: serverTimestamp(),
      });
      setCommentText("");
      setProcessing(false);
    } catch (e) {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-matrix-green animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start gap-6">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-matrix-green/50 flex-shrink-0">
                {token.imageUrl ? (
                  <Image src={token.imageUrl} alt={token.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black text-4xl">
                    {token.ticker[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-matrix-green mb-2">${token.ticker}</h1>
                <h2 className="text-xl mb-4">{token.name}</h2>
                <p className="text-gray-400">{token.description}</p>
                <div className="mt-4 flex gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Market Cap</p>
                    <p className="text-lg font-bold text-matrix-green">
                      {token.marketCap.toLocaleString()} SOL
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Creator</p>
                    <p className="text-sm text-gray-400 font-mono">
                      {token.creatorAddress.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card h-96 bg-black flex items-center justify-center">
            <div className="text-center text-gray-600">
              <p>Chart Placeholder</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-matrix-green mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Trades
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {trades.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No trades yet</p>
              ) : (
                trades.slice(0, 10).map((t) => (
                  <div key={t.id} className="flex justify-between border-b border-matrix-green/10 pb-2">
                    <div className="flex items-center gap-2">
                      {t.type === "buy" ? (
                        <TrendingUp className="w-4 h-4 text-matrix-green" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={t.type === "buy" ? "text-matrix-green" : "text-red-500"}>
                        {t.type.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-bold">{t.amountSol} SOL</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("buy")}
                className={`flex-1 py-3 rounded-lg font-bold ${
                  activeTab === "buy"
                    ? "bg-matrix-green text-black"
                    : "bg-black text-gray-400"
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setActiveTab("sell")}
                className={`flex-1 py-3 rounded-lg font-bold ${
                  activeTab === "sell"
                    ? "bg-red-600 text-white"
                    : "bg-black text-gray-400"
                }`}
              >
                Sell
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount (SOL)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="0.00"
                  className="input"
                />
              </div>

              <button
                onClick={handleTrade}
                disabled={processing || !tradeAmount}
                className={`w-full ${
                  activeTab === "buy" ? "btn-primary" : "btn-sell"
                } disabled:opacity-50`}
              >
                {processing
                  ? "Processing..."
                  : `${activeTab === "buy" ? "Buy" : "Sell"} ${token.ticker}`}
              </button>

              <p className="text-xs text-gray-500 text-center">
                MVP: Simulated (no wallet)
              </p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-matrix-green mb-2">Bonding Curve</h3>
            <div className="w-full bg-black rounded-full h-4 mb-2">
              <div
                className="bg-matrix-green h-full transition-all"
                style={{ width: `${token.bondingCurveProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">{token.bondingCurveProgress.toFixed(2)}%</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-matrix-green mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat ({comments.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4 p-2">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center text-sm">No comments</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="bg-black p-3 rounded-lg">
                    <p className="text-xs text-matrix-green font-mono mb-1">{c.userAddress}</p>
                    <p className="text-sm">{c.text}</p>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Message..."
                className="input flex-1"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={processing || !commentText.trim()}
                className="btn-primary disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}