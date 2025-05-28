// src/components/xrpl/XRPLComponents.tsx
import '../../styles/web3.css';
import React, { useState, useEffect } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { Client, Wallet, xrpToDrops } from 'xrpl';
import type { EscrowCreate } from 'xrpl/dist/npm/models/transactions';

// Context type
interface XRPLContextType {
  client: Client | null;
  wallet: Wallet | null;
  setWallet: (wallet: Wallet | null) => void;
}
const XRPLContext = React.createContext<XRPLContextType | undefined>(undefined);

interface XRPLProviderProps { children: ReactNode }
export const XRPLProvider: React.FC<XRPLProviderProps> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const url = import.meta.env.VITE_APP_XRPL_RPC_URL!;
        const c = new Client(url);
        await c.connect();
        setClient(c);
      } catch (e: any) {
        setError(`Failed to connect: ${e.message}`);
      } finally {
        setLoading(false);
      }
    })();
    return () => { client?.disconnect(); };
  }, []);

  if (loading) {
    return (
      <div className="web3-card">
        <div className="loader" />
        <p className="web3-label neon-text text-center">Connecting to XRPL Testnet...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="web3-card">
        <p className="web3-label" style={{ color: 'var(--color-accent)' }}>{error}</p>
      </div>
    );
  }
  return (
    <XRPLContext.Provider value={{ client, wallet, setWallet }}>
      {children}
    </XRPLContext.Provider>
  );
};

// ConnectWallet
export const ConnectWallet: React.FC = () => {
  const ctx = React.useContext(XRPLContext);
  if (!ctx) throw new Error('Used outside XRPLProvider');
  const { wallet, setWallet } = ctx;
  const [seed, setSeed] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const connect = () => {
    try {
      setWallet(Wallet.fromSeed(seed));
      setErr(null);
      setSeed('');
    } catch {
      setErr('Invalid seed');
    }
  };
  const disconnect = () => {
    setWallet(null);
    setErr(null);
  };

  return (
    <div className="web3-card">
      <h3 className="neon-text">Connect XRPL Wallet</h3>
      {wallet ? (
        <>
          <label className="web3-label">Address</label>
          <div className="web3-input" style={{ cursor: 'default' }}>{wallet.address}</div>
          <button className="web3-button" onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <>
          <label htmlFor="seed" className="web3-label">Wallet Seed</label>
          <input
            id="seed" type="password"
            className="web3-input"
            value={seed} onChange={(e: ChangeEvent<HTMLInputElement>) => setSeed(e.target.value)}
            placeholder="s████████████████████████████"
          />
          {err && <p className="web3-label" style={{ color: 'var(--color-accent)' }}>{err}</p>}
          <button className="web3-button" onClick={connect}>Connect Wallet</button>
        </>
      )}
    </div>
  );
};

// EscrowTransaction
export const EscrowTransaction: React.FC = () => {
  const ctx = React.useContext(XRPLContext);
  if (!ctx) throw new Error('Used outside XRPLProvider');
  const { client, wallet } = ctx;
  const [dest, setDest] = useState('');
  const [amount, setAmount] = useState('');
  const [finish, setFinish] = useState('');
  const [cancel, setCancel] = useState('');
  const [status, setStatus] = useState<string|null>(null);
  const [txHash, setTxHash] = useState<string|null>(null);

  const create = async () => {
    if (!client || !wallet) return setStatus('Init client & wallet');
    if (!amount || parseFloat(amount) <= 0) return setStatus('Enter valid amount');
    try {
      const drops = xrpToDrops(amount);
      const now = Math.floor(Date.now()/1000);
      const tx: EscrowCreate = {
        TransactionType: 'EscrowCreate',
        Account: wallet.address,
        Amount: drops,
        Destination: dest,
        FinishAfter: now + parseInt(finish,10),
        CancelAfter: now + parseInt(cancel,10)
      };
      const prep = await client.autofill(tx);
      const signed = wallet.sign(prep);
      const res = await client.submitAndWait(signed.tx_blob);
      setTxHash(res.result.hash);
      const meta = res.result.meta;
      setStatus(typeof meta === 'object' && meta && 'TransactionResult' in meta 
        ? meta.TransactionResult as string 
        : 'Unknown result');
    } catch (e: any) {
      setStatus(e.data?.result?.engine_result || e.message);
      setTxHash(null);
    }
  };

  return (
    <div className="web3-card">
      <h3 className="neon-text">Create Escrow</h3>
      <div className="grid lg-web3-grid-2 web3-grid">
        <div>
          <label className="web3-label">Destination</label>
          <input className="web3-input" value={dest} onChange={e=>setDest(e.target.value)} placeholder="rDEST..." />
        </div>
        <div>
          <label className="web3-label">Amount (XRP)</label>
          <input className="web3-input" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="10" />
        </div>
      </div>
      <div className="grid lg-web3-grid-2 web3-grid">
        <div>
          <label className="web3-label">Finish After (s)</label>
          <input className="web3-input" value={finish} onChange={e=>setFinish(e.target.value)} placeholder="1800" />
        </div>
        <div>
          <label className="web3-label">Cancel After (s)</label>
          <input className="web3-input" value={cancel} onChange={e=>setCancel(e.target.value)} placeholder="3600" />
        </div>
      </div>
      <button className="web3-button" onClick={create} disabled={!wallet || !client}>Submit Escrow</button>
      {status && <p className="web3-label" style={{marginTop:'1rem'}}>{status}</p>}
      {txHash && (
        <>
          <p className="web3-label neon-text">Txn Hash: {txHash}</p>
          <a
            href={`https://testnet.xrpl.org/transactions/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="web3-label neon-text"
            style={{ textDecoration: 'underline', cursor: 'pointer', display: 'block', marginTop: '0.5rem' }}
          >
            View on XRPL Testnet Explorer →
          </a>
        </>
      )}
    </div>
  );
};

// TestnetWallet
export const TestnetWallet: React.FC = () => {
  const ctx = React.useContext(XRPLContext);
  if (!ctx) throw new Error('Used outside XRPLProvider');
  const { client, setWallet } = ctx;
  const [status, setStatus] = useState<string|null>(null);

  const gen = async () => {
    if (!client) return setStatus('Client not ready');
    try {
      setStatus('Generating...');
      const { wallet: w, balance } = await client.fundWallet();
      setWallet(w);
      setStatus(`Addr: ${w.address}\nSeed: ${w.seed}\nBalance: ${balance}`);
    } catch(e:any) { setStatus(e.message); }
  };

  return (
    <div className="web3-card">
      <h3 className="neon-text">Generate Test Wallet</h3>
      <button className="web3-button" onClick={gen} disabled={!client}>Generate</button>
      {status && <pre className="web3-label" style={{whiteSpace:'pre-wrap'}}>{status}</pre>}
    </div>
  );
};

// MainXRPLComponent
export const MainXRPLComponent: React.FC = () => (
  <XRPLProvider>
    <div className="container mx-auto p-8 web3-grid lg-web3-grid-2">
      <div>
        <TestnetWallet />
        <div className="hover-glow"></div>
        <ConnectWallet />
      </div>
      <EscrowTransaction />
    </div>
  </XRPLProvider>
);
