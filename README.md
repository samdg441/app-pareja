# Love Touch - 8-Bit Pixel Art App

A private React Native app for couples built with Expo and Supabase, featuring a retro 8-bit pixel art aesthetic.

## Features

- **Touch Feature**: Send love touches to your partner with haptic feedback via Supabase Realtime
- **Habit Tracker**: Create and track habits with a 7x5 pixel art calendar grid
- **Theme System**: Switch between 5 monochromatic 4-color palettes (Blue, Green, Purple, Red, Amber)
- **Partner Linking**: Pair accounts using UUIDs

## Tech Stack

- **Frontend**: React Native, Expo, TypeScript
- **Navigation**: React Navigation (Bottom Tabs)
- **Backend**: Supabase (Auth, Database, Realtime)
- **Styling**: React Native StyleSheet (no UI libraries for authentic pixel art look)

## Project Structure

```
/workspace
├── App.tsx                 # Main app entry point
├── app.json                # Expo configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
└── src/
    ├── components/         # Reusable pixel art components
    │   ├── PixelButton.tsx
    │   ├── PixelInput.tsx
    │   ├── PixelHeart.tsx
    │   ├── PixelCalendar.tsx
    │   ├── PixelColorPicker.tsx
    │   └── ThemeSwatch.tsx
    ├── screens/            # App screens
    │   ├── OnboardingScreen.tsx
    │   ├── HomeScreen.tsx
    │   ├── AddTaskScreen.tsx
    │   ├── PixelCalendarScreen.tsx
    │   └── ProfileScreen.tsx
    ├── navigation/         # Navigation setup
    │   └── AppNavigator.tsx
    ├── context/            # React Context providers
    │   └── ThemeContext.tsx
    ├── theme/              # Theme definitions
    │   └── colors.ts
    └── utils/              # Utilities
        └── supabase.ts
```

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Supabase**:
   - Update `src/utils/supabase.ts` with your Supabase URL and anon key
   - Create the following tables in your Supabase database:

   ```sql
   -- Users table (handled by Supabase Auth)
   
   -- Partner links table
   CREATE TABLE partner_links (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     partner_id UUID REFERENCES auth.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Tasks table
   CREATE TABLE tasks (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     name TEXT NOT NULL,
     color TEXT NOT NULL,
     rest_days INTEGER[] DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Task completions table
   CREATE TABLE task_completions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     task_id UUID REFERENCES tasks(id),
     user_id UUID REFERENCES auth.users(id),
     completed_date DATE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Touches table
   CREATE TABLE touches (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     sender_id UUID REFERENCES auth.users(id),
     receiver_id UUID REFERENCES auth.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Run the app**:
   ```bash
   npm start
   ```

## Theme System

The app uses a 4-color monochromatic palette system inspired by retro gaming:
- Background
- Surface
- Primary Light
- Primary Medium
- Primary Dark

Available themes: Blue, Green, Purple, Red, Amber

## Pixel Art Design

All UI elements use:
- 4px borders for blocky appearance
- Monospace font family
- Sharp shadows (no blur)
- No rounded corners

## License

Private project for personal use.
