import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OfferRide from './pages/OfferRide';
import FindRide  from './pages/FindRide';
import RideDetail from './pages/RideDetail';
import MyRides   from './pages/MyRides';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"          element={<Navigate to="/login" />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/offer-ride" element={
            <ProtectedRoute><OfferRide /></ProtectedRoute>
          } />
          <Route path="/find-ride"   element={<ProtectedRoute><FindRide /></ProtectedRoute>} />
          <Route path="/rides/:id"   element={<ProtectedRoute><RideDetail /></ProtectedRoute>} />
          <Route path="/my-rides"    element={<ProtectedRoute><MyRides /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;