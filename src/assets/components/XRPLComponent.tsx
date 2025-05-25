import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Client, Wallet, xrpToDrops } from 'xrpl';

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

  useEffect(() => {
    const initClient = async () => {
      const c = new Client(import.meta.env.VITE_APP_XRPL_RPC_URL!);
      await c.connect();
      setClient(c);
    };
    initClient();
    return () => {
      client?.disconnect();
    };
  }, []);

  return (
    <XRPLContext.Provider value={{ client, wallet, setWallet }}>
      {children}
    </XRPLContext.Provider>
  );
};

// ConnectWallet component
export const ConnectWallet: React.FC = () => {
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
export const EscrowTransaction: React.FC = () => {
  const context = React.useContext(XRPLContext);
  if (!context) throw new Error('EscrowTransaction must be used within XRPLProvider');

  const { client, wallet } = context;
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [cancelAfter, setCancelAfter] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const createEscrow = async () => {
    if (!client || !wallet) {
      setStatus('Client or wallet not initialized');
      return;
    }
    try {
      const tx = {
        TransactionType: 'EscrowCreate',
        Account: wallet.address,
        Amount: xrpToDrops(amount),
        Destination: destination,
        CancelAfter: Math.floor(Date.now() / 1000) + parseInt(cancelAfter, 10),
      } as any;
      const { tx_json } = await client.autofill(tx);
      const signed = wallet.sign(tx_json);
      const res = await client.submitAndWait(signed.tx_blob);
      const meta = res.result.meta;
      const result = typeof meta === 'object' && meta ? meta.TransactionResult : 'Unknown';
      setStatus(`Result: ${result}`);
    } catch (e: any) {
      setStatus(`Error: ${e.data?.result?.engine_result || e.message}`);
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
          <Label htmlFor="cancelAfter">Cancel After (seconds)</Label>
          <Input
            id="cancelAfter"
            value={cancelAfter}
            onChange={(e: ChangeEvent) => setCancelAfter(e.target.value)}
            placeholder="3600"
          />
        </div>
        <Button onClick={createEscrow} disabled={!client || !wallet}>
          Create Escrow
        </Button>
        {status && <p className="text-sm mt-2">{status}</p>}
      </CardContent>
    </Card>
  );
};
