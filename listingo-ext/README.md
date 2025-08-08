# Listing Optimizer Extension Frontend

A Chrome/Edge browser extension that provides AI-powered marketplace listing optimization with real-time scanning and one-click patching.

## Features

### 🚀 Core Functionality
- **Real-time Listing Detection**: Automatically detects marketplace listings on Etsy, Shopify, and other platforms
- **AI-Powered Optimization**: Uses GPT-4o-mini to generate optimized titles and descriptions
- **One-Click Patching**: Apply optimizations directly to your listings with a single click
- **Job Tracking**: Monitor scan progress and view optimization results
- **Quota Management**: Track remaining credits and purchase more as needed

### 🎨 User Interface
- **Modern Design**: Clean, intuitive interface built with React 18 and Tailwind CSS
- **Tabbed Navigation**: Organized sections for Demo, Sources, Connect, Jobs, and Settings
- **Real-time Updates**: Live status updates and progress indicators
- **Responsive Layout**: Optimized for extension popup dimensions

### 🔧 Technical Features
- **State Management**: Zustand for efficient state management across components
- **Authentication**: Supabase magic-link authentication with JWT tokens
- **API Integration**: Seamless integration with Edge API for fast processing
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Smooth loading animations and progress indicators

## Architecture

### Component Structure
```
listingo-ext/
├── components/
│   ├── DemoTab.tsx          # Demo flow for guest users
│   ├── ConnectedSources.tsx  # Display connected stores
│   ├── JobResults.tsx        # Detailed job results view
│   ├── JobsList.tsx          # List of active jobs
│   ├── SignInOverlay.tsx     # Authentication overlay
│   └── UpgradeOverlay.tsx    # Upgrade prompt for guests
├── core/
│   ├── edge.ts              # Edge API client
│   ├── supabase.ts          # Supabase client
│   ├── topup.ts             # Credit purchase flow
│   └── useQuotaPoll.ts      # Quota polling hook
├── hooks/
│   ├── useInitAuth.ts       # Authentication initialization
│   └── useLemonSqueezyCheckout.ts # Payment integration
├── state/
│   ├── authSlice.ts         # Authentication state
│   ├── quotaSlice.ts        # Quota management
│   ├── jobsSlice.ts         # Job tracking
│   ├── sourcesSlice.ts      # Connected sources
│   └── demoSlice.ts         # Demo flow state
├── content.tsx              # Content script for listing detection
├── popup.tsx                # Main extension popup
└── options.tsx              # Extension settings page
```

### State Management
The extension uses Zustand for state management with the following slices:

- **AuthSlice**: JWT tokens, user plan, authentication state
- **QuotaSlice**: Remaining credits, quota polling, sign-in overlay
- **JobsSlice**: Job tracking, polling, patch application
- **SourcesSlice**: Connected marketplace sources
- **DemoSlice**: Demo flow for guest users

### API Integration
- **Edge API**: Fast processing via Cloudflare Workers
- **Supabase**: Authentication and user management
- **LemonSqueezy**: Payment processing for credits

## Development

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Chrome/Edge browser for testing

### Setup
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Package extension
pnpm package
```

### Environment Variables
Create a `.env` file in the extension directory:

```env
# Edge API
PLASMO_PUBLIC_EDGE_BASE=https://api.listingo.ai
VITE_EDGE_BASE=https://api.listingo.ai
VITE_HMAC_SECRET=your-hmac-secret

# Supabase
PLASMO_PUBLIC_SUPABASE_URL=your-supabase-url
PLASMO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# LemonSqueezy
PLASMO_PUBLIC_LEMONSQUEEZY_STORE_ID=your-store-id
PLASMO_PUBLIC_LEMONSQUEEZY_PRODUCT_ID=your-product-id
```

### Development Workflow
1. **Content Script**: Detects marketplace listings and shows optimization overlay
2. **Popup**: Main interface for job management and settings
3. **Background**: Handles authentication and message routing
4. **Options**: Comprehensive settings page for account management

## Key Components

### Content Script (`content.tsx`)
- Detects marketplace listings on page load
- Shows optimization overlay with suggestions
- Handles one-click patch application
- Supports Etsy, Shopify, and other platforms

### Main Popup (`popup.tsx`)
- Tabbed interface with Demo, Sources, Connect, Jobs, and Settings
- Real-time quota display and credit purchase
- Job tracking and results viewing
- User authentication and plan management

### Job Results (`JobResults.tsx`)
- Displays detailed optimization suggestions
- Shows confidence scores and reasoning
- One-click patch application
- Copy-to-clipboard functionality

### Settings Page (`options.tsx`)
- Account management and profile settings
- Credit balance and purchase options
- Preferences for auto-scanning and notifications
- Help and support resources

## Styling

The extension uses Tailwind CSS with a custom design system:

- **Colors**: Blue primary, green success, red error, gray neutral
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent padding and margins
- **Animations**: Smooth transitions and loading states

## Testing

### Manual Testing
1. **Install Extension**: Load unpacked extension in Chrome/Edge
2. **Authentication**: Test sign-in flow and plan detection
3. **Content Script**: Visit marketplace pages to test listing detection
4. **Job Processing**: Start scans and verify results
5. **Patch Application**: Test one-click optimization application

### Automated Testing
```bash
# Run tests (when implemented)
pnpm test

# Run linting
pnpm lint
```

## Deployment

### Chrome Web Store
1. Build the extension: `pnpm build`
2. Create a ZIP file of the `build/chrome-mv3-prod` directory
3. Upload to Chrome Web Store Developer Dashboard

### Edge Add-ons
1. Build the extension: `pnpm build`
2. Create a ZIP file of the `build/chrome-mv3-prod` directory
3. Upload to Microsoft Edge Add-ons Developer Dashboard

## Performance

### Optimization Features
- **Lazy Loading**: Components load only when needed
- **Efficient Polling**: Smart job status polling with exponential backoff
- **Minimal Re-renders**: Optimized React components with proper memoization
- **Fast API Calls**: Edge API for sub-400ms response times

### Monitoring
- **Error Tracking**: Comprehensive error handling and logging
- **Performance Metrics**: Track API response times and user interactions
- **Usage Analytics**: Monitor feature usage and user engagement

## Security

### Authentication
- **JWT Tokens**: Secure authentication with RS256 signatures
- **HMAC Verification**: Request signing for API calls
- **Token Refresh**: Automatic token renewal

### Data Protection
- **Local Storage**: Sensitive data stored securely in extension storage
- **API Security**: All requests authenticated and signed
- **Privacy**: No unnecessary data collection

## Future Enhancements

### Planned Features
- **Batch Processing**: Process multiple listings simultaneously
- **Advanced Analytics**: Detailed performance metrics and insights
- **Custom Templates**: User-defined optimization templates
- **Multi-language Support**: Internationalization for global users
- **Advanced Filters**: Sophisticated listing filtering options

### Technical Improvements
- **Service Worker**: Background processing for better performance
- **Offline Support**: Basic functionality without internet connection
- **Push Notifications**: Real-time job completion notifications
- **Advanced Caching**: Intelligent caching for faster responses

## Contributing

### Development Guidelines
1. **Code Style**: Follow TypeScript and React best practices
2. **Component Design**: Create reusable, well-documented components
3. **State Management**: Use Zustand slices for state organization
4. **Testing**: Write tests for critical functionality
5. **Documentation**: Update README for new features

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request with detailed description

## Support

### Documentation
- [API Documentation](https://listingo.ai/docs)
- [User Guide](https://listingo.ai/guide)
- [Developer Guide](https://listingo.ai/dev)

### Contact
- **Email**: support@listingo.ai
- **Discord**: [Join our community](https://discord.gg/listingo)
- **GitHub**: [Report issues](https://github.com/listingo/listing-optimizer/issues)

---

Built with ❤️ by the Listing Optimizer team
