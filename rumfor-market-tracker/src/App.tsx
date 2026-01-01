import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="App min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <header className="text-center mb-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Rumfor Market Tracker
            </h1>
            <p className="text-xl text-muted leading-relaxed">
              Track and discover farmers markets, festivals, and community events with a professional platform designed for serious organizers and vendors.
            </p>
          </div>
        </header>
        
        <Routes>
          <Route path="/" element={
            <div className="card max-w-4xl mx-auto text-center">
              <div className="card-content">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Welcome to Your Professional Market Management Platform
                </h2>
                <p className="text-muted mb-8 max-w-2xl mx-auto leading-relaxed">
                  A comprehensive solution designed for market organizers, vendors, and community leaders. 
                  Streamline applications, manage vendor relationships, and grow your market community.
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button className="btn btn-primary">
                    Get Started
                  </button>
                  <button className="btn btn-secondary">
                    Learn More
                  </button>
                  <button className="btn btn-ghost">
                    View Demo
                  </button>
                </div>
              </div>
              
              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-accent font-semibold text-lg">📊</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Analytics Dashboard</h3>
                  <p className="text-sm text-muted">Track market performance and vendor metrics</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-accent font-semibold text-lg">📝</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Application Management</h3>
                  <p className="text-sm text-muted">Streamline vendor applications and approvals</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-accent font-semibold text-lg">🤝</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Community Building</h3>
                  <p className="text-sm text-muted">Connect vendors and grow market engagement</p>
                </div>
              </div>
            </div>
          } />
          
          <Route path="*" element={
            <div className="card max-w-2xl mx-auto text-center">
              <div className="card-content">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
                <p className="text-muted mb-8">The page you're looking for doesn't exist yet. Please check your URL or return to the main page.</p>
                <button className="btn btn-primary">
                  Return Home
                </button>
              </div>
            </div>
          } />
        </Routes>
        
        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted">
            © 2026 Rumfor Market Tracker. Professional market management made simple.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App