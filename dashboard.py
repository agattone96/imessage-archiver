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
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

    :root {
      /* Base */
      --bg0: #05060b;
      --bg1: #070912;
      --bg2: #0b0e1a;

      /* Accents */
      --pink: #ff2aa8;
      --pink2: #ff54da;
      --violet: #7b5cff;
      --cyan: #34f2ff;

      /* Surfaces */
      --panel: rgba(18, 16, 28, 0.54);
      --panel2: rgba(10, 10, 18, 0.32);
      --stroke: rgba(255, 255, 255, 0.12);
      --stroke2: rgba(255, 255, 255, 0.07);

      --text: rgba(255, 255, 255, 0.9);
      --muted: rgba(255, 255, 255, 0.62);

      --radius: 26px;
      --btn: 46px;

      /* Shadows + glow */
      --shadow: 0 18px 62px rgba(0, 0, 0, 0.58),
        0 1px 0 rgba(255, 255, 255, 0.06) inset;

      --glow-soft: 0 0 16px rgba(255, 42, 168, 0.22),
        0 0 44px rgba(255, 42, 168, 0.12);

      --glow-mid: 0 0 18px rgba(255, 42, 168, 0.34),
        0 0 64px rgba(255, 42, 168, 0.16);

      /* Safe-area */
      --dock-bottom: max(22px, env(safe-area-inset-bottom));
    }

    * { box-sizing: border-box; }

    .stApp {
        background: radial-gradient(
          1200px 700px at 50% 12%,
          rgba(255, 42, 168, 0.16),
          transparent 60%
        ),
        radial-gradient(
          900px 600px at 20% 86%,
          rgba(123, 92, 255, 0.14),
          transparent 58%
        ),
        radial-gradient(
          750px 520px at 90% 78%,
          rgba(52, 242, 255, 0.08),
          transparent 60%
        ),
        linear-gradient(180deg, var(--bg0), var(--bg2)) !important;
        color: var(--text);
        font-family: 'Outfit', ui-sans-serif, system-ui, -apple-system, sans-serif !important;
    }

    /* HIDE STREAMLIT ELEMENTS */
    header, [data-testid="stHeader"], [data-testid="stFooter"] { visibility: hidden; }
    #MainMenu, footer { display: none !important; }

    .ui-stage {
      position: relative;
      width: 100%;
      min-height: 100svh;
      padding: 22px;
      z-index: 1;
    }

    .ui-bg-overlay {
      position: fixed;
      inset: -60px;
      pointer-events: none;
      opacity: 0.92;
      background: radial-gradient(
          900px 260px at 50% 114%,
          rgba(255, 42, 168, 0.1),
          transparent 62%
        ),
        radial-gradient(
          820px 280px at 50% 120%,
          rgba(255, 42, 168, 0.08),
          transparent 60%
        ),
        linear-gradient(0deg, rgba(0, 0, 0, 0.28), transparent 45%);
      filter: blur(0.25px);
      z-index: 0;
    }

    /* Status Chip */
    .status-chip {
      position: fixed;
      left: 50%;
      top: 24px;
      transform: translateX(-50%);
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(10, 10, 14, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 14px 38px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 999999;
    }
    .status-value::before {
      content: "";
      width: 8px;
      height: 8px;
      display: inline-block;
      border-radius: 99px;
      margin-right: 8px;
      background: var(--pink);
      box-shadow: 0 0 12px rgba(255, 42, 168, 0.72);
      vertical-align: middle;
    }

    /* Panels */
    .glass-panel {
        background: var(--panel);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid var(--stroke);
        border-radius: var(--radius);
        padding: 32px;
        box-shadow: var(--shadow);
    }

    /* Sidebar / Sidebar Nav */
    section[data-testid="stSidebar"] {
        background-color: rgba(5, 6, 11, 0.8) !important;
        border-right: 1px solid var(--stroke);
        backdrop-filter: blur(20px);
    }

    /* Metric Cards */
    .metric-card {
        background: var(--panel2);
        border: 1px solid var(--stroke2);
        border-radius: 16px;
        padding: 16px;
        text-align: center;
    }
    .metric-value {
        font-size: 24px;
        font-weight: 800;
        color: var(--pink);
        text-shadow: 0 0 12px rgba(255, 42, 168, 0.3);
    }
    .metric-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--muted);
    }

    /* Chat Bubbles */
    .msg-row.me .bubble {
        background: linear-gradient(135deg, var(--pink), var(--pink2));
        color: white !important;
        border-radius: 18px 18px 4px 18px;
        box-shadow: 0 10px 20px rgba(255, 42, 168, 0.15);
    }
    .msg-row.them .bubble {
        background: var(--panel);
        border: 1px solid var(--stroke);
        color: var(--text);
        border-radius: 18px 18px 18px 4px;
    }

    /* Timeline */
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
        background: linear-gradient(to bottom, var(--pink), rgba(255, 42, 168, 0.05));
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
        background: var(--bg0);
        border: 2px solid var(--stroke);
        z-index: 2;
        transition: all 0.3s ease;
    }
    .timeline-step.active .timeline-dot {
        background: var(--pink) !important;
        border-color: var(--pink) !important;
        box-shadow: 0 0 12px var(--pink) !important;
    }
    .timeline-step.done .timeline-dot {
        background: var(--cyan);
        border-color: var(--cyan);
    }
    .timeline-label {
        font-size: 14px;
        font-weight: 600;
        display: block;
    }
    .timeline-desc {
        font-size: 12px;
        color: var(--muted);
    }

    /* Floating Toolbar Simulation */
    .neo-toolbar-mock {
      position: fixed;
      left: 50%;
      bottom: 32px;
      transform: translateX(-50%);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px;
      border-radius: 99px;
      border: 1px solid var(--stroke);
      background: linear-gradient(180deg, var(--panel), var(--panel2));
      box-shadow: var(--shadow);
      backdrop-filter: blur(16px);
      animation: floaty 5.8s ease-in-out infinite;
    }

    @keyframes floaty {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(-5px); }
    }
</style>
<div class="ui-bg-overlay"></div>
<div class="status-chip">
    <span style="color: var(--muted); font-size: 12px;">SYSTEM</span>
    <span class="status-value" style="font-weight: 700; font-size: 12px;">ENCRYPTED & LOCAL</span>
</div>
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
            
            # Trust Card
            with st.container():
                st.markdown('<div class="glass-panel" style="padding: 24px; margin: 24px 0;">', unsafe_allow_html=True)
                st.caption("PRIVACY COMMITMENTS")
                
                tr1, tr2 = st.columns([0.1, 0.9])
                tr1.markdown("✅")
                tr2.markdown(f"**Local-only processing**  \n<small style='color:var(--muted)'>Messages never leave this machine.</small>", unsafe_allow_html=True)
                
                tr1, tr2 = st.columns([0.1, 0.9])
                tr1.markdown("✅")
                tr2.markdown(f"**Stored on this Mac**  \n<small style='color:var(--muted)'>Saved to your secure ~/Analyzed folder.</small>", unsafe_allow_html=True)
                
                tr1, tr2 = st.columns([0.1, 0.9])
                tr1.markdown("✅")
                tr2.markdown(f"**Read-only access**  \n<small style='color:var(--muted)'>Archiver cannot modify your data.</small>", unsafe_allow_html=True)
                st.markdown('</div>', unsafe_allow_html=True)

            st.markdown("<p style='font-size: 14px; color: var(--muted); margin-bottom: 24px;'>Next you’ll grant access to Messages and attachments so the archive can be built locally.</p>", unsafe_allow_html=True)
            
            col_cta1, col_cta2 = st.columns(2)
            if col_cta1.button("Initialize Archive", type="primary", use_container_width=True):
                st.session_state.onboard_step = 2
                st.rerun()
            if col_cta2.button("See what gets collected", use_container_width=True):
                st.info("The app reads chat.db and attachments stored in ~/Library/Messages. No private keys or passwords are accessed.")
            
            st.markdown("</div>", unsafe_allow_html=True)

        elif step == 2:
            st.markdown(f"""
            <div class="glass-panel" style="margin-top: 40px;">
                <h2 style="color: #ffffff; margin-bottom: 20px;">🔒 Full Disk Access</h2>
                <p style="color: #c9d1d9; margin-bottom: 24px;">To read your messages, the app needs permission to access your Library folder.</p>
                
                <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 12px; border: 1px solid var(--stroke2);">
                    <ol style="color: var(--muted); line-height: 1.8; margin-bottom: 0;">
                        <li>Open <b style="color:white">System Settings</b>.</li>
                        <li>Go to <b style="color:white">Privacy & Security</b> > <b style="color:white">Full Disk Access</b>.</li>
                        <li>Grant access to your <b>Terminal</b> or <b>IDE</b> (e.g., Terminal, iTerm, VS Code).</li>
                    </ol>
                </div>
                
                <p style="font-size: 12px; color: var(--cyan); margin-top: 24px;">
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
            <div class="glass-panel" style="margin-top: 40px;">
                <h2 style="color: #ffffff; margin-bottom: 20px;">📂 Export Destination</h2>
                <p style="color: #c9d1d9; margin-bottom: 24px;">Your archive will be initialized in:</p>
                <div style="background: rgba(52, 242, 255, 0.05); padding: 16px; border-radius: 8px; font-family: 'SF Mono', monospace; font-size: 14px; color: var(--cyan); border: 1px solid rgba(52, 242, 255, 0.2); text-align: center;">
                    {backend.OUT_DIR}
                </div>
                <p style="font-size: 13px; color: var(--muted); margin-top: 24px;">Everything is indexed locally for zero-latency browsing.</p>
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

    # Float Toolbar (Always on Onboarding)
    st.markdown("""
        <div class="neo-toolbar-mock">
            <div style="color: var(--pink); font-weight: 800; font-size: 18px; margin-right: 12px;">ARCHIVER</div>
            <div style="width: 1px; height: 20px; background: var(--stroke);"></div>
            <div style="color: var(--muted); font-size: 12px; margin-left: 12px;">V1.0.0 READY</div>
        </div>
    """, unsafe_allow_html=True)

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

        @st.cache_data(ttl=2, show_spinner=False)
        def load_recent_chats_cached(search_filter):
            return backend.get_recent_chats(limit=50, search_filter=search_filter, h_map=get_cached_handle_map())

        @st.cache_data(ttl=2, show_spinner=False)
        def load_chat_messages_cached(chat_guid):
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
            rows = [dict(r) for r in cur.execute(sql, (chat_guid,))]
            conn.close()
            return list(reversed(rows))

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
             metadata.setdefault("ui_defaults", {})["onboarding_complete"] = False
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

    chats = load_recent_chats_cached(search_query)

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
                rows = load_chat_messages_cached(guid)
                
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
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:60vh; text-align:center;">
                    <div class="glass-panel" style="display:flex; flex-direction:column; align-items:center; padding: 60px;">
                        <img src="app_icon.png" width="120" style="margin-bottom: 20px;">
                        <h2 style="color: #ffffff;">Ready to Explore?</h2>
                        <p style="font-size: 18px; color: var(--muted);">Select a conversation from the sidebar to view history, archive, and analyze trends.</p>
                    </div>
                </div>
                """, 
                unsafe_allow_html=True
            )
