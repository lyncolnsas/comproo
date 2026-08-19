import sys
import os
import subprocess
import time

def open_window():
    import webview
    webview.create_window('MikroGestor', 'http://localhost')
    webview.start()

if __name__ == '__main__':
    # Se chamado com --window, apenas abre a janela e sai (usado para contornar problemas de thread)
    if '--window' in sys.argv:
        open_window()
        sys.exit(0)

    # Importações do app principal
    from PIL import Image
    import pystray
    from pystray import MenuItem as item
    import threading

    processes = []

    def start_services():
        # Redireciona a saída para não travar o processo invisível
        devnull = subprocess.DEVNULL

        # Instala dependências se não existirem
        if not os.path.exists("node_modules"):
            if sys.platform == "win32":
                subprocess.run(["npm", "install"], shell=True, stdout=devnull, stderr=devnull)
            else:
                subprocess.run(["npm", "install"], stdout=devnull, stderr=devnull)

        # Inicia o Caddy se existir
        caddy_path = os.path.join("caddy", "caddy.exe") if sys.platform == "win32" else os.path.join("caddy", "caddy")
        if os.path.exists(caddy_path):
            p_caddy = subprocess.Popen([caddy_path, "run", "--config", "Caddyfile"], stdout=devnull, stderr=devnull)
            processes.append(p_caddy)

        # Inicia o Next.js
        if sys.platform == "win32":
            p_next = subprocess.Popen(["npm", "run", "dev"], shell=True, stdout=devnull, stderr=devnull)
        else:
            p_next = subprocess.Popen(["npm", "run", "dev"], stdout=devnull, stderr=devnull)
            
        processes.append(p_next)

    def stop_services():
        for p in processes:
            try:
                if sys.platform == "win32":
                    subprocess.call(['taskkill', '/F', '/T', '/PID', str(p.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    p.terminate()
            except Exception:
                pass
        processes.clear()

    def on_open_panel(icon, item):
        # Abre a interface gráfica em um processo filho limpo
        subprocess.Popen([sys.executable, "--window"])

    def on_exit(icon, item):
        stop_services()
        icon.stop()

    def setup_tray():
        try:
            # Tenta carregar o ícone. Na build empacotada pode ser necessário usar o caminho absoluto ou confiar no diretório atual.
            icon_path = "logo.ico"
            if getattr(sys, 'frozen', False):
                # Se for compilado, tentar ler da mesma pasta do executável
                icon_path = os.path.join(os.path.dirname(sys.executable), "logo.ico")
                
            if not os.path.exists(icon_path) and os.path.exists("logo.ico"):
                icon_path = "logo.ico"

            img = Image.open(icon_path)
        except Exception:
            # Fallback se não tiver ícone
            img = Image.new('RGB', (64, 64), color=(0, 120, 215))

        menu = pystray.Menu(
            item('Abrir Painel', on_open_panel, default=True),
            item('Encerrar Sistema', on_exit)
        )
        
        icon = pystray.Icon("MikroGestor", img, "MikroGestor Servidor", menu)
        icon.run()

    # Inicializa serviços e bandeja
    start_services()
    setup_tray()
