import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Client, Wallet, xrpToDrops } from 'xrpl';
import type { EscrowCreate } from 'xrpl/dist/npm/models/transactions';

// UI components
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

// Context type
interface XRPLContextType {
  client: Client | null;
  wallet: Wallet | null;
  setWallet: (wallet: Wallet) => void;
}

// Create context
const XRPLContext = React.createContext<XRPLContextType | undefined>(undefined);

// Provider props
interface XRPLProviderProps {
  children: ReactNode;
}

// Add type for change event
type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

// XRPLProvider component
export const XRPLProvider: React.FC<XRPLProviderProps> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initClient = async () => {
      try {
        setIsConnecting(true);
        if (!import.meta.env.VITE_APP_XRPL_RPC_URL) {
          throw new Error('XRPL RPC URL not configured. Please check your .env file.');
        }
        const c = new Client(import.meta.env.VITE_APP_XRPL_RPC_URL);
        await c.connect();
        setClient(c);
        setError(null);
      } catch (err: any) {
        setError(`Failed to connect: ${err.message}`);
        console.error("Failed to connect to XRPL:", err);
      } finally {
        setIsConnecting(false);
      }
    };

    initClient();
    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, []);

  if (isConnecting) {
    return (
      <Card className="max-w-md mx-auto mt-6">
        <CardContent className="py-4">
          <div className="text-center">
            <p>Connecting to XRPL Testnet...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-6">
        <CardContent className="py-4">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <XRPLContext.Provider value={{ client, wallet, setWallet }}>
      {children}
    </XRPLContext.Provider>
  );
};



// ConnectWallet component
export const ConnectWallet: React.FC<{}> = () => {
  const context = React.useContext(XRPLContext);
  if (!context) throw new Error('ConnectWallet must be used within XRPLProvider');

  const { wallet, setWallet } = context;
  const [seed, setSeed] = useState('');
  const [error, setError] = useState<string | null>(null);

  const connectWallet = () => {
    try {
      const w = Wallet.fromSeed(seed);
      setWallet(w);
      setError(null);
    } catch {
      setError('Invalid seed');
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-6">
      <CardHeader>
        <CardTitle>Connect XRPL Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {wallet ? (
          <div>
            <p className="font-medium">Connected Address:</p>
            <p className="text-sm text-gray-700 truncate">{wallet.address}</p>
          </div>
        ) : (
          <>
            <div>
              <Label htmlFor="seed">Wallet Seed</Label>
              <Input
                id="seed"
                value={seed}
                onChange={(e: ChangeEvent) => setSeed(e.target.value)}
                placeholder="s████████████████████████████"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={connectWallet}>Connect</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// EscrowTransaction component
export const EscrowTransaction: React.FC<{}> = () => {
  const context = React.useContext(XRPLContext);
  if (!context) throw new Error('EscrowTransaction must be used within XRPLProvider');

  const { client, wallet } = context;
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [cancelAfter, setCancelAfter] = useState('');
  const [finishAfter, setFinishAfter] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const validateAmount = (value: string) => {
    // Allow only numbers and decimal point
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value) || value === '') {
      setAmount(value);
    }
  };

  const createEscrow = async () => {
    if (!client || !wallet) {
      setStatus('Client or wallet not initialized');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setStatus('Please enter a valid amount');
      return;
    }

    try {
      const drops = xrpToDrops(amount);
      const currentTime = Math.floor(Date.now() / 1000);
      
      const tx: EscrowCreate = {
        TransactionType: 'EscrowCreate',
        Account: wallet.address,
        Amount: drops,
        Destination: destination,
        CancelAfter: currentTime + parseInt(cancelAfter, 10),
        FinishAfter: currentTime + parseInt(finishAfter, 10)
      };

      const prepared = await client.autofill(tx);
      const signed = wallet.sign(prepared);
      const res = await client.submitAndWait(signed.tx_blob);
      const meta = res.result.meta;
      const result = typeof meta === 'object' && meta ? meta.TransactionResult : 'Unknown';
      setTxHash(res.result.hash);
      setStatus(`Result: ${result}`);
    } catch (e: any) {
      setStatus(`Error: ${e.data?.result?.engine_result || e.message}`);
      setTxHash(null);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-6">
      <CardHeader>
        <CardTitle>Create Escrow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="destination">Destination Address</Label>
          <Input
            id="destination"
            value={destination}
            onChange={(e: ChangeEvent) => setDestination(e.target.value)}
            placeholder="rDESTINATION..."
          />
        </div>
        <div>
          <Label htmlFor="amount">Amount (XRP)</Label>
          <Input
            id="amount"
            value={amount}
            onChange={(e: ChangeEvent) => setAmount(e.target.value)}
            placeholder="10"
          />
        </div>
        <div>
          <Label htmlFor="finishAfter">Finish After (seconds)</Label>
          <Input
            id="finishAfter"
            value={finishAfter}
            onChange={(e: ChangeEvent) => setFinishAfter(e.target.value)}
            placeholder="1800"
          />
          <p className="text-sm text-gray-500 mt-1">Time before escrow can be finished (e.g., 1800 for 30 minutes)</p>
        </div>
        <div>
          <Label htmlFor="cancelAfter">Cancel After (seconds)</Label>
          <Input
            id="cancelAfter"
            value={cancelAfter}
            onChange={(e: ChangeEvent) => setCancelAfter(e.target.value)}
            placeholder="3600"
          />
          <p className="text-sm text-gray-500 mt-1">Time after which escrow can be cancelled (e.g., 3600 for 1 hour)</p>
        </div>
        <Button onClick={createEscrow} disabled={!client || !wallet || !amount || !destination || !finishAfter}>
          Create Escrow
        </Button>
        {status && (
          <div className="mt-4 space-y-2">
            <p className="text-sm">{status}</p>
            {txHash && (
              <a
                href={`https://testnet.xrpl.org/transactions/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-600 underline"
              >
                View on XRPL Testnet Explorer
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// TestnetWallet component
export const TestnetWallet: React.FC<{}> = () => {
  const context = React.useContext(XRPLContext);
  if (!context) throw new Error('TestnetWallet must be used within XRPLProvider');

  const { client, setWallet } = context;
  const [status, setStatus] = useState<string | null>(null);

  const generateWallet = async () => {
    if (!client) {
      setStatus('Client not initialized');
      return;
    }

    try {
      setStatus('Generating wallet...');
      // Generate a new wallet
      const fund_result = await client.fundWallet();
      const new_wallet = fund_result.wallet;
      
      // Set the wallet in context
      setWallet(new_wallet);
      
      setStatus(`Wallet generated and funded!\nAddress: ${new_wallet.address}\nSeed: ${new_wallet.seed}\nBalance: ${fund_result.balance} XRP`);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-6">
      <CardHeader>
        <CardTitle>Generate Testnet Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={generateWallet} 
          disabled={!client}
          className="w-full"
        >
          Generate New Testnet Wallet
        </Button>
        {status && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
            <pre className="text-sm">{status}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main component that combines all XRPL components
export const MainXRPLComponent: React.FC = () => {
  return (
    <XRPLProvider>
      <div className="container mx-auto p-4 space-y-6">
        <TestnetWallet />
        <ConnectWallet />
        <EscrowTransaction />
      </div>
    </XRPLProvider>
  );
};
