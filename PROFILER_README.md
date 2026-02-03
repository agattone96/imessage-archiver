# Launch Performance Profiler

## What it does
The `profile_launch.sh` script monitors every phase of the app launch and generates a detailed timing report.

## How to use

1. **Install the app** from the DMG:
   ```bash
   open ~/Downloads/iMessage\ Archiver-1.0.0-arm64.dmg
   # Drag to Applications folder
   ```

2. **Run the profiler**:
   ```bash
   cd "/Users/owner/Library/Application Support/iMessageArchiver"
   ./profile_launch.sh
   ```

3. **What it measures**:
   - Pre-launch checks (app size, Python detection)
   - App launch time (Electron startup)
   - Backend initialization (Streamlit process)
   - Server availability (when HTTP server responds)
   - Resource usage (CPU, RAM)

4. **Output**:
   - Real-time console output
   - Saved log file on your Desktop: `launch_profile_YYYYMMDD_HHMMSS.log`

5. **Share the log**:
   - Send me the log file from your Desktop
   - I'll analyze the timings and optimize the slow phases

## What I added

### Loading Screen
- Beautiful gradient splash screen (blue-purple)
- Animated progress bar
- Shows immediately when app opens
- Automatically closes when Streamlit is ready

### Smart Python Detection
- Searches multiple common Python locations
- No more hardcoded paths
- Graceful error messaging if Python not found
