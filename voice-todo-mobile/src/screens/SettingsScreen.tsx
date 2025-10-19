import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen = ({navigation}: Props) => {
  const [livekitUrl, setLivekitUrl] = useState('');
  const [livekitToken, setLivekitToken] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const url = await AsyncStorage.getItem('livekit_url');
      const token = await AsyncStorage.getItem('livekit_token');
      if (url) setLivekitUrl(url);
      if (token) setLivekitToken(token);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('livekit_url', livekitUrl);
      await AsyncStorage.setItem('livekit_token', livekitToken);
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const clearSettings = () => {
    Alert.alert(
      'Clear Settings',
      'Are you sure you want to clear all settings?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setLivekitUrl('');
            setLivekitToken('');
            await AsyncStorage.removeItem('livekit_url');
            await AsyncStorage.removeItem('livekit_token');
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* LiveKit Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LiveKit Configuration</Text>
        <Text style={styles.sectionDescription}>
          Configure your LiveKit server connection to enable voice features.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>LiveKit URL</Text>
          <TextInput
            style={styles.input}
            value={livekitUrl}
            onChangeText={setLivekitUrl}
            placeholder="wss://your-server.livekit.cloud"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            Your LiveKit server URL (starts with wss://)
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>LiveKit Token</Text>
          <TextInput
            style={styles.input}
            value={livekitToken}
            onChangeText={setLivekitToken}
            placeholder="Your access token"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <Text style={styles.hint}>
            Your LiveKit access token for authentication
          </Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Icon name="content-save" size={20} color="#0a0a0a" />
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Setup Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📖 Setup Instructions</Text>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionStep}>1. Deploy the Agent</Text>
          <Text style={styles.instructionText}>
            Deploy the voice-todo-agent to LiveKit Cloud or your own server
          </Text>
        </View>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionStep}>2. Get Your URL</Text>
          <Text style={styles.instructionText}>
            Copy your LiveKit server URL (e.g., wss://your-project.livekit.cloud)
          </Text>
        </View>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionStep}>3. Generate Token</Text>
          <Text style={styles.instructionText}>
            Create an access token using the LiveKit CLI or dashboard
          </Text>
        </View>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionStep}>4. Enter Credentials</Text>
          <Text style={styles.instructionText}>
            Paste your URL and token above, then save
          </Text>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>Voice To-Do Mobile</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutDescription}>
            A voice-powered to-do list app built with React Native and LiveKit
          </Text>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Danger Zone</Text>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={clearSettings}>
          <Icon name="delete-forever" size={20} color="#ff0000" />
          <Text style={styles.dangerButtonText}>Clear All Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#00ffff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a0a0a',
    marginLeft: 8,
  },
  instructionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#00ffff',
  },
  instructionStep: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00ffff',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  aboutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  aboutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    color: '#00ffff',
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  dangerButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#ff0000',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff0000',
    marginLeft: 8,
  },
});

export default SettingsScreen;

