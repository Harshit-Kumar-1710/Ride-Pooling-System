import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HistoryNav from './components/HistoryNav';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import OfferRide from './pages/OfferRide';
import FindRide  from './pages/FindRide';
import RideDetail from './pages/RideDetail';
import MyRides   from './pages/MyRides';
import TrackRide from './pages/TrackRide';
import ReviewRide from './pages/ReviewRide';
import Profile from './pages/Profile';
import About from './pages/About';
import Help from './pages/Help';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
        <Navbar />
        <HistoryNav />
        <Routes>
          <Route path="/"          element={<LandingPage />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/offer-ride" element={
            <ProtectedRoute><OfferRide /></ProtectedRoute>
          } />
          <Route path="/find-ride"   element={<ProtectedRoute><FindRide /></ProtectedRoute>} />
          <Route path="/rides/:id"   element={<ProtectedRoute><RideDetail /></ProtectedRoute>} />
          <Route path="/my-rides"    element={<ProtectedRoute><MyRides /></ProtectedRoute>} />
          <Route path="/track/:id" element={<ProtectedRoute><TrackRide /></ProtectedRoute>} />
          <Route path="/review/:rideId" element={<ProtectedRoute><ReviewRide /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
        </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;