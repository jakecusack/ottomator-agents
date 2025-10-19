import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';
import {TaskStorage, Task} from '../services/TaskStorage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

const TaskListScreen = ({navigation}: Props) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadTasks();
    const unsubscribe = navigation.addListener('focus', loadTasks);
    return unsubscribe;
  }, [navigation]);

  const loadTasks = async () => {
    const allTasks = await TaskStorage.getTasks();
    setTasks(allTasks);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updatedTask = {
      ...task,
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    };
    await TaskStorage.updateTask(updatedTask);
    loadTasks();
  };

  const handleDeleteTask = async (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.description}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await TaskStorage.deleteTask(task.id);
            loadTasks();
          },
        },
      ],
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {icon: 'alert-circle', color: '#ff0000'};
      case 'high':
        return {icon: 'arrow-up-circle', color: '#ff8800'};
      case 'medium':
        return {icon: 'minus-circle', color: '#ffff00'};
      case 'low':
        return {icon: 'arrow-down-circle', color: '#00ffff'};
      default:
        return {icon: 'circle-outline', color: '#888'};
    }
  };

  const renderTask = ({item}: {item: Task}) => {
    const priorityInfo = getPriorityIcon(item.priority);
    const isCompleted = item.status === 'completed';

    return (
      <View style={styles.taskCard}>
        <TouchableOpacity
          style={styles.taskContent}
          onPress={() => handleToggleComplete(item)}>
          <View style={styles.taskLeft}>
            <Icon
              name={isCompleted ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={24}
              color={isCompleted ? '#00ff00' : '#00ffff'}
            />
            <View style={styles.taskInfo}>
              <Text
                style={[
                  styles.taskDescription,
                  isCompleted && styles.taskCompleted,
                ]}>
                {item.description}
              </Text>
              {item.due_date && (
                <Text style={styles.taskDueDate}>Due: {item.due_date}</Text>
              )}
            </View>
          </View>
          <View style={styles.taskRight}>
            <Icon
              name={priorityInfo.icon}
              size={20}
              color={priorityInfo.color}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTask(item)}>
          <Icon name="delete" size={20} color="#ff0000" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}>
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}>
            All ({tasks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'pending' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('pending')}>
          <Text
            style={[
              styles.filterText,
              filter === 'pending' && styles.filterTextActive,
            ]}>
            Pending ({tasks.filter(t => t.status === 'pending').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'completed' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('completed')}>
          <Text
            style={[
              styles.filterText,
              filter === 'completed' && styles.filterTextActive,
            ]}>
            Done ({tasks.filter(t => t.status === 'completed').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="checkbox-marked-circle-outline" size={64} color="#333" />
          <Text style={styles.emptyText}>
            {filter === 'all'
              ? 'No tasks yet. Use voice to add some!'
              : filter === 'pending'
              ? 'No pending tasks. Great job!'
              : 'No completed tasks yet. Keep going!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Priority Levels:</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <Icon name="alert-circle" size={16} color="#ff0000" />
            <Text style={styles.legendText}>Urgent</Text>
          </View>
          <View style={styles.legendItem}>
            <Icon name="arrow-up-circle" size={16} color="#ff8800" />
            <Text style={styles.legendText}>High</Text>
          </View>
          <View style={styles.legendItem}>
            <Icon name="minus-circle" size={16} color="#ffff00" />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <Icon name="arrow-down-circle" size={16} color="#00ffff" />
            <Text style={styles.legendText}>Low</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#00ffff',
  },
  filterText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#0a0a0a',
  },
  listContent: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  taskLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskDescription: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  taskDueDate: {
    fontSize: 12,
    color: '#888',
  },
  taskRight: {
    marginLeft: 12,
  },
  deleteButton: {
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  legend: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  legendTitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
});

export default TaskListScreen;

