import os
import re
import urllib.request

def download_inter_fonts():
    print("Iniciando download das fontes locais...")
    
    # URL do CSS do Google Fonts para a família Inter
    css_url = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    
    # Headers simulando um navegador moderno para obter arquivos .woff2
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    req = urllib.request.Request(css_url, headers=headers)
    
    try:
        with urllib.request.urlopen(req) as response:
            css_content = response.read().decode('utf-8')
    except Exception as e:
        print(f"Erro ao obter CSS do Google Fonts: {e}")
        return
        
    # Encontrar as URLs das fontes e seus respectivos pesos
    # O CSS retornado é dividido em blocos @font-face
    font_face_blocks = re.findall(r'@font-face\s*\{([^}]+)\}', css_content)
    
    downloaded_files = {}
    
    # Pastas onde queremos salvar as fontes
    target_dirs = [
        os.path.abspath("public/fonts"),
    ]
    
    # Adicionar também todas as pastas de templates em hotspot/
    hotspot_path = os.path.abspath("hotspot")
    if os.path.exists(hotspot_path):
        for item in os.listdir(hotspot_path):
            item_path = os.path.join(hotspot_path, item)
            if os.path.isdir(item_path):
                target_dirs.append(os.path.join(item_path, "fonts"))
                
    # Criar todas as pastas caso não existam
    for d in target_dirs:
        os.makedirs(d, exist_ok=True)
        
    for block in font_face_blocks:
        # Filtrar apenas o subconjunto latin para manter o tamanho mínimo
        if 'unicode-range' in block and 'U+0000-00FF' not in block:
            continue
            
        weight_match = re.search(r'font-weight:\s*(\d+)', block)
        url_match = re.search(r'src:\s*url\((https://[^)]+\.woff2)\)', block)
        
        if weight_match and url_match:
            weight = weight_match.group(1)
            url = url_match.group(1)
            
            # Mapear os pesos para nomes amigáveis
            weight_names = {
                '400': 'Inter-Regular.woff2',
                '500': 'Inter-Medium.woff2',
                '600': 'Inter-SemiBold.woff2',
                '700': 'Inter-Bold.woff2'
            }
            
            filename = weight_names.get(weight)
            if not filename or filename in downloaded_files:
                continue
                
            print(f"Baixando Inter peso {weight} de {url}...")
            
            try:
                # Baixar o arquivo binário da fonte
                font_req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(font_req) as font_response:
                    font_data = font_response.read()
                    
                # Salvar em todos os diretórios de destino
                for target_dir in target_dirs:
                    dest_path = os.path.join(target_dir, filename)
                    with open(dest_path, 'wb') as f:
                        f.write(font_data)
                        
                downloaded_files[filename] = True
                print(f"Salvo {filename} com sucesso em {len(target_dirs)} pastas.")
            except Exception as e:
                print(f"Erro ao baixar a fonte {filename}: {e}")

    # Escrever o arquivo CSS local
    css_content_local = """/* Declaração de fontes locais para rodar totalmente offline no MikroTik */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('fonts/Inter-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('fonts/Inter-Medium.woff2') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('fonts/Inter-SemiBold.woff2') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('fonts/Inter-Bold.woff2') format('woff2');
}
"""
    # Salvar o CSS local em public/fonts/fonts.css e em cada template
    with open(os.path.join(os.path.abspath("public/fonts"), "fonts.css"), "w", encoding="utf-8") as f:
        f.write(css_content_local)
        
    for item in os.listdir(hotspot_path):
        item_path = os.path.join(hotspot_path, item)
        if os.path.isdir(item_path):
            with open(os.path.join(item_path, "fonts/fonts.css"), "w", encoding="utf-8") as f:
                # Nos templates de hotspot, a URL das fontes é relativa à pasta do hotspot, 
                # e como fonts.css já está dentro de fonts/, a URL é relativa a ele (ou seja, src: url('Inter-Regular.woff2') ou url('fonts/...'))
                # Como o link no login.html aponta para "fonts/fonts.css", a pasta relativa ao login.html é "fonts/", 
                # então src no CSS deve ser url('Inter-Regular.woff2') ou url('fonts/Inter-Regular.woff2') dependendo do caminho.
                # Se fonts.css está em hotspot/<template>/fonts/fonts.css, e é referenciado em login.html como <link href="fonts/fonts.css">,
                # o browser resolve caminhos de arquivos de fonte em relação a fonts.css, ou seja, url('Inter-Regular.woff2')!
                css_for_template = css_content_local.replace("url('fonts/", "url('")
                f.write(css_for_template)
                
    print("Processo de download e escrita de CSS locais concluído com sucesso!")

if __name__ == "__main__":
    download_inter_fonts()
