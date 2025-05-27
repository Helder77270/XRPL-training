import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { MainXRPLComponent } from './assets/components/XRPLComponent';
import './App.css'

function App() {
  return (
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
      
      {/* XRPL Component */}
      <MainXRPLComponent />
    </div>
  )
}

export default App
