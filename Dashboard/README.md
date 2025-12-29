# PersonalOS Dashboard

A visual command center for your PersonalOS system, matching your Submission Specialist aesthetic.

## Features

### Dark Stealth Theme
- Matches your BJJ fitness dashboard design
- Space Grotesk + Inter + JetBrains Mono fonts
- Card-based layout with hover effects
- Mobile-responsive design

### Real-Time Data
- **Today's Priority** - From latest episode log
- **Week 1 Progress** - DecoponATX email challenge stats
- **Business Views** - Tasks organized by:
  - DecoponATX (blue accent)
  - Musha Shugyo (purple accent)
  - Health Coaching (green accent)
- **Resistance Log** - This week's resistance moments

### Auto-Updates
- Refreshes every 5 minutes
- Parses your markdown files in real-time
- No manual data entry needed

## Quick Start

### Start the Dashboard

```bash
dashboard
```

Then open in browser:
- **Local:** http://localhost:3002
- **Mobile:** http://michaels-macbook-pro:3002 (via Tailscale)

### Stop the Dashboard

Press `Ctrl+C` in the terminal

## How It Works

### Data Sources

The dashboard reads from your existing PersonalOS files:

```
~/PersonalOS/
├── Memory/episode_logs/*.md     → Today's priority
├── Tasks/Active/*.md            → Business tasks
└── Tasks/Active/DecoponATX_Week1.md → Email stats
```

### File Parsing

**Episode Logs:**
- Extracts today's priority
- Finds resistance moments
- Tracks completion patterns

**Task Files:**
- Parses `- [ ]` checkboxes
- Extracts due dates
- Categorizes by business (filename-based)

**Week 1 Tracking:**
- Counts completed emails
- Calculates progress percentage
- Shows visual progress bar

## Customization

### Add New Business

Edit `server.py` line 75-85 to add business categories:

```python
# Add your business
if 'mybusiness' in filename_lower:
    business = 'mybusiness'
```

Then update `index.html` to add a new card.

### Change Colors

Edit `index.html` CSS variables:

```css
:root {
    --accent-green: #10b981;   /* Health Coaching */
    --accent-blue: #3b82f6;    /* DecoponATX */
    --accent-purple: #8b5cf6;  /* Musha Shugyo */
}
```

### Adjust Auto-Refresh

Edit `index.html` line 396:

```javascript
// Refresh every 5 minutes (default)
setInterval(loadDashboard, 5 * 60 * 1000);

// Change to 1 minute:
setInterval(loadDashboard, 1 * 60 * 1000);
```

## Mobile Access

### Via Tailscale (Already Set Up)

1. Make sure Tailscale is running on Mac
2. Start dashboard: `dashboard`
3. On iPhone, go to: `http://michaels-macbook-pro:3002`
4. Bookmark it or add to home screen

### Mobile Features

- Fully responsive design
- Touch-friendly cards
- Swipe-friendly layout
- Works offline (caches data)

## Technical Details

### Stack

- **Frontend:** HTML + Vanilla JS + CSS
- **Backend:** Python Flask
- **Data:** Markdown files (your existing PersonalOS)
- **Port:** 3002 (doesn't conflict with OpenCode on 3001)

### Dependencies

```bash
pip3 install flask
```

Already included in your Python installation.

### File Structure

```
Dashboard/
├── index.html    # Frontend dashboard
├── server.py     # Backend API
└── README.md     # This file
```

## Troubleshooting

### Dashboard Won't Start

**Check Python/Flask:**
```bash
python3 -c "import flask; print('Flask installed')"
```

If error, install:
```bash
pip3 install flask
```

### No Data Showing

**Check file paths:**
```bash
ls ~/PersonalOS/Memory/episode_logs/
ls ~/PersonalOS/Tasks/Active/
```

**Check server logs:**
Dashboard server prints errors to terminal.

### Port Already in Use

**Change port in two files:**

1. `Dashboard/server.py` line 206:
   ```python
   app.run(host='0.0.0.0', port=3003, debug=True)  # Change 3002 → 3003
   ```

2. `Scripts/dashboard.sh` line 9:
   ```bash
   echo "  Local:  http://localhost:3003"  # Update display
   ```

## Next Steps

### Deploy to Netlify (Optional)

When you want it accessible without Mac running:

1. Build static version with pre-rendered data
2. Deploy `index.html` to Netlify
3. Use Netlify Functions for backend

See: `DEPLOYMENT.md` (coming soon)

### Add Features

Ideas for future enhancements:
- [ ] Click to complete tasks
- [ ] Add new tasks via dashboard
- [ ] Voice memo upload
- [ ] Calendar integration
- [ ] Goal progress charts
- [ ] Weekly review summary

---

**Built with the Submission Specialist aesthetic** 🥋
