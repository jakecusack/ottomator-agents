import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';
import {LiveKitService} from '../services/LiveKitService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Voice'>;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const VoiceScreen = ({navigation}: Props) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [liveKitService] = useState(() => new LiveKitService());

  useEffect(() => {
    // Set up event listeners
    liveKitService.on('connected', handleConnected);
    liveKitService.on('disconnected', handleDisconnected);
    liveKitService.on('userSpeech', handleUserSpeech);
    liveKitService.on('agentSpeech', handleAgentSpeech);
    liveKitService.on('error', handleError);

    return () => {
      liveKitService.disconnect();
    };
  }, []);

  const handleConnected = () => {
    setIsConnected(true);
    setIsConnecting(false);
    addMessage('Connected to voice assistant!', false);
  };

  const handleDisconnected = () => {
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
  };

  const handleUserSpeech = (text: string) => {
    addMessage(text, true);
  };

  const handleAgentSpeech = (text: string) => {
    addMessage(text, false);
  };

  const handleError = (error: string) => {
    Alert.alert('Error', error);
    setIsConnecting(false);
  };

  const addMessage = (text: string, isUser: boolean) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await liveKitService.connect();
    } catch (error) {
      Alert.alert('Connection Error', 'Failed to connect to voice assistant');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    liveKitService.disconnect();
  };

  const handleToggleMicrophone = () => {
    if (isSpeaking) {
      liveKitService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      liveKitService.startSpeaking();
      setIsSpeaking(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="microphone-outline" size={64} color="#333" />
            <Text style={styles.emptyText}>
              {isConnected
                ? 'Start talking to your assistant'
                : 'Connect to start a conversation'}
            </Text>
          </View>
        ) : (
          messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.agentBubble,
              ]}>
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.agentText,
                ]}>
                {message.text}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  message.isUser ? styles.userTime : styles.agentTime,
                ]}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {!isConnected ? (
          <TouchableOpacity
            style={[styles.connectButton, isConnecting && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={isConnecting}>
            {isConnecting ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <>
                <Icon name="power" size={24} color="#0a0a0a" />
                <Text style={styles.connectButtonText}>Connect</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.connectedControls}>
            {/* Microphone Button */}
            <TouchableOpacity
              style={[
                styles.micButton,
                isSpeaking && styles.micButtonActive,
              ]}
              onPress={handleToggleMicrophone}>
              <Icon
                name={isSpeaking ? 'microphone' : 'microphone-off'}
                size={48}
                color={isSpeaking ? '#0a0a0a' : '#00ffff'}
              />
            </TouchableOpacity>

            {/* Disconnect Button */}
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}>
              <Icon name="power" size={24} color="#ff0000" />
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              isConnected && styles.statusDotConnected,
            ]}
          />
          <Text style={styles.statusText}>
            {isConnecting
              ? 'Connecting...'
              : isConnected
              ? isSpeaking
                ? 'Listening...'
                : 'Connected (tap mic to talk)'
              : 'Disconnected'}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      {isConnected && (
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Commands:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => liveKitService.sendText('Show me my tasks')}>
              <Text style={styles.quickActionText}>📋 Show Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() =>
                liveKitService.sendText('What should I work on next?')
              }>
              <Text style={styles.quickActionText}>💡 Next Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => liveKitService.sendText('How am I doing today?')}>
              <Text style={styles.quickActionText}>📊 Progress</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#00ffff',
  },
  agentBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#0a0a0a',
  },
  agentText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userTime: {
    color: '#0a0a0a',
    opacity: 0.7,
  },
  agentTime: {
    color: '#666',
  },
  controlsContainer: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  connectButton: {
    backgroundColor: '#00ffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  connectButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a0a0a',
    marginLeft: 8,
  },
  connectedControls: {
    alignItems: 'center',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  micButtonActive: {
    backgroundColor: '#00ffff',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  disconnectButtonText: {
    fontSize: 14,
    color: '#ff0000',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginRight: 8,
  },
  statusDotConnected: {
    backgroundColor: '#00ff00',
  },
  statusText: {
    fontSize: 14,
    color: '#888',
  },
  quickActions: {
    padding: 16,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  quickActionsTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  quickActionButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#00ffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: '#00ffff',
  },
});

export default VoiceScreen;

