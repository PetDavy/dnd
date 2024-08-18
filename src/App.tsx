import Header from './components/Header';
import VerticalList from './components/VerticalListDnd';

import './App.css';
import { useDnd } from './components/useDnd';

function App() {
  const { DndProvider } = useDnd();

  return (
    <main className="App">
      <DndProvider>
        <Header />
        <div className="content">
          <VerticalList />
        </div>
      </DndProvider>
    </main>
  );
}

export default App;
