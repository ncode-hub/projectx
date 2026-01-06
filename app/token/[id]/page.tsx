"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot, collection, addDoc, updateDoc, serverTimestamp, query, orderBy, setDoc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Token, Trade, Comment, Holder } from "@/types";
import { TrendingUp, TrendingDown, MessageCircle, Send, Users } from "lucide-react";
import Image from "next/image";

export default function TokenDetailPage() {
  const params = useParams();
  const tokenId = params.id as string;
  const [token, setToken] = useState<Token | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradeAmount, setTradeAmount] = useState("");
  const [commentText, setCommentText] = useState("");
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [processing, setProcessing] = useState(false);
  const [currentUserAddress] = useState("USER_" + Math.random().toString(36).substr(2, 9));

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
    const holdersQ = query(collection(db, "tokens", tokenId, "holders"));
    const unsubHolders = onSnapshot(holdersQ, (snap) => {
      const list: Holder[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Holder));
      // Sort by tokens held descending
      list.sort((a, b) => b.tokensHeld - a.tokensHeld);
      setHolders(list);
    });
    return () => {
      unsubToken();
      unsubTrades();
      unsubComments();
      unsubHolders();
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
      // Calculate price and tokens based on bonding curve
      const basePrice = 0.0001; // Starting price per token
      const priceMultiplier = 1 + (token.bondingCurveProgress / 100);
      const pricePerToken = basePrice * priceMultiplier;
      const tokensAmount = amount / pricePerToken;
      
      const impact = amount * 100;
      const newCap = activeTab === "buy" ? token.marketCap + impact : Math.max(1000, token.marketCap - impact);
      const newProg = Math.min(100, (newCap / 100000) * 100);
      
      // Update token market cap
      await updateDoc(doc(db, "tokens", tokenId), {
        marketCap: newCap,
        bondingCurveProgress: newProg,
        totalSupply: (token.totalSupply || 1000000) + (activeTab === "buy" ? tokensAmount : -tokensAmount),
      });
      
      // Add trade to history
      await addDoc(collection(db, "tokens", tokenId, "trades"), {
        type: activeTab,
        amountSol: amount,
        tokensAmount: tokensAmount,
        pricePerToken: pricePerToken,
        timestamp: serverTimestamp(),
        userAddress: currentUserAddress,
      });
      
      // Update holder information
      const holderRef = doc(db, "tokens", tokenId, "holders", currentUserAddress);
      const holderSnap = await getDoc(holderRef);
      
      if (holderSnap.exists()) {
        const currentData = holderSnap.data();
        const newTokensHeld = activeTab === "buy" 
          ? currentData.tokensHeld + tokensAmount 
          : Math.max(0, currentData.tokensHeld - tokensAmount);
        const newTotalInvested = activeTab === "buy"
          ? currentData.totalInvested + amount
          : Math.max(0, currentData.totalInvested - amount);
        
        await updateDoc(holderRef, {
          tokensHeld: newTokensHeld,
          totalInvested: newTotalInvested,
        });
      } else if (activeTab === "buy") {
        await setDoc(holderRef, {
          userAddress: currentUserAddress,
          tokensHeld: tokensAmount,
          totalInvested: amount,
          percentage: 0, // Will be calculated below
        });
      }
      
      // Recalculate all holders percentages
      const holdersSnap = await getDocs(collection(db, "tokens", tokenId, "holders"));
      let totalTokens = 0;
      holdersSnap.forEach((doc) => {
        totalTokens += doc.data().tokensHeld;
      });
      
      // Update percentages
      holdersSnap.forEach(async (holderDoc) => {
        const percentage = (holderDoc.data().tokensHeld / totalTokens) * 100;
        await updateDoc(doc(db, "tokens", tokenId, "holders", holderDoc.id), {
          percentage: percentage,
        });
      });
      
      setTradeAmount("");
      setProcessing(false);
    } catch (e) {
      console.error("Trade error:", e);
      alert("Trade failed: " + (e instanceof Error ? e.message : "Unknown error"));
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
                  <div key={t.id} className="border-b border-matrix-green/10 pb-2">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        {t.type === "buy" ? (
                          <TrendingUp className="w-4 h-4 text-matrix-green" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={t.type === "buy" ? "text-matrix-green font-bold" : "text-red-500 font-bold"}>
                          {t.type.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-bold">{t.amountSol} SOL</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{t.tokensAmount?.toLocaleString(undefined, {maximumFractionDigits: 2})} {token.ticker}</span>
                      <span className="font-mono">{t.userAddress?.slice(0, 8)}...</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-matrix-green mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Holder Distribution ({holders.length})
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {holders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No holders yet</p>
              ) : (
                holders.map((holder, index) => (
                  <div key={holder.id} className="bg-black/50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-matrix-green font-bold">#{index + 1}</span>
                        <span className="font-mono text-sm text-gray-400">
                          {holder.userAddress.slice(0, 12)}...
                        </span>
                      </div>
                      <span className="text-matrix-green font-bold">
                        {holder.percentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Tokens Held</p>
                        <p className="font-bold">{holder.tokensHeld.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Invested</p>
                        <p className="font-bold">{holder.totalInvested.toFixed(2)} SOL</p>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-black rounded-full h-2">
                      <div
                        className="bg-matrix-green h-full rounded-full transition-all"
                        style={{ width: `${holder.percentage}%` }}
                      />
                    </div>
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

              {tradeAmount && parseFloat(tradeAmount) > 0 && (
                <div className="bg-black/50 p-3 rounded-lg text-sm">
                  <p className="text-gray-400">You will {activeTab === "buy" ? "receive" : "sell"}:</p>
                  <p className="text-matrix-green font-bold text-lg">
                    {(() => {
                      const basePrice = 0.0001;
                      const priceMultiplier = 1 + ((token?.bondingCurveProgress || 0) / 100);
                      const pricePerToken = basePrice * priceMultiplier;
                      const tokensAmount = parseFloat(tradeAmount) / pricePerToken;
                      return tokensAmount.toLocaleString(undefined, {maximumFractionDigits: 2});
                    })()} {token.ticker}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Current price: {(() => {
                      const basePrice = 0.0001;
                      const priceMultiplier = 1 + ((token?.bondingCurveProgress || 0) / 100);
                      return (basePrice * priceMultiplier).toFixed(6);
                    })()} SOL per token
                  </p>
                </div>
              )}

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

              <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg">
                <p className="text-xs text-blue-400">
                  <span className="font-bold">Your Address:</span>
                  <br />
                  <span className="font-mono">{currentUserAddress}</span>
                </p>
              </div>

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