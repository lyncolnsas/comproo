import os, zipfile, sys

zip_filename = 'mikrogestor_deploy.zip'
print(f"Compactando projeto para {zip_filename}...")

# Pastas e arquivos a ignorar
ignore_dirs = {'.git', 'node_modules', '.next', '.agent', '.gemini', 'brain', 'scratch'}
ignore_files = {'mikrogestor_deploy.zip'}

with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        # Filtra diretórios
        dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith('.git')]
        for file in files:
            if file in ignore_files or file.endswith('.pyc') or file.endswith('.tmp'):
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, '.')
            zipf.write(file_path, arcname)

size_mb = os.path.getsize(zip_filename) / (1024 * 1024)
print(f"Projeto compactado com sucesso! Tamanho: {size_mb:.2f} MB")
