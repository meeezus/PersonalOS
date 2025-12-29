# Mobile Access Guide

## Status: READY TO CONFIGURE

Your PersonalOS can be accessed from your phone once you complete the Tailscale setup.

---

## Quick Setup (One Time - 10 minutes)

### Step 1: Install Tailscale on Mac (DONE ✅)
Tailscale is installed and ready to configure.

### Step 2: Authenticate Tailscale on Mac

**Run this command in your terminal:**
```bash
sudo /opt/homebrew/opt/tailscale/bin/tailscaled &
sleep 2
/opt/homebrew/bin/tailscale up
```

This will:
- Start the Tailscale daemon
- Open your browser to authenticate
- Connect your Mac to your Tailscale network

**After authenticating, get your hostname:**
```bash
tailscale status
```

Look for your Mac's hostname (something like `michaels-macbook` or `macbook-pro`).
Your full Tailscale address will be: `[hostname].tail-scale.ts.net`

### Step 3: Install Tailscale on Your Phone

**iOS:** App Store - search "Tailscale"
**Android:** Play Store - search "Tailscale"

**Log in with the same account** you used on your Mac.

### Step 4: Start OpenCode Server

**In your Mac terminal:**
```bash
pos                           # Navigate to PersonalOS
opencode web --port 3000 --hostname 0.0.0.0
```

This starts OpenCode in web mode, accessible from any device on your Tailscale network.

**Keep this terminal window open** - or set up auto-start (see below).

### Step 5: Bookmark on Phone

**In Safari/Chrome on your phone:**
```
http://[YOUR-TAILSCALE-HOSTNAME]:3000
```

Replace `[YOUR-TAILSCALE-HOSTNAME]` with what you got from `tailscale status`.

Example: `http://michaels-macbook:3000`

Save this as a bookmark or add to home screen.

---

## Daily Mobile Usage

### Quick Access
1. Open Tailscale app on phone (make sure it's connected)
2. Open your bookmark: `http://[hostname]:3000`
3. Same OpenCode interface as your laptop!

### What You Can Do

**Quick updates while mobile:**
```
Update DecoponATX: sent 5 emails today
```

**Log resistance moments immediately:**
```
Log resistance: The voice said "this isn't working" at email 8
```

**Capture tasks on the go:**
```
Add task: Follow up with Sarah about venue. Due Friday.
```

**After meetings:**
```
Add to Sarah's contact: Had coffee today, she wants proposal by Jan 15, budget $1500
```

**Search the web (NEW!):**
```
Search for corporate event venues in Austin
Find team building workshop ideas for 20 people
```

### Voice Input Option

Use your phone's dictation:
1. Tap microphone icon on keyboard
2. Speak your command naturally
3. Send

This is perfect for:
- Walking to meetings
- Waiting in line
- Quick captures between tasks
- Logging wins immediately

---

## When It Works

**Your PersonalOS is accessible anywhere when:**
- ✅ Your Mac is on and awake
- ✅ OpenCode server is running (`opencode web`)
- ✅ Tailscale is connected on both devices
- ✅ Both devices have internet

**It does NOT require:**
- ❌ Your Mac and phone on same WiFi
- ❌ Public IP address
- ❌ Port forwarding
- ❌ Complex VPN setup

Tailscale creates a secure private network between your devices.

---

## Auto-Start OpenCode Server (Optional)

**Don't want to manually start OpenCode every time?**

Set it up to auto-start when your Mac boots:

### Create Launch Agent

**Run these commands:**
```bash
mkdir -p ~/Library/LaunchAgents

cat > ~/Library/LaunchAgents/com.opencode.server.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.opencode.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/opencode</string>
        <string>web</string>
        <string>--port</string>
        <string>3000</string>
        <string>--hostname</string>
        <string>0.0.0.0</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/michaelenriquez/PersonalOS</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/michaelenriquez/PersonalOS/opencode-server.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/michaelenriquez/PersonalOS/opencode-server-error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>ANTHROPIC_API_KEY</key>
        <string>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</string>
        <key>PATH</key>
        <string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
EOF

# Load it now
launchctl load ~/Library/LaunchAgents/com.opencode.server.plist

# Check if it's running
launchctl list | grep opencode
```

**Now OpenCode runs automatically when your Mac starts!**

To stop it:
```bash
launchctl unload ~/Library/LaunchAgents/com.opencode.server.plist
```

To start it manually after stopping:
```bash
launchctl load ~/Library/LaunchAgents/com.opencode.server.plist
```

---

## Troubleshooting

### Can't connect from phone

**Check:**
1. Is Tailscale connected on phone? (Open Tailscale app, look for green checkmark)
2. Is Mac awake and Tailscale running? Run `tailscale status` on Mac
3. Is OpenCode server running? Check with `ps aux | grep opencode`
4. Try accessing from Mac first: `http://localhost:3000`

### OpenCode server not starting

**Check the logs:**
```bash
cat ~/PersonalOS/opencode-server-error.log
```

**Common fixes:**
- Make sure you're in PersonalOS directory: `pos`
- Check API key is set: `echo $ANTHROPIC_API_KEY`
- Try starting manually first: `opencode web --port 3000 --hostname 0.0.0.0`

### Tailscale says "not connected"

**Restart Tailscale:**
```bash
brew services restart tailscale
tailscale up
```

---

## Privacy & Security

**Is this secure?**
Yes. Tailscale:
- Uses WireGuard encryption (industry standard)
- Creates peer-to-peer connections when possible
- Never exposes your system to the public internet
- Only devices you authenticate can connect
- Works like a private VPN

**What can someone access if they get my phone?**
- They can interact with OpenCode (same as your laptop)
- They can read/write PersonalOS files
- **Security recommendation:** Use phone lock screen protection
- **For extra security:** Log out of Tailscale when not using

---

## Usage Scenarios

### Walking to meeting
"Add task: Email venue about capacity question. Due today."

### At coffee shop (resistance moment)
"Log resistance: Voice said I should wait until I have perfect pricing. But I'm sending the proposal anyway."

### Post-meeting (immediate capture)
"Add to Jane's contact: Loved the workshop idea, wants proposal for 30 people, budget $2000, decision by Feb 1"

### Inspiration strikes
"Add to content ideas: Post about how ADHD entrepreneurs can use voice capture to beat context switching"

### Evening review (from couch)
"What did I accomplish today? Show me DecoponATX progress."

---

## Next Steps

1. **Authenticate Tailscale** on your Mac (run the commands in Step 2)
2. **Note your Tailscale hostname** (run `tailscale status`)
3. **Install Tailscale on phone** and authenticate
4. **Start OpenCode server** on Mac
5. **Bookmark the URL** on your phone
6. **Test it!** Try a simple command from your phone

---

**Once configured, your Personal AI System works from anywhere.** 🚀

**See DAILY_GUIDE.md for mobile workflow integration.**
