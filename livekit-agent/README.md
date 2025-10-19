# LiveKit Voice AI Agent - Complete Tutorial

A comprehensive LiveKit-powered voice AI agent framework demonstrating how to build production-ready realtime conversational AI. This project is based on the tutorial **"Build Your First Voice AI Agent in 20 Minutes with LiveKit"** and includes everything from basic setup to advanced features like custom tool integration and cloud deployment.

## Overview

Unlike "black box" voice AI platforms like Vapi, Synthflow, and Bland.ai, LiveKit provides an open-source Python framework that gives you complete control over your voice AI infrastructure, conversation logic, and custom tools. You can self-host or deploy to the cloud with full transparency and customization.

## Features

- 🎤 **Natural Voice Conversations** - Low latency, real-time voice interaction
- 🔄 **Interruption Handling** - Seamless conversation flow with turn detection
- 🛠️ **Custom Tools** - Extend functionality with Python functions
- 🎯 **Multiple AI Providers** - Mix and match STT, LLM, and TTS providers
- 🔌 **MCP Integration** - Connect to Model Context Protocol servers
- 📱 **Multi-Platform** - Works in terminal, browser, phone, and native apps
- ☁️ **Cloud Ready** - Easy deployment to LiveKit Cloud
- 🧪 **Testing Modes** - Console, dev, and production modes

## What You'll Learn

This tutorial demonstrates:

1. **Basic Agent Creation** - Set up a simple voice agent with minimal code
2. **Custom Tool Integration** - Add Python functions as agent capabilities
3. **Advanced Use Cases** - Build an Airbnb booking assistant with multi-turn conversations
4. **Cloud Deployment** - Deploy your agent to LiveKit Cloud for production use

## Prerequisites

### Required Software
- Python 3.9 or later
- UV package manager (recommended) or pip

### Required API Keys
- **OpenAI API Key** - For LLM and TTS ([Get it here](https://platform.openai.com/api-keys))
- **Deepgram API Key** - For STT ([Get it here](https://console.deepgram.com/))

### Optional (for Cloud Deployment)
- **LiveKit Cloud Account** - Free tier available ([Sign up here](https://cloud.livekit.io/))
- **LiveKit CLI** - For deployment management

## Quick Start (20 Minutes)

### Step 1: Install Dependencies (2 minutes)

```bash
# Install UV package manager if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install project dependencies
uv sync
```

### Step 2: Configure Environment (3 minutes)

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Optional (for cloud deployment)
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
```

### Step 3: Download Model Files (2 minutes)

Download required models for voice activity detection and turn detection:

```bash
# For basic agent
uv run python livekit_basic_agent.py download-files

# For MCP agent (if using)
uv run python livekit_mcp_agent.py download-files
```

### Step 4: Run Your First Agent (1 minute)

Start the agent in console mode to test locally:

```bash
uv run python livekit_basic_agent.py console
```

You can now speak to your agent directly in the terminal! Try asking:
- "What time is it?"
- "Search for Airbnbs in San Francisco"
- "Book the cozy downtown loft for John Smith from January 15 to January 20"

### Step 5: Test in Browser (5 minutes)

Run in development mode to access from anywhere:

```bash
uv run python livekit_basic_agent.py dev
```

Visit the [LiveKit Agents Playground](https://agents-playground.livekit.io/) to interact with your agent in a web browser.

### Step 6: Deploy to Cloud (7 minutes)

See the [Cloud Deployment](#cloud-deployment) section below for detailed instructions.

## Architecture

### Voice Pipeline

The agent uses a modular pipeline that processes voice in real-time:

```
User Speech → STT → LLM → TTS → Agent Voice
              ↓      ↓     ↓
           Deepgram OpenAI OpenAI
```

### Component Flow

```
┌─────────────────┐
│  User Interface │  (Terminal, Browser, Phone, App)
└────────┬────────┘
         │ WebRTC
┌────────▼────────┐
│  LiveKit Room   │  (Real-time communication)
└────────┬────────┘
         │
┌────────▼────────┐
│  Voice Agent    │  (Your Python code)
├─────────────────┤
│ • STT Engine    │  (Speech-to-Text)
│ • LLM Brain     │  (Language Model)
│ • TTS Engine    │  (Text-to-Speech)
│ • VAD           │  (Voice Activity Detection)
│ • Turn Detector │  (Conversation Flow)
│ • Custom Tools  │  (Your Functions)
└────────┬────────┘
         │
┌────────▼────────┐
│  AI Providers   │  (OpenAI, Deepgram, etc.)
└─────────────────┘
```

## Project Structure

```
livekit-agent/
├── livekit_basic_agent.py      # Tutorial example with Airbnb tools
├── livekit_mcp_agent.py        # Advanced agent with MCP integration
├── pyproject.toml              # Python dependencies
├── .env.example                # Environment template
├── .env                        # Your credentials (create this)
├── README.md                   # This file
├── CLAUDE.md                   # Additional documentation
└── uv.lock                     # Dependency lock file
```

## Understanding the Code

### Basic Agent Structure

Every LiveKit agent has three main components:

#### 1. The Assistant Class

```python
from livekit.agents import Agent, RunContext
from livekit.agents.llm import function_tool

class Assistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="You are a helpful voice assistant..."
        )
    
    @function_tool
    async def your_custom_tool(self, context: RunContext, param: str) -> str:
        """Tool description for the LLM."""
        # Your tool logic here
        return "Result"
```

#### 2. The Entry Point

```python
async def entrypoint(ctx: agents.JobContext):
    # Configure voice pipeline
    session = AgentSession(
        stt=deepgram.STT(model="nova-2"),
        llm=openai.LLM(model="gpt-4.1-mini"),
        tts=openai.TTS(voice="echo"),
        vad=silero.VAD.load(),
    )
    
    # Start the session
    await session.start(room=ctx.room, agent=Assistant())
    
    # Initial greeting
    await session.generate_reply(
        instructions="Greet the user warmly."
    )
```

#### 3. The Main Runner

```python
if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
```

### Adding Custom Tools

Tools are Python functions decorated with `@function_tool`. The LLM automatically learns to use them based on the function signature and docstring:

```python
@function_tool
async def search_airbnbs(self, context: RunContext, city: str) -> str:
    """Search for available Airbnbs in a city.
    
    Args:
        city: The city name to search for Airbnbs
    """
    # Your search logic
    return f"Found listings in {city}..."
```

**Key Points:**
- The docstring tells the LLM what the tool does
- Type hints define the parameters
- The LLM decides when to call the tool based on user input
- Return values are passed back to the LLM to formulate a response

## Voice Pipeline Configuration

### Speech-to-Text (STT) Options

```python
# Deepgram (Default - Best accuracy)
stt=deepgram.STT(model="nova-2")

# AssemblyAI (Alternative)
stt=assemblyai.STT(model="universal-streaming")

# Whisper (Local option)
stt=whisper.STT()
```

### Large Language Model (LLM) Options

```python
# OpenAI (Default)
llm=openai.LLM(model="gpt-4.1-mini")

# Anthropic Claude
llm=anthropic.LLM(model="claude-3-5-sonnet")

# Google Gemini
llm=google.LLM(model="gemini-2.0-flash")
```

### Text-to-Speech (TTS) Options

```python
# OpenAI (Default - Natural)
tts=openai.TTS(voice="echo")

# Cartesia (Fastest)
tts=cartesia.TTS(voice="sonic-2")

# ElevenLabs (Highest quality)
tts=elevenlabs.TTS(voice="rachel")
```

## Running Modes

### Console Mode (Local Testing)

Best for development and testing without internet connectivity:

```bash
uv run python livekit_basic_agent.py console
```

- Runs entirely on your machine
- Uses your microphone and speakers
- No LiveKit server required
- Great for debugging

### Dev Mode (Cloud Testing)

Connects to LiveKit Cloud for browser-based testing:

```bash
uv run python livekit_basic_agent.py dev
```

- Agent runs locally but connects to LiveKit
- Access from [Agents Playground](https://agents-playground.livekit.io/)
- Test from any device with a browser
- See real-time logs and metrics

### Start Mode (Production)

Runs the agent in production mode:

```bash
uv run python livekit_basic_agent.py start
```

- Production-ready configuration
- Optimized for performance
- Suitable for deployment

## Cloud Deployment

Deploy your agent to LiveKit Cloud for production use:

### 1. Create LiveKit Cloud Account

Sign up for a free account at [cloud.livekit.io](https://cloud.livekit.io/)

### 2. Install LiveKit CLI

**macOS:**
```bash
brew install livekit
```

**Linux:**
```bash
curl -sSL https://get.livekit.io/ | bash
```

**Windows:**
```bash
winget install LiveKit.LiveKitCLI
```

### 3. Authenticate

```bash
lk cloud auth
```

This opens a browser to link your CLI with your LiveKit Cloud account.

### 4. Configure Environment

```bash
lk app env -w
```

This creates `.env.local` with your LiveKit credentials.

### 5. Deploy Agent

```bash
lk agent create
```

This command:
- Creates a `Dockerfile` for your agent
- Builds and pushes the container
- Registers the agent with LiveKit Cloud
- Makes it available for production use

### 6. Test in Playground

Visit [agents-playground.livekit.io](https://agents-playground.livekit.io/) and sign in to test your deployed agent.

## Example Use Cases

### 1. Simple Date/Time Tool

```python
@function_tool
async def get_current_date_and_time(self, context: RunContext) -> str:
    """Get the current date and time."""
    return datetime.now().strftime("%B %d, %Y at %I:%M %p")
```

**User:** "What time is it?"  
**Agent:** "The current date and time is October 19, 2025 at 2:30 PM"

### 2. Airbnb Search

```python
@function_tool
async def search_airbnbs(self, context: RunContext, city: str) -> str:
    """Search for available Airbnbs in a city."""
    # Search logic
    return f"Found {len(listings)} Airbnbs in {city}..."
```

**User:** "Find me some places to stay in San Francisco"  
**Agent:** *Calls search_airbnbs("San Francisco")* "I found 3 Airbnbs in San Francisco..."

### 3. Multi-Step Booking

```python
@function_tool
async def book_airbnb(self, context: RunContext, airbnb_id: str, 
                     guest_name: str, check_in_date: str, 
                     check_out_date: str) -> str:
    """Book an Airbnb."""
    # Booking logic
    return f"Booking confirmed! Confirmation: {conf_number}"
```

**Conversation:**
- **User:** "I want to book the cozy downtown loft"
- **Agent:** "Great choice! What's your name?"
- **User:** "John Smith"
- **Agent:** "When would you like to check in?"
- **User:** "January 15th"
- **Agent:** "And when will you check out?"
- **User:** "January 20th"
- **Agent:** *Calls book_airbnb(...)* "Your booking is confirmed!"

## Advanced Features

### MCP Server Integration

Connect to Model Context Protocol servers for extended functionality:

```python
from livekit.agents import mcp

session = AgentSession(
    # ... other config ...
    mcp_servers=[
        mcp.MCPServerHTTP(url="http://localhost:8089/mcp")
    ]
)
```

See `livekit_mcp_agent.py` for a complete example.

### Event Handling

Listen to agent events for logging and monitoring:

```python
@session.on("agent_speech_committed")
def on_speech_committed(msg):
    print(f"Agent said: {msg.message}")

@session.on("user_speech_committed")
def on_user_speech(msg):
    print(f"User said: {msg.message}")
```

### State Management

Track conversation state across turns:

```python
class Assistant(Agent):
    def __init__(self):
        super().__init__(...)
        self.user_preferences = {}
        self.conversation_history = []
```

## Performance Optimization

### Reduce Latency

1. **Choose Fast Providers**
   - STT: Deepgram Nova-2 or AssemblyAI
   - TTS: Cartesia Sonic-2
   - LLM: GPT-4.1-mini or Groq

2. **Regional Deployment**
   - Deploy close to your users
   - Use LiveKit Cloud's global network

3. **Streaming**
   - All components stream by default
   - Responses start before completion

### Scale Efficiently

1. **Worker Configuration**
   ```toml
   # livekit.toml
   [worker]
   prewarm = 5  # Keep 5 workers ready
   ```

2. **Connection Pooling**
   - Reuse API connections
   - Cache frequently accessed data

3. **Resource Management**
   - Monitor memory usage
   - Set appropriate timeouts

## Troubleshooting

### Common Issues

#### Audio Not Working in Console Mode
- Check microphone/speaker permissions
- Verify audio devices in system settings
- Try adjusting VAD sensitivity

#### API Key Errors
```bash
# Verify keys are set
cat .env | grep API_KEY

# Check for extra whitespace
# Keys should have no quotes or spaces
```

#### Model Download Slow
- First run downloads models (one-time)
- Use `download-files` command beforehand
- Check internet connection

#### Agent Not Responding
- Check API credits/quotas
- Verify all required keys are set
- Look for errors in console output

### Debug Mode

Enable detailed logging:

```bash
# Set in .env
LOG_LEVEL=DEBUG

# Or run with verbose flag
uv run python livekit_basic_agent.py console --verbose
```

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `OPENAI_API_KEY` | Yes | OpenAI API key | - |
| `DEEPGRAM_API_KEY` | Yes | Deepgram API key | - |
| `LIVEKIT_URL` | No* | LiveKit server URL | - |
| `LIVEKIT_API_KEY` | No* | LiveKit API key | - |
| `LIVEKIT_API_SECRET` | No* | LiveKit API secret | - |
| `LLM_CHOICE` | No | LLM model name | `gpt-4.1-mini` |
| `LOG_LEVEL` | No | Logging level | `INFO` |

*Required for cloud deployment and dev mode

## Additional Resources

### Documentation
- [LiveKit Agents Docs](https://docs.livekit.io/agents/)
- [LiveKit Python SDK](https://github.com/livekit/agents)
- [LiveKit Examples](https://github.com/livekit-examples/python-agents-examples)

### Video Tutorial
- [Build Your First Voice AI Agent in 20 Minutes](https://youtu.be/TXVyxJdlzQs)

### Community
- [LiveKit Discord](https://livekit.io/community)
- [GitHub Discussions](https://github.com/livekit/agents/discussions)

## Next Steps

1. **Customize Your Agent**
   - Modify the instructions to change personality
   - Add your own custom tools
   - Integrate with your backend services

2. **Try Different Providers**
   - Experiment with different LLMs
   - Test various TTS voices
   - Compare STT accuracy

3. **Build Advanced Features**
   - Add RAG for knowledge retrieval
   - Implement multi-agent workflows
   - Connect to external APIs

4. **Deploy to Production**
   - Set up monitoring and alerts
   - Configure auto-scaling
   - Implement telephony integration

## Contributing

This is part of the [Ottomator Agents](https://github.com/jakecusack/ottomator-agents) collection. Contributions are welcome!

## License

This project follows the license of the parent repository.

## Support

For issues and questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review [LiveKit Documentation](https://docs.livekit.io/)
- Join the [LiveKit Community](https://livekit.io/community)

---

**Built with ❤️ using LiveKit Agents**

