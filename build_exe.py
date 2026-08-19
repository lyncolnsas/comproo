import sys
import subprocess
import os
import shutil

def install_deps():
    try:
        import webview
        from PIL import Image
        import PyInstaller
        import pystray
    except ImportError:
        print("Installing dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "pywebview", "pyinstaller", "pystray"])

def build():
    from PIL import Image
    
    # Generate logo.ico
    img_path = r"C:\Users\lyncoln.silva\.gemini\antigravity\brain\37678457-e4fd-4dde-90be-e9798387f7a0\mikrogestor_logo_1779718728911.png"
    if os.path.exists(img_path):
        img = Image.open(img_path)
        img.save("logo.ico", format="ICO", sizes=[(256, 256)])
        print("Created logo.ico")
    else:
        print("Image not found. Will build without icon.")
    
    print("Building executable...")
    # --noconsole para não mostrar janela preta no fundo.
    cmd = [
        sys.executable, "-m", "PyInstaller", 
        "--noconfirm", 
        "--onedir", 
        "--windowed", 
        "--noconsole",
        "--name", "MikroGestor"
    ]
    if os.path.exists("logo.ico"):
        cmd.extend(["--icon", "logo.ico"])
        
    cmd.append("tray_app.py")
    
    subprocess.check_call(cmd)
    
    # Copy logo.ico to the output directory so the tray app can find it at runtime
    if os.path.exists("logo.ico"):
        shutil.copy("logo.ico", os.path.join("dist", "MikroGestor", "logo.ico"))
        
    print("Build finished successfully!")

if __name__ == "__main__":
    install_deps()
    build()
