export default function OfflinePage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-4">You're offline</h1>
        <p className="text-xl mb-8">Some features may be limited while you're offline.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Try to reconnect
        </button>
      </div>
    )
  }
  
  