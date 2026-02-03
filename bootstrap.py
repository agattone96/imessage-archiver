import os
import sys
import subprocess
import socket
import time
import webview
import threading

def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('localhost', 0))
    port = s.getsockname()[1]
    s.close()
    return port

def wait_for_port(port, timeout=30):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with socket.create_connection(("localhost", port), timeout=1):
                return True
        except (ConnectionRefusedError, socket.timeout):
            time.sleep(0.5)
    return False

def show_splash():
    """Create a minimal splash screen window."""
    base_path = os.path.dirname(os.path.abspath(__file__))
    icon_path = os.path.join(base_path, "app_icon.png")
    
    html = f"""
    <body style="margin: 0; background: #0D1117; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; -webkit-app-region: drag;">
        <div style="text-align: center;">
            <img src="file://{icon_path}" style="width: 128px; height: 128px; margin-bottom: 20px;">
            <div style="color: #58A6FF; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">
                Initializing Secure Vault...
            </div>
            <div style="margin-top: 10px; width: 200px; height: 4px; background: #30363D; border-radius: 2px; overflow: hidden; margin-left: auto; margin-right: auto;">
                <div style="width: 40%; height: 100%; background: #58A6FF; animation: loading 2s infinite ease-in-out;"></div>
            </div>
        </div>
        <style>
            @keyframes loading {{
                0% {{ transform: translateX(-100%); }}
                100% {{ transform: translateX(250%); }}
            }}
        </style>
    </body>
    """
    
    splash = webview.create_window(
        "Archiver Splash",
        html=html,
        width=400,
        height=300,
        frameless=True,
        on_top=True,
        background_color='#0D1117'
    )
    return splash

def main():
    # 1. Setup Environment
    base_path = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_path)
    
    os.environ["SCRIPT_DIR"] = base_path
    os.environ["METADATA_FILE"] = os.path.join(base_path, "metadata.json")
    os.environ["ENABLE_PROFILING"] = "1"  # Enable profiler for backend
    
    # Setup Logging
    log_dir = os.path.expanduser("~/Library/Logs/iMessageArchiver")
    os.makedirs(log_dir, exist_ok=True)
    log_path = os.path.join(log_dir, "launcher.log")
    
    with open(log_path, "a") as f:
        f.write(f"\n--- SESSION START (Profiler Enabled): {time.ctime()} ---\n")

    dashboard_path = os.path.join(base_path, "dashboard.py")
    port = get_free_port()
    
    # 2. Launch Splash Screen in Main Thread
    # We'll use a thread to start the backend so splash can show immediately
    splash_window = show_splash()

    def start_backend():
        cmd = [
            sys.executable, "-m", "streamlit", "run", dashboard_path,
            "--server.port", str(port),
            "--server.headless", "true",
            "--server.enableCORS", "false",
            "--server.enableXsrfProtection", "false",
            "--browser.gatherUsageStats", "false",
            "--global.developmentMode", "false",
            "--browser.serverAddress", "localhost",
            "--server.address", "localhost"
        ]
        
        backend_log_path = os.path.join(log_dir, "backend.log")
        with open(backend_log_path, "a") as blog:
            proc = subprocess.Popen(cmd, stdout=blog, stderr=blog, env=os.environ.copy())
        
        if wait_for_port(port):
            # Backend ready, launch main window and close splash
            time.sleep(0.5) # Smooth transition
            
            main_window = webview.create_window(
                "iMessage Archiver", 
                f"http://localhost:{port}",
                width=1200,
                height=800,
                resizable=True
            )
            
            def on_closed():
                try: proc.terminate()
                except: pass
                os._exit(0)

            main_window.events.closed += on_closed
            splash_window.destroy()
        else:
            with open(log_path, "a") as f: f.write("Backend timeout.\n")
            os._exit(1)

    # Start startup thread
    threading.Thread(target=start_backend, daemon=True).start()
    
    # Start webview event loop (Must be main thread)
    webview.start()

if __name__ == "__main__":
    main()
