import Express from "express";
import cors from "cors";
import cla from "command-line-args";
import {
  AlphaRouter,
  ChainId,
  CurrencyAmount,
  V3Route,
} from "@uniswap/smart-order-router";
import BN from "bignumber.js";
import config from "./config";
import { ethers } from "ethers";
import { Token, TradeType } from "@uniswap/sdk-core";
import { Protocol } from "@uniswap/router-sdk";
import { Cache } from "./cache";

const { port } = cla([
  { name: "port", alias: "p", type: Number, defaultValue: 8080 },
]);
const networks = Object.keys(config.node).map((network) => Number(network));
function isNetwork(
  network: any
): network is ChainId & keyof typeof config.node {
  return !Number.isNaN(Number(network)) && networks.includes(network);
}
function isURL(v: string) {
  try {
    new URL(v);
    return true;
  } catch (err) {
    return false;
  }
}

const cache = new Cache();
Express()
  .use(cors())
  .get("/:network", async (req, res) => {
    const network = Number(req.params.network);
    if (!isNetwork(network)) {
      return res.status(400).send("Invalid network");
    }
    if (!isURL(config.node[network])) {
      return res.status(400).send("Network not supported");
    }

    const { inTokenAddress, inDecimals, outTokenAddress, outDecimals, amount } =
      {
        inTokenAddress: String(req.query.inToken),
        inDecimals: Number(String(req.query.inDecimals)),
        outTokenAddress: String(req.query.outToken),
        outDecimals: Number(String(req.query.outDecimals)),
        amount: String(req.query.amount),
      };
    if (!ethers.utils.isAddress(inTokenAddress)) {
      return res.status(400).send("Invalid inToken address");
    }
    if (Number.isNaN(inDecimals) || inDecimals === 0) {
      return res.status(400).send("Invalid inDecimals");
    }
    if (!ethers.utils.isAddress(outTokenAddress)) {
      return res.status(400).send("Invalid outToken address");
    }
    if (Number.isNaN(outDecimals) || outDecimals === 0) {
      return res.status(400).send("Invalid outDecimals");
    }
    if (new BN(amount).isNaN() || new BN(amount).eq(0)) {
      return res.status(400).send("Invalid amount");
    }

    const cacheKey = `${network}:${inTokenAddress}:${outTokenAddress}:${amount}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    try {
      const router = new AlphaRouter({
        chainId: network,
        provider: new ethers.providers.JsonRpcProvider(
          config.node[network],
          network
        ),
      });
      const route = await router.route(
        CurrencyAmount.fromRawAmount(
          new Token(network, inTokenAddress, inDecimals),
          new BN(amount).multipliedBy(`1e${inDecimals}`).toFixed(0)
        ),
        new Token(network, outTokenAddress, outDecimals),
        TradeType.EXACT_INPUT,
        undefined,
        { protocols: [Protocol.V3] }
      );
      if (route === null || route.route.length === 0) {
        return res.json([]);
      }

      const { pools, tokenPath } = route.route[0].route as V3Route;
      const path = tokenPath
        .slice(1)
        .reduce(
          (path: Array<string | number>, token, i) => [
            ...path,
            pools[i].fee,
            token.address,
          ],
          [tokenPath[0].address]
        );
      cache.set(cacheKey, JSON.stringify(path), config.cache.ttl);

      return res.json(path);
    } catch (e) {
      console.error(`Error: ${e}`);
      return res.json([]);
    }
  })
  .listen(port, () => console.log(`Listen 127.0.0.1:${port}`));

setInterval(() => cache.clear(), Cache.TICK * 1000);

process.on("SIGINT", () => {
  console.info("Exit");
  process.exit(0);
});
