# Voice-Powered To-Do List Agent

An interactive voice AI agent that helps you manage your daily tasks and goals through natural conversation. Simply talk to your agent about what you want to accomplish, and it will help you track, prioritize, and complete your tasks.

## Overview

This voice-powered to-do list agent provides a natural, conversational way to manage your tasks. Instead of typing or tapping, just speak naturally about what you want to do today, and the agent will:

- **Listen actively** to your goals and tasks
- **Ask clarifying questions** to understand your needs
- **Track your progress** throughout the day
- **Celebrate your wins** when you complete tasks
- **Suggest priorities** to help you focus
- **Provide motivation** to keep you going

## Features

### 🎤 Natural Voice Interaction

Talk to your to-do list like you would talk to a personal assistant. The agent understands natural language and responds conversationally.

**Example conversations:**
- "I want to finish the project report today"
- "What should I work on next?"
- "Show me my high priority tasks"
- "I completed the meeting preparation"

### ✅ Task Management

- **Add tasks** with natural language
- **Set priorities** (low, medium, high, urgent)
- **Add due dates** (today, tomorrow, specific dates)
- **Complete tasks** and track progress
- **Delete tasks** you no longer need
- **Update priorities** as things change

### 📊 Progress Tracking

- View all tasks or filter by status
- Get daily summaries of your progress
- See completion rates and statistics
- Track pending vs. completed tasks
- Monitor high-priority items

### 🎯 Smart Suggestions

- Get suggestions for what to work on next
- Prioritization based on urgency and importance
- Motivational feedback on your progress
- Celebration of completed tasks

### 💾 Persistent Storage

- Tasks are saved automatically to `tasks.json`
- Your to-do list persists between sessions
- Load previous tasks when you restart
- Clear completed tasks when you're ready

## Quick Start

### Prerequisites

- Python 3.9 or later
- UV package manager (or pip)
- OpenAI API key
- Deepgram API key

### Installation

1. **Install dependencies:**
   ```bash
   # Using UV (recommended)
   uv sync
   
   # Or using pip
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   ```

3. **Download model files:**
   ```bash
   uv run python todo_agent.py download-files
   ```

4. **Run the agent:**
   ```bash
   # Console mode (local testing)
   uv run python todo_agent.py console
   
   # Dev mode (browser access)
   uv run python todo_agent.py dev
   ```

## Usage

### Console Mode

The fastest way to test locally:

```bash
uv run python todo_agent.py console
```

**Sample conversation:**

```
Agent: "Hello! I'm your to-do list assistant. What would you like to accomplish today?"

You: "I need to finish the quarterly report, call the client, and review the budget"

Agent: "Got it! I've added three tasks to your list:
        1. Finish the quarterly report
        2. Call the client  
        3. Review the budget
        What priority should I set for these?"

You: "The client call is urgent, the report is high priority, and the budget review is medium"

Agent: "Perfect! I've updated the priorities. Would you like to see your full task list?"

You: "Yes, show me my tasks"

Agent: "Here are your tasks:
        🔴 Call the client (urgent) [ID: 2]
        🟠 Finish the quarterly report (high) [ID: 1]
        🟡 Review the budget (medium) [ID: 3]
        
        Total: 3 tasks (3 pending, 0 completed)"

You: "I finished the client call"

Agent: "Awesome! ✅ You completed 'Call the client'
        2 tasks remaining. Keep up the great work!"
```

### Development Mode

Test in your browser:

```bash
uv run python todo_agent.py dev
```

Then visit [agents-playground.livekit.io](https://agents-playground.livekit.io/) to interact with your agent.

## Available Commands

The agent understands natural language, so you can phrase things however you like. Here are some examples:

### Adding Tasks

- "Add finish the report to my list"
- "I need to call John today"
- "Remind me to review the budget, it's high priority"
- "I want to exercise tomorrow"

### Viewing Tasks

- "Show me my tasks"
- "What's on my list?"
- "Show me only pending tasks"
- "What are my high priority items?"
- "Show me today's tasks"

### Completing Tasks

- "I finished the report"
- "Mark task 3 as complete"
- "I'm done with the meeting preparation"

### Managing Tasks

- "Delete task 5"
- "Remove the budget review from my list"
- "Change task 2 to high priority"
- "Make the client call urgent"

### Getting Insights

- "What should I work on next?"
- "Give me a summary of my day"
- "How am I doing today?"
- "What's my progress?"

### Cleaning Up

- "Clear all completed tasks"
- "Remove finished items"

## Task Structure

Each task contains:

```json
{
  "id": 1,
  "description": "Finish the quarterly report",
  "priority": "high",
  "status": "pending",
  "created_at": "2025-10-19 14:30",
  "due_date": "today",
  "completed_at": null
}
```

### Priority Levels

- 🔴 **Urgent** - Do this immediately
- 🟠 **High** - Important, do soon
- 🟡 **Medium** - Normal priority (default)
- 🔵 **Low** - Do when you have time

### Status Values

- **Pending** - Not yet completed
- **Completed** - Finished

## Mobile App Integration

This agent is designed to work seamlessly with mobile apps through LiveKit's mobile SDKs:

### iOS Integration

```swift
import LiveKit

// Connect to your agent
let room = Room()
try await room.connect(url: livekitURL, token: token)

// Enable voice
let localParticipant = room.localParticipant
try await localParticipant.setMicrophone(enabled: true)
```

### Android Integration

```kotlin
import io.livekit.android.room.Room

// Connect to your agent
val room = Room()
room.connect(url = livekitURL, token = token)

// Enable voice
room.localParticipant.setMicrophoneEnabled(true)
```

### React Native Integration

```javascript
import { useRoom, useParticipant } from '@livekit/react-native';

// Connect and interact with your agent
const { connect } = useRoom();
await connect(livekitURL, token);
```

## Deployment

### LiveKit Cloud (Recommended)

1. **Install LiveKit CLI:**
   ```bash
   # macOS
   brew install livekit
   
   # Linux
   curl -sSL https://get.livekit.io/ | bash
   ```

2. **Authenticate:**
   ```bash
   lk cloud auth
   ```

3. **Configure environment:**
   ```bash
   lk app env -w
   ```
   
   Add your API keys to `.env.local`:
   ```bash
   OPENAI_API_KEY=your_key
   DEEPGRAM_API_KEY=your_key
   ```

4. **Deploy:**
   ```bash
   lk agent create
   ```

Your agent is now live and accessible from:
- Mobile apps (iOS, Android, React Native)
- Web browsers
- Phone calls (with Twilio integration)

### Self-Hosted

See the [deployment guide](../livekit-agent/DEPLOYMENT.md) for self-hosting options.

## Customization

### Change the Agent's Personality

Edit the `instructions` in `TodoAssistant.__init__()`:

```python
instructions="""You are a strict, no-nonsense productivity coach.
You push users to complete their tasks and don't accept excuses.
Be direct and motivating."""
```

### Add Custom Features

Add new tools by creating methods with the `@function_tool` decorator:

```python
@function_tool
async def schedule_task(self, context: RunContext, task_id: int, time: str) -> str:
    """Schedule a task for a specific time.
    
    Args:
        task_id: The task to schedule
        time: When to do it (e.g., '2pm', 'morning')
    """
    # Your implementation
    return f"Task scheduled for {time}"
```

### Change Voice Settings

Modify the `AgentSession` configuration in `entrypoint()`:

```python
session = AgentSession(
    stt=deepgram.STT(model="nova-2"),
    llm=openai.LLM(model="gpt-4.1-mini"),
    tts=openai.TTS(voice="alloy"),  # Try: alloy, echo, fable, onyx, nova, shimmer
    vad=silero.VAD.load(),
)
```

### Use Different AI Providers

```python
# Use Anthropic Claude
from livekit.plugins import anthropic
llm=anthropic.LLM(model="claude-3-5-sonnet")

# Use Cartesia for faster TTS
from livekit.plugins import cartesia
tts=cartesia.TTS(voice="sonic-2")

# Use AssemblyAI for STT
from livekit.plugins import assemblyai
stt=assemblyai.STT()
```

## Data Storage

Tasks are stored in `tasks.json` in the current directory:

```json
{
  "tasks": [
    {
      "id": 1,
      "description": "Finish quarterly report",
      "priority": "high",
      "status": "completed",
      "created_at": "2025-10-19 14:30",
      "due_date": "today",
      "completed_at": "2025-10-19 16:45"
    }
  ],
  "next_id": 2
}
```

### Database Integration

For production use, replace file storage with a database:

```python
import sqlite3

def save_tasks(self):
    """Save tasks to database."""
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    
    for task in self.tasks:
        cursor.execute('''
            INSERT OR REPLACE INTO tasks 
            (id, description, priority, status, created_at, due_date, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            task['id'], task['description'], task['priority'],
            task['status'], task['created_at'], task['due_date'],
            task['completed_at']
        ))
    
    conn.commit()
    conn.close()
```

## Privacy & Security

This agent is designed to be **private** and secure:

### Local Storage
- Tasks are stored locally in `tasks.json`
- No data sent to third parties (except AI providers for processing)
- You control where the data lives

### Self-Hosting
- Deploy on your own infrastructure
- Full control over data and privacy
- No vendor lock-in

### API Key Security
- Store API keys in environment variables
- Never commit `.env` to version control
- Use different keys for dev/prod

### User Authentication

For multi-user deployments, add authentication:

```python
class TodoAssistant(Agent):
    def __init__(self, user_id: str):
        super().__init__(...)
        self.user_id = user_id
        self.load_tasks(user_id)
    
    def load_tasks(self, user_id: str):
        """Load tasks for specific user."""
        filename = f"tasks_{user_id}.json"
        # Load user-specific tasks
```

## Troubleshooting

### Agent doesn't start
```bash
# Check Python version
python3 --version  # Should be 3.9+

# Reinstall dependencies
uv sync --reinstall

# Verify API keys
cat .env
```

### No audio in console mode
- Check microphone permissions
- Verify audio device selection
- Test with: `python -m sounddevice`

### Tasks not saving
- Check file permissions
- Verify `tasks.json` can be created
- Check for errors in console output

### Agent doesn't understand commands
- Speak clearly and naturally
- Try rephrasing your request
- Check that tools are properly defined
- Review LLM instructions

## Examples

### Morning Planning Session

```
Agent: "Good morning! What would you like to accomplish today?"

You: "I want to exercise, finish the presentation, and call mom"

Agent: "Great goals! I've added:
        - Exercise
        - Finish the presentation
        - Call mom
        
        Which of these is most important?"

You: "The presentation is urgent, exercise is high priority, calling mom is medium"

Agent: "Perfect! Your priorities are set. Want to know what to start with?"

You: "Yes, what should I do first?"

Agent: "I suggest working on: 🔴 'Finish the presentation' (due today)
        This is your urgent priority task."
```

### Progress Check

```
You: "How am I doing today?"

Agent: "📊 Daily Summary
        
        Total tasks: 5
        ✅ Completed: 3
        ⬜ Pending: 2
        🔴 High priority: 1
        Progress: 60%
        
        👍 Good work! Keep it up!"
```

### Task Completion

```
You: "I finished the presentation"

Agent: "Awesome! ✅ You completed 'Finish the presentation'
        
        1 task remaining. You're almost done!"
```

## Advanced Features

### Recurring Tasks

Add support for recurring tasks:

```python
@function_tool
async def add_recurring_task(
    self, 
    context: RunContext, 
    description: str,
    frequency: str
) -> str:
    """Add a recurring task.
    
    Args:
        description: What to do
        frequency: How often (daily, weekly, monthly)
    """
    # Implementation
    return f"Added recurring task: {description} ({frequency})"
```

### Task Categories

Organize tasks by category:

```python
@function_tool
async def add_task_with_category(
    self,
    context: RunContext,
    description: str,
    category: str
) -> str:
    """Add a task with a category.
    
    Args:
        description: What to do
        category: Category (work, personal, health, etc.)
    """
    # Implementation
    return f"Added {description} to {category}"
```

### Time Estimates

Track time estimates and actual time:

```python
@function_tool
async def add_task_with_estimate(
    self,
    context: RunContext,
    description: str,
    estimated_minutes: int
) -> str:
    """Add a task with time estimate.
    
    Args:
        description: What to do
        estimated_minutes: How long it will take
    """
    # Implementation
    return f"Added {description} (estimated: {estimated_minutes} min)"
```

## Contributing

Contributions are welcome! This is part of the [Ottomator Agents](https://github.com/jakecusack/ottomator-agents) collection.

## License

This project follows the license of the parent repository.

## Support

For questions or issues:
- Check the troubleshooting section
- Review the [LiveKit documentation](https://docs.livekit.io/)
- Join the [LiveKit community](https://livekit.io/community)

---

**Built with ❤️ using LiveKit Agents**

Start your day with a conversation. Accomplish more with voice. 🎯

