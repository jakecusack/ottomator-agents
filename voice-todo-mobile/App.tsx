/**
 * Voice To-Do Mobile App
 * React Native app with LiveKit voice agent integration
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import VoiceScreen from './src/screens/VoiceScreen';
import TaskListScreen from './src/screens/TaskListScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Types
export type RootStackParamList = {
  Home: undefined;
  Voice: undefined;
  TaskList: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a1a',
            },
            headerTintColor: '#00ffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: '#0a0a0a',
            },
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: 'Voice To-Do'}}
          />
          <Stack.Screen
            name="Voice"
            component={VoiceScreen}
            options={{title: 'Talk to Assistant'}}
          />
          <Stack.Screen
            name="TaskList"
            component={TaskListScreen}
            options={{title: 'My Tasks'}}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{title: 'Settings'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;

