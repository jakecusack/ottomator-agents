# Testing Guide for LiveKit Voice Agents

This guide covers how to test your LiveKit voice agents locally before deploying to production.

## Table of Contents

1. [Quick Testing](#quick-testing)
2. [Console Mode Testing](#console-mode-testing)
3. [Development Mode Testing](#development-mode-testing)
4. [Unit Testing](#unit-testing)
5. [Integration Testing](#integration-testing)
6. [Performance Testing](#performance-testing)
7. [Troubleshooting](#troubleshooting)

## Quick Testing

### Prerequisites Check

Before testing, verify your setup:

```bash
# Check Python version (should be 3.9+)
python3.11 --version

# Verify UV is installed
uv --version

# Check environment variables
cat .env | grep API_KEY
```

### Syntax Validation

Validate your code before running:

```bash
# Check Python syntax
python3.11 -m py_compile livekit_basic_agent.py

# Run linter (if installed)
uv run ruff check livekit_basic_agent.py

# Format code (if installed)
uv run black livekit_basic_agent.py
```

## Console Mode Testing

Console mode is the fastest way to test your agent locally.

### Setup

1. **Ensure dependencies are installed:**
   ```bash
   uv sync
   ```

2. **Download model files:**
   ```bash
   uv run python livekit_basic_agent.py download-files
   ```

3. **Set environment variables:**
   ```bash
   # Create .env file with your keys
   echo "OPENAI_API_KEY=your_key" >> .env
   echo "DEEPGRAM_API_KEY=your_key" >> .env
   ```

### Running Console Mode

Start the agent:

```bash
uv run python livekit_basic_agent.py console
```

**What to expect:**
- Agent starts and downloads any missing models
- You'll see initialization logs
- Agent greets you with voice
- You can speak naturally
- Agent responds in real-time
- Press Ctrl+C to exit

### Testing Checklist

Use this checklist when testing in console mode:

#### Basic Functionality
- [ ] Agent starts without errors
- [ ] Agent greets you upon start
- [ ] Microphone input is detected
- [ ] Agent responds to simple questions
- [ ] Voice output is clear and natural
- [ ] Agent can be interrupted mid-sentence

#### Tool Testing
- [ ] Date/time tool works correctly
  - Try: "What time is it?"
  - Try: "What's today's date?"

- [ ] Search tool works correctly
  - Try: "Search for Airbnbs in San Francisco"
  - Try: "Find me a place to stay in New York"

- [ ] Booking tool works correctly
  - Try: "Book the cozy downtown loft"
  - Provide: Name, check-in, check-out dates
  - Verify: Confirmation number is generated

#### Conversation Flow
- [ ] Multi-turn conversations work
- [ ] Agent remembers context
- [ ] Agent asks for missing information
- [ ] Agent handles unclear requests gracefully

#### Error Handling
- [ ] Agent handles invalid city names
- [ ] Agent handles invalid booking IDs
- [ ] Agent recovers from errors gracefully

### Sample Test Conversations

#### Test 1: Basic Interaction
```
You: "Hello"
Agent: "Hello! I'm your Airbnb booking assistant. How can I help you today?"

You: "What time is it?"
Agent: "The current date and time is October 19, 2025 at 2:30 PM"
```

#### Test 2: Search Flow
```
You: "I need a place to stay in San Francisco"
Agent: "I found 3 Airbnbs in San Francisco..."
[Lists properties]

You: "Tell me more about the Victorian house"
Agent: [Provides details about the Victorian house]
```

#### Test 3: Booking Flow
```
You: "I want to book the cozy downtown loft"
Agent: "Great choice! What's your name?"

You: "John Smith"
Agent: "Thank you, John. When would you like to check in?"

You: "January 15th"
Agent: "And when will you check out?"

You: "January 20th"
Agent: "Booking confirmed! Confirmation number: BK1001..."
```

#### Test 4: Error Handling
```
You: "Search for Airbnbs in Paris"
Agent: "Sorry, I don't have any listings for Paris. Available cities are: San Francisco, New York, and Los Angeles."

You: "Book property ABC123"
Agent: "Sorry, I couldn't find an Airbnb with ID ABC123. Please search for available listings first."
```

## Development Mode Testing

Development mode connects your local agent to LiveKit Cloud for browser-based testing.

### Setup

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

### Running Dev Mode

Start the agent in development mode:

```bash
uv run python livekit_basic_agent.py dev
```

**What happens:**
- Agent connects to LiveKit Cloud
- You get a URL to the Agents Playground
- Agent is accessible from any device with a browser

### Testing in Playground

1. **Access the playground:**
   - Visit [agents-playground.livekit.io](https://agents-playground.livekit.io/)
   - Sign in with your LiveKit account
   - Select your agent

2. **Test features:**
   - Click microphone to enable voice
   - Speak naturally to the agent
   - Test all tools and features
   - Check transcriptions for accuracy

3. **Monitor logs:**
   - Keep terminal open to see logs
   - Watch for errors or warnings
   - Monitor API calls and responses

### Dev Mode Checklist

- [ ] Agent connects to LiveKit Cloud
- [ ] Playground loads successfully
- [ ] Microphone permission granted
- [ ] Voice input detected
- [ ] Agent responds correctly
- [ ] All tools work as expected
- [ ] No errors in console logs
- [ ] Latency is acceptable (<2 seconds)

## Unit Testing

Write unit tests for your agent tools.

### Setup Testing Framework

Install pytest:

```bash
uv add --dev pytest pytest-asyncio
```

### Create Test File

Create `tests/test_agent.py`:

```python
import pytest
from livekit_basic_agent import Assistant

@pytest.fixture
def agent():
    """Create an agent instance for testing."""
    return Assistant()

@pytest.mark.asyncio
async def test_get_current_date_and_time(agent):
    """Test the date/time tool."""
    result = await agent.get_current_date_and_time(None)
    assert "current date and time is" in result.lower()
    assert "2025" in result  # Current year

@pytest.mark.asyncio
async def test_search_airbnbs_valid_city(agent):
    """Test searching for Airbnbs in a valid city."""
    result = await agent.search_airbnbs(None, "San Francisco")
    assert "Found" in result
    assert "San Francisco" in result
    assert "sf001" in result

@pytest.mark.asyncio
async def test_search_airbnbs_invalid_city(agent):
    """Test searching for Airbnbs in an invalid city."""
    result = await agent.search_airbnbs(None, "Paris")
    assert "Sorry" in result
    assert "Available cities" in result

@pytest.mark.asyncio
async def test_book_airbnb_valid(agent):
    """Test booking a valid Airbnb."""
    result = await agent.book_airbnb(
        None, 
        "sf001", 
        "John Smith", 
        "January 15, 2025", 
        "January 20, 2025"
    )
    assert "Booking confirmed" in result or "confirmed" in result.lower()
    assert "John Smith" in result
    assert "BK" in result  # Confirmation number

@pytest.mark.asyncio
async def test_book_airbnb_invalid_id(agent):
    """Test booking with invalid Airbnb ID."""
    result = await agent.book_airbnb(
        None, 
        "invalid123", 
        "John Smith", 
        "January 15, 2025", 
        "January 20, 2025"
    )
    assert "Sorry" in result or "couldn't find" in result.lower()

@pytest.mark.asyncio
async def test_multiple_bookings(agent):
    """Test that multiple bookings generate unique confirmation numbers."""
    result1 = await agent.book_airbnb(None, "sf001", "User 1", "Jan 15", "Jan 20")
    result2 = await agent.book_airbnb(None, "ny001", "User 2", "Jan 25", "Jan 30")
    
    # Extract confirmation numbers
    import re
    conf1 = re.search(r'BK\d+', result1).group()
    conf2 = re.search(r'BK\d+', result2).group()
    
    assert conf1 != conf2  # Should be different
    assert len(agent.bookings) == 2
```

### Run Tests

```bash
# Run all tests
uv run pytest

# Run with verbose output
uv run pytest -v

# Run specific test file
uv run pytest tests/test_agent.py

# Run specific test
uv run pytest tests/test_agent.py::test_search_airbnbs_valid_city

# Run with coverage
uv run pytest --cov=livekit_basic_agent
```

### Test Coverage Goals

Aim for:
- **Tool functions:** 100% coverage
- **Error handling:** All error paths tested
- **Edge cases:** Invalid inputs, empty data, etc.
- **Integration:** Multi-step workflows

## Integration Testing

Test the full agent pipeline end-to-end.

### Create Integration Tests

Create `tests/test_integration.py`:

```python
import pytest
from livekit_basic_agent import Assistant

@pytest.mark.asyncio
async def test_full_booking_workflow():
    """Test the complete booking workflow."""
    agent = Assistant()
    
    # Step 1: Search for Airbnbs
    search_result = await agent.search_airbnbs(None, "San Francisco")
    assert "sf001" in search_result
    
    # Step 2: Book an Airbnb
    booking_result = await agent.book_airbnb(
        None, "sf001", "Test User", "Jan 15", "Jan 20"
    )
    assert "BK" in booking_result
    
    # Step 3: Verify booking was saved
    assert len(agent.bookings) == 1
    assert agent.bookings[0]['guest_name'] == "Test User"

@pytest.mark.asyncio
async def test_multiple_city_searches():
    """Test searching multiple cities."""
    agent = Assistant()
    
    cities = ["San Francisco", "New York", "Los Angeles"]
    for city in cities:
        result = await agent.search_airbnbs(None, city)
        assert city in result
        assert "Found" in result

@pytest.mark.asyncio
async def test_error_recovery():
    """Test that agent recovers from errors."""
    agent = Assistant()
    
    # Try invalid city
    result1 = await agent.search_airbnbs(None, "InvalidCity")
    assert "Sorry" in result1
    
    # Should still work for valid city
    result2 = await agent.search_airbnbs(None, "San Francisco")
    assert "Found" in result2
```

## Performance Testing

Test agent performance and latency.

### Measure Response Times

Create `tests/test_performance.py`:

```python
import pytest
import time
from livekit_basic_agent import Assistant

@pytest.mark.asyncio
async def test_tool_execution_speed():
    """Test that tools execute quickly."""
    agent = Assistant()
    
    start = time.time()
    await agent.get_current_date_and_time(None)
    duration = time.time() - start
    
    assert duration < 0.1  # Should be nearly instant

@pytest.mark.asyncio
async def test_search_performance():
    """Test search performance."""
    agent = Assistant()
    
    start = time.time()
    await agent.search_airbnbs(None, "San Francisco")
    duration = time.time() - start
    
    assert duration < 0.5  # Should be fast

@pytest.mark.asyncio
async def test_concurrent_operations():
    """Test handling multiple operations."""
    agent = Assistant()
    
    import asyncio
    
    tasks = [
        agent.search_airbnbs(None, "San Francisco"),
        agent.search_airbnbs(None, "New York"),
        agent.get_current_date_and_time(None),
    ]
    
    start = time.time()
    results = await asyncio.gather(*tasks)
    duration = time.time() - start
    
    assert len(results) == 3
    assert all(results)  # All should succeed
    assert duration < 2.0  # Should be reasonably fast
```

### Load Testing

For production readiness, test with multiple concurrent users:

```python
@pytest.mark.asyncio
async def test_multiple_agents():
    """Test multiple agent instances."""
    agents = [Assistant() for _ in range(10)]
    
    tasks = [
        agent.search_airbnbs(None, "San Francisco")
        for agent in agents
    ]
    
    results = await asyncio.gather(*tasks)
    assert len(results) == 10
    assert all("Found" in r for r in results)
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Agent Won't Start

**Symptoms:**
- Import errors
- Module not found
- Environment variable errors

**Solutions:**
```bash
# Reinstall dependencies
uv sync --reinstall

# Check Python version
python3.11 --version

# Verify environment variables
cat .env
```

#### 2. No Audio in Console Mode

**Symptoms:**
- Can't hear agent
- Agent doesn't hear you

**Solutions:**
- Check microphone/speaker permissions
- Verify audio devices in system settings
- Test with `python -m sounddevice`
- Try different audio backend

#### 3. Tools Not Being Called

**Symptoms:**
- Agent doesn't use tools
- Direct answers instead of tool calls

**Solutions:**
- Check function signatures
- Verify docstrings are clear
- Test with explicit requests
- Review LLM instructions

#### 4. High Latency

**Symptoms:**
- Slow responses
- Long pauses

**Solutions:**
- Check internet connection
- Verify API keys are valid
- Monitor API rate limits
- Consider faster providers

#### 5. API Errors

**Symptoms:**
- 401 Unauthorized
- 429 Rate limit
- 500 Server errors

**Solutions:**
```bash
# Verify API keys
echo $OPENAI_API_KEY
echo $DEEPGRAM_API_KEY

# Check API status
curl https://status.openai.com/
curl https://status.deepgram.com/

# Monitor rate limits
# Check your API dashboard
```

### Debug Mode

Enable detailed logging:

```python
import logging

# Add to your agent.py
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

Or set environment variable:

```bash
export LOG_LEVEL=DEBUG
uv run python livekit_basic_agent.py console
```

### Monitoring Tools

Use these tools to monitor your agent:

```bash
# Monitor CPU/Memory
top
htop

# Monitor network
iftop
nethogs

# Monitor logs
tail -f agent.log

# Monitor API calls
# Use API dashboard or monitoring tools
```

## Best Practices

### 1. Test Early and Often

- Test each tool as you build it
- Run tests before committing code
- Test in console mode first
- Then test in dev mode
- Finally test in production

### 2. Automate Testing

```bash
# Add to your workflow
uv run pytest
uv run ruff check .
uv run black --check .
```

### 3. Document Test Cases

Keep a test plan document:

```markdown
# Test Plan

## Test Case 1: Basic Greeting
- Start agent
- Verify greeting
- Expected: "Hello! I'm your Airbnb..."

## Test Case 2: Search Functionality
- Say: "Search for Airbnbs in San Francisco"
- Expected: List of 3 properties
- Verify: All properties shown
```

### 4. Use Version Control

```bash
# Create test branch
git checkout -b test-new-feature

# Run tests
uv run pytest

# If tests pass
git checkout main
git merge test-new-feature
```

## Continuous Integration

Set up CI/CD for automated testing:

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install UV
      run: curl -LsSf https://astral.sh/uv/install.sh | sh
    
    - name: Install dependencies
      run: uv sync
    
    - name: Run tests
      run: uv run pytest
    
    - name: Check code style
      run: uv run ruff check .
```

## Summary

Testing checklist for production readiness:

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Performance tests meet requirements
- [ ] Console mode works correctly
- [ ] Dev mode works correctly
- [ ] All tools function as expected
- [ ] Error handling works properly
- [ ] Documentation is complete
- [ ] Code is formatted and linted
- [ ] CI/CD pipeline is set up

---

**Ready for production?** See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.

