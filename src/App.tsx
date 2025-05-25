import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { XRPLProvider, ConnectWallet, EscrowTransaction } from './assets/components/XRPLComponent';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <XRPLProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center space-x-4 mb-8">
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1 className="text-4xl font-bold text-center mb-8">XRPL + React Demo</h1>
        
        {/* XRPL Components */}
        <ConnectWallet />
        <EscrowTransaction />
      </div>
    </XRPLProvider>
  )
}

export default App
