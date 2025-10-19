"""
Voice-Powered To-Do List Agent
================================
An interactive voice AI agent that helps you manage your daily tasks and goals.
The agent asks what you want to accomplish today and helps you track your progress.
"""

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentSession, RunContext
from livekit.agents.llm import function_tool
from livekit.plugins import openai, deepgram, silero
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json
import os

# Load environment variables
load_dotenv(".env")

class TodoAssistant(Agent):
    """Voice-powered to-do list assistant."""

    def __init__(self):
        super().__init__(
            instructions="""You are an enthusiastic and supportive to-do list assistant.
            Your role is to help users plan their day, track their tasks, and stay motivated.
            
            When greeting users:
            - Ask them warmly what they want to accomplish today
            - Show genuine interest in their goals
            - Be encouraging and positive
            
            When managing tasks:
            - Help break down big goals into smaller tasks
            - Suggest priorities when asked
            - Celebrate completed tasks
            - Provide gentle reminders
            
            Keep responses conversational and natural. You're like a helpful friend,
            not a rigid system. Be brief but warm in your responses."""
        )
        
        # Initialize task storage
        self.tasks: List[Dict] = []
        self.task_id_counter = 1
        
        # Load existing tasks if available
        self.load_tasks()
    
    def load_tasks(self):
        """Load tasks from storage."""
        try:
            if os.path.exists("tasks.json"):
                with open("tasks.json", "r") as f:
                    data = json.load(f)
                    self.tasks = data.get("tasks", [])
                    self.task_id_counter = data.get("next_id", 1)
        except Exception as e:
            print(f"Could not load tasks: {e}")
    
    def save_tasks(self):
        """Save tasks to storage."""
        try:
            with open("tasks.json", "w") as f:
                json.dump({
                    "tasks": self.tasks,
                    "next_id": self.task_id_counter
                }, f, indent=2)
        except Exception as e:
            print(f"Could not save tasks: {e}")
    
    @function_tool
    async def add_task(
        self, 
        context: RunContext, 
        task_description: str,
        priority: str = "medium",
        due_date: Optional[str] = None
    ) -> str:
        """Add a new task to the to-do list.
        
        Args:
            task_description: What needs to be done
            priority: Task priority (low, medium, high, urgent)
            due_date: Optional due date (e.g., 'today', 'tomorrow', 'Oct 20')
        """
        task = {
            "id": self.task_id_counter,
            "description": task_description,
            "priority": priority.lower(),
            "status": "pending",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "due_date": due_date,
            "completed_at": None
        }
        
        self.tasks.append(task)
        self.task_id_counter += 1
        self.save_tasks()
        
        priority_emoji = {
            "low": "🔵",
            "medium": "🟡", 
            "high": "🟠",
            "urgent": "🔴"
        }.get(priority.lower(), "⚪")
        
        response = f"Got it! I've added '{task_description}' to your list {priority_emoji}"
        if due_date:
            response += f" (due {due_date})"
        
        return response
    
    @function_tool
    async def list_tasks(
        self, 
        context: RunContext,
        filter_by: str = "all"
    ) -> str:
        """List all tasks or filter by status.
        
        Args:
            filter_by: Filter tasks (all, pending, completed, today, high-priority)
        """
        if not self.tasks:
            return "Your to-do list is empty! What would you like to accomplish today?"
        
        # Filter tasks
        filtered_tasks = []
        filter_lower = filter_by.lower()
        
        for task in self.tasks:
            if filter_lower == "all":
                filtered_tasks.append(task)
            elif filter_lower == "pending" and task["status"] == "pending":
                filtered_tasks.append(task)
            elif filter_lower == "completed" and task["status"] == "completed":
                filtered_tasks.append(task)
            elif filter_lower == "today" and task["due_date"] in ["today", datetime.now().strftime("%Y-%m-%d")]:
                filtered_tasks.append(task)
            elif filter_lower == "high-priority" and task["priority"] in ["high", "urgent"]:
                filtered_tasks.append(task)
        
        if not filtered_tasks:
            return f"No {filter_by} tasks found."
        
        # Build response
        result = f"Here are your {filter_by} tasks:\n\n"
        
        for task in filtered_tasks:
            status_icon = "✅" if task["status"] == "completed" else "⬜"
            priority_icon = {
                "low": "🔵",
                "medium": "🟡",
                "high": "🟠", 
                "urgent": "🔴"
            }.get(task["priority"], "⚪")
            
            result += f"{status_icon} {priority_icon} {task['description']}"
            
            if task["due_date"]:
                result += f" (due {task['due_date']})"
            
            result += f" [ID: {task['id']}]\n"
        
        pending_count = sum(1 for t in self.tasks if t["status"] == "pending")
        completed_count = sum(1 for t in self.tasks if t["status"] == "completed")
        
        result += f"\n📊 Total: {len(self.tasks)} tasks ({pending_count} pending, {completed_count} completed)"
        
        return result
    
    @function_tool
    async def complete_task(self, context: RunContext, task_id: int) -> str:
        """Mark a task as completed.
        
        Args:
            task_id: The ID of the task to complete
        """
        for task in self.tasks:
            if task["id"] == task_id:
                if task["status"] == "completed":
                    return f"Task '{task['description']}' is already completed! 🎉"
                
                task["status"] = "completed"
                task["completed_at"] = datetime.now().strftime("%Y-%m-%d %H:%M")
                self.save_tasks()
                
                # Count remaining tasks
                remaining = sum(1 for t in self.tasks if t["status"] == "pending")
                
                response = f"Awesome! ✅ You completed '{task['description']}'"
                
                if remaining == 0:
                    response += "\n\n🎉 Amazing! You've completed all your tasks! You're crushing it today!"
                elif remaining == 1:
                    response += f"\n\nJust 1 more task to go! You're almost done!"
                else:
                    response += f"\n\n{remaining} tasks remaining. Keep up the great work!"
                
                return response
        
        return f"I couldn't find a task with ID {task_id}. Try listing your tasks to see the IDs."
    
    @function_tool
    async def delete_task(self, context: RunContext, task_id: int) -> str:
        """Delete a task from the list.
        
        Args:
            task_id: The ID of the task to delete
        """
        for i, task in enumerate(self.tasks):
            if task["id"] == task_id:
                description = task["description"]
                self.tasks.pop(i)
                self.save_tasks()
                return f"Removed '{description}' from your list."
        
        return f"I couldn't find a task with ID {task_id}."
    
    @function_tool
    async def update_task_priority(
        self, 
        context: RunContext, 
        task_id: int, 
        new_priority: str
    ) -> str:
        """Update the priority of a task.
        
        Args:
            task_id: The ID of the task
            new_priority: New priority level (low, medium, high, urgent)
        """
        for task in self.tasks:
            if task["id"] == task_id:
                old_priority = task["priority"]
                task["priority"] = new_priority.lower()
                self.save_tasks()
                
                priority_emoji = {
                    "low": "🔵",
                    "medium": "🟡",
                    "high": "🟠",
                    "urgent": "🔴"
                }.get(new_priority.lower(), "⚪")
                
                return f"Updated '{task['description']}' from {old_priority} to {new_priority} priority {priority_emoji}"
        
        return f"I couldn't find a task with ID {task_id}."
    
    @function_tool
    async def get_daily_summary(self, context: RunContext) -> str:
        """Get a summary of today's tasks and progress."""
        if not self.tasks:
            return "You don't have any tasks yet. What would you like to accomplish today?"
        
        total = len(self.tasks)
        completed = sum(1 for t in self.tasks if t["status"] == "completed")
        pending = sum(1 for t in self.tasks if t["status"] == "pending")
        high_priority = sum(1 for t in self.tasks if t["priority"] in ["high", "urgent"] and t["status"] == "pending")
        
        completion_rate = (completed / total * 100) if total > 0 else 0
        
        summary = f"📊 Daily Summary\n\n"
        summary += f"Total tasks: {total}\n"
        summary += f"✅ Completed: {completed}\n"
        summary += f"⬜ Pending: {pending}\n"
        summary += f"🔴 High priority: {high_priority}\n"
        summary += f"Progress: {completion_rate:.0f}%\n\n"
        
        if completion_rate == 100:
            summary += "🎉 Perfect! You've completed everything!"
        elif completion_rate >= 75:
            summary += "🌟 Great progress! You're almost there!"
        elif completion_rate >= 50:
            summary += "👍 Good work! Keep it up!"
        elif completion_rate >= 25:
            summary += "💪 You're making progress! Stay focused!"
        else:
            summary += "🚀 Let's get started! You've got this!"
        
        return summary
    
    @function_tool
    async def suggest_next_task(self, context: RunContext) -> str:
        """Suggest the next task to work on based on priority and due dates."""
        pending_tasks = [t for t in self.tasks if t["status"] == "pending"]
        
        if not pending_tasks:
            return "You've completed all your tasks! 🎉 Want to add something new?"
        
        # Sort by priority (urgent > high > medium > low) and due date
        priority_order = {"urgent": 0, "high": 1, "medium": 2, "low": 3}
        
        sorted_tasks = sorted(
            pending_tasks,
            key=lambda t: (
                priority_order.get(t["priority"], 4),
                t["due_date"] if t["due_date"] else "9999"
            )
        )
        
        next_task = sorted_tasks[0]
        
        priority_emoji = {
            "low": "🔵",
            "medium": "🟡",
            "high": "🟠",
            "urgent": "🔴"
        }.get(next_task["priority"], "⚪")
        
        response = f"I suggest working on: {priority_emoji} '{next_task['description']}'"
        
        if next_task["due_date"]:
            response += f" (due {next_task['due_date']})"
        
        response += f"\n\nThis is your {next_task['priority']} priority task."
        
        if len(pending_tasks) > 1:
            response += f" You have {len(pending_tasks) - 1} other tasks waiting."
        
        return response
    
    @function_tool
    async def clear_completed_tasks(self, context: RunContext) -> str:
        """Remove all completed tasks from the list."""
        completed = [t for t in self.tasks if t["status"] == "completed"]
        
        if not completed:
            return "No completed tasks to clear."
        
        count = len(completed)
        self.tasks = [t for t in self.tasks if t["status"] != "completed"]
        self.save_tasks()
        
        return f"Cleared {count} completed task{'s' if count != 1 else ''}. Fresh start! 🧹"


async def entrypoint(ctx: agents.JobContext):
    """Entry point for the to-do list agent."""
    
    # Configure the voice pipeline
    session = AgentSession(
        stt=deepgram.STT(model="nova-2"),
        llm=openai.LLM(model=os.getenv("LLM_CHOICE", "gpt-4.1-mini")),
        tts=openai.TTS(voice="echo"),
        vad=silero.VAD.load(),
    )
    
    # Start the session
    await session.start(
        room=ctx.room,
        agent=TodoAssistant()
    )
    
    # Generate initial greeting
    await session.generate_reply(
        instructions="""Greet the user warmly and ask them what they want to accomplish today.
        Be enthusiastic and supportive. Make them feel motivated to share their goals."""
    )


if __name__ == "__main__":
    # Run the agent
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))

