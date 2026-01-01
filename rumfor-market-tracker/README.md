# Rumfor Market Tracker

A comprehensive platform for market discovery, vendor applications, and community engagement built with modern web technologies.

## 🚀 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + UnoCSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## 🏗️ Project Structure

```
rumfor-market-tracker/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   └── ui/            # Base UI components
│   ├── features/          # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── markets/       # Market management
│   │   ├── applications/  # Vendor applications
│   │   ├── community/     # Comments, photos, hashtags
│   │   └── admin/         # Admin functionality
│   ├── pages/             # Route components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── config/            # Configuration files
│   ├── lib/               # Third-party integrations
│   └── styles/            # Global styles
├── .env.example           # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── uno.config.ts
```

## 🎯 Features

### For Visitors
- Browse and search farmers markets and events
- Filter by location, category, and accessibility
- View market details, schedules, and photos
- Leave comments and reactions

### For Vendors
- Apply to markets with customizable forms
- Track application status
- Manage vendor todo lists
- Track expenses and profits
- Upload market photos

### For Promoters
- Create and manage markets
- Set custom application requirements
- Review vendor applications
- Communicate with applicants
- Analytics and insights

### For Admins
- User management and moderation
- Promoter verification
- Content moderation
- System analytics
- Bulk operations

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd rumfor-market-tracker
```

2. Install dependencies
```bash
npm install
```

3. Copy environment variables
```bash
cp .env.example .env
```

4. Start development server
```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_ENV=development
```

### API Integration
The project is configured to work with a REST API. Update the API endpoints in:
- `src/lib/apiClient.ts`
- Feature-specific API modules

## 🎨 Styling

The project uses a utility-first approach with Tailwind CSS and extends it with:

- Custom color palette optimized for market/festival themes
- Responsive design patterns
- Dark mode support (planned)
- Accessible color contrasts

## 📱 Responsive Design

Built with mobile-first approach ensuring excellent experience across:
- Desktop (1024px+)
- Tablet (768px - 1023px)  
- Mobile (320px - 767px)

## 🔐 Authentication

Role-based access control with four user types:
- **Visitor**: Browse markets, leave comments
- **Vendor**: Apply to markets, manage applications
- **Promoter**: Create and manage markets
- **Admin**: Full system administration

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
The project is configured for easy deployment to modern hosting platforms.

## 📝 Contributing

1. Follow the established code style
2. Use TypeScript for all new code
3. Write tests for new features
4. Update documentation as needed

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For questions or support, please create an issue in the repository.