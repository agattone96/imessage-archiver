import streamlit as st
import os
import html

# --- PAGE CONFIG ---
st.set_page_config(
    page_title="Archiver",
    page_icon="app_icon.png",
    layout="wide",
)

# Imports
import os
import pandas as pd
import altair as alt

# Lazy imports - load heavy modules only when needed
@st.cache_resource
def load_backend():
    import backend as be
    return be

backend = load_backend()

@st.cache_resource
def get_pd():
    import pandas as pd
    return pd

@st.cache_resource  
def get_alt():
    import altair as alt
    return alt

# --- CUSTOM CSS ---
ST_STYLE = """
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

    /* MAIN CONTAINER & VIGNETTE */
    .stApp {
        background: #0D1117;
        background: radial-gradient(circle at center, #161b22 0%, #0D1117 100%);
        color: #C9D1D9;
        font-family: 'Inter', -apple-system, sans-serif;
    }
    
    /* HIDE ANCHOR LINKS */
    .stApp a.step-down, .stApp a.step-up, .element-container:hover a.anchor, .element-container a.anchor {
        display: none !important;
    }

    /* FROSTED PANELS */
    .vault-panel {
        background: rgba(22, 27, 34, 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
    }

    /* TRUST CARD */
    .trust-card {
        background: rgba(22, 27, 34, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 24px;
        margin: 24px 0;
    }

    /* TIMELINE RAIL */
    .timeline-container {
        position: relative;
        padding-left: 32px;
        margin-top: 20px;
    }
    .timeline-line {
        position: absolute;
        left: 7px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(to bottom, #58a6ff, rgba(88, 166, 255, 0.05));
    }
    .timeline-step {
        position: relative;
        margin-bottom: 48px;
        transition: opacity 0.3s ease;
    }
    .timeline-dot {
        position: absolute;
        left: -32px;
        top: 4px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #0D1117;
        border: 2px solid #30363D;
        z-index: 2;
        transition: all 0.3s ease;
    }
    .timeline-step.active .timeline-dot {
        background: #58a6ff;
        border-color: #58a6ff;
        box-shadow: 0 0 12px rgba(88, 166, 255, 0.6);
    }
    .timeline-step.done .timeline-dot {
        background: #238636;
        border-color: #238636;
    }
    .timeline-label {
        font-size: 14px;
        font-weight: 600;
        display: block;
    }
    .timeline-desc {
        font-size: 12px;
        color: #8B949E;
    }

    /* PREVIEW PANE */
    .preview-container {
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        background: #161B22;
        position: relative;
    }
    .preview-blur {
        filter: blur(8px);
        transform: scale(1.05);
        opacity: 0.6;
    }
</style>
"""
st.markdown(ST_STYLE, unsafe_allow_html=True)

# --- ONBOARDING LOGIC ---

def render_onboarding(onboard_metadata):
    if "onboard_step" not in st.session_state: st.session_state.onboard_step = 1
    
    # 3-Column Layout
    col_rail, col_main, col_preview = st.columns([1, 2.5, 2], gap="large")
    
    # LEFT: Timeline Rail
    with col_rail:
        st.write("")
        step = st.session_state.onboard_step
        
        def get_step_class(s_num):
            if step == s_num: return "active"
            if step > s_num: return "done"
            return ""

        st.markdown(f"""
        <div class="timeline-container">
            <div class="timeline-line"></div>
            <div class="timeline-step {get_step_class(1)}">
                <div class="timeline-dot"></div>
                <span class="timeline-label">1. Initialize</span>
                <span class="timeline-desc">Local-only Vault</span>
            </div>
            <div class="timeline-step {get_step_class(2)}">
                <div class="timeline-dot"></div>
                <span class="timeline-label">2. Permission</span>
                <span class="timeline-desc">Full Disk Access</span>
            </div>
            <div class="timeline-step {get_step_class(3)}">
                <div class="timeline-dot"></div>
                <span class="timeline-label">3. Storage</span>
                <span class="timeline-desc">Setting directory</span>
            </div>
            <div class="timeline-step {get_step_class(4)}">
                <div class="timeline-dot"></div>
                <span class="timeline-label">4. Browse</span>
                <span class="timeline-desc">Ready to explore</span>
            </div>
        </div>
        """, unsafe_allow_html=True)

    # CENTER: Action Card
    with col_main:
        if step == 1:
            st.markdown("""<div style="margin-top: 40px;">""", unsafe_allow_html=True)
            st.markdown("# Initialize your iMessage archive.")
            st.markdown("Export, index, and browse locally.  \nNo cloud. No tracking.")
            
            # Trust Card (Using Streamlit container and columns instead of raw HTML for data)
            with st.container():
                st.markdown('<div class="trust-card">', unsafe_allow_html=True)
                st.caption("PRIVACY COMMITMENTS")
                
                c1, c2 = st.columns([0.1, 0.9])
                c1.markdown("✅")
                c2.markdown("**Local-only processing**  \n<small style='color:#8B949E'>Messages never leave this machine.</small>", unsafe_allow_html=True)
                
                c1, c2 = st.columns([0.1, 0.9])
                c1.markdown("✅")
                c2.markdown("**Stored on this Mac**  \n<small style='color:#8B949E'>Saved to your secure ~/Analyzed folder.</small>", unsafe_allow_html=True)
                
                c1, c2 = st.columns([0.1, 0.9])
                c1.markdown("✅")
                c2.markdown("**Read-only access**  \n<small style='color:#8B949E'>Archiver cannot modify your data.</small>", unsafe_allow_html=True)
                st.markdown('</div>', unsafe_allow_html=True)

            st.markdown("<p style='font-size: 14px; color: #8B949E; margin-bottom: 24px;'>Next you’ll grant access to Messages and attachments so the archive can be built locally.</p>", unsafe_allow_html=True)
            
            col_cta1, col_cta2 = st.columns(2)
            if col_cta1.button("Initialize Archive", type="primary", use_container_width=True):
                st.session_state.onboard_step = 2
                st.rerun()
            if col_cta2.button("See what gets collected", use_container_width=True):
                st.info("The app reads chat.db and attachments stored in ~/Library/Messages. No private keys or passwords are accessed.")
            
            st.markdown("</div>", unsafe_allow_html=True)

        elif step == 2:
            st.markdown("""
            <div class="vault-panel" style="margin-top: 40px;">
                <h2 style="color: #ffffff; margin-bottom: 20px;">🔒 Full Disk Access</h2>
                <p style="color: #c9d1d9; margin-bottom: 24px;">To read your messages, the app needs permission to access your Library folder.</p>
                
                <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 12px; border: 1px solid #30363D;">
                    <ol style="color: #8B949E; line-height: 1.8; margin-bottom: 0;">
                        <li>Open <b style="color:white">System Settings</b>.</li>
                        <li>Go to <b style="color:white">Privacy & Security</b> > <b style="color:white">Full Disk Access</b>.</li>
                        <li>Grant access to your <b>Terminal</b> or <b>IDE</b> (e.g., Terminal, iTerm, VS Code).</li>
                    </ol>
                </div>
                
                <p style="font-size: 12px; color: #58A6FF; margin-top: 24px;">
                    ⚠️ We make a safe local backup before any processing starts.
                </p>
            </div>
            """, unsafe_allow_html=True)
            st.write("")
            col_b1, col_b2 = st.columns(2)
            if col_b1.button("← Back", use_container_width=True):
                st.session_state.onboard_step = 1
                st.rerun()
            if col_b2.button("Permission Granted →", type="primary", use_container_width=True):
                st.session_state.onboard_step = 3
                st.rerun()

        elif step == 3:
            st.markdown(f"""
            <div class="vault-panel" style="margin-top: 40px;">
                <h2 style="color: #ffffff; margin-bottom: 20px;">📂 Export Destination</h2>
                <p style="color: #c9d1d9; margin-bottom: 24px;">Your archive will be initialized in:</p>
                <div style="background: rgba(88, 166, 255, 0.05); padding: 16px; border-radius: 8px; font-family: 'SF Mono', monospace; font-size: 14px; color: #58A6FF; border: 1px solid rgba(88, 166, 255, 0.2); text-align: center;">
                    {backend.OUT_DIR}
                </div>
                <p style="font-size: 13px; color: #8B949E; margin-top: 24px;">Everything is indexed locally for zero-latency browsing.</p>
            </div>
            """, unsafe_allow_html=True)
            st.write("")
            col_b1, col_b2 = st.columns(2)
            if col_b1.button("← Back", use_container_width=True):
                st.session_state.onboard_step = 2
                st.rerun()
            if col_b2.button("🚀 Enter Vault", type="primary", use_container_width=True):
                if "ui_defaults" not in onboard_metadata: onboard_metadata["ui_defaults"] = {}
                onboard_metadata["ui_defaults"]["onboarding_complete"] = True
                backend.save_metadata(onboard_metadata)
                st.rerun()

    # RIGHT: Preview Pane
    with col_preview:
        st.write("")
        st.write("")
        st.markdown('<div class="preview-container">', unsafe_allow_html=True)
        
        # Use existing preview image with the new styling
        preview_path = "app_preview_blurred.png"
        if os.path.exists(preview_path):
            st.image(preview_path, use_container_width=True)
        else:
            # Fallback for blurred preview look
            st.markdown("""
            <div style="height: 400px; display: flex; align-items: center; justify-content: center; color: #30363D;">
                <div class="preview-blur" style="text-align:center;">
                    <div style="font-size:40px;">💬</div>
                    <div style="font-size:12px; margin-top:10px;">Archive Browser Preview</div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
        st.markdown('</div>', unsafe_allow_html=True)
        st.markdown("<p style='text-align: center; font-size: 11px; color: #8B949E; margin-top: 12px; font-style: italic;'>A preview of your upcoming vault console.</p>", unsafe_allow_html=True)

# --- MAIN APP ---

# Load Data first to check metadata
try:
    metadata = backend.load_metadata()
except: metadata = {}

# Check Onboarding
if not metadata.get("ui_defaults", {}).get("onboarding_complete"):
    render_onboarding(metadata)
else:
    # --- DATA LOADING (Main) ---
    try:
        @st.cache_data
        def load_global_stats():
            return backend.get_global_stats()

        @st.cache_resource
        def get_cached_handle_map():
            return backend.get_handle_map()

        h_map = get_cached_handle_map()
        # metadata loaded above
        stats = load_global_stats()
    except Exception as e:
        st.error(f"Critical Error Loading Data: {e}")
        st.stop()

    # --- SIDEBAR (COMMAND CENTER) ---
    with st.sidebar:
        st.image("app_icon.png", width=80)
        st.markdown("## Archiver")
        st.caption("v1.0.0 Production Ready")
        
        # Global Metrics Grid
        c1, c2 = st.columns(2)
        with c1:
            st.markdown(f"""<div class="metric-card"><div class="metric-value">{stats.get('total_messages',0):,}</div><div class="metric-label">Messages</div></div>""", unsafe_allow_html=True)
        with c2:
            st.markdown(f"""<div class="metric-card"><div class="metric-value">{stats.get('total_chats',0):,}</div><div class="metric-label">Chats</div></div>""", unsafe_allow_html=True)
        
        st.markdown("---")
        
        st.subheader("Filters & Export")
        search_query = st.text_input("🔍 Search", placeholder="Name, Number, or Content...")
        
        col_fmt, col_inc = st.columns(2)
        with col_fmt:
            export_format = st.selectbox("Format", ["csv", "json", "md"], index=0, label_visibility="collapsed")
        with col_inc:
            is_incremental = st.checkbox("Incremental", value=True)
            
        st.markdown("---")
        st.subheader("AI Enhancements")
        enable_ai = st.toggle("Enable OCR & Transcripts", value=True, help="Processes attachments locally using AI binaries.")
        if enable_ai:
            st.caption("⚠️ Local binaries verified via hash pinning.")
        else:
            st.caption("AI processing is disabled.")
            
        st.markdown("---")
        st.caption(f"📂 Storage: `{backend.OUT_DIR}`")
        if st.button("Reset Onboarding"):
             metadata["ui_defaults"]["onboarding_complete"] = False
             backend.save_metadata(metadata)
             st.rerun()
             
        st.markdown("---")
        
        # Top Contact Badge
        if stats['top_contact_handle'] != "N/A":
            top_name = backend.resolve_name(stats['top_contact_handle'], h_map)
            st.info(f"🏆 Top Friend: **{top_name}** ({stats['top_contact_count']} msgs)")

    # --- MAIN LAYOUT ---

    # 1. Thread List (Left Panel)
    if "selected_guid" not in st.session_state:
        st.session_state.selected_guid = None

    chats = backend.get_recent_chats(limit=50, search_filter=search_query, h_map=h_map)

    col_list, col_view = st.columns([1, 2], gap="large")

    with col_list:
        st.subheader("💬 Threads")
        
        for c in chats:
            active = (st.session_state.selected_guid == c["chat_guid"])
            # Custom button label
            name = c['display_names']
            if len(name) > 25: name = name[:23] + ".."
            
            label = f"{c['badges']} {name} \n({c['msg_count']} msgs)"
            
            if st.button(label, key=f"btn_{c['chat_guid']}", use_container_width=True):
                st.session_state.selected_guid = c["chat_guid"]
                st.session_state.selected_name = c["display_names"]
                st.rerun()

    # 2. Detail View (Right Panel)
    with col_view:
        if st.session_state.selected_guid:
            guid = st.session_state.selected_guid
            name = st.session_state.selected_name
            
            # Header
            head_c1, head_c2 = st.columns([3, 1])
            with head_c1:
                st.markdown(f"## {name}")
                st.caption(f"GUID: `{guid}`")
            if st.button("📥 Archive Now", type="primary", use_container_width=True):
                progress_bar = st.progress(0, text="Starting archival...")
                
                def update_bar(curr, total):
                    pct = int((curr / total) * 100) if total > 0 else 0
                    progress_bar.progress(pct, text=f"Archiving message {curr} of {total}...")
                
                try:
                    use_profiler = os.environ.get("ENABLE_PROFILING") == "1"
                    arch_func = backend.archive_chat_profiled if use_profiler else backend.archive_chat
                    
                    path, count = arch_func(
                        guid, 
                        export_format, 
                        is_incremental, 
                        metadata=metadata, 
                        h_map=h_map,
                        progress_callback=update_bar
                    )
                    progress_bar.progress(100, text="Done!")
                    if count > 0: 
                        st.toast(f"✅ Archived {count} messages!", icon="🎉")
                        st.success(f"Files saved to: `{path}`")
                    else: 
                        st.toast("No new messages found.", icon="ℹ️")
                        progress_bar.empty()
                except Exception as e:
                    progress_bar.empty()
                    st.error(f"Archival Failed: {e}")

            # Tabs for various views
            tab_chat, tab_analytics = st.tabs(["Conversation View", "Activity Trends"])
            
            with tab_chat:
                # Fetch last 50 messages for preview
                # We need raw data for our custom renderer
                conn = backend.get_db_connection()
                cur = conn.cursor()
                sql = """
                SELECT m.text, m.attributedBody, m.is_from_me, m.date, h.id as handle_id
                FROM message m
                JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
                JOIN chat c ON cmj.chat_id = c.ROWID
                LEFT JOIN handle h ON m.handle_id = h.ROWID
                WHERE c.guid = ?
                ORDER BY m.date DESC LIMIT 50
                """
                rows = [dict(r) for r in cur.execute(sql, (guid,))]
                conn.close()
                rows = list(reversed(rows))
                
                # Render Chat
                html_parts = ['<div class="chat-container">']
                last_sender = None
                
                for r in rows:
                    is_me = r['is_from_me']
                    # T-003: Sanitize untrusted content from chat.db
                    raw_text = backend.decode_body(r['text'], r['attributedBody'])
                    text = html.escape(raw_text) if raw_text else "<i>[Media/Attachment]</i>"
                    ts = backend.mac_timestamp_to_iso(r['date'])
                    
                    row_class = "me" if is_me else "them"
                    
                    # Show sender name if it changes and it's not me
                    sender_label = ""
                    if not is_me and r['handle_id'] != last_sender:
                        s_name = backend.resolve_name(r['handle_id'], h_map)
                        sender_label = f'<div style="font-size:10px; color:#8b949e; margin-left:10px; margin-bottom:2px;">{s_name}</div>'
                    
                    last_sender = r['handle_id']
                    
                    bubble_html = f"""
                    {sender_label}
                    <div class="msg-row {row_class}">
                        <div class="bubble {row_class}">
                            {text}
                        </div>
                    </div>
                    <div class="meta-info {row_class}">{ts}</div>
                    """
                    html_parts.append(bubble_html)
                
                html_parts.append('</div>')
                st.markdown("".join(html_parts), unsafe_allow_html=True)

            with tab_analytics:
                st.markdown("#### Message Volume (Last 30 Days)")
                trend_data = backend.get_chat_activity_trend(guid)
                if trend_data:
                    df = pd.DataFrame(trend_data, columns=["Date", "Messages"])
                    chart = alt.Chart(df).mark_bar(color="#007AFF").encode(
                        x='Date',
                        y='Messages',
                        tooltip=['Date', 'Messages']
                    ).interactive()
                    st.altair_chart(chart, use_container_width=True)
                else:
                    st.info("Not enough data for analytics.")
                    
        else:
            # Empty State
            st.markdown(
                """
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:60vh; color:#8b949e; text-align:center;">
                    <img src="app_icon.png" width="120" style="margin-bottom: 20px;">
                    <h2 style="color: #ffffff;">Ready to Explore?</h2>
                    <p style="font-size: 18px;">Select a conversation from the sidebar to view history, archive, and analyze trends.</p>
                </div>
                """, 
                unsafe_allow_html=True
            )
