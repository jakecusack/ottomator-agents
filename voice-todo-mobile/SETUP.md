# Setup Guide - VS Code Development

Complete guide for setting up the Voice To-Do mobile app development environment in VS Code on your PC.

## Prerequisites Installation

### 1. Install Node.js

**Windows:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Run the installer
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

**macOS:**
```bash
brew install node
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install VS Code

1. Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. Install for your platform
3. Launch VS Code

### 3. Install Git

**Windows:**
- Download from [git-scm.com](https://git-scm.com/)
- Run installer

**macOS:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt-get install git
```

### 4. Install React Native CLI

```bash
npm install -g react-native-cli
```

### 5. Platform-Specific Setup

#### For iOS Development (macOS only)

1. **Install Xcode:**
   - Download from Mac App Store
   - Install Command Line Tools:
     ```bash
     xcode-select --install
     ```

2. **Install CocoaPods:**
   ```bash
   sudo gem install cocoapods
   ```

3. **Install iOS Simulator:**
   - Open Xcode
   - Preferences > Components
   - Download iOS simulators

#### For Android Development (All platforms)

1. **Install Android Studio:**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Run installer
   - Open Android Studio

2. **Install Android SDK:**
   - Open Android Studio
   - Tools > SDK Manager
   - Install:
     - Android SDK Platform 31 (or later)
     - Android SDK Build-Tools
     - Android Emulator
     - Android SDK Platform-Tools

3. **Set Environment Variables:**

   **Windows (PowerShell):**
   ```powershell
   [System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\YourUsername\AppData\Local\Android\Sdk', 'User')
   [System.Environment]::SetEnvironmentVariable('Path', $env:Path + ';C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools', 'User')
   ```

   **macOS/Linux (add to ~/.bash_profile or ~/.zshrc):**
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

4. **Create Android Emulator:**
   - Open Android Studio
   - Tools > AVD Manager
   - Create Virtual Device
   - Select a device (e.g., Pixel 5)
   - Select system image (API 31+)
   - Finish

## Project Setup

### 1. Clone Repository

```bash
git clone https://github.com/jakecusack/ottomator-agents.git
cd ottomator-agents/voice-todo-mobile
```

### 2. Open in VS Code

```bash
code .
```

Or:
- Open VS Code
- File > Open Folder
- Select `voice-todo-mobile` folder

### 3. Install VS Code Extensions

When you open the project, VS Code will prompt you to install recommended extensions. Click "Install All".

Or install manually:

1. **React Native Tools** (msjsdiag.vscode-react-native)
2. **ESLint** (dbaeumer.vscode-eslint)
3. **Prettier** (esbenp.prettier-vscode)
4. **ES7+ React/Redux/React-Native snippets** (dsznajder.es7-react-js-snippets)
5. **Auto Import** (steoates.autoimport)

### 4. Install Project Dependencies

In VS Code terminal (View > Terminal or Ctrl+`):

```bash
npm install
```

### 5. Platform-Specific Setup

#### iOS (macOS only)

```bash
cd ios
pod install
cd ..
```

#### Android

No additional setup needed. Dependencies are managed by Gradle.

## Running the App

### Start Metro Bundler

In VS Code terminal:

```bash
npm start
```

Keep this running in one terminal.

### Run on iOS (macOS only)

Open a new terminal in VS Code (Terminal > New Terminal):

```bash
npm run ios
```

Or select a specific simulator:

```bash
npm run ios -- --simulator="iPhone 14 Pro"
```

### Run on Android

Open a new terminal in VS Code:

```bash
npm run android
```

Make sure an emulator is running or a device is connected.

## VS Code Development Workflow

### 1. File Navigation

- **Quick Open**: `Cmd/Ctrl + P` - Type filename to open
- **Go to Symbol**: `Cmd/Ctrl + Shift + O` - Navigate within file
- **Go to Definition**: `F12` - Jump to function/component definition
- **Peek Definition**: `Alt + F12` - View definition inline

### 2. Code Editing

- **Auto Format**: `Shift + Alt + F` - Format current file
- **Auto Import**: Type component name, select from autocomplete
- **Rename Symbol**: `F2` - Rename variable/function everywhere
- **Multi-cursor**: `Alt + Click` - Edit multiple locations

### 3. Debugging

#### Start Debugging

1. Press `F5` or click Run > Start Debugging
2. Select "Debug Android" or "Debug iOS"
3. App will launch with debugger attached

#### Set Breakpoints

- Click left of line number to set breakpoint
- Red dot appears
- App will pause when line is reached

#### Debug Controls

- **Continue**: `F5`
- **Step Over**: `F10`
- **Step Into**: `F11`
- **Step Out**: `Shift + F11`

#### Debug Console

- View variables
- Execute code
- See console.log output

### 4. Git Integration

#### Stage Changes

- Click Source Control icon (left sidebar)
- Click `+` next to files to stage

#### Commit

- Enter commit message
- Click checkmark or `Cmd/Ctrl + Enter`

#### Push

- Click `...` > Push
- Or use terminal: `git push`

### 5. Terminal

- **Open Terminal**: `` Ctrl + ` ``
- **New Terminal**: `Cmd/Ctrl + Shift + ` `
- **Split Terminal**: Click split icon
- **Multiple Terminals**: Run Metro, iOS, Android separately

## Development Tips

### Hot Reload

- **Fast Refresh**: Enabled by default
- Changes appear automatically
- Shake device/emulator for dev menu
- Press `R` to reload manually

### React Native Dev Menu

**iOS Simulator:**
- Press `Cmd + D`

**Android Emulator:**
- Press `Cmd/Ctrl + M`
- Or shake the device

**Options:**
- Reload
- Debug
- Enable Fast Refresh
- Show Inspector
- Show Perf Monitor

### Code Snippets

Type these prefixes and press Tab:

- `rnf` - React Native function component
- `rnc` - React Native class component
- `uss` - useState hook
- `uef` - useEffect hook
- `sty` - StyleSheet.create

### Useful VS Code Shortcuts

**General:**
- `Cmd/Ctrl + Shift + P` - Command Palette
- `Cmd/Ctrl + B` - Toggle Sidebar
- `Cmd/Ctrl + J` - Toggle Panel

**Editing:**
- `Cmd/Ctrl + /` - Toggle Comment
- `Alt + Up/Down` - Move Line
- `Shift + Alt + Up/Down` - Copy Line

**Search:**
- `Cmd/Ctrl + F` - Find in File
- `Cmd/Ctrl + Shift + F` - Find in Project
- `Cmd/Ctrl + H` - Replace in File

## Troubleshooting

### Metro Bundler Issues

**Cache problems:**
```bash
npm start -- --reset-cache
```

**Port already in use:**
```bash
# Kill process on port 8081
# Windows:
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8081 | xargs kill
```

### Build Issues

**iOS:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

**Android:**
```bash
cd android
./gradlew clean
cd ..
```

### VS Code Issues

**Extensions not working:**
1. Reload Window: `Cmd/Ctrl + Shift + P` > "Reload Window"
2. Restart VS Code

**IntelliSense not working:**
1. Check TypeScript version: Bottom right of VS Code
2. Use workspace version: Click version > "Use Workspace Version"

**Debugger not attaching:**
1. Stop all running processes
2. Close Metro bundler
3. Restart debugger

### Common Errors

**"Unable to resolve module":**
```bash
npm install
npm start -- --reset-cache
```

**"Command not found: react-native":**
```bash
npm install -g react-native-cli
```

**"SDK location not found":**
- Set ANDROID_HOME environment variable
- Restart terminal/VS Code

## Next Steps

### 1. Configure LiveKit

See README.md section "Configuration" for:
- Deploying the voice agent
- Getting LiveKit credentials
- Configuring in the app

### 2. Customize the App

- Modify colors in StyleSheets
- Add new screens
- Create custom components
- Add features

### 3. Test on Real Devices

**iOS:**
1. Connect iPhone via USB
2. Trust computer on device
3. Select device in Xcode
4. Run

**Android:**
1. Enable Developer Options on device
2. Enable USB Debugging
3. Connect via USB
4. Run `npm run android`

### 4. Build for Production

See README.md section "Building for Production"

## Resources

### Documentation
- [React Native Docs](https://reactnative.dev/)
- [VS Code Docs](https://code.visualstudio.com/docs)
- [LiveKit React Native](https://docs.livekit.io/client-sdk-js/react-native/)

### Learning
- [React Native Tutorial](https://reactnative.dev/docs/tutorial)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

### Community
- [React Native Community](https://reactnative.dev/community/overview)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
- [Discord Servers](https://reactnative.dev/community/overview#discord)

## Support

If you encounter issues:

1. Check this SETUP guide
2. Review README.md troubleshooting
3. Search React Native docs
4. Check GitHub issues
5. Ask in community forums

---

**Happy Coding in VS Code! 🚀**

You're all set to develop a cross-platform mobile app with voice AI integration.

