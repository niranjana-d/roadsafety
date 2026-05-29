# DriveLegal 🚗⚖️

An AI-powered traffic law awareness and challan assistance mobile application, designed with a **mobile-first, offline-first** architecture for the Indian ecosystem.

## Features ✨
- **Offline-First Capabilities**: Access core traffic laws and emergency contacts even without internet connectivity.
- **Challan Calculator**: Estimate your fines based on vehicle type, location (all 28 states & 8 UTs), and offence history.
- **AI Chatbot**: Ask complex traffic law questions in plain language (English & Hindi support).
- **Laws Library**: Searchable database of all Motor Vehicles Act sections and state-specific amendments.
- **Emergency SOS**: Quick access to national and state-specific helplines, accident checklist, and rights.
- **Multi-State Support**: Comprehensive coverage of rules across all Indian states and union territories.

## Tech Stack 🛠️
- **Framework**: React Native with Expo (TypeScript)
- **State Management**: Zustand with persistent storage (`AsyncStorage`)
- **Styling**: Context-based theming (Light/Dark mode) with StyleSheet
- **Navigation**: Expo Router (File-based routing)
- **Data Architecture**: Mock services designed for seamless backend replacement

## Getting Started 🚀

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app on your physical device (iOS/Android) or an Emulator

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd drivelegal-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   *(Ensure you have installed `zustand`, `@react-native-async-storage/async-storage`, and other core Expo packages).*

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

4. Open the app:
   - **On Physical Device**: Scan the QR code using the Expo Go app (Android) or the Camera app (iOS).
   - **On Emulator**: Press `a` for Android Emulator or `i` for iOS Simulator.

## Architecture 🏗️
The project follows an **Atomic Design Structure**:
- `/app` - Expo Router screens (Splash, Tabs, Modals)
- `/src/components` - Reusable UI components
- `/src/constants` - App constants (States, Violations, Vehicles, Theme)
- `/src/store` - Zustand stores (Offline, Location, Chat, User, etc.)
- `/src/services` - Service layer for API/Mock interactions
- `/src/types` - TypeScript interfaces
- `/src/utils` - Helper functions

## Next Steps
- Integrate real backend APIs (replace `src/services/mock`).
- Finalize localized content (Hindi translations).
- Setup CI/CD pipelines.

## License
MIT
