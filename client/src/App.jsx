import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import CollectorDashboard from './pages/CollectorDashboard';
import NewCollection from './pages/NewCollection';
import MyLots from './pages/MyLots';
import RecyclerMatch from './pages/RecyclerMatch';
import Earnings from './pages/Earnings';
import SafetyGuide from './pages/SafetyGuide';
import HouseholdPortal from './pages/HouseholdPortal';
import RecyclerPortal from './pages/RecyclerPortal';
import MunicipalityDashboard from './pages/MunicipalityDashboard';
import TraceabilityLedger from './pages/TraceabilityLedger';
import { Toaster } from 'react-hot-toast';
import { useOfflineSync } from './hooks/useOfflineSync';

function App() {
  useOfflineSync();

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/collector" element={<CollectorDashboard />} />
          <Route path="/collector/collect" element={<NewCollection />} />
          <Route path="/collector/lots" element={<MyLots />} />
          <Route path="/collector/recyclers" element={<RecyclerMatch />} />
          <Route path="/collector/earnings" element={<Earnings />} />
          <Route path="/collector/safety" element={<SafetyGuide />} />
          <Route path="/household" element={<HouseholdPortal />} />
          <Route path="/recycler" element={<RecyclerPortal />} />
          <Route path="/municipality" element={<MunicipalityDashboard />} />
          <Route path="/track/:lotId" element={<TraceabilityLedger />} />
        </Routes>
      </Layout>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}

export default App;
