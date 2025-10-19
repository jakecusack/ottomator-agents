import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';
import {TaskStorage} from '../services/TaskStorage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  highPriority: number;
}

const HomeScreen = ({navigation}: Props) => {
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0,
  });

  useEffect(() => {
    loadStats();
    const unsubscribe = navigation.addListener('focus', loadStats);
    return unsubscribe;
  }, [navigation]);

  const loadStats = async () => {
    const tasks = await TaskStorage.getTasks();
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const highPriority = tasks.filter(
      t => t.status === 'pending' && (t.priority === 'high' || t.priority === 'urgent'),
    ).length;

    setStats({
      total: tasks.length,
      completed,
      pending,
      highPriority,
    });
  };

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Voice To-Do</Text>
          <Text style={styles.subtitle}>
            Manage your tasks with your voice
          </Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Today's Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.completedColor]}>
                {stats.completed}
              </Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.pendingColor]}>
                {stats.pending}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.urgentColor]}>
                {stats.highPriority}
              </Text>
              <Text style={styles.statLabel}>Urgent</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, {width: `${completionRate}%`}]}
            />
          </View>
          <Text style={styles.progressText}>{completionRate}% Complete</Text>
        </View>

        {/* Main Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => navigation.navigate('Voice')}>
            <Icon name="microphone" size={40} color="#0a0a0a" />
            <Text style={styles.primaryButtonText}>Talk to Assistant</Text>
            <Text style={styles.buttonSubtext}>
              Add tasks, get updates, and more
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('TaskList')}>
              <Icon name="format-list-checks" size={30} color="#00ffff" />
              <Text style={styles.secondaryButtonText}>View Tasks</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Settings')}>
              <Icon name="cog" size={30} color="#00ffff" />
              <Text style={styles.secondaryButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <Text style={styles.tipText}>
            • Say "What should I work on next?" for smart suggestions
          </Text>
          <Text style={styles.tipText}>
            • Say "Show me my tasks" to see your full list
          </Text>
          <Text style={styles.tipText}>
            • Say "I finished [task]" to mark it complete
          </Text>
          <Text style={styles.tipText}>
            • Say "How am I doing?" for a progress summary
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  statsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 4,
  },
  completedColor: {
    color: '#00ff00',
  },
  pendingColor: {
    color: '#ffff00',
  },
  urgentColor: {
    color: '#ff0000',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ffff',
  },
  progressText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#00ffff',
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a0a0a',
    marginTop: 12,
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#333',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00ffff',
    marginTop: 8,
  },
  tipsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default HomeScreen;

