import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/features/auth/authStore';
import { useSidebarStore } from '@/features/theme/themeStore';
import { MarketGrid } from '@/components/MarketGrid';
import { SubHeader } from '@/components/SubHeader';
import { VendorCard } from '@/components/VendorCard';
import { marketsApi } from '@/features/markets/marketsApi';
import { useVendors } from '@/features/vendor/hooks/useVendors';
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets';
import type { VendorCardData } from '@/types';
import {
  Users,
  Leaf,
  Palette,
  ShoppingBag,
  UtensilsCrossed,
  Gift,
  Hammer,
  Moon,
  MapPin,
  Archive,
} from 'lucide-react';

// Fallback mock vendors when API returns empty
const mockVendors: VendorCardData[] = [
  {
    id: 'mock-1',
    firstName: 'Artisan',
    lastName: 'Crafts',
    businessName: 'Artisan Crafts Co.',
    tagline: 'Makes handcrafted silver necklaces, ceramic bowls, and woven baskets',
    blurb: 'Beautiful, unique pieces made with love',
    cardColor: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
    profileImage: '',
    productCategories: [],
  },
  {
    id: 'mock-2',
    firstName: 'Fresh',
    lastName: 'Harvest',
    businessName: 'Fresh Harvest',
    tagline: 'Grows and sells organic tomatoes, leafy greens, and homemade sourdough',
    blurb: 'Farm-fresh daily from local growers',
    cardColor: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
    profileImage: '',
    productCategories: [],
  },
  {
    id: 'mock-3',
    firstName: 'Bella',
    lastName: 'Baker',
    businessName: "Bella's Bakery",
    tagline: 'Bakes artisan sourdough bread, chocolate croissants, and birthday cakes',
    blurb: 'Heavenly treats baked fresh each morning',
    cardColor: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
    profileImage: '',
    productCategories: [],
  },
  {
    id: 'mock-4',
    firstName: 'Jade',
    lastName: 'Jeweler',
    businessName: 'Jewelry by Jade',
    tagline: 'Creates custom crystal earrings, amethyst pendants, and beaded bracelets',
    blurb: 'Stunning pieces that tell your story',
    cardColor: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    profileImage: '',
    productCategories: [],
  },
  {
    id: 'mock-5',
    firstName: 'Mountain',
    lastName: 'Brew',
    businessName: 'Mountain Brew Coffee',
    tagline: 'Roasts and sells Ethiopian single-origin beans and flavored cold brew',
    blurb: 'Bold, rich flavors from mountain estates',
    cardColor: 'bg-gradient-to-br from-red-500/20 to-rose-500/20',
    profileImage: '',
    productCategories: [],
  },
  {
    id: 'mock-6',
    firstName: 'Honey',
    lastName: 'Farmer',
    businessName: 'Honey Bee Farms',
    tagline: 'Produces wildflower honey, beeswax candles, and natural lip balm',
    blurb: 'Pure, natural sweetness from our hives',
    cardColor: 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20',
    profileImage: '',
    productCategories: [],
  },
];

// Market categories for browsing
const marketCategories = [
  { name: 'Farmers Markets', icon: Leaf },
  { name: 'Arts & Crafts', icon: Palette },
  { name: 'Flea Markets', icon: ShoppingBag },
  { name: 'Food Festivals', icon: UtensilsCrossed },
  { name: 'Vintage & Antique', icon: Archive },
  { name: 'Craft Shows', icon: Hammer },
  { name: 'Night Markets', icon: Moon },
  { name: 'Street Fairs', icon: MapPin },
  { name: 'Holiday Markets', icon: Gift },
  { name: 'Community Events', icon: Users },
];

export function HomePage() {
  const {
    isAuthenticated,
    login,
    isLoading: authLoading,
    error: authError,
  } = useAuthStore();
  const { isSidebarOpen } = useSidebarStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showLoginForm, setShowLoginForm] = useState(false);

  // Fetch trending vendors for homepage
  const { vendors: apiVendors, isLoading: vendorsLoading } = useVendors({}, 1, 6);
  const displayVendors = apiVendors.length > 0 ? apiVendors : mockVendors;
  const hasRealVendors = apiVendors.length > 0;

  // Fetch tracked markets for authenticated users
  const { trackedMarketIds, trackMarket, untrackMarket } = useTrackedMarkets();

  // Fetch recently added markets for homepage
  const { data: featuredMarkets, isLoading: marketsLoading } = useQuery({
    queryKey: ['markets', 'featured'],
    queryFn: () => marketsApi.getMarkets({}, 1, 3),
    staleTime: 5 * 60 * 1000,
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the store
    }
  };

  // Open sidebar by default on homepage only (mobile landing page)
  useEffect(() => {
    useSidebarStore.getState().setSidebarOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Full height, acts as mobile homepage */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] md:hidden bg-background overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Mobile Landing Page */}
            <div className="md:hidden relative h-full">
              {/* Mobile Header */}
              <div className="sticky top-0 z-50 bg-surface-2 border-b border-surface-3">
                <div className="flex items-center justify-between px-4 py-3">
                  {/* Logo Icon */}
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center transform -rotate-3 shadow-[4px_4px_0px_0px] shadow-gray-500/40">
                    <span className="text-accent-foreground font-bold text-xl">
                      R
                    </span>
                  </div>

                  {/* Sign In Button */}
                  {!isAuthenticated && (
                    <Link to="/auth/login">
                      <Button
                        size="sm"
                        className="bg-white hover:bg-surface-2 font-bold text-base text-amber-600 px-6 shadow-sm"
                      >
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Mobile Hero */}
              <div className="relative bg-gradient-to-br from-surface-2 to-surface px-5 py-10 border-b border-surface-3">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-20 h-20 bg-accent rounded-xl flex items-center justify-center transform -rotate-3 shadow-[4px_4px_0px_0px] shadow-gray-500/40">
                    <span className="text-accent-foreground font-bold text-5xl">
                      R
                    </span>
                  </div>
                  <h1 className="font-bold text-4xl text-foreground uppercase tracking-tighter leading-none">
                    RUMFOR
                  </h1>
                </div>

                {/* Message */}
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-black text-foreground mb-2 uppercase tracking-wide italic -rotate-1">
                    Your Market
                    <br />
                    <span className="text-amber-600 not-italic rotate-1 inline-block">
                      Organizer
                    </span>
                  </h2>
                </div>

                {/* Primary Action */}
                <div className="max-w-xs mx-auto">
                  {!isAuthenticated ? (
                    <Link to="/auth/register" className="block">
                      <Button
                        size="lg"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xl font-extrabold uppercase tracking-wider -rotate-1 shadow-lg"
                      >
                        Get Started
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/vendor/tracked-markets" className="block">
                      <Button size="lg" variant="outline" className="w-full">
                        My Markets
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Browse by Category */}
              <div className="px-4 py-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3 text-center">
                  Explore
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {marketCategories.map(cat => {
                    const Icon = cat.icon;
                    const categorySlug = cat.name
                      .toLowerCase()
                      .replace(' & ', '-')
                      .replace(' ', '-');
                    return (
                      <Link
                        key={cat.name}
                        to={`/markets?category=${categorySlug}`}
                      >
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-surface hover:bg-surface-2 transition-colors border border-surface-3">
                          <Icon
                            className="h-5 w-5 text-amber-500"
                            strokeWidth={2}
                          />
                          <span className="font-medium text-foreground text-sm">
                            {cat.name}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <Link to="/markets" className="block mt-3">
                  <button className="w-full py-2 text-sm text-amber-500 font-medium hover:underline">
                    View All Categories →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 px-6 py-1 space-y-1 ${isSidebarOpen ? 'hidden md:block' : 'block'}`}
      >
        {isAuthenticated && <SubHeader />}

        {/* RUMFOR Branding + Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          {/* Branding Column */}
          <div className="hidden md:flex flex-col items-center pt-8">
            <Link
              to="/"
              className="flex flex-col items-center space-y-2 transform -rotate-3"
             >
              <div className="w-20 h-20 bg-accent rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px] shadow-gray-500/40">
                <span className="text-accent-foreground font-bold text-5xl">
                  R
                </span>
              </div>
              <span className="font-bold text-4xl text-foreground tracking-tighter uppercase">
                Rumfor
              </span>
            </Link>
            <div className="mt-8 space-y-3 w-full px-4">
              <Link to="/markets" className="block">
                <div className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 text-center transform hover:-translate-y-0.5">
                  <span className="text-white font-bold text-sm uppercase tracking-wide">
                    Browse All Markets →
                  </span>
                </div>
              </Link>
              <Link to="/vendor/add-market/vendor" className="block">
                <div className="w-full py-3 rounded-xl bg-surface-2 border-2 border-surface-3 hover:border-amber-500 hover:bg-surface-3 transition-all text-center">
                  <span className="text-foreground font-bold text-sm uppercase tracking-wide">
                    Add a Market +
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Hero Banner - Refined & Subtle */}
          <div className="w-full h-full">
            <div className="w-full mx-auto relative overflow-hidden rounded-xl bg-gradient-to-br from-surface-2 via-surface to-surface-3 border border-surface-3 py-2">
              {/* Lava Lamp Bubbles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-amber-400/20 rounded-full blur-xl animate-float-1" />
                <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-orange-500/20 rounded-full blur-xl animate-float-2" />
                <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-amber-500/15 rounded-full blur-xl animate-float-3" />
                <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-amber-400/25 rounded-full blur-xl animate-float-4" />
                <div className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-orange-400/20 rounded-full blur-xl animate-float-5" />
                <div className="absolute top-1/6 left-1/2 w-16 h-16 bg-amber-300/20 rounded-full blur-xl animate-float-6" />
              </div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center pt-2 pb-2 px-4 md:px-6">
                {/* First Column - Main Message */}
                <div className="flex flex-col">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                    Find Markets.
                    <br />
                    Sell Stuff.
                    <br />
                    <span className="text-amber-600">Build Your Empire.</span>
                  </h1>
                </div>

                {/* Second Column - YOUR MARKET ORGANIZER */}
                <div className="flex flex-col items-center md:items-end">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center md:text-right">
                    Your Market
                    <br />
                    <span className="text-amber-600">Organizer</span>
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-end">
                    <span className="text-sm text-foreground/70">
                      Save Markets
                    </span>
                    <span className="text-surface-3">•</span>
                    <span className="text-sm text-foreground/70">Track Apps</span>
                    <span className="text-surface-3">•</span>
                    <span className="text-sm text-foreground/70">To-Dos</span>
                    <span className="text-surface-3">•</span>
                    <span className="text-sm text-foreground/70">Expenses</span>
                  </div>
                </div>
              </div>

              {/* Explore Categories */}
              <div className="relative z-10 mt-6 pt-6 border-t border-surface-3/50 px-4 pb-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {marketCategories.map(cat => {
                    const Icon = cat.icon;
                    const categorySlug = cat.name
                      .toLowerCase()
                      .replace(' & ', '-')
                      .replace(' ', '-');
                    return (
                      <Link
                        key={cat.name}
                        to={`/markets?category=${categorySlug}`}
                      >
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-surface hover:bg-surface-2 transition-colors border border-surface-3">
                          <Icon
                            className="h-4 w-4 text-amber-500 shrink-0"
                            strokeWidth={2}
                          />
                          <span className="font-medium text-foreground text-xs truncate">
                            {cat.name}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Added */}
        <section>
          <div className="flex items-center justify-between mb-6 pt-6 border-t border-surface-3/50">
            <h2 className="text-2xl font-bold text-foreground">
              Recently Added
            </h2>
            <Link to="/markets">
              <Button variant="ghost" size="sm" className="text-amber-500">
                See All
              </Button>
            </Link>
          </div>

          <MarketGrid
            markets={featuredMarkets?.data || []}
            isLoading={marketsLoading}
            variant="grid"
            trackedMarketIds={trackedMarketIds || []}
            onTrack={trackMarket}
            onUntrack={untrackMarket}
            className=""
          />
        </section>

        {/* Trending Vendors */}
        <section className="mt-10 mb-10">
          <div className="flex items-center justify-between mb-6 pt-6">
            <h2 className="text-2xl font-bold text-foreground">
              Trending Vendors
            </h2>
            <Link to="/vendors">
              <Button variant="ghost" size="sm" className="text-amber-500">
                See All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 p-1">
            {vendorsLoading ? (
              // Skeleton loading state
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-surface animate-pulse border border-surface-3" />
              ))
            ) : (
              displayVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  showLink={hasRealVendors}
                />
              ))
            )}
          </div>
        </section>

        <div className="h-10"></div>
      </div>
    </div>
  );
}
