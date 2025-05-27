# XRPL React Frontend Application

This application provides a user interface for interacting with the XRP Ledger (XRPL) on the testnet. It includes functionality for wallet management and escrow transactions.

## Features

- 🔐 Wallet Management
  - Generate new testnet wallets with funded XRP
  - Connect existing wallets using seeds
  - View wallet balances in real-time
  
- 💰 Escrow Transactions
  - Create time-based escrow transactions
  - Set finish and cancel conditions
  - View transaction results on XRPL Testnet Explorer

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A modern web browser

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd my-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure the environment:
Edit `.env` and set your XRPL testnet URL:
```
VITE_APP_XRPL_RPC_URL=wss://s.altnet.rippletest.net:51233
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Component Documentation

### XRPLProvider

The core context provider that manages the XRPL client connection and wallet state.

```typescript
interface XRPLContextType {
  client: Client | null;
  wallet: Wallet | null;
  setWallet: (wallet: Wallet) => void;
}
```

#### Features:
- Automatic connection to XRPL network
- Connection status management
- Error handling
- Wallet state management

### TestnetWallet Component

Allows users to generate new testnet wallets with funded XRP.

#### Features:
- One-click wallet generation
- Automatic funding through testnet faucet
- Displays wallet address, seed, and initial balance
- Automatically connects generated wallet

### ConnectWallet Component

Enables users to connect existing wallets using their seeds.

#### Features:
- Secure wallet connection using seeds
- Real-time balance display
- Balance auto-refresh
- Manual balance refresh option
- Error handling for invalid seeds

### EscrowTransaction Component

Facilitates the creation of escrow transactions on the XRPL.

#### Features:
- Create time-locked escrow transactions
- Set destination address
- Specify XRP amount
- Configure finish and cancel conditions
- Transaction result display
- Direct link to transaction explorer

#### Transaction Parameters:
- `destination`: Recipient's XRPL address
- `amount`: Amount in XRP
- `finishAfter`: Time before escrow can be finished (in seconds)
- `cancelAfter`: Time after which escrow can be cancelled (in seconds)

## Usage Examples

### Generating a Test Wallet

1. Click "Generate New Testnet Wallet"
2. Wait for the wallet to be funded
3. Save the displayed seed for future use

### Connecting an Existing Wallet

1. Input your wallet seed
2. Click "Connect"
3. View your wallet address and balance

### Creating an Escrow

1. Connect a wallet
2. Navigate to the Escrow section
3. Enter recipient's address
4. Specify amount in XRP
5. Set finish and cancel times
6. Click "Create Escrow"
7. View transaction result and explorer link

## Security Considerations

- Never use testnet seeds on mainnet
- Keep wallet seeds secure and private
- Verify transaction details before submitting
- Test with small amounts first

## Development

### Project Structure

```
my-app/
├── src/
│   ├── assets/
│   │   ├── components/
│   │   │   └── XRPLComponent.tsx    # Main XRPL components
│   │   └── ui/                      # UI components
│   ├── App.tsx                      # Main application component
│   └── main.tsx                     # Application entry point
├── .env.example                     # Environment template
└── README.md                        # Documentation
```

### Adding New Features

1. Extend the XRPLContext if needed
2. Create new components in the components directory
3. Add UI components in the ui directory
4. Update documentation

## Troubleshooting

Common issues and solutions:

1. Connection Issues
   - Verify XRPL testnet URL in .env
   - Check network connectivity
   - Ensure WebSocket support

2. Transaction Failures
   - Verify wallet has sufficient balance
   - Check transaction parameters
   - Ensure valid destination address

3. Balance Not Updating
   - Click refresh balance
   - Check network connectivity
   - Verify account exists on network

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the GNU General Public License v3.0 (GPLv3) - see the [LICENSE](LICENSE) file for details.

### What this means:

✅ You CAN:
- Use this code for personal and commercial purposes
- Modify the code
- Distribute the code

⚠️ You MUST:
- Use the same GPLv3 license for any derivatives
- State changes you made to the code
- Disclose the source code of any derivatives
- Include the original copyright notice

❌ You CANNOT:
- Create closed-source versions
- Sublicense the code
- Hold the author liable

This ensures that any modifications or derivatives of this project must also remain open-source and freely available to the community.

## Acknowledgments

- XRPL.js Documentation
- React Documentation
- Vite
- Tailwind CSS
