import os
import sys
import json
import subprocess
import backend

# --- JXA UI HELPERS ---

def ask_user_popup(choices_list, prompt="Select an option:"):
    choices_json = json.dumps(choices_list)
    prompt_json = json.dumps(prompt)
    jxa = f'''
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;
    app.activate();
    var choices = {choices_json};
    var result = app.chooseFromList(choices, {{
        withTitle: "iMessage Archiver",
        withPrompt: {prompt_json},
        defaultItems: [choices[0]]
    }});
    result ? result[0] : ""
    '''
    try:
        res = subprocess.check_output(["osascript", "-l", "JavaScript", "-e", jxa], text=True).strip()
        return res if res and res != "false" else None
    except: return None

def ask_user_text(prompt, default_text=""):
    p_json = json.dumps(prompt)
    d_json = json.dumps(default_text)
    jxa = f'''
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;
    app.activate();
    try {{
        var result = app.displayDialog({p_json}, {{
            defaultAnswer: {d_json},
            buttons: ["Cancel", "OK"],
            defaultButton: "OK"
        }});
        result.textReturned
    }} catch(e) {{ "" }}
    '''
    try:
        res = subprocess.check_output(["osascript", "-l", "JavaScript", "-e", jxa], text=True).strip()
        return res if res else None
    except: return None

def update_ui_progress(completed, total, description, additional=""):
    d_json = json.dumps(description)
    a_json = json.dumps(additional)
    jxa = f'''
    var app = Application.currentApplication();
    app.includeStandardAdditions = true;
    app.progress.totalUnitCount = {total};
    app.progress.completedUnitCount = {completed};
    app.progress.description = {d_json};
    app.progress.additionalDescription = {a_json};
    '''
    subprocess.run(["osascript", "-l", "JavaScript", "-e", jxa], stderr=subprocess.DEVNULL)
    print(f"[PROGRESS] {description} ({completed}/{total})")

def notify_macos(title, message):
    t_json = json.dumps(title)
    m_json = json.dumps(message)
    jxa = f'var app = Application.currentApplication(); app.includeStandardAdditions = true; app.displayNotification({m_json}, {{withTitle: {t_json}}});'
    subprocess.run(["osascript", "-l", "JavaScript", "-e", jxa], stderr=subprocess.DEVNULL)

# --- MAIN FLOW ---

def main():
    # Environment configs from shell wrapper
    batch_count = int(os.environ.get("BATCH_COUNT", "0"))
    batch_preset = os.environ.get("BATCH_PRESET", "csv").lower()
    
    metadata = backend.load_metadata()
    h_map = backend.get_handle_map()
    
    export_tasks = []

    if batch_count > 0:
        print(f"Batch Mode: Archiving top {batch_count} chats...")
        recents = backend.get_recent_chats(batch_count, h_map=h_map)
        for c in recents:
            guid = c["chat_guid"]
            meta = metadata.get("chats", {}).get(guid, {})
            export_tasks.append({
                "guid": guid,
                "ext": batch_preset,
                "is_incremental": bool(meta),
                "is_batch": True
            })
    else:
        # Interactive Mode
        # check helpers
        ocr_ok = bool(backend.OCR_BIN and os.path.exists(backend.OCR_BIN))
        trans_ok = bool(backend.TRANSCRIBE_BIN and os.path.exists(backend.TRANSCRIBE_BIN))
        
        status_msg = f"iMessage Archiver v3.0\n---\nOCR: {'ACTIVE' if ocr_ok else 'INACTIVE'}\nTranscription: {'ACTIVE' if trans_ok else 'INACTIVE'}\n---\nProceed?"
        if ask_user_popup(["Start", "Exit"], status_msg) != "Start":
            sys.exit(0)

        state = "selection"
        target_guid = None
        target_name = ""
        target_cnt = 0
        search_q = None
        one_on_one = False
        exp_ext = "csv"
        is_inc = False
        
        # Filter choice
        if ask_user_popup(["1:1 Only", "All Chats"], "Filter:") == "1:1 Only":
            one_on_one = True

        while state != "done":
            if state == "selection":
                recents = backend.get_recent_chats(100, one_on_one_only=one_on_one, search_filter=search_q, h_map=h_map)
                choices = []
                map_c = {}
                
                S_LBL = f"-- Search (Current: {search_q}) --" if search_q else "-- Search --"
                R_LBL = "-- Reset Search --"
                M_LBL = "-- Manual GUID --"
                
                choices.append(S_LBL)
                if search_q: choices.append(R_LBL)
                
                for r in recents:
                    ts = backend.mac_timestamp_to_iso(r['last_date'])
                    lbl = f"{r['badges']} {r['display_names']} ({r['msg_count']} msgs, {ts})"
                    choices.append(lbl)
                    map_c[lbl] = (r['chat_guid'], r['display_names'], r['msg_count'])
                
                choices.append(M_LBL)
                
                sel = ask_user_popup(choices, "Select Chat:")
                if not sel: sys.exit(0)
                
                if sel == S_LBL:
                    search_q = ask_user_text("Search term:", search_q or "")
                elif sel == R_LBL:
                    search_q = None
                elif sel == M_LBL:
                    target_guid = ask_user_text("Enter Chat GUID:")
                    target_name = "Manual"
                    if target_guid: state = "format"
                else:
                    target_guid, target_name, target_cnt = map_c.get(sel)
                    state = "format"
            
            elif state == "format":
                last = metadata.get("ui_defaults", {}).get("last_preset", "CSV")
                opts = ["CSV", "JSON", "Markdown", "<-- Back"]
                sel = ask_user_popup(opts, f"Format (Last: {last}):") or last
                if sel == "<-- Back": 
                    state = "selection"
                    continue
                
                if "JSON" in sel: exp_ext = "json"
                elif "Markdown" in sel: exp_ext = "md"
                else: exp_ext = "csv"
                
                metadata.setdefault("ui_defaults", {})["last_preset"] = sel
                backend.save_metadata(metadata)
                state = "mode"
            
            elif state == "mode":
                last_meta = metadata.get("chats", {}).get(target_guid)
                opts = ["Full Export", "<-- Back"]
                if last_meta:
                    opts.insert(0, f"Incremental (Since {last_meta.get('iso')})")
                
                sel = ask_user_popup(opts, "Mode:")
                if sel == "<-- Back":
                    state = "format"
                    continue
                
                is_inc = "Incremental" in sel
                state = "audit"
            
            elif state == "audit":
                preview = backend.get_message_preview(target_guid, h_map=h_map)
                msg = (f"Target: {target_name}\nFormat: {exp_ext}\nMode: {'Incremental' if is_inc else 'Full'}\n\nPreview:\n{preview}")
                if ask_user_popup(["Archive", "<-- Back"], msg) == "Archive":
                    state = "done"
                else:
                    state = "mode"

        export_tasks.append({"guid": target_guid, "ext": exp_ext, "is_incremental": is_inc, "is_batch": False})

    # Execution Loop
    last_file = ""
    for task in export_tasks:
        print(f"\nProcessing {task['guid']}...")
        
        def prog(curr, tot):
            if not task['is_batch'] and curr % 50 == 0:
                update_ui_progress(curr, tot, "Archiving...")
        
        outfile, count = backend.archive_chat(
            task['guid'], 
            task['ext'], 
            task['is_incremental'], 
            metadata=metadata, 
            h_map=h_map, 
            progress_callback=prog
        )
        
        if outfile:
            print(f"Archived {count} messages to {outfile}")
            last_file = outfile
            if not task['is_batch']:
                update_ui_progress(count, count, "Done!")
    
    # Final signal
    tmpdir = os.environ.get("TMPDIR") or "/tmp"
    target_outfile_path = os.path.join(tmpdir, "target_outfile.txt")
    with open(target_outfile_path, "w") as f:
        f.write(last_file)

if __name__ == "__main__":
    main()
