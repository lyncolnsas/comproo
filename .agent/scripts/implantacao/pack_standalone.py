import os, zipfile, sys

zip_filename = 'mikrogestor_standalone.zip'
print(f"Compactando standalone build para {zip_filename}...")

base_standalone = os.path.join('.next', 'standalone')

with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    # 1. Adiciona todo o conteúdo de .next/standalone
    for root, dirs, files in os.walk(base_standalone):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, base_standalone)
            zipf.write(file_path, arcname)
            
    # 2. Adiciona a pasta public
    if os.path.exists('public'):
        for root, dirs, files in os.walk('public'):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.join('public', os.path.relpath(file_path, 'public'))
                zipf.write(file_path, arcname)

    # 3. Adiciona .next/static para .next/static
    static_dir = os.path.join('.next', 'static')
    if os.path.exists(static_dir):
        for root, dirs, files in os.walk(static_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.join('.next', 'static', os.path.relpath(file_path, static_dir))
                zipf.write(file_path, arcname)

    # 4. Adiciona prisma/dev.db e prisma/schema.prisma
    if os.path.exists('prisma'):
        for root, dirs, files in os.walk('prisma'):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.join('prisma', os.path.relpath(file_path, 'prisma'))
                zipf.write(file_path, arcname)

    # 5. Adiciona scripts/init-db.js e .env
    if os.path.exists('scripts'):
        for root, dirs, files in os.walk('scripts'):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.join('scripts', os.path.relpath(file_path, 'scripts'))
                zipf.write(file_path, arcname)
                
    if os.path.exists('.env'):
        zipf.write('.env', '.env')

size_mb = os.path.getsize(zip_filename) / (1024 * 1024)
print(f"Pacote standalone criado com sucesso! Tamanho: {size_mb:.2f} MB")
