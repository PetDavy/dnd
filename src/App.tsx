import Header from './components/Header';
import VerticalList from './components/VerticalList';

import './App.css';

function App() {
  return (
    <main className="App">
      <Header />
      <div className="content">
        <VerticalList />
      </div>
    </main>
  );
}

export default App;
