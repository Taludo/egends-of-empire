import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { Village } from './pages/Village'
import { Navbar } from './components/Layout/Navbar'
import { ToastProvider } from './contexts/ToastContext'
import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  // Attendre que l'état d'authentification soit vérifié
  if (isAuthenticated === null) {
    return null; // ou un écran de chargement
  }

  return (
    <ChakraProvider>
      <ToastProvider>
        <Router>
          <Box pt="64px">
            <Navbar />
            <Routes>
              <Route 
                path="/" 
                element={
                  isAuthenticated ? (
                    <Navigate to="/village" replace />
                  ) : (
                    <Home />
                  )
                } 
              />
              <Route 
                path="/village" 
                element={
                  isAuthenticated ? (
                    <Village />
                  ) : (
                    <Navigate to="/" replace />
                  )
                } 
              />
            </Routes>
          </Box>
        </Router>
      </ToastProvider>
    </ChakraProvider>
  )
}

export default App
