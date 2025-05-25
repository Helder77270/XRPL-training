# XRPL React Frontend

A React-based frontend application for interacting with the XRP Ledger. This project demonstrates how to connect to XRPL, manage wallets, and create escrow transactions.

## Features

- XRPL Wallet Connection
- Escrow Transaction Creation
- Modern UI with Tailwind CSS
- TypeScript Support

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Getting Started

1. Clone the repository:
```bash
git clone <your-repository-url>
cd my-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your XRPL node URL:
```env
VITE_APP_XRPL_RPC_URL=wss://s.altnet.rippletest.net:51233/
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
my-app/
├── src/
│   ├── assets/
│   │   ├── components/
│   │   │   └── XRPLComponent.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── label.tsx
│   ├── App.tsx
│   └── main.tsx
├── .env
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
