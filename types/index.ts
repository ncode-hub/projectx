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
}

export interface Trade {
  id?: string;
  type: "buy" | "sell";
  amountSol: number;
  timestamp: any;
  userAddress?: string;
}

export interface Comment {
  id?: string;
  text: string;
  userAddress: string;
  timestamp: any;
}

