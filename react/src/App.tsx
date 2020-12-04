import React from 'react';
import './App.css';

const testDebug = () => {
  const p = 25;
  console.log(p + 1);
}

type AppProps = { message: string };

const App = ({message}: AppProps) => {
  return (
    <div className="App">
      <header className="App-header">
        <p>{message}</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      <button onClick={testDebug}>click here</button>
      </header>
    </div>
  );
}

export default App;
