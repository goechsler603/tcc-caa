import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState('carregando...')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('erro ao conectar no backend'))
  }, [])

  return <h1>Backend: {status}</h1>
}

export default App