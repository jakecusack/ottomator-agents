/**
 * LiveKit Service
 * Handles connection to LiveKit voice agent
 */

import {Room, RoomEvent, Track, Participant} from '@livekit/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {EventEmitter} from 'events';

export class LiveKitService extends EventEmitter {
  private room: Room | null = null;
  private isConnected: boolean = false;

  constructor() {
    super();
  }

  /**
   * Connect to LiveKit room
   */
  async connect(): Promise<void> {
    try {
      // Get credentials from storage
      const url = await AsyncStorage.getItem('livekit_url');
      const token = await AsyncStorage.getItem('livekit_token');

      if (!url || !token) {
        throw new Error(
          'LiveKit credentials not configured. Please set them in Settings.',
        );
      }

      // Create room
      this.room = new Room();

      // Set up event listeners
      this.setupEventListeners();

      // Connect to room
      await this.room.connect(url, token);

      this.isConnected = true;
      this.emit('connected');
    } catch (error) {
      console.error('Failed to connect to LiveKit:', error);
      this.emit('error', error.message || 'Failed to connect');
      throw error;
    }
  }

  /**
   * Disconnect from LiveKit room
   */
  disconnect(): void {
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
    this.isConnected = false;
    this.emit('disconnected');
  }

  /**
   * Start speaking (enable microphone)
   */
  async startSpeaking(): Promise<void> {
    if (!this.room) {
      throw new Error('Not connected to room');
    }

    try {
      await this.room.localParticipant.setMicrophoneEnabled(true);
      this.emit('speakingStarted');
    } catch (error) {
      console.error('Failed to enable microphone:', error);
      this.emit('error', 'Failed to enable microphone');
      throw error;
    }
  }

  /**
   * Stop speaking (disable microphone)
   */
  async stopSpeaking(): Promise<void> {
    if (!this.room) {
      throw new Error('Not connected to room');
    }

    try {
      await this.room.localParticipant.setMicrophoneEnabled(false);
      this.emit('speakingStopped');
    } catch (error) {
      console.error('Failed to disable microphone:', error);
      this.emit('error', 'Failed to disable microphone');
      throw error;
    }
  }

  /**
   * Send text message to agent (for quick commands)
   */
  async sendText(text: string): Promise<void> {
    if (!this.room) {
      throw new Error('Not connected to room');
    }

    try {
      // Send as data message
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      await this.room.localParticipant.publishData(data, {reliable: true});
      this.emit('userSpeech', text);
    } catch (error) {
      console.error('Failed to send text:', error);
      this.emit('error', 'Failed to send message');
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Set up event listeners for room events
   */
  private setupEventListeners(): void {
    if (!this.room) return;

    // Connection state changes
    this.room.on(RoomEvent.Connected, () => {
      console.log('Connected to room');
      this.isConnected = true;
      this.emit('connected');
    });

    this.room.on(RoomEvent.Disconnected, () => {
      console.log('Disconnected from room');
      this.isConnected = false;
      this.emit('disconnected');
    });

    // Participant events
    this.room.on(RoomEvent.ParticipantConnected, (participant: Participant) => {
      console.log('Participant connected:', participant.identity);
    });

    // Track events
    this.room.on(RoomEvent.TrackSubscribed, (track: Track) => {
      console.log('Track subscribed:', track.kind);
      if (track.kind === Track.Kind.Audio) {
        // Audio track from agent
        this.handleAgentAudio(track);
      }
    });

    // Data received (agent responses)
    this.room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
      const decoder = new TextDecoder();
      const text = decoder.decode(payload);
      console.log('Data received:', text);
      this.emit('agentSpeech', text);
    });

    // Errors
    this.room.on(RoomEvent.ConnectionQualityChanged, (quality: string) => {
      console.log('Connection quality:', quality);
    });
  }

  /**
   * Handle audio track from agent
   */
  private handleAgentAudio(track: Track): void {
    // Audio will be played automatically by LiveKit
    console.log('Agent audio track received');
  }
}

