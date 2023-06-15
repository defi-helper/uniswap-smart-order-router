import dotenv from "dotenv";
dotenv.config({ path: "./configuration/.env" });

export default {
  node: {
    1: process.env.NODE_ETH,
    5: process.env.NODE_GOERLI,
    10: process.env.NODE_OPTIMISTIC,
    56: process.env.NODE_BSC,
    137: process.env.NODE_POLYGON,
    42161: process.env.NODE_ARBITRUM,
  },
  cache: {
    ttl: Number(process.env.CACHE_TTL ?? "6"),
  },
};
