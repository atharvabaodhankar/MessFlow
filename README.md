# MessFlow - Mess Management System

A comprehensive web-based mess management platform designed for mess owners and their customers, featuring bilingual support (Marathi/English) and Firebase integration.

## 🌟 Features

### For Mess Owners (Authenticated)
- **Dashboard**: Real-time overview of active customers, daily attendance, and expiring subscriptions
- **Customer Management**: Add, edit, and manage customer profiles with subscription tracking
- **Attendance System**: Manual attendance marking with meal-type tracking (lunch/dinner)
- **Plan Management**: Create and manage different meal plans with flexible pricing
- **Analytics**: View detailed reports and analytics of mess operations
- **Bilingual Interface**: Full Marathi and English language support

### For Customers (Public Access)
- **Public Search**: Search subscription details using mobile number
- **Subscription Status**: View validity, remaining days, and attendance history
- **No Login Required**: Easy access without account creation

## 🏗️ Architecture

- **Frontend**: React 19 + Vite
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Icons**: Heroicons + Material Icons

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd messflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Firebase Setup**
   
   Configure Firestore security rules (see `firestore.rules`):
   ```javascript
   // Basic security rules for mess management
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Add your security rules here
     }
   }
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   ```

## 📱 Application Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.jsx      # Main layout with navigation
├── contexts/           # React Context providers
│   ├── AuthContext.jsx # Authentication state management
│   └── LanguageContext.jsx # Language switching
├── pages/              # Main application pages
│   ├── Dashboard.jsx   # Owner dashboard
│   ├── Customers.jsx   # Customer management
│   ├── Attendance.jsx  # Attendance tracking
│   ├── Plans.jsx       # Plan management
│   ├── Analytics.jsx   # Analytics and reports
│   ├── Login.jsx       # Owner authentication
│   └── PublicSearch.jsx # Public customer search
├── utils/              # Utility functions
│   ├── translations.js # UI text translations
│   └── translator.js   # Translation helpers
├── firebase.js         # Firebase configuration
├── App.jsx            # Main app component
└── main.jsx           # Application entry point
```

## 🔥 Firebase Collections

### Core Collections
- **messOwners**: Mess owner profiles and settings
- **customers**: Customer profiles and subscription data
- **attendance**: Daily attendance records
- **plans**: Meal plan configurations
- **renewals**: Subscription renewal history

### Data Models

#### Customer Document
```javascript
{
  id: string,
  messId: string,
  name: string,
  nameMarathi: string,
  mobile: string,
  customerNumber: number,
  startDate: timestamp,
  endDate: timestamp,
  status: "active" | "expiring" | "expired",
  planId: string,
  planName: string,
  planPrice: number,
  totalMeals: number,
  mealsConsumed: number,
  mealsPerDay: number,
  amountPaid: number,
  remainingAmount: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Attendance Document
```javascript
{
  id: string,
  messId: string,
  customerId: string,
  date: "YYYY-MM-DD",
  mealType: "lunch" | "dinner",
  timestamp: timestamp,
  method: "manual" | "qr"
}
```

## 🎨 Design System

### Color Palette
- **Primary**: `#0F4C3A` (Dark Green)
- **Primary Light**: `#E8F3EF` (Light Mint)
- **Gold Accent**: `#D4A941`
- **Status Colors**:
  - Active: `#38A169` (Green)
  - Expiring: `#ECC94B` (Yellow)
  - Expired: `#E53E3E` (Red)

### Typography
- **Font Family**: Poppins (Display), System Sans-serif (Body)
- **Material Icons**: Used for consistent iconography

## 🌐 Internationalization

The application supports bilingual interface:
- **Marathi (मराठी)**: Primary language for local users
- **English**: Secondary language for broader accessibility

Language switching is handled through `LanguageContext` with persistent storage.

## 🔐 Authentication & Security

- **Google Authentication**: Secure login for mess owners
- **Firestore Security Rules**: Role-based access control
- **Public Routes**: Customer search without authentication
- **Private Routes**: Protected owner dashboard and management

## 📊 Key Features Detail

### Dashboard
- Real-time statistics (active customers, daily attendance, expiring subscriptions)
- Quick action buttons for common tasks
- Responsive design for mobile and desktop

### Customer Management
- Comprehensive customer profiles with bilingual names
- Subscription tracking with automatic expiry calculation
- Payment tracking with remaining balance display
- Meal consumption monitoring

### Attendance System
- Manual attendance marking with meal-type selection
- Smart search with customer number, name, or mobile
- Marathi name translation support for search
- Meal limit validation and expiry checks

### Public Search
- Mobile number-based customer lookup
- Subscription status and validity display
- No authentication required for customer convenience

## 🚀 Deployment

### Vercel (Recommended)
The project includes `vercel.json` for easy deployment:

```bash
npm run build
# Deploy to Vercel
```

### Firebase Hosting
```bash
npm run build
firebase deploy
```

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Code Style
- ESLint configuration for React
- Tailwind CSS for styling
- Component-based architecture
- Context API for state management

## 📋 System Requirements

- **Node.js**: v18 or higher
- **Browser**: Modern browsers with ES6+ support
- **Firebase**: Active Firebase project with Firestore enabled
- **Internet**: Required for Firebase services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [System Design](SYSTEM_DESIGN.md) for detailed architecture
- Review Firebase documentation for backend setup
- Ensure proper environment variables are configured

## 🔄 Version History

- **v0.0.0** - Initial release with core mess management features
- Bilingual support (Marathi/English)
- Firebase integration
- Responsive design
- Customer and attendance management
