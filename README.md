## Hardhat介绍

> 面向专业人士的以太坊开发环境

[hardhat-tutorial](https://hardhat.org/tutorial)


## 安装Hardhat框架

安装nvm
```bash
brew install nvm
```
~/.zshrc添加nvm配置
```shell
# NVM CONFIG

export NVM_DIR="$HOME/.nvm"
	[ -s "/usr/local/opt/nvm/nvm.sh" ] && \. "/usr/local/opt/nvm/nvm.sh" # This loads nvm
	[ -s "/usr/local/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/usr/local/opt/nvm/etc/bash_completion.d/nvm" # This loads nvm bash_completion
```

source ~/.zshrc

安装node20
```bash
nvm install 20
nvm use 20
nvm alias default 20
npm install npm --global # Upgrade npm to the latest version
```

## 创建Hardhat示例项目

创建空白项目目录
```bash
mkdir hardhat-tutorial
cd hardhat-tutorial
```

安装hardhat及hardhat-toolbox
```
npm install --save-dev hardhat
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

初始化hardhat项目-创建空的hardhat项目

```bash
npx hardhat init
888    888                      888 888               888
888    888                      888 888               888
888    888                      888 888               888
8888888888  8888b.  888d888 .d88888 88888b.   8888b.  888888
888    888     "88b 888P"  d88" 888 888 "88b     "88b 888
888    888 .d888888 888    888  888 888  888 .d888888 888
888    888 888  888 888    Y88b 888 888  888 888  888 Y88b.
888    888 "Y888888 888     "Y88888 888  888 "Y888888  "Y888

👷 Welcome to Hardhat v2.19.4 👷‍

? What do you want to do? …
  Create a JavaScript project
  Create a TypeScript project
   Create a TypeScript project (with Viem)
❯ Create an empty hardhat.config.js
  Quit
```

修改hardhat.config.js，添加`require("@nomicfoundation/hardhat-toolbox");`
```js
/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
};
```

使用vscode打开项目

### 项目结构

## 部署合约

创建合约目录
```bash
$ mkdir contracts
```
新建合约contracts/Token.sol

```solidity
//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;


// This is the main building block for smart contracts.
contract Token {
    // Some string type variables to identify the token.
    string public name = "My Hardhat Token";
    string public symbol = "MHT";

    // The fixed amount of tokens, stored in an unsigned integer type variable.
    uint256 public totalSupply = 1000000;

    // An address type variable is used to store ethereum accounts.
    address public owner;

    // A mapping is a key/value map. Here we store each account's balance.
    mapping(address => uint256) balances;

    // The Transfer event helps off-chain applications understand
    // what happens within your contract.
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    /**
     * Contract initialization.
     */
    constructor() {
        // The totalSupply is assigned to the transaction sender, which is the
        // account that is deploying the contract.
        balances[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    /**
     * A function to transfer tokens.
     *
     * The `external` modifier makes a function *only* callable from *outside*
     * the contract.
     */
    function transfer(address to, uint256 amount) external {
        // Check if the transaction sender has enough tokens.
        // If `require`'s first argument evaluates to `false` then the
        // transaction will revert.
        require(balances[msg.sender] >= amount, "Not enough tokens");

        // Transfer the amount.
        balances[msg.sender] -= amount;
        balances[to] += amount;

        // Notify off-chain applications of the transfer.
        emit Transfer(msg.sender, to, amount);
    }

    /**
     * Read only function to retrieve the token balance of a given account.
     *
     * The `view` modifier indicates that it doesn't modify the contract's
     * state, which allows us to call it without executing a transaction.
     */
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}
```
编译合约（在项目根目录下执行）
```
$ npx hardhat compile
```
> 编译后在项目根目录下生成cache及artifacts目录

### 部署合约
新建scripts目录及scripts/deploy.js文件
```bash
$ mkdir scripts
$ touch scripts/deploy.js
```

编写部署脚本
```js
// deploy.js
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  const token = await ethers.deployContract("Token");
  console.log("Token address:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

启动本地节点（新建一个终端窗口）
```bash
$ npx hardhat node
```

本地部署
```bash
$ npx hardhat run scripts/deploy.js --network localhost

Deploying contracts with the account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Token address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

查看`npx hardhat node`终端输出
```bash
eth_accounts
hardhat_metadata (20)
eth_blockNumber
eth_getBlockByNumber
eth_feeHistory
eth_sendTransaction
  Contract deployment: Token
  Contract address:    0x5fbdb2315678afecb367f032d93f642f64180aa3
  Transaction:         0x824cff7f7ff0c8dbfdc70f92ea53099d0836ab77ade9ed604f0a2504bea91763
  From:                0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  Value:               0 ETH
  Gas used:            620798 of 30000000
  Block #1:            0x11f3174556629f438058c51d18a150b4e8e963ceeeda285d82e5867fe13eb0cb

eth_getTransactionByHash
eth_getTransactionReceipt
eth_blockNumber
```

## 测试合约

创建test子目录
```bash
mkdir test
```

创建测试文件test/Token.js

```js
const { expect } = require("chai");

describe("Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();
	// 部署合约
    const hardhatToken = await ethers.deployContract("Token");
	// 调用合约balanceOf方法
    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    // 断言
    expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  });
});

```

执行测试
```bash
npx hardhat test --network localhost
```

查看`npx hardhat node`终端输出
```bash
eth_accounts
hardhat_metadata (20)
eth_accounts
hardhat_metadata (20)
eth_blockNumber
eth_getBlockByNumber
eth_feeHistory
eth_sendTransaction
  Contract deployment: Token
  Contract address:    0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9
  Transaction:         0x5fb5e85cb1f6f87b65fe1c8eeb72bf8f6151fbcc7b533bfa7064fea730f91260
  From:                0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  Value:               0 ETH
  Gas used:            620798 of 30000000
  Block #2:            0x4ac3cabd8d59f0117e7fbb0c80a86461f3198583768300f608afad13cde7667f

eth_getTransactionByHash
eth_call
  Contract call:       Token#balanceOf
  From:                0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  To:                  0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9

eth_call
  Contract call:       Token#totalSupply
  From:                0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  To:                  0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9
```

## 生成trace

复制上面的Transaction交易Id，在项目根目录执行
```bash
curl localhost:8545 \
   -X POST \
   -H "Content-Type: application/json" \
   --data '{"method":"debug_traceTransaction","params":["0x09d01b7d053602de4fe5c73e06a823c6e8134e0801eb64b2456f0bd7e59bdafd"], "id":1,"jsonrpc":"2.0"}' > output.json
```

在项目根目录下新建tool.js
```js
const fs = require('fs');

let rawdata = fs.readFileSync('output.json');
let result = JSON.parse(rawdata);
let data = '';
for (let i = 0; i < result.result.structLogs.length; i++) {
    let line = JSON.stringify(result.result.structLogs[i]);
    data = data + line +'\n';
}
fs.writeFileSync('trace.jsonl', data);
```

执行tool.js 生成 trace.jsonl
```bash
node tool.js
```