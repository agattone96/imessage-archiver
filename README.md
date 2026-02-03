# iMessage Archiver

A professional macOS application to archive, browse, and analyze your iMessage history with a modern desktop experience.

![App Icon](app_icon.png)

## Features
- **Modern Desktop UI**: Powered by Electron for a sleek, responsive experience.
- **Unified Dashboard**: Single-page Command Center for browsing all threads.
- **Search & Filter**: Find specific messages or contacts instantly.
- **Full History Export**: High-fidelity exports including text, reactions, and attachments.
- **Intelligent Processing**:
    - **OCR**: Extract text from images automatically.
    - **Transcription**: Convert audio messages to text.
- **Privacy First**: All processing happens locally on your machine. No data ever leaves your device.

## Prerequisites
- **macOS**: Compatible with modern macOS versions.
- **Full Disk Access**: The application requires Full Disk Access to read your local `chat.db`.
    - Go to `System Settings > Privacy & Security > Full Disk Access`.
    - Add and enable **Archiver**.

## Installation & Setup

### For Users
1. Download the latest `Archiver.dmg` from the Releases page.
2. Drag **Archiver** to your Applications folder.
3. Launch and grant the necessary permissions.

### For Developers
1. Clone the repository.
2. Ensure you have Node.js and Python 3 installed.
3. Build the application:
   ```bash
   ./build_electron.sh
   ```
4. Run in development mode:
   ```bash
   npm start
   ```

## Output Structure
Exports are organized in `~/Downloads/iMessage_Exports/`:
```
<Contact Name>/
├── chat_export.csv       # Categorized Message History
└── Media/                # High-res Attachments
    ├── Photos/
    ├── Videos/
    ├── Audio/            # Voice Memos + Transcripts
    └── OCR/              # Image Text Analysis
```

## Architecture
- **Frontend**: Electron + Streamlit (embedded).
- **Engine**: Python-based archival core.
- **Database**: Direct integration with macOS `chat.db` and `AddressBook`.

## License
MIT License - see [LICENSE](LICENSE) for details.
