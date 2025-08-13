# Interswitch Banking Dashboard

A production-quality, responsive Customer Account Dashboard for a banking app built with React + TypeScript, following modern frontend standards, accessibility guidelines, and security best practices.

## 🚀 Features

### Core Functionality

- **Account Overview**: View account types, masked account numbers, balances, and last transaction dates
- **Transaction History**: Paginated/virtualized transaction lists with filtering and CSV export
- **Funds Transfer**: Secure transfer system with confirmation modals and optimistic UI updates
- **Session Management**: OAuth2 integration with auto-logout after 5 minutes of inactivity
- **Security**: Encrypted sensitive data storage, secure authentication, and session handling

### Technical Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: WCAG AA compliant with keyboard navigation and screen reader support
- **Performance**: List virtualization, lazy loading, and optimized rendering
- **Testing**: Comprehensive unit tests with Jest + React Testing Library and E2E tests with Playwright
- **Code Quality**: ESLint, Prettier, TypeScript strict mode, and Husky pre-commit hooks

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.2
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest + React Testing Library + Playwright
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged

## 🎨 Design System

### Brand Colors

```css
--color-interswitch-dark: #00425f --color-interswitch-primary: #479fc8 --color-white: #ffffff
  --color-success: #28a745 --color-danger: #e53935;
```

### Spacing Scale

- 4px, 8px, 16px, 24px, 32px
- Base font size: 16px

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Modal)
│   └── layout/         # Layout components (Header, Sidebar, Layout)
├── features/           # Feature-based organization
│   ├── auth/          # Authentication components and hooks
│   ├── accounts/      # Account management
│   ├── transactions/  # Transaction handling
│   └── transfer/      # Fund transfer functionality
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries and API client
├── pages/             # Next.js pages
├── styles/            # Global styles and design tokens
└── types/             # TypeScript type definitions

tests/
├── components/        # Component unit tests
├── features/          # Feature integration tests
└── e2e/              # End-to-end tests with Playwright
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/interswitch-banking-dashboard.git
   cd interswitch-banking-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

- **Email**: test@interswitch.com
- **Password**: password123

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Run All Tests (Unit + E2E)

```bash
# Run unit tests, install Playwright browsers, and run E2E tests
npm run test:all
```

### E2E Tests

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npx playwright test --headed
```

### Type Checking

```bash
npm run type-check
```

## 🏗️ Building for Production

### Build the application

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Lint and format code

```bash
npm run lint
npm run lint:fix
```

## 🔒 Security Features

- **Encrypted Storage**: Sensitive data encrypted using Web Crypto API
- **Secure Authentication**: OAuth2 integration with secure token storage
- **Session Management**: Automatic logout after inactivity with warning modals
- **Input Validation**: Comprehensive form validation with Zod schemas
- **XSS Protection**: Content Security Policy headers and input sanitization
- **CSRF Protection**: Secure API endpoints with proper authentication

## ♿ Accessibility Features

- **WCAG AA Compliance**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and semantic markup
- **Focus Management**: Visible focus indicators and logical tab order
- **Color Contrast**: High contrast ratios for better readability
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces

## 📱 Responsive Design

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: Responsive breakpoints for tablet and desktop
- **Touch Friendly**: Optimized for touch interactions
- **Performance**: Optimized for mobile performance

## 🚀 Performance Optimizations

- **Code Splitting**: Automatic code splitting with Next.js
- **Lazy Loading**: Route-based and component-based lazy loading
- **Virtualization**: Virtualized lists for large datasets
- **Image Optimization**: Next.js Image component with optimization
- **Bundle Analysis**: Webpack bundle analyzer for optimization

## 🔧 Configuration

### Tailwind CSS

Custom configuration with Interswitch brand colors and spacing scale.

### ESLint

Strict TypeScript rules with accessibility and security best practices.

### Jest

Comprehensive testing setup with React Testing Library and custom mocks.

### Playwright

Cross-browser E2E testing with visual regression testing support.

## 📊 API Integration

The dashboard integrates with a banking API that provides:

- **Authentication**: OAuth2 endpoints for secure login
- **Accounts**: Account information and balance queries
- **Transactions**: Transaction history with filtering and pagination
- **Transfers**: Fund transfer initiation and status tracking

## 🧪 Testing Strategy

### Unit Tests

- Component rendering and behavior
- Hook functionality and state management
- Utility function correctness
- Form validation and submission

### Integration Tests

- API client functionality
- State management integration
- Component interaction testing

### E2E Tests

- Complete user workflows
- Cross-browser compatibility
- Performance and accessibility testing

## 📈 Monitoring and Analytics

- **Performance Monitoring**: Core Web Vitals tracking
- **Error Tracking**: Comprehensive error logging and reporting
- **User Analytics**: Usage patterns and feature adoption
- **Security Monitoring**: Authentication and authorization logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write comprehensive tests for new features
- Ensure accessibility compliance
- Follow the established code style
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Interswitch for the brand guidelines and requirements
- Next.js team for the excellent framework
- Tailwind CSS for the utility-first CSS framework
- React Testing Library for testing best practices
- Playwright for reliable E2E testing

## 📞 Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation and examples

---

**Built with ❤️ for secure and accessible banking experiences**
