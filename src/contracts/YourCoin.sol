// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title YourCoin
 * @dev ERC20 Token with minting and pausing capabilities
 * Symbol: YRC
 * Decimals: 18
 * 
 * Features:
 * - Only owner can mint new tokens
 * - Burnable by token holders
 * - ERC20Permit for gasless approvals
 * 
 * Deploy this contract using Remix IDE or Hardhat
 * Network: Polygon Amoy Testnet or Polygon Mainnet
 */
contract YourCoin is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    bool public paused;
    
    event Paused(address account);
    event Unpaused(address account);
    
    constructor(address initialOwner)
        ERC20("YourCoin", "YRC")
        Ownable(initialOwner)
        ERC20Permit("YourCoin")
    {
        paused = false;
        // Mint initial supply to owner (1 million tokens)
        _mint(initialOwner, 1000000 * 10 ** decimals());
    }

    /**
     * @dev Modifier to check if contract is not paused
     */
    modifier whenNotPaused() {
        require(!paused, "YourCoin: token transfer while paused");
        _;
    }

    /**
     * @dev Pause token transfers
     * Can only be called by the owner
     */
    function pause() public onlyOwner {
        paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Unpause token transfers
     * Can only be called by the owner
     */
    function unpause() public onlyOwner {
        paused = false;
        emit Unpaused(_msgSender());
    }

    /**
     * @dev Mint new tokens
     * Can only be called by the owner
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Override transfer function to include pause check
     */
    function _update(address from, address to, uint256 value)
        internal
        override
        whenNotPaused
    {
        super._update(from, to, value);
    }

    /**
     * @dev Batch mint tokens to multiple addresses
     * Useful for airdrops or initial distribution
     * @param recipients Array of addresses to receive tokens
     * @param amounts Array of amounts to mint (must match recipients length)
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) 
        external 
        onlyOwner 
    {
        require(recipients.length == amounts.length, "YourCoin: arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }
}

/**
 * DEPLOYMENT GUIDE:
 * 
 * 1. Install dependencies (if using Hardhat):
 *    npm install @openzeppelin/contracts
 * 
 * 2. Using Remix IDE (easiest method):
 *    a. Go to https://remix.ethereum.org
 *    b. Create new file: YourCoin.sol
 *    c. Paste this code
 *    d. Compile with Solidity 0.8.20+
 *    e. Deploy:
 *       - Connect MetaMask to Polygon Amoy testnet
 *       - Select "Injected Provider - MetaMask"
 *       - Enter your wallet address as initialOwner
 *       - Click "Deploy"
 *    f. Copy the deployed contract address
 * 
 * 3. Verify on PolygonScan:
 *    - Go to https://amoy.polygonscan.com
 *    - Find your contract
 *    - Click "Verify and Publish"
 *    - Use Solidity 0.8.20, optimization enabled
 * 
 * 4. Add liquidity on QuickSwap:
 *    - Go to https://quickswap.exchange
 *    - Create a YRC/USDC pool
 *    - Add initial liquidity
 * 
 * 5. Update your frontend:
 *    - Replace contract address in Home.tsx
 *    - Update token symbol from "YOUR" to "YRC"
 */