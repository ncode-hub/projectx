export interface Token {
  id: string;
  name: string;
  ticker: string;
  description: string;
  imageUrl: string;
  creatorAddress: string;
  marketCap: number;
  bondingCurveProgress: number;
  createdAt: any;
  totalSupply?: number;
}

export interface Trade {
  id?: string;
  type: "buy" | "sell";
  amountSol: number;
  tokensAmount?: number;
  pricePerToken?: number;
  timestamp: any;
  userAddress?: string;
}

export interface Comment {
  id?: string;
  text: string;
  userAddress: string;
  timestamp: any;
}

export interface Holder {
  id?: string;
  userAddress: string;
  tokensHeld: number;
  percentage: number;
  totalInvested: number;
}

