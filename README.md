# iMessage Archiver

A powerful, hybrid tool to archive your iMessage history. Supports both a command-line interface (CLI) and a modern Web Dashboard.

## Features
- **Dual Mode**: Run as a CLI tool or a Web Dashboard.
- **Full History**: Exports text, reactions, and attachments.
- **Incremental Sync**: Continue where you left off without re-exporting everything.
- **Multi-Format**: Export to CSV, JSON, or Markdown (Narrative).
- **Media Processing**:
    - **OCR**: Automatically extracts text from images (requires `ocr_helper`).
    - **Transcription**: Transcribes audio messages (requires `transcribe_helper`).
- **Contact Resolution**: Resolves names from your local Contacts (AddressBook) database.

## Prerequisites
- **macOS**: This tool relies on the macOS `Messages.app` database (`chat.db`).
- **Full Disk Access**: Terminal (or iTerm/VSCode) MUST have Full Disk Access to read the iMessage database.
    - Go to `System Settings > Privacy & Security > Full Disk Access` and enable your terminal.
- **Python 3**: Pre-installed on macOS.
- **Streamlit**: (Optional) Required for the Web Dashboard.

## Installation

1.  **Clone/Copy** files to a folder (e.g., `~/Applications/iMessageArchiver`).
2.  **Run Setup**:
    ```bash
    ./setup.sh
    ```
    This will install python dependencies.

### Quick Start (App Bundle)
Double-click **iMessage Archiver.app** in this folder to launch.
*   You can drag this app to your `Applications` folder or Dock.
*   **Note**: The first time you run it, macOS might ask for permission to access `Terminal` or `Documents`.

### Command Line
```bash
./archiver.sh
```

## Output
All exports are saved to: `~/Downloads/iMessage_Exports/`

**Folder Structure:**
```
~/Downloads/iMessage_Exports/
  └── <Contact Name>/
      ├── chat_export.csv       # Message History
      └── Media/                # All Attachments
          ├── Photos/
          ├── Videos/
          ├── Audio/            # Audio Messages & Transcriptions
          └── OCR/              # Extracted text from images
```

## Troubleshooting
- **Permission Denied**: Ensure your terminal has Full Disk Access.
- **Database Locked**: Close the Messages app if you encounter issues, though the script creates a safe backup to avoid this.

## Architecture
- `archiver.sh`: Main entry point / shell wrapper.
- `backend.py`: Core logic (Database, Archival, Helpers).
- `cli_main.py`: Native macOS UI logic.
- `dashboard.py`: Streamlit Web UI.
