"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Upload, Rocket } from "lucide-react";

export default function CreateTokenPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    description: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if Firebase is configured
    console.log("Firebase DB initialized:", !!db);
    console.log("Firebase config:", {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", formData);
    setLoading(true);
    setError("");

    try {
      // Use the preview URL (base64) instead of uploading to Firebase Storage
      const imageUrl = imagePreview || "";

      console.log("Creating token document...");
      
      // Add timeout to prevent infinite loading
      const createTokenPromise = addDoc(collection(db, "tokens"), {
        name: formData.name,
        ticker: formData.ticker.toUpperCase(),
        description: formData.description,
        imageUrl,
        creatorAddress: "MOCK_ADDRESS_" + Math.random().toString(36).substring(7),
        marketCap: 5000,
        bondingCurveProgress: 0,
        createdAt: serverTimestamp(),
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - Firestore may not be enabled')), 10000)
      );

      const docRef = await Promise.race([createTokenPromise, timeoutPromise]);

      console.log("Token created, redirecting to:", docRef.id);
      router.push(`/token/${docRef.id}`);
    } catch (err) {
      console.error("Error creating token:", err);
      setError(`Failed to create token: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-matrix-green mb-2 flex items-center gap-3">
          <Rocket className="w-10 h-10" />
          Launch Your Token
        </h1>
        <p className="text-gray-400">
          Fill in the details below to launch your token on the bonding curve
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-semibold text-matrix-green mb-2">
            Token Image
          </label>
          <div className="flex items-center gap-4">
            {imagePreview && (
              <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-matrix-green/50">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <label className="flex-1 cursor-pointer">
              <div className="border-2 border-dashed border-matrix-green/30 rounded-lg p-6 hover:border-matrix-green/60 transition-all text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-matrix-green" />
                <p className="text-sm text-gray-400">
                  {image ? image.name : "Click to upload image"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-matrix-green mb-2">
            Token Name *
          </label>
          <input
            type="text"
            required
            maxLength={32}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Solana Doge"
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-matrix-green mb-2">
            Token Ticker *
          </label>
          <input
            type="text"
            required
            maxLength={10}
            value={formData.ticker}
            onChange={(e) =>
              setFormData({ ...formData, ticker: e.target.value.toUpperCase() })
            }
            placeholder="e.g., SDOGE"
            className="input uppercase"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-matrix-green mb-2">
            Description *
          </label>
          <textarea
            required
            maxLength={500}
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Tell the world about your token..."
            className="input resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/500 characters
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
            <p className="font-bold mb-2">Error:</p>
            <p>{error}</p>
            {error.includes('timeout') && (
              <div className="mt-3 text-sm">
                <p className="font-bold mb-1">Possible solutions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Enable Firestore Database in Firebase Console</li>
                  <li>Set Firestore rules to allow read/write in test mode</li>
                  <li>Check your internet connection</li>
                  <li>Verify Firebase configuration in .env.local</li>
                </ul>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />
              Launching...
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              Launch Token
            </>
          )}
        </button>
      </form>

      <div className="mt-8 card bg-black/50">
        <h3 className="text-matrix-green font-bold mb-2">How it works:</h3>
        <ul className="text-sm text-gray-400 space-y-2">
          <li>- Your token starts with 5000 SOL market cap</li>
          <li>- Trading happens on a bonding curve</li>
          <li>- When the curve reaches 100%, liquidity migrates to Raydium</li>
          <li>- Creator fee: 1% of all trades</li>
        </ul>
      </div>
    </div>
  );
}
