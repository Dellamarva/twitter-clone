import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({ //App wont refetch when refocused (switched back tab)
  defaulyOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* Able to use Browser Router*/}
      <QueryClientProvider client={queryClient}> {/* Able to use Query Client*/}
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
