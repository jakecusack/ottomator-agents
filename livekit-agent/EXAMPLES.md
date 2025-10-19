# LiveKit Agent Examples

This document provides additional examples and use cases for building voice AI agents with LiveKit.

## Table of Contents

1. [Simple Examples](#simple-examples)
2. [Business Use Cases](#business-use-cases)
3. [Advanced Patterns](#advanced-patterns)
4. [Integration Examples](#integration-examples)

## Simple Examples

### 1. Weather Assistant

A simple agent that provides weather information:

```python
from livekit.agents import Agent, RunContext
from livekit.agents.llm import function_tool
import requests

class WeatherAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are a helpful weather assistant.
            You provide current weather information and forecasts for any city.
            Be friendly and conversational."""
        )
    
    @function_tool
    async def get_weather(self, context: RunContext, city: str) -> str:
        """Get current weather for a city.
        
        Args:
            city: The city name (e.g., 'San Francisco', 'New York')
        """
        # In production, use a real weather API
        # Example with OpenWeatherMap:
        # api_key = os.getenv("OPENWEATHER_API_KEY")
        # url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}"
        # response = requests.get(url).json()
        
        # Mock response for demo
        return f"The weather in {city} is sunny with a temperature of 72°F"
    
    @function_tool
    async def get_forecast(self, context: RunContext, city: str, days: int = 3) -> str:
        """Get weather forecast for a city.
        
        Args:
            city: The city name
            days: Number of days to forecast (1-7)
        """
        return f"{days}-day forecast for {city}: Mostly sunny with temperatures between 65-75°F"
```

**Example conversation:**
- User: "What's the weather like in San Francisco?"
- Agent: "The weather in San Francisco is sunny with a temperature of 72°F"

### 2. Calculator Agent

An agent that can perform calculations:

```python
from livekit.agents import Agent, RunContext
from livekit.agents.llm import function_tool

class CalculatorAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are a helpful calculator assistant.
            You can perform mathematical calculations and explain the results.
            Always show your work."""
        )
    
    @function_tool
    async def calculate(self, context: RunContext, expression: str) -> str:
        """Evaluate a mathematical expression.
        
        Args:
            expression: A mathematical expression (e.g., '2 + 2', '10 * 5 + 3')
        """
        try:
            # Safe evaluation of mathematical expressions
            result = eval(expression, {"__builtins__": {}}, {})
            return f"{expression} = {result}"
        except Exception as e:
            return f"Error calculating {expression}: {str(e)}"
    
    @function_tool
    async def convert_units(self, context: RunContext, value: float, 
                          from_unit: str, to_unit: str) -> str:
        """Convert between units.
        
        Args:
            value: The value to convert
            from_unit: Source unit (e.g., 'miles', 'kg', 'celsius')
            to_unit: Target unit (e.g., 'km', 'lbs', 'fahrenheit')
        """
        conversions = {
            ('miles', 'km'): lambda x: x * 1.60934,
            ('km', 'miles'): lambda x: x / 1.60934,
            ('kg', 'lbs'): lambda x: x * 2.20462,
            ('lbs', 'kg'): lambda x: x / 2.20462,
            ('celsius', 'fahrenheit'): lambda x: x * 9/5 + 32,
            ('fahrenheit', 'celsius'): lambda x: (x - 32) * 5/9,
        }
        
        key = (from_unit.lower(), to_unit.lower())
        if key in conversions:
            result = conversions[key](value)
            return f"{value} {from_unit} = {result:.2f} {to_unit}"
        else:
            return f"Conversion from {from_unit} to {to_unit} not supported"
```

### 3. Reminder Agent

An agent that manages reminders:

```python
from livekit.agents import Agent, RunContext
from livekit.agents.llm import function_tool
from datetime import datetime, timedelta

class ReminderAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are a helpful reminder assistant.
            You help users set, view, and manage their reminders.
            Be proactive and friendly."""
        )
        self.reminders = []
    
    @function_tool
    async def set_reminder(self, context: RunContext, task: str, 
                          when: str) -> str:
        """Set a reminder for a task.
        
        Args:
            task: What to be reminded about
            when: When to be reminded (e.g., 'tomorrow at 3pm', 'in 2 hours')
        """
        reminder = {
            "id": len(self.reminders) + 1,
            "task": task,
            "when": when,
            "created": datetime.now().strftime("%Y-%m-%d %H:%M")
        }
        self.reminders.append(reminder)
        return f"Reminder set: '{task}' for {when}"
    
    @function_tool
    async def list_reminders(self, context: RunContext) -> str:
        """List all active reminders."""
        if not self.reminders:
            return "You have no reminders set"
        
        result = f"You have {len(self.reminders)} reminder(s):\n\n"
        for r in self.reminders:
            result += f"• {r['task']} - {r['when']}\n"
        return result
    
    @function_tool
    async def delete_reminder(self, context: RunContext, reminder_id: int) -> str:
        """Delete a reminder by ID.
        
        Args:
            reminder_id: The ID of the reminder to delete
        """
        self.reminders = [r for r in self.reminders if r['id'] != reminder_id]
        return f"Reminder {reminder_id} deleted"
```

## Business Use Cases

### 1. Restaurant Reservation Agent

```python
class RestaurantAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are a restaurant reservation assistant.
            You help customers make, modify, and cancel reservations.
            Always be polite and confirm all details."""
        )
        self.reservations = []
        self.available_times = ["5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", 
                               "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM"]
    
    @function_tool
    async def check_availability(self, context: RunContext, date: str, 
                                party_size: int) -> str:
        """Check table availability.
        
        Args:
            date: Reservation date (e.g., 'October 20, 2025')
            party_size: Number of guests
        """
        return f"Available times for {party_size} guests on {date}: {', '.join(self.available_times)}"
    
    @function_tool
    async def make_reservation(self, context: RunContext, name: str, 
                             date: str, time: str, party_size: int,
                             phone: str) -> str:
        """Make a reservation.
        
        Args:
            name: Guest name
            date: Reservation date
            time: Reservation time
            party_size: Number of guests
            phone: Contact phone number
        """
        reservation = {
            "confirmation": f"RES{len(self.reservations) + 1001}",
            "name": name,
            "date": date,
            "time": time,
            "party_size": party_size,
            "phone": phone
        }
        self.reservations.append(reservation)
        
        return f"""
        Reservation confirmed!
        
        Confirmation: {reservation['confirmation']}
        Name: {name}
        Date: {date}
        Time: {time}
        Party size: {party_size}
        Phone: {phone}
        
        We look forward to seeing you!
        """
    
    @function_tool
    async def cancel_reservation(self, context: RunContext, 
                                confirmation: str) -> str:
        """Cancel a reservation.
        
        Args:
            confirmation: Reservation confirmation number
        """
        self.reservations = [r for r in self.reservations 
                           if r['confirmation'] != confirmation]
        return f"Reservation {confirmation} has been cancelled"
```

### 2. Customer Support Agent

```python
class SupportAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are a customer support agent.
            You help customers with their questions and issues.
            Always be empathetic, patient, and solution-oriented.
            Escalate to a human agent if needed."""
        )
        self.tickets = []
        self.knowledge_base = {
            "reset password": "To reset your password, click 'Forgot Password' on the login page...",
            "billing": "For billing questions, please contact billing@company.com...",
            "shipping": "Standard shipping takes 5-7 business days..."
        }
    
    @function_tool
    async def search_knowledge_base(self, context: RunContext, 
                                   query: str) -> str:
        """Search the knowledge base for answers.
        
        Args:
            query: Search query
        """
        query_lower = query.lower()
        for key, value in self.knowledge_base.items():
            if key in query_lower:
                return value
        return "I couldn't find specific information about that. Let me create a support ticket."
    
    @function_tool
    async def create_ticket(self, context: RunContext, issue: str, 
                          customer_email: str) -> str:
        """Create a support ticket.
        
        Args:
            issue: Description of the issue
            customer_email: Customer's email address
        """
        ticket = {
            "id": f"TICKET-{len(self.tickets) + 1001}",
            "issue": issue,
            "email": customer_email,
            "status": "open",
            "created": datetime.now().strftime("%Y-%m-%d %H:%M")
        }
        self.tickets.append(ticket)
        return f"Support ticket {ticket['id']} created. We'll respond to {customer_email} within 24 hours."
    
    @function_tool
    async def escalate_to_human(self, context: RunContext, reason: str) -> str:
        """Escalate to a human agent.
        
        Args:
            reason: Reason for escalation
        """
        return f"I'm connecting you with a human agent. Reason: {reason}. Please hold..."
```

### 3. Sales Assistant

```python
class SalesAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are a sales assistant for a software company.
            You help prospects learn about our products and schedule demos.
            Be helpful but not pushy. Focus on understanding their needs."""
        )
        self.products = {
            "starter": {"name": "Starter Plan", "price": 29, "features": ["5 users", "Basic support"]},
            "professional": {"name": "Professional Plan", "price": 99, "features": ["25 users", "Priority support", "API access"]},
            "enterprise": {"name": "Enterprise Plan", "price": 299, "features": ["Unlimited users", "24/7 support", "Custom integrations"]}
        }
        self.demos = []
    
    @function_tool
    async def get_product_info(self, context: RunContext, plan: str) -> str:
        """Get information about a product plan.
        
        Args:
            plan: Plan name (starter, professional, or enterprise)
        """
        if plan.lower() in self.products:
            product = self.products[plan.lower()]
            features = "\n".join([f"• {f}" for f in product['features']])
            return f"{product['name']} - ${product['price']}/month\n\nFeatures:\n{features}"
        return "Plan not found. Available plans: Starter, Professional, Enterprise"
    
    @function_tool
    async def schedule_demo(self, context: RunContext, name: str, 
                          email: str, company: str, 
                          preferred_date: str) -> str:
        """Schedule a product demo.
        
        Args:
            name: Contact name
            email: Contact email
            company: Company name
            preferred_date: Preferred demo date/time
        """
        demo = {
            "id": f"DEMO-{len(self.demos) + 1001}",
            "name": name,
            "email": email,
            "company": company,
            "date": preferred_date
        }
        self.demos.append(demo)
        return f"Demo scheduled! Confirmation {demo['id']} sent to {email}"
```

## Advanced Patterns

### 1. Multi-Step Workflow

Handle complex workflows with state management:

```python
class OnboardingAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are an onboarding assistant.
            Guide users through the account setup process step by step.
            Be patient and clear."""
        )
        self.user_data = {}
        self.current_step = 0
        self.steps = ["name", "email", "company", "role", "team_size"]
    
    @function_tool
    async def collect_info(self, context: RunContext, field: str, 
                          value: str) -> str:
        """Collect user information.
        
        Args:
            field: Information field (name, email, company, role, team_size)
            value: Field value
        """
        self.user_data[field] = value
        self.current_step += 1
        
        if self.current_step < len(self.steps):
            next_field = self.steps[self.current_step]
            return f"Got it! Now, what's your {next_field}?"
        else:
            return self.complete_onboarding()
    
    def complete_onboarding(self) -> str:
        """Complete the onboarding process."""
        summary = "Great! Here's what we have:\n\n"
        for key, value in self.user_data.items():
            summary += f"• {key.title()}: {value}\n"
        summary += "\nYour account is being created..."
        return summary
```

### 2. Context-Aware Responses

Use conversation history for better responses:

```python
class ContextualAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are a context-aware assistant.
            Remember previous interactions and provide personalized responses."""
        )
        self.conversation_history = []
        self.user_preferences = {}
    
    @function_tool
    async def save_preference(self, context: RunContext, 
                            preference_type: str, value: str) -> str:
        """Save a user preference.
        
        Args:
            preference_type: Type of preference (e.g., 'language', 'timezone')
            value: Preference value
        """
        self.user_preferences[preference_type] = value
        return f"Preference saved: {preference_type} = {value}"
    
    @function_tool
    async def get_personalized_greeting(self, context: RunContext) -> str:
        """Get a personalized greeting based on user preferences."""
        name = self.user_preferences.get('name', 'there')
        timezone = self.user_preferences.get('timezone', 'UTC')
        
        hour = datetime.now().hour
        if hour < 12:
            time_of_day = "morning"
        elif hour < 18:
            time_of_day = "afternoon"
        else:
            time_of_day = "evening"
        
        return f"Good {time_of_day}, {name}! How can I help you today?"
```

### 3. Error Handling and Validation

Implement robust error handling:

```python
class RobustAgent(Agent):
    @function_tool
    async def process_payment(self, context: RunContext, 
                            card_number: str, amount: float) -> str:
        """Process a payment with validation.
        
        Args:
            card_number: Credit card number
            amount: Payment amount
        """
        # Validate input
        if amount <= 0:
            return "Error: Amount must be greater than zero"
        
        if len(card_number.replace(" ", "")) != 16:
            return "Error: Invalid card number format"
        
        try:
            # Process payment (mock)
            transaction_id = f"TXN{datetime.now().timestamp()}"
            return f"Payment of ${amount:.2f} processed successfully. Transaction ID: {transaction_id}"
        except Exception as e:
            return f"Payment failed: {str(e)}. Please try again or contact support."
```

## Integration Examples

### 1. Database Integration

Connect to a database for persistent storage:

```python
import sqlite3

class DatabaseAgent(Agent):
    def __init__(self):
        super().__init__(instructions="...")
        self.conn = sqlite3.connect('agent.db')
        self.create_tables()
    
    def create_tables(self):
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                name TEXT,
                email TEXT,
                created_at TIMESTAMP
            )
        ''')
        self.conn.commit()
    
    @function_tool
    async def save_user(self, context: RunContext, name: str, 
                       email: str) -> str:
        """Save a user to the database."""
        cursor = self.conn.cursor()
        cursor.execute(
            'INSERT INTO users (name, email, created_at) VALUES (?, ?, ?)',
            (name, email, datetime.now())
        )
        self.conn.commit()
        return f"User {name} saved successfully"
```

### 2. API Integration

Call external APIs:

```python
import httpx

class APIAgent(Agent):
    @function_tool
    async def fetch_stock_price(self, context: RunContext, 
                               symbol: str) -> str:
        """Fetch current stock price.
        
        Args:
            symbol: Stock symbol (e.g., 'AAPL', 'GOOGL')
        """
        async with httpx.AsyncClient() as client:
            # Example with Alpha Vantage API
            api_key = os.getenv("ALPHAVANTAGE_API_KEY")
            url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}"
            
            response = await client.get(url)
            data = response.json()
            
            if "Global Quote" in data:
                price = data["Global Quote"]["05. price"]
                return f"{symbol} is currently trading at ${price}"
            else:
                return f"Could not fetch price for {symbol}"
```

### 3. Webhook Integration

Send notifications via webhooks:

```python
class WebhookAgent(Agent):
    @function_tool
    async def send_notification(self, context: RunContext, 
                               message: str, channel: str) -> str:
        """Send a notification via webhook.
        
        Args:
            message: Notification message
            channel: Notification channel (slack, discord, etc.)
        """
        webhook_urls = {
            "slack": os.getenv("SLACK_WEBHOOK_URL"),
            "discord": os.getenv("DISCORD_WEBHOOK_URL")
        }
        
        if channel not in webhook_urls:
            return f"Unknown channel: {channel}"
        
        async with httpx.AsyncClient() as client:
            await client.post(
                webhook_urls[channel],
                json={"text": message}
            )
        
        return f"Notification sent to {channel}"
```

## Best Practices

### 1. Clear Tool Descriptions

Always provide clear, detailed docstrings:

```python
@function_tool
async def good_tool(self, context: RunContext, param: str) -> str:
    """This is a good tool description.
    
    It clearly explains what the tool does, when to use it,
    and what each parameter means.
    
    Args:
        param: A clear description of this parameter
    
    Returns:
        A description of what this tool returns
    """
    return "result"
```

### 2. Input Validation

Always validate inputs:

```python
@function_tool
async def validated_tool(self, context: RunContext, email: str) -> str:
    """Tool with input validation."""
    if "@" not in email:
        return "Error: Invalid email format"
    
    # Process valid input
    return f"Email {email} is valid"
```

### 3. Error Messages

Provide helpful error messages:

```python
@function_tool
async def helpful_errors(self, context: RunContext, user_id: int) -> str:
    """Tool with helpful error messages."""
    try:
        user = self.get_user(user_id)
        return f"Found user: {user['name']}"
    except KeyError:
        return f"User {user_id} not found. Please check the ID and try again."
    except Exception as e:
        return f"An error occurred: {str(e)}. Please contact support."
```

## Testing Your Tools

### Unit Testing

```python
import pytest
from your_agent import YourAgent

@pytest.mark.asyncio
async def test_search_tool():
    agent = YourAgent()
    result = await agent.search_airbnbs(None, "San Francisco")
    assert "Found" in result
    assert "San Francisco" in result

@pytest.mark.asyncio
async def test_booking_tool():
    agent = YourAgent()
    result = await agent.book_airbnb(
        None, "sf001", "John Smith", 
        "Jan 15", "Jan 20"
    )
    assert "Confirmed" in result
    assert "John Smith" in result
```

### Integration Testing

```python
@pytest.mark.asyncio
async def test_full_workflow():
    agent = YourAgent()
    
    # Search
    search_result = await agent.search_airbnbs(None, "San Francisco")
    assert "sf001" in search_result
    
    # Book
    booking_result = await agent.book_airbnb(
        None, "sf001", "Test User", "Jan 15", "Jan 20"
    )
    assert "BK" in booking_result
```

## Additional Resources

- [LiveKit Agents Documentation](https://docs.livekit.io/agents/)
- [Python Agents Examples Repository](https://github.com/livekit-examples/python-agents-examples)
- [LiveKit Community Discord](https://livekit.io/community)

---

**Have more examples to share?** Contribute to this document or join the community!

