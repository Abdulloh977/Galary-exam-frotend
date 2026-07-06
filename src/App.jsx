import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PinDetail from "./pages/PinDetail";
import CreatePin from "./pages/CreatePin";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Boards from "./pages/Boards";
import BoardDetail from "./pages/BoardDetail";
import SearchResults from "./pages/SearchResults";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Login qilmasdan ham ko'rish mumkin bo'lgan sahifalar */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pin/:id" element={<PinDetail />} />
            <Route path="/board/:id" element={<BoardDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/profile/:id" element={<Profile />} />

            {/* Faqat login qilingandan keyin ochiladigan sahifalar */}
            <Route
              path="/boards"
              element={
                <ProtectedRoute>
                  <Boards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pin/create"
              element={
                <ProtectedRoute>
                  <CreatePin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:userId"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />

            {/* Topilmagan manzillar uchun */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
