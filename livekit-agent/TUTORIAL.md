# Build Your First Voice AI Agent - Step-by-Step Tutorial

This tutorial walks you through building a voice AI agent from scratch, based on the video **"Build Your First Voice AI Agent in 20 Minutes with LiveKit"**.

## Table of Contents

1. [Introduction](#introduction)
2. [Why LiveKit?](#why-livekit)
3. [Part 1: Basic Agent Setup](#part-1-basic-agent-setup)
4. [Part 2: Adding Your First Tool](#part-2-adding-your-first-tool)
5. [Part 3: Building an Airbnb Assistant](#part-3-building-an-airbnb-assistant)
6. [Part 4: Cloud Deployment](#part-4-cloud-deployment)
7. [Next Steps](#next-steps)

## Introduction

In this tutorial, you'll learn how to build a production-ready voice AI agent using LiveKit, an open-source framework that gives you complete control over your AI infrastructure.

**What you'll build:**
- A basic voice agent that can have natural conversations
- Custom tools for getting date/time information
- An Airbnb booking assistant with search and booking capabilities
- A cloud-deployed agent accessible from anywhere

**Time required:** 20-30 minutes

**Prerequisites:**
- Basic Python knowledge
- OpenAI API key
- Deepgram API key
- Terminal/command line familiarity

## Why LiveKit?

### The Problem with Black Box Platforms

Platforms like Vapi, Synthflow, and Bland.ai offer quick setup but come with limitations:

- **High costs** - Premium pricing for basic features
- **Limited customization** - Can't deeply modify conversation logic
- **Slow tools** - No control over tool execution
- **Vendor lock-in** - Stuck in someone else's infrastructure
- **Black box** - No visibility into how things work

### The LiveKit Advantage

LiveKit is an open-source Python framework that provides:

- **Full control** - Own your infrastructure and conversation logic
- **Fast tools** - Optimize tool execution yourself
- **Flexibility** - Mix and match any AI providers
- **Transparency** - See exactly how everything works
- **Cost-effective** - Pay only for what you use
- **Self-hosting** - Deploy anywhere you want

## Part 1: Basic Agent Setup

Let's start by creating the simplest possible voice agent.

### Step 1: Project Setup

Create a new directory and initialize the project:

```bash
# Create project directory
mkdir my-voice-agent
cd my-voice-agent

# Initialize with UV
uv init --bare
```

### Step 2: Install Dependencies

Add the required packages:

```bash
uv add "livekit-agents[silero,turn-detector]~=1.2" \
       "livekit-plugins-openai" \
       "livekit-plugins-deepgram" \
       "python-dotenv"
```

**What these packages do:**
- `livekit-agents` - Core framework with VAD and turn detection
- `livekit-plugins-openai` - OpenAI LLM and TTS integration
- `livekit-plugins-deepgram` - Deepgram STT integration
- `python-dotenv` - Environment variable management

### Step 3: Configure Environment

Create a `.env` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

### Step 4: Create Your First Agent

Create `agent.py`:

```python
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentSession
from livekit.plugins import openai, deepgram, silero

# Load environment variables
load_dotenv()

class Assistant(Agent):
    """A simple voice assistant."""
    
    def __init__(self):
        super().__init__(
            instructions="""You are a friendly voice assistant.
            You help users with their questions in a natural, conversational way.
            Keep your responses concise and to the point."""
        )

async def entrypoint(ctx: agents.JobContext):
    """Entry point for the agent."""
    
    # Configure the voice pipeline
    session = AgentSession(
        stt=deepgram.STT(model="nova-2"),
        llm=openai.LLM(model="gpt-4.1-mini"),
        tts=openai.TTS(voice="echo"),
        vad=silero.VAD.load(),
    )
    
    # Start the session
    await session.start(
        room=ctx.room,
        agent=Assistant()
    )
    
    # Generate initial greeting
    await session.generate_reply(
        instructions="Greet the user warmly and offer your assistance."
    )

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
```

### Step 5: Download Model Files

Before running, download required models:

```bash
uv run python agent.py download-files
```

This downloads:
- Silero VAD model (voice activity detection)
- Turn detector model (conversation flow)

### Step 6: Test Your Agent

Run in console mode:

```bash
uv run python agent.py console
```

**What happens:**
1. Agent starts and greets you
2. You can speak naturally
3. Agent responds in real-time
4. Press Ctrl+C to exit

**Try saying:**
- "Hello, how are you?"
- "What can you help me with?"
- "Tell me a joke"

### Understanding the Code

Let's break down what each part does:

#### The Assistant Class

```python
class Assistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="..."  # This is the system prompt
        )
```

The `instructions` parameter is like ChatGPT's system prompt - it defines the agent's personality and behavior.

#### The Voice Pipeline

```python
session = AgentSession(
    stt=deepgram.STT(model="nova-2"),      # Speech-to-Text
    llm=openai.LLM(model="gpt-4.1-mini"),  # Language Model
    tts=openai.TTS(voice="echo"),          # Text-to-Speech
    vad=silero.VAD.load(),                 # Voice Activity Detection
)
```

This creates a pipeline: **Voice → Text → AI → Voice**

#### The Entry Point

```python
async def entrypoint(ctx: agents.JobContext):
    # Configure and start the agent
    await session.start(room=ctx.room, agent=Assistant())
    
    # Generate greeting
    await session.generate_reply(instructions="Greet the user...")
```

This function runs when a user connects to your agent.

## Part 2: Adding Your First Tool

Tools let your agent perform actions beyond just conversation. Let's add a simple tool.

### Step 1: Import the Decorator

Add to your imports:

```python
from livekit.agents import RunContext
from livekit.agents.llm import function_tool
from datetime import datetime
```

### Step 2: Add a Tool Method

Add this method to your `Assistant` class:

```python
class Assistant(Agent):
    def __init__(self):
        super().__init__(...)
    
    @function_tool
    async def get_current_date_and_time(self, context: RunContext) -> str:
        """Get the current date and time."""
        current_datetime = datetime.now().strftime("%B %d, %Y at %I:%M %p")
        return f"The current date and time is {current_datetime}"
```

### Step 3: Test the Tool

Run your agent again:

```bash
uv run python agent.py console
```

**Try asking:**
- "What time is it?"
- "What's today's date?"
- "Tell me the current date and time"

**What happens:**
1. You ask about the time
2. The LLM recognizes it needs the tool
3. The tool executes and returns the time
4. The LLM formulates a natural response
5. You hear the response

### How Tools Work

The magic is in the decorator and docstring:

```python
@function_tool  # Tells LiveKit this is a tool
async def get_current_date_and_time(self, context: RunContext) -> str:
    """Get the current date and time."""  # LLM reads this
    # Your code here
    return "Result"  # LLM receives this
```

**The LLM automatically:**
- Reads the function name and docstring
- Understands when to call it
- Extracts parameters from user speech
- Uses the return value in its response

## Part 3: Building an Airbnb Assistant

Now let's build something more complex - an Airbnb booking assistant.

### Step 1: Add Mock Data

Add this to your `Assistant.__init__`:

```python
class Assistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are a helpful Airbnb booking assistant.
            You can search for Airbnbs in different cities and help users book their stays.
            Be friendly, helpful, and ask for any information you need to complete bookings."""
        )
        
        # Mock Airbnb database
        self.airbnbs = {
            "san francisco": [
                {
                    "id": "sf001",
                    "name": "Cozy Downtown Loft",
                    "address": "123 Market Street, San Francisco, CA",
                    "price": 150,
                    "amenities": ["WiFi", "Kitchen", "Workspace"],
                },
                {
                    "id": "sf002",
                    "name": "Victorian House with Bay Views",
                    "address": "456 Castro Street, San Francisco, CA",
                    "price": 220,
                    "amenities": ["WiFi", "Parking", "Bay Views"],
                },
            ],
            "new york": [
                {
                    "id": "ny001",
                    "name": "Brooklyn Brownstone",
                    "address": "321 Bedford Avenue, Brooklyn, NY",
                    "price": 175,
                    "amenities": ["WiFi", "Kitchen", "Backyard"],
                },
            ],
        }
        
        # Track bookings
        self.bookings = []
```

### Step 2: Add Search Tool

```python
@function_tool
async def search_airbnbs(self, context: RunContext, city: str) -> str:
    """Search for available Airbnbs in a city.
    
    Args:
        city: The city name to search (e.g., 'San Francisco', 'New York')
    """
    city_lower = city.lower()
    
    if city_lower not in self.airbnbs:
        return f"Sorry, no listings found for {city}. Available cities: San Francisco, New York"
    
    listings = self.airbnbs[city_lower]
    result = f"Found {len(listings)} Airbnbs in {city}:\n\n"
    
    for listing in listings:
        result += f"• {listing['name']}\n"
        result += f"  ${listing['price']}/night\n"
        result += f"  {listing['address']}\n"
        result += f"  Amenities: {', '.join(listing['amenities'])}\n"
        result += f"  ID: {listing['id']}\n\n"
    
    return result
```

### Step 3: Add Booking Tool

```python
@function_tool
async def book_airbnb(
    self, 
    context: RunContext, 
    airbnb_id: str, 
    guest_name: str, 
    check_in_date: str, 
    check_out_date: str
) -> str:
    """Book an Airbnb.
    
    Args:
        airbnb_id: The ID of the Airbnb (e.g., 'sf001')
        guest_name: Name of the guest
        check_in_date: Check-in date (e.g., 'January 15, 2025')
        check_out_date: Check-out date (e.g., 'January 20, 2025')
    """
    # Find the Airbnb
    airbnb = None
    for city_listings in self.airbnbs.values():
        for listing in city_listings:
            if listing['id'] == airbnb_id:
                airbnb = listing
                break
        if airbnb:
            break
    
    if not airbnb:
        return f"Sorry, couldn't find Airbnb with ID {airbnb_id}"
    
    # Create booking
    booking = {
        "confirmation": f"BK{len(self.bookings) + 1001}",
        "property": airbnb['name'],
        "guest": guest_name,
        "check_in": check_in_date,
        "check_out": check_out_date,
        "price": airbnb['price'],
    }
    
    self.bookings.append(booking)
    
    return f"""
    ✓ Booking Confirmed!
    
    Confirmation: {booking['confirmation']}
    Property: {booking['property']}
    Guest: {booking['guest']}
    Check-in: {booking['check_in']}
    Check-out: {booking['check_out']}
    Rate: ${booking['price']}/night
    
    You'll receive a confirmation email shortly!
    """
```

### Step 4: Test the Full Flow

Run your agent:

```bash
uv run python agent.py console
```

**Try this conversation:**

**You:** "I'm looking for a place to stay in San Francisco"  
**Agent:** *Calls search_airbnbs("San Francisco")* "I found 2 Airbnbs in San Francisco..."

**You:** "Tell me about the cozy downtown loft"  
**Agent:** "The Cozy Downtown Loft is $150 per night..."

**You:** "I'd like to book it"  
**Agent:** "Great! What's your name?"

**You:** "John Smith"  
**Agent:** "When would you like to check in?"

**You:** "January 15th"  
**Agent:** "And when will you check out?"

**You:** "January 20th"  
**Agent:** *Calls book_airbnb(...)* "Your booking is confirmed! Confirmation number BK1001..."

### Understanding Multi-Turn Conversations

Notice how the agent:
1. **Gathers information gradually** - Asks for name, dates separately
2. **Maintains context** - Remembers which property you're booking
3. **Validates input** - Checks if the Airbnb exists
4. **Provides confirmation** - Gives detailed booking information

This is all handled automatically by the LLM based on your tool signatures and instructions!

## Part 4: Cloud Deployment

Now let's deploy your agent to LiveKit Cloud so anyone can access it.

### Step 1: Create LiveKit Cloud Account

1. Visit [cloud.livekit.io](https://cloud.livekit.io/)
2. Sign up for a free account
3. Create a new project

### Step 2: Install LiveKit CLI

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

### Step 3: Authenticate

```bash
lk cloud auth
```

This opens a browser to link your CLI with your account.

### Step 4: Configure Environment

```bash
lk app env -w
```

This creates `.env.local` with your LiveKit credentials.

**Add your AI keys to `.env.local`:**
```bash
# Add these lines
OPENAI_API_KEY=your_key_here
DEEPGRAM_API_KEY=your_key_here
```

### Step 5: Test Connection

```bash
uv run python agent.py dev
```

Visit [agents-playground.livekit.io](https://agents-playground.livekit.io/) to test in your browser.

### Step 6: Deploy

```bash
lk agent create
```

This will:
1. Create a Dockerfile
2. Build your agent
3. Push to LiveKit Cloud
4. Start the agent

### Step 7: Access Your Agent

Your agent is now live! Access it from:
- **Playground**: [agents-playground.livekit.io](https://agents-playground.livekit.io/)
- **Phone**: Integrate with Twilio (see [docs](https://docs.livekit.io/agents/start/telephony/))
- **Web App**: Use LiveKit JavaScript SDK
- **Mobile App**: Use LiveKit mobile SDKs

## Next Steps

### Enhance Your Agent

1. **Add More Tools**
   ```python
   @function_tool
   async def check_weather(self, context: RunContext, city: str) -> str:
       """Check the weather in a city."""
       # Call weather API
       return f"Weather in {city}: ..."
   ```

2. **Integrate Real APIs**
   - Replace mock data with real Airbnb API
   - Connect to your database
   - Integrate with payment systems

3. **Improve Conversation**
   - Add personality to instructions
   - Handle edge cases
   - Implement error recovery

### Explore Advanced Features

1. **RAG (Retrieval Augmented Generation)**
   - Add knowledge base
   - Search documents
   - Provide context-aware answers

2. **Multi-Agent Systems**
   - Hand off to specialists
   - Coordinate multiple agents
   - Build complex workflows

3. **Vision Capabilities**
   - Process images
   - Screen sharing
   - Visual understanding

### Production Considerations

1. **Monitoring**
   - Set up logging
   - Track metrics
   - Configure alerts

2. **Scaling**
   - Auto-scale workers
   - Load balancing
   - Performance optimization

3. **Security**
   - Implement authentication
   - Rate limiting
   - Input validation

## Resources

### Documentation
- [LiveKit Agents Docs](https://docs.livekit.io/agents/)
- [API Reference](https://docs.livekit.io/reference/python/)
- [Examples Repository](https://github.com/livekit-examples/python-agents-examples)

### Video Tutorials
- [Original Tutorial Video](https://youtu.be/TXVyxJdlzQs)
- [LiveKit YouTube Channel](https://www.youtube.com/@livekit)

### Community
- [LiveKit Discord](https://livekit.io/community)
- [GitHub Discussions](https://github.com/livekit/agents/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/livekit)

## Troubleshooting

### Agent Won't Start
```bash
# Check Python version
python --version  # Should be 3.9+

# Verify dependencies
uv sync

# Check environment variables
cat .env
```

### No Audio in Console Mode
- Check microphone permissions
- Verify audio device selection
- Try adjusting VAD sensitivity

### Tools Not Being Called
- Check function signature
- Verify docstring is clear
- Test with explicit requests
- Review LLM instructions

### High Latency
- Use faster providers (Cartesia TTS, Groq LLM)
- Deploy closer to users
- Optimize tool execution
- Enable streaming

## Conclusion

Congratulations! You've built a production-ready voice AI agent with:

✅ Natural voice conversations  
✅ Custom tool integration  
✅ Multi-turn conversation handling  
✅ Cloud deployment  

You now have the foundation to build any voice AI application you can imagine!

### What's Next?

- Customize the agent for your use case
- Add integration with your services
- Deploy to production
- Build something amazing!

---

**Questions?** Join the [LiveKit Community](https://livekit.io/community) for help and inspiration!

