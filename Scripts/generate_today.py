#!/usr/bin/env python3
"""
PersonalOS - Today Generator (Week 1 MVP)
Generates a Today.md file with daily email targets and progress tracking.
"""

import os
from datetime import datetime
from pathlib import Path

# Configuration
PERSONALOS_DIR = Path.home() / "PersonalOS"
TASKS_DIR = PERSONALOS_DIR / "Tasks"
WEEK1_FILE = TASKS_DIR / "Active" / "DecoponATX_Week1.md"
TODAY_FILE = TASKS_DIR / "Daily" / "Today.md"

# Week 1 schedule (Dec 30 - Jan 3)
SCHEDULE = {
    "2024-12-30": {"day": "Monday", "target": 15},
    "2024-12-31": {"day": "Tuesday", "target": 20},
    "2025-01-01": {"day": "Wednesday", "target": 20},
    "2025-01-02": {"day": "Thursday", "target": 20},
    "2025-01-03": {"day": "Friday", "target": 15},
}

def get_today_info():
    """Get today's date and target info"""
    today = datetime.now().strftime("%Y-%m-%d")
    
    if today in SCHEDULE:
        return SCHEDULE[today]
    else:
        # If outside Week 1, show a completion message
        return None

def read_week1_progress():
    """Read the Week 1 tracking file to get current progress"""
    if not WEEK1_FILE.exists():
        return {"total_sent": 0, "total_target": 90}
    
    with open(WEEK1_FILE, 'r') as f:
        content = f.read()
    
    # Simple parsing - count completed emails
    total_sent = 0
    for line in content.split('\n'):
        if '**Completed:**' in line:
            try:
                num = int(line.split('**Completed:**')[1].strip())
                total_sent += num
            except:
                pass
    
    return {"total_sent": total_sent, "total_target": 90}

def generate_today_md():
    """Generate the Today.md file"""
    
    today_info = get_today_info()
    
    if today_info is None:
        # Week 1 is over
        content = f"""# Today - {datetime.now().strftime("%A, %B %d, %Y")}

## 🎉 Week 1 Complete!

You made it through the 90-email challenge.

Check your `DecoponATX_Week1.md` file for final results.

---

**Next:** Time to build the full Personal OS system.
"""
    else:
        # Generate today's focus page
        progress = read_week1_progress()
        day = today_info["day"]
        target = today_info["target"]
        total_sent = progress["total_sent"]
        total_target = progress["total_target"]
        remaining = total_target - total_sent
        completion_pct = int((total_sent / total_target) * 100)
        
        content = f"""# Today - {day}, {datetime.now().strftime("%B %d, %Y")}

## 🎯 Today's Mission
**Send {target} cold emails to Austin companies.**

---

## 📊 Week 1 Progress
- **Total Sent:** {total_sent} / {total_target} emails ({completion_pct}%)
- **Remaining:** {remaining} emails
- **Today's Target:** {target} emails

---

## ✅ Today's Checklist

### Morning Ritual
- [ ] Read the core belief: "I can't make shit happen"
- [ ] Say out loud: "I'm proving I CAN make shit happen today"
- [ ] Open Apollo/Hunter and start finding contacts
- [ ] Deep breath. I'm ready.

### Email Batches
- [ ] Batch 1: Emails 1-5 (personalize each one)
- [ ] Batch 2: Emails 6-10
{"- [ ] Batch 3: Emails 11-15" if target >= 15 else ""}
{"- [ ] Batch 4: Emails 16-20" if target == 20 else ""}

### Update Tracker
- [ ] Update `DecoponATX_Week1.md` with today's count
- [ ] Log any resistance moments below
- [ ] Celebrate wins (even small ones)

---

## 🧠 When Resistance Shows Up

**The Voice Will Say:**
- "This isn't working"
- "You can't make shit happen"
- "You should research more"
- "Maybe build a tool to optimize this"

**You Will Say:**
- "Thank you for trying to protect me"
- "I'm sending the email anyway"
- "That was ONE email. I'm sending {target - 1} more. Watch me."

**Log It Here:**
- 

---

## 🏆 Today's Wins
(Write at least 3, even if they're tiny)

1. 
2. 
3. 

---

## 📈 Evidence I'm Building
Today I proved I can make shit happen by:

- 

---

**Remember:** The goal isn't perfection. The goal is EXECUTION.

You don't need to believe you can do it. You just need to ACT AS IF.

Now go send {target} emails.
"""
    
    # Write the file
    with open(TODAY_FILE, 'w') as f:
        f.write(content)
    
    print(f"✅ Today.md generated successfully!")
    print(f"📍 Location: {TODAY_FILE}")
    print(f"\nOpen it with: open {TODAY_FILE}")
    print(f"Or in Obsidian if you have the vault set up there.")

if __name__ == "__main__":
    generate_today_md()
