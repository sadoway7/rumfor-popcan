import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { useNotificationsStore } from '@/features/notifications/notificationsStore'
import { Button } from '@/components/ui'
import { Menu, X, LogOut } from 'lucide-react'
import { NotificationBell } from './NotificationBell'

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotificationsStore()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-surface border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-xl text-foreground">Rumfor</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/markets" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Markets
            </Link>
            <Link 
              to="/about" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Navigation Links */}
                <nav className="flex items-center space-x-6">
                  <Link 
                    to="/markets" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Markets
                  </Link>
                  {user?.role === 'vendor' && (
                    <>
                      <Link 
                        to="/vendor/dashboard" 
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/vendor/planning" 
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Planning
                      </Link>
                      <Link 
                        to="/vendor/expenses" 
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Expenses
                      </Link>
                    </>
                  )}
                  {user?.role === 'promoter' && (
                    <Link 
                      to="/promoter/dashboard" 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin/dashboard" 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                </nav>

                {/* Notification Bell */}
                <NotificationBell
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onDeleteNotification={removeNotification}
                />

                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {user?.firstName}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/markets"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Markets
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="border-t border-border pt-2">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Welcome, {user?.firstName}
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 text-foreground hover:bg-accent/10 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-foreground hover:bg-accent/10 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-foreground hover:bg-accent/10 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/auth/login"
                      className="block px-3 py-2 text-foreground hover:bg-accent/10 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/auth/register"
                      className="block px-3 py-2 text-foreground hover:bg-accent/10 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}