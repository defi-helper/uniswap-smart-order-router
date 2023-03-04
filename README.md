# Config
Create `configuration/.env` file with:

```
NODE_ETH="https://..."
NODE_GOERLI="https://..."
NODE_BSC="https://..."
NODE_POLYGON="https://..."
NODE_OPTIMISTIC="https://..."
CACHE_TTL=360
```

# Build
* `docker build -t uniswap-router .`

# Start
* `docker run -d -p 80:80 --name uniswap-router uniswap-router`

# Use
* `curl -X GET "http://localhost:80/5?inToken=0xafd2Dfb918777d9bCC29E315C4Df4551208DBE82&inDecimals=18&outToken=0x57f6d7137B4b535971cC832dE0FDDfE535A4DB22&outDecimals=18&amount=5"`