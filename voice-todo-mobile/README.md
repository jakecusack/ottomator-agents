# Voice To-Do Mobile App

A cross-platform React Native mobile app for managing your to-do list with voice commands using LiveKit.

## Overview

This is a **React Native mobile application** that connects to the voice-powered to-do list agent. It provides a beautiful, native mobile experience for iOS and Android, allowing you to manage your tasks through natural voice conversation.

### Key Features

- 🎤 **Voice Interaction** - Talk to your to-do list naturally
- 📱 **Cross-Platform** - Works on both iOS and Android
- 🎨 **Dark Theme** - Beautiful CMYK-inspired dark UI
- 💾 **Local Storage** - Tasks stored on your device
- 🔒 **Private** - Your data stays with you
- ⚡ **Real-time** - Instant voice responses via LiveKit
- 🎯 **Smart UI** - View tasks, progress, and statistics

## Screenshots

### Home Screen
- Daily progress dashboard
- Quick stats (total, completed, pending, urgent)
- Progress bar and completion percentage
- Quick access to voice assistant and task list

### Voice Screen
- Real-time conversation with agent
- Message bubbles (user vs agent)
- Microphone control
- Quick command buttons
- Connection status indicator

### Task List Screen
- Filter by all/pending/completed
- Priority indicators (🔴🟠🟡🔵)
- Tap to complete/uncomplete
- Swipe to delete
- Priority legend

### Settings Screen
- LiveKit server configuration
- Setup instructions
- About information

## Prerequisites

### Development Environment

1. **Node.js** (v18 or later)
   ```bash
   node --version
   ```

2. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

3. **For iOS Development:**
   - macOS required
   - Xcode 14 or later
   - CocoaPods
   ```bash
   sudo gem install cocoapods
   ```

4. **For Android Development:**
   - Android Studio
   - Android SDK (API 31 or later)
   - JDK 11 or later

5. **VS Code** (Recommended)
   - React Native Tools extension
   - ESLint extension
   - Prettier extension

### Backend Requirements

- Deployed voice-todo-agent (see `../voice-todo-agent/`)
- LiveKit server URL
- LiveKit access token

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/jakecusack/ottomator-agents.git
cd ottomator-agents/voice-todo-mobile
```

### 2. Install Dependencies

```bash
npm install
```

### 3. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 4. Configure Environment

```bash
cp .env.example .env
```

**Note:** LiveKit credentials are configured in the app's Settings screen, not in `.env`.

## Running the App

### iOS (macOS only)

```bash
npm run ios
```

Or open `ios/VoiceToDo.xcworkspace` in Xcode and run.

### Android

```bash
npm run android
```

Or open the `android` folder in Android Studio and run.

### Development Server

The Metro bundler will start automatically. If not:

```bash
npm start
```

## VS Code Development

### Recommended Extensions

Install these VS Code extensions for the best experience:

1. **React Native Tools** - Microsoft
2. **ESLint** - Microsoft
3. **Prettier - Code formatter**
4. **React-Native/React/Redux snippets**
5. **Auto Import - ES6, TS, JSX, TSX**

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Debugging in VS Code

1. Install React Native Tools extension
2. Press F5 or go to Run > Start Debugging
3. Select "Debug Android" or "Debug iOS"
4. Set breakpoints in your code
5. Use the Debug Console

### Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Android",
      "cwd": "${workspaceFolder}",
      "type": "reactnative",
      "request": "launch",
      "platform": "android"
    },
    {
      "name": "Debug iOS",
      "cwd": "${workspaceFolder}",
      "type": "reactnative",
      "request": "launch",
      "platform": "ios"
    }
  ]
}
```

## Configuration

### Setting Up LiveKit Connection

1. **Deploy the Agent**
   - Deploy `voice-todo-agent` to LiveKit Cloud or your server
   - See `../voice-todo-agent/README.md` for deployment instructions

2. **Get Your Credentials**
   - **LiveKit URL**: Your server URL (e.g., `wss://your-project.livekit.cloud`)
   - **Access Token**: Generate using LiveKit CLI or dashboard

3. **Configure in App**
   - Open the app
   - Go to Settings
   - Enter your LiveKit URL
   - Enter your access token
   - Tap "Save Settings"

4. **Test Connection**
   - Go to Home screen
   - Tap "Talk to Assistant"
   - Tap "Connect"
   - Start talking!

### Generating Access Tokens

Using LiveKit CLI:

```bash
# Install LiveKit CLI
brew install livekit  # macOS
# or
curl -sSL https://get.livekit.io/ | bash  # Linux

# Generate token
lk token create \
  --api-key YOUR_API_KEY \
  --api-secret YOUR_API_SECRET \
  --identity user123 \
  --room todo-room \
  --valid-for 24h
```

## Project Structure

```
voice-todo-mobile/
├── App.tsx                      # Main app component
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Dashboard with stats
│   │   ├── VoiceScreen.tsx      # Voice interaction
│   │   ├── TaskListScreen.tsx   # Task management
│   │   └── SettingsScreen.tsx   # Configuration
│   └── services/
│       ├── LiveKitService.ts    # LiveKit integration
│       └── TaskStorage.ts       # Local task storage
├── ios/                         # iOS native code
├── android/                     # Android native code
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── babel.config.js             # Babel config
└── metro.config.js             # Metro bundler config
```

## Features in Detail

### Home Screen

**Dashboard showing:**
- Total tasks
- Completed tasks
- Pending tasks
- High-priority tasks
- Progress bar with completion percentage

**Quick Actions:**
- Talk to Assistant (primary button)
- View Tasks
- Settings

**Quick Tips:**
- Sample voice commands
- Usage examples

### Voice Screen

**Real-time Conversation:**
- User messages (cyan bubbles, right-aligned)
- Agent messages (dark bubbles, left-aligned)
- Timestamps on all messages

**Controls:**
- Connect/Disconnect button
- Microphone toggle (tap to talk)
- Connection status indicator

**Quick Commands:**
- "Show Tasks" button
- "Next Task" button
- "Progress" button

### Task List Screen

**Filtering:**
- All tasks
- Pending only
- Completed only

**Task Display:**
- Checkbox to toggle completion
- Task description
- Due date (if set)
- Priority indicator
- Delete button

**Priority Legend:**
- 🔴 Urgent (red)
- 🟠 High (orange)
- 🟡 Medium (yellow)
- 🔵 Low (cyan)

### Settings Screen

**Configuration:**
- LiveKit URL input
- Access token input (secure)
- Save settings button

**Setup Instructions:**
- Step-by-step guide
- Deployment instructions
- Token generation help

**About:**
- App version
- Description

## Customization

### Changing Colors

Edit the color scheme in each screen's `StyleSheet`:

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0a',  // Background
  },
  primaryButton: {
    backgroundColor: '#00ffff',  // Cyan accent
  },
  // ... more styles
});
```

### Adding Features

1. **New Screen:**
   - Create in `src/screens/`
   - Add to navigation in `App.tsx`
   - Import and use

2. **New Service:**
   - Create in `src/services/`
   - Export class/functions
   - Import where needed

3. **New Component:**
   - Create in `src/components/`
   - Export component
   - Use in screens

### Voice Commands

The app sends text to the agent via LiveKit. Add quick command buttons in `VoiceScreen.tsx`:

```typescript
<TouchableOpacity
  style={styles.quickActionButton}
  onPress={() => liveKitService.sendText('Your command here')}>
  <Text style={styles.quickActionText}>🎯 Button Label</Text>
</TouchableOpacity>
```

## Troubleshooting

### iOS Issues

**Pods not found:**
```bash
cd ios
pod install
cd ..
```

**Build fails:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

**Simulator not starting:**
- Open Xcode
- Window > Devices and Simulators
- Create/start a simulator

### Android Issues

**Gradle build fails:**
```bash
cd android
./gradlew clean
cd ..
```

**SDK not found:**
- Open Android Studio
- Tools > SDK Manager
- Install required SDK versions

**Emulator not starting:**
- Open Android Studio
- Tools > AVD Manager
- Create/start an emulator

### Connection Issues

**Can't connect to agent:**
- Verify LiveKit URL is correct (starts with `wss://`)
- Check access token is valid (not expired)
- Ensure agent is deployed and running
- Check network connectivity

**No audio:**
- Check microphone permissions
- Verify audio is enabled on device
- Test with device speakers (not silent mode)

**Messages not appearing:**
- Check LiveKit connection status
- Verify agent is responding
- Check console logs for errors

### Development Issues

**Metro bundler not starting:**
```bash
npm start -- --reset-cache
```

**TypeScript errors:**
```bash
npm run tsc
```

**Linting errors:**
```bash
npm run lint
```

## Building for Production

### iOS

1. **Configure signing:**
   - Open `ios/VoiceToDo.xcworkspace` in Xcode
   - Select project > Signing & Capabilities
   - Set your team and bundle identifier

2. **Build:**
   ```bash
   cd ios
   xcodebuild -workspace VoiceToDo.xcworkspace \
     -scheme VoiceToDo \
     -configuration Release \
     -archivePath build/VoiceToDo.xcarchive \
     archive
   ```

3. **Export IPA:**
   - Use Xcode Organizer
   - Or use `xcodebuild -exportArchive`

### Android

1. **Generate signing key:**
   ```bash
   keytool -genkeypair -v -storetype PKCS12 \
     -keystore my-release-key.keystore \
     -alias my-key-alias \
     -keyalg RSA -keysize 2048 \
     -validity 10000
   ```

2. **Configure gradle:**
   - Edit `android/gradle.properties`
   - Add signing config

3. **Build APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

4. **Find APK:**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

## Testing

### Manual Testing

1. **Home Screen:**
   - Verify stats display correctly
   - Test navigation to all screens
   - Check progress bar updates

2. **Voice Screen:**
   - Test connection/disconnection
   - Verify microphone toggle
   - Check message display
   - Test quick commands

3. **Task List:**
   - Test filtering
   - Toggle task completion
   - Delete tasks
   - Verify priority display

4. **Settings:**
   - Save/load credentials
   - Clear settings
   - Verify instructions display

### Automated Testing

```bash
npm test
```

## Performance Optimization

### Tips for Better Performance

1. **Use React.memo** for expensive components
2. **Optimize images** (use appropriate sizes)
3. **Lazy load** screens when possible
4. **Debounce** user input
5. **Cache** API responses
6. **Use FlatList** for long lists (already implemented)

### Monitoring

Use React Native Debugger:
```bash
npm install -g react-native-debugger
```

## Contributing

This is part of the [Ottomator Agents](https://github.com/jakecusack/ottomator-agents) collection.

## License

This project follows the license of the parent repository.

## Support

### Documentation
- [React Native Docs](https://reactnative.dev/)
- [LiveKit React Native](https://docs.livekit.io/client-sdk-js/react-native/)
- [Navigation Docs](https://reactnavigation.org/)

### Community
- [React Native Community](https://reactnative.dev/community/overview)
- [LiveKit Community](https://livekit.io/community)

### Issues
- Check the troubleshooting section
- Review React Native documentation
- Open an issue on GitHub

---

**Built with ❤️ using React Native and LiveKit**

Develop in VS Code. Deploy to iOS and Android. Manage tasks with your voice. 🎯

