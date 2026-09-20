import sys, os, paramiko
sys.stdout.reconfigure(encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Conectando ao Raspberry Pi...")
client.connect('192.168.88.253', port=22, username='hotspot', password='22101844')

sftp = client.open_sftp()
local_file = 'mikrogestor_standalone.zip'
remote_file = '/home/hotspot/mikrogestor_standalone.zip'

print(f"Enviando {local_file} ({os.path.getsize(local_file) / (1024*1024):.2f} MB)...")

def progress(transferred, total):
    percent = (transferred / total) * 100
    if transferred % (10 * 1024 * 1024) < 65536 or transferred == total:
        print(f"Progresso do envio: {percent:.1f}% ({transferred/(1024*1024):.1f}/{total/(1024*1024):.1f} MB)")

sftp.put(local_file, remote_file, callback=progress)
sftp.close()
print("Upload concluido com sucesso!")

client.close()
