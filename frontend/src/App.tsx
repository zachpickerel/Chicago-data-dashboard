import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import TrainMap from './pages/TrainMap';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-chicago-dark">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trains" element={<TrainMap />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
