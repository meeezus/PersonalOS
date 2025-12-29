#!/usr/bin/env python3
"""
PersonalOS Dashboard Server
Parses markdown files and serves data to the dashboard
"""

from flask import Flask, jsonify, send_from_directory
from pathlib import Path
import re
from datetime import datetime

app = Flask(__name__)

# Paths
PERSONALOS_DIR = Path.home() / "PersonalOS"
MEMORY_DIR = PERSONALOS_DIR / "Memory"
TASKS_DIR = PERSONALOS_DIR / "Tasks"
PROJECTS_DIR = PERSONALOS_DIR / "Projects"

def parse_episode_log(file_path):
    """Parse the latest episode log for priority and stats"""
    try:
        with open(file_path, 'r') as f:
            content = f.read()

        # Extract priority (look for common patterns)
        priority_patterns = [
            r'## Today\'s Priority\n(.+)',
            r'## Focus\n(.+)',
            r'Priority:\s*(.+)',
        ]

        priority = "Check latest episode log"
        for pattern in priority_patterns:
            match = re.search(pattern, content, re.MULTILINE)
            if match:
                priority = match.group(1).strip()
                break

        return {
            'priority': priority,
            'content': content
        }
    except Exception as e:
        print(f"Error parsing episode log: {e}")
        return {'priority': 'Error loading priority', 'content': ''}

def parse_unified_week1_tasks():
    """Parse Unified Week 1 Plan for today's tasks"""
    unified_file = TASKS_DIR / "Active" / "Unified_Week1_Plan.md"

    try:
        with open(unified_file, 'r') as f:
            content = f.read()

        # Get today's date
        today = datetime.now()
        day_name = today.strftime("%A")  # "Sunday"
        month_day = today.strftime("%b %d")  # "Dec 28"

        print(f"Looking for: {day_name} {month_day}")

        # Extract tasks (look for checkbox items)
        tasks = []
        lines = content.split('\n')
        in_today_section = False

        for i, line in enumerate(lines):
            # Check if we're in today's section - match by date only (ignore day name discrepancies)
            line_lower = line.lower()
            month_day_lower = month_day.lower()

            # Match on "### Day Month DD" pattern
            if line.startswith('###') and month_day_lower in line_lower:
                in_today_section = True
                print(f"Found section: {line}")
            elif line.startswith('##') and in_today_section and not line.startswith('###'):
                # Hit next major section, stop
                print("Exiting section")
                break

            # Extract tasks from today's section
            if in_today_section and '- [ ]' in line:
                task_text = line.replace('- [ ]', '').strip()
                if task_text:
                    # Extract time if present
                    time_match = re.search(r'\*\*(.+?)\*\*:', task_text)
                    time = time_match.group(1) if time_match else None
                    task_title = re.sub(r'\*\*.*?\*\*:\s*', '', task_text)

                    tasks.append({
                        'title': task_title,
                        'time': time,
                        'completed': False
                    })
                    print(f"Added task: {task_title}")

        print(f"Total tasks found: {len(tasks)}")
        return tasks
    except Exception as e:
        print(f"Error parsing unified plan: {e}")
        import traceback
        traceback.print_exc()
        return []

def parse_decoponATX_week1():
    """Parse DecoponATX Week 1 file for email stats"""
    week1_file = TASKS_DIR / "Active" / "DecoponATX_Week1.md"

    try:
        with open(week1_file, 'r') as f:
            content = f.read()

        # Count completed emails
        total_sent = 0
        for line in content.split('\n'):
            if '**Completed:**' in line:
                try:
                    num = int(re.search(r'\d+', line.split('**Completed:**')[1]).group())
                    total_sent += num
                except:
                    pass

        total_target = 90
        percent = int((total_sent / total_target) * 100) if total_target > 0 else 0

        return {
            'sent': total_sent,
            'target': total_target,
            'percent': percent
        }
    except Exception as e:
        print(f"Error parsing Week 1 file: {e}")
        return None

def parse_tasks_by_business():
    """Parse tasks from Active directory, categorized by business"""
    tasks = {
        'decopon': [],
        'musha': [],
        'health': []
    }

    try:
        active_dir = TASKS_DIR / "Active"
        if not active_dir.exists():
            return tasks

        for file in active_dir.glob("*.md"):
            with open(file, 'r') as f:
                content = f.read()

            # Determine business from filename or content
            filename_lower = file.stem.lower()
            if 'decopon' in filename_lower:
                business = 'decopon'
            elif 'musha' in filename_lower or 'content' in filename_lower:
                business = 'musha'
            elif 'health' in filename_lower or 'coaching' in filename_lower:
                business = 'health'
            else:
                business = 'decopon'  # Default

            # Extract tasks (lines starting with - [ ])
            for line in content.split('\n'):
                task_match = re.match(r'-\s*\[([ x])\]\s*(.+)', line)
                if task_match:
                    completed = task_match.group(1).lower() == 'x'
                    text = task_match.group(2).strip()

                    # Extract due date if present
                    due_match = re.search(r'Due:\s*(.+?)(?:\||$)', text)
                    due = due_match.group(1).strip() if due_match else None

                    tasks[business].append({
                        'text': text,
                        'completed': completed,
                        'due': due
                    })

    except Exception as e:
        print(f"Error parsing tasks: {e}")

    return tasks

def parse_resistance_log():
    """Extract resistance moments from episode logs"""
    resistance_items = []

    try:
        episode_dir = MEMORY_DIR / "episode_logs"
        if not episode_dir.exists():
            return resistance_items

        # Get last 7 days of episode logs
        episode_files = sorted(episode_dir.glob("*.md"), reverse=True)[:7]

        for file in episode_files:
            with open(file, 'r') as f:
                content = f.read()

            # Look for resistance patterns
            resistance_patterns = [
                r'Resistance.*?:\s*(.+?)(?:\n|$)',
                r'Voice said:\s*"(.+?)"',
                r'The voice:\s*"(.+?)"',
            ]

            for pattern in resistance_patterns:
                matches = re.finditer(pattern, content, re.MULTILINE | re.IGNORECASE)
                for match in matches:
                    voice_text = match.group(1).strip().strip('"')

                    # Try to find the action taken
                    action_patterns = [
                        r'(?:did it anyway|sent anyway|acted anyway):\s*(.+?)(?:\n|$)',
                        r'Response:\s*(.+?)(?:\n|$)',
                    ]

                    action = "Acted anyway"
                    for action_pattern in action_patterns:
                        action_match = re.search(action_pattern, content[match.end():match.end()+200], re.MULTILINE)
                        if action_match:
                            action = action_match.group(1).strip()
                            break

                    # Extract date from filename
                    date_match = re.match(r'(\d{4}-\d{2}-\d{2})', file.stem)
                    time_str = date_match.group(1) if date_match else 'Unknown'

                    resistance_items.append({
                        'time': time_str,
                        'voice': voice_text,
                        'action': action
                    })

    except Exception as e:
        print(f"Error parsing resistance log: {e}")

    return resistance_items[:5]  # Return last 5 items

@app.route('/')
def index():
    """Serve the dashboard HTML"""
    return send_from_directory('.', 'personalos.html')

@app.route('/personalos.js')
def serve_js():
    """Serve the JavaScript file"""
    return send_from_directory('.', 'personalos.js')

@app.route('/api/tasks/today')
def todays_tasks():
    """Get today's tasks from Unified Week 1 Plan"""
    tasks = parse_unified_week1_tasks()
    return jsonify({'tasks': tasks})

@app.route('/api/briefing')
def daily_briefing():
    """Generate AI-powered daily briefing using Claude"""
    try:
        import subprocess
        import json

        # Read context files
        identity_file = MEMORY_DIR / "identity.md"
        episode_dir = MEMORY_DIR / "episode_logs"
        latest_episode = max(episode_dir.glob("*.md"), key=lambda p: p.stat().st_mtime)
        unified_plan = TASKS_DIR / "Active" / "Unified_Week1_Plan.md"

        identity_content = identity_file.read_text() if identity_file.exists() else ""
        episode_content = latest_episode.read_text() if latest_episode.exists() else ""
        plan_content = unified_plan.read_text() if unified_plan.exists() else ""

        # Build prompt for Claude
        prompt = f"""Read these files for context:

IDENTITY (who I am):
{identity_content[:1000]}

LATEST EPISODE LOG (where we left off):
{episode_content[:1500]}

UNIFIED WEEK 1 PLAN:
{plan_content[:2000]}

Today is {datetime.now().strftime('%A, %B %d, %Y')}.

Generate a brief overview (2-3 sentences) summarizing:
1. What I'm working on this week
2. What I should focus on today
3. Any key context from where we left off

Keep it concise and actionable."""

        # Call Claude via opencode
        result = subprocess.run(
            ['opencode', 'prompt', prompt],
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode == 0:
            briefing = result.stdout.strip()
        else:
            briefing = "DUAL MISSION: Launch Musha Shugyo content system (Dec 30-Jan 5) + Execute 90 DecoponATX emails (Jan 6-10)."

        return jsonify({'briefing': briefing})

    except Exception as e:
        print(f"Error generating briefing: {e}")
        return jsonify({'briefing': 'Check Unified_Week1_Plan.md for today\'s focus.'})

@app.route('/api/dashboard')
def dashboard_data():
    """Return all dashboard data as JSON"""

    # Get latest episode log
    try:
        episode_dir = MEMORY_DIR / "episode_logs"
        latest_episode = max(episode_dir.glob("*.md"), key=lambda p: p.stat().st_mtime)
        episode_data = parse_episode_log(latest_episode)
    except:
        episode_data = {'priority': 'No episode log found', 'content': ''}

    # Get Week 1 stats
    week1_data = parse_decoponATX_week1()

    # Get tasks by business
    tasks_data = parse_tasks_by_business()

    # Get resistance log
    resistance_data = parse_resistance_log()

    return jsonify({
        'priority': episode_data['priority'],
        'week1': week1_data,
        'tasks': tasks_data,
        'resistance': resistance_data,
        'updated_at': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 PersonalOS Dashboard starting...")
    print(f"📂 Reading from: {PERSONALOS_DIR}")
    print(f"🌐 Dashboard available at: http://localhost:3002")
    print(f"📱 Mobile access: http://michaels-macbook-pro:3002")
    print("")
    app.run(host='0.0.0.0', port=3002, debug=True)
