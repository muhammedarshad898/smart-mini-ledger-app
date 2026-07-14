import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.jsx';
import HomePage from './pages/HomePage.jsx';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
