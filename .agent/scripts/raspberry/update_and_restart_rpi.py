import os
import shutil
import zipfile
import paramiko
import time

print("--- 1. PREPARANDO PACOTE STANDALONE ---")
cwd = r'c:\Users\lynco\OneDrive\Documentos\-Projetos\mikrogestor-voucher22'
standalone_dir = os.path.join(cwd, '.next', 'standalone')
standalone_static = os.path.join(standalone_dir, '.next', 'static')
standalone_public = os.path.join(standalone_dir, 'public')
standalone_hotspot = os.path.join(standalone_dir, 'hotspot')
standalone_scripts = os.path.join(standalone_dir, 'scripts')

src_static = os.path.join(cwd, '.next', 'static')
src_public = os.path.join(cwd, 'public')
src_hotspot = os.path.join(cwd, 'hotspot')
src_scripts = os.path.join(cwd, 'scripts')

# 1.1 Copiar arquivos estáticos
if os.path.exists(src_static):
    os.makedirs(os.path.dirname(standalone_static), exist_ok=True)
    if os.path.exists(standalone_static):
        shutil.rmtree(standalone_static)
    shutil.copytree(src_static, standalone_static)
    print("Copiado .next/static para standalone")

# 1.2 Copiar public
if os.path.exists(src_public):
    if os.path.exists(standalone_public):
        shutil.rmtree(standalone_public)
    shutil.copytree(src_public, standalone_public)
    print("Copiado public para standalone")

# 1.3 Copiar templates de hotspot
if os.path.exists(src_hotspot):
    if os.path.exists(standalone_hotspot):
        shutil.rmtree(standalone_hotspot)
    shutil.copytree(src_hotspot, standalone_hotspot, ignore=shutil.ignore_patterns('*.log'))
    print("Copiado hotspot para standalone")

# 1.4 Copiar scripts de inicialização
if os.path.exists(src_scripts):
    if os.path.exists(standalone_scripts):
        shutil.rmtree(standalone_scripts)
    shutil.copytree(src_scripts, standalone_scripts)
    print("Copiado scripts para standalone")

zip_path = os.path.join(cwd, 'update_rpi.zip')
if os.path.exists(zip_path):
    os.remove(zip_path)

print("Compactando pacote de atualização...")
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(standalone_dir):
        # NUNCA incluir arquivos de banco de dados para preservar os dados reais da produção
        for file in files:
            if (
                file.endswith('.db')
                or file.endswith('.db-wal')
                or file.endswith('.db-shm')
                or file.endswith('.log')
            ):
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, standalone_dir)
            zipf.write(full_path, rel_path)

zip_size_mb = os.path.getsize(zip_path) / (1024 * 1024)
print(f"Pacote update_rpi.zip criado com sucesso! Tamanho: {zip_size_mb:.2f} MB")

print("\n--- 2. ENVIANDO PARA O RASPBERRY PI (192.168.88.251) ---")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.88.251', username='hotspot', password='22101844', timeout=15)

sftp = ssh.open_sftp()
remote_zip = '/home/hotspot/update_rpi.zip'
print("Iniciando upload SFTP...")
sftp.put(zip_path, remote_zip)
sftp.close()
print("Upload concluído com sucesso!")

# Remove zip local para não deixar lixo no repositório
if os.path.exists(zip_path):
    os.remove(zip_path)
    print("Arquivo temporário local update_rpi.zip removido.")

print("\n--- 3. EXTRAINDO E REINICIANDO APLICAÇÃO ---")
def run(cmd):
    print(f">>> {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    res = (out + err).strip()
    if res:
        print(res.encode('ascii', errors='replace').decode('ascii'))
    return res

run('unzip -o /home/hotspot/update_rpi.zip -d /home/hotspot/mikrogestor-prod')
run('rm -f /home/hotspot/update_rpi.zip')
run('sudo docker restart mikrogestor-voucher')

print("\nAguardando 8 segundos para inicialização do container...")
time.sleep(8)

print("\n--- 4. STATUS E VERIFICAÇÃO ---")
run('sudo docker ps')
run('sudo docker logs mikrogestor-voucher --tail 25')
run('curl -I http://127.0.0.1:80')
run('curl -s -X POST http://127.0.0.1:80/api/auth/login -H "Content-Type: application/json" -d "{\\"username\\":\\"test\\",\\"password\\":\\"test\\"}"')

ssh.close()
print("\n=== ATUALIZAÇÃO CONCLUÍDA COM SUCESSO NO RASPBERRY PI! ===")
