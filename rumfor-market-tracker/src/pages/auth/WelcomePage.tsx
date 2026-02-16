import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Store, Search, PlusCircle, TrendingUp, UserCheck, Megaphone, CheckCircle, ChevronDown, ChevronRight, Smartphone, X, Share } from 'lucide-react'

export function WelcomePage() {
  const [showInstallInstructions, setShowInstallInstructions] = useState(false)
  const [showWhatYouCanDo, setShowWhatYouCanDo] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const isAndroid = /android/i.test(navigator.userAgent)
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const dismissed = localStorage.getItem('pwa-install-dismissed')

    if (isAndroid && !dismissed) {
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setShowAndroidPrompt(true)
      }
      window.addEventListener('beforeinstallprompt', handler)
      
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }

    if (isIos && !dismissed) {
      const standalone = (window.navigator as any).standalone
      if (!standalone) {
        setShowInstallInstructions(true)
      }
    }
  }, [])

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowAndroidPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const dismissAndroidPrompt = () => {
    setShowAndroidPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      {showAndroidPrompt && (
        <div className="fixed inset-x-4 top-4 bg-surface border border-border rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-accent" />
              <span className="font-semibold">Install Rumfor</span>
            </div>
            <button onClick={dismissAndroidPrompt} className="p-1">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Add Rumfor to your home screen for quick access.
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handleAndroidInstall}
              className="flex-1 bg-accent text-accent-foreground rounded-lg py-2 text-sm font-medium"
            >
              Install
            </button>
            <button 
              onClick={dismissAndroidPrompt}
              className="flex-1 bg-surface border border-border rounded-lg py-2 text-sm font-medium"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      <div className="text-center">
        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Welcome to Rumfor</h1>
        <p className="text-sm text-muted-foreground">Your account is ready</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
        <h2 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-2">Limited Beta</h2>
        <p className="text-sm text-foreground">
          Email verification may not be working correctly. Your account works fine—we'll ask you to verify later.
        </p>
      </div>

      <div className="rounded-lg overflow-hidden">
        <button 
          onClick={() => setShowInstallInstructions(!showInstallInstructions)}
          className="w-full bg-surface p-3 flex items-center justify-between text-left active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2">
            {showInstallInstructions ? <ChevronDown className="w-4 h-4 text-accent" /> : <ChevronRight className="w-4 h-4 text-accent" />}
            <Smartphone className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Add to iPhone Homescreen</h2>
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{showInstallInstructions ? 'Collapse' : 'Expand'}</span>
        </button>
        
        {showInstallInstructions && (
          <div className="bg-surface px-3 pb-3 space-y-2">
            <p className="text-xs text-muted-foreground pt-2">
              For the best experience, add Rumfor to your home screen:
            </p>
            <div className="bg-background rounded-lg p-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-xs font-bold text-accent">1</div>
                <p className="text-xs text-foreground">Tap the <Share className="w-4 h-4 inline mx-1" /> Share button at the bottom of Safari</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-xs font-bold text-accent">2</div>
                <p className="text-xs text-foreground">Scroll down and tap "Add to Home Screen"</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-xs font-bold text-accent">3</div>
                <p className="text-xs text-foreground">Tap "Add" in the top right corner</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg overflow-hidden">
        <button 
          onClick={() => setShowWhatYouCanDo(!showWhatYouCanDo)}
          className="w-full bg-surface p-3 flex items-center justify-between text-left active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2">
            {showWhatYouCanDo ? <ChevronDown className="w-4 h-4 text-accent" /> : <ChevronRight className="w-4 h-4 text-accent" />}
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">What you can do</h2>
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{showWhatYouCanDo ? 'Collapse' : 'Expand'}</span>
        </button>
        
        {showWhatYouCanDo && (
          <div className="bg-surface px-3 pb-3 space-y-3">
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="bg-background rounded-lg p-3 text-center">
                <UserCheck className="w-5 h-5 mx-auto text-accent mb-1" />
                <p className="text-xs font-medium">Track Status</p>
              </div>
              <div className="bg-background rounded-lg p-3 text-center">
                <Store className="w-5 h-5 mx-auto text-accent mb-1" />
                <p className="text-xs font-medium">Share Markets</p>
              </div>
              <div className="bg-background rounded-lg p-3 text-center">
                <TrendingUp className="w-5 h-5 mx-auto text-accent mb-1" />
                <p className="text-xs font-medium">Stay Organized</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Markets you're attending appear on your profile.
            </p>
            <p className="text-xs text-muted-foreground">
              Your profile also shows on those market pages.
            </p>
          </div>
        )}

        <button 
          onClick={() => setShowComingSoon(!showComingSoon)}
          className="w-full bg-surface p-3 flex items-center justify-between text-left active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2">
            {showComingSoon ? <ChevronDown className="w-4 h-4 text-accent" /> : <ChevronRight className="w-4 h-4 text-accent" />}
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Coming Soon</h2>
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{showComingSoon ? 'Collapse' : 'Expand'}</span>
        </button>
        
        {showComingSoon && (
          <div className="bg-surface px-3 pb-3 space-y-2">
            <div className="bg-background rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Enhanced Budget Tools</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Easier year-end reporting and market performance insights. Your current data won't be lost—it'll get better.
              </p>
            </div>

            <div className="bg-background rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Promoter Accounts</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Manage market listings—available late summer 2026. We'll help roll over your account if you're a promoter, when it's ready.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4 grid gap-2">
        <Link to="/vendor/profile" className="block p-3 bg-accent/20 rounded-lg font-medium text-sm flex items-center active:opacity-90 shadow-md">
          <Store className="w-4 h-4 mr-3" />
          Setup your vendor profile
        </Link>
        <Link to="/markets" className="block p-3 bg-accent/20 rounded-lg font-medium text-sm flex items-center active:opacity-90 shadow-md">
          <Search className="w-4 h-4 mr-3" />
          Browse Markets to track
        </Link>
        <Link to="/vendor/add-market" className="block p-3 bg-accent/20 rounded-lg font-medium text-sm flex items-center active:opacity-90 shadow-md">
          <PlusCircle className="w-4 h-4 mr-3" />
          Add a market to your list
        </Link>
      </div>

      <div className="bg-surface rounded-lg p-3 flex items-start gap-3">
        <Megaphone className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          <strong>Find a bug or have a suggestion?</strong> Contact <span className="text-foreground">James / Rupert Rooster</span>.<br />
          In-app feedback submission form coming to your avatar.
        </p>
      </div>
    </div>
  )
}
