import os
import re

dashboard_dir = r"c:\Users\lyncoln.silva\OneDrive - Adventistas\Documentos\Projetos-\Mikhmon\mikhmon\mikrogestor-voucher\src\app\dashboard"
ignore_folders = ["node_modules", ".next", ".git"]

issues = []

def audit_file(filepath):
    rel_path = os.path.relpath(filepath, dashboard_dir)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        lines = content.splitlines()

    # 1. Check for <table> tags and see if there is an enclosing overflow-x-auto
    table_indices = [i for i, line in enumerate(lines) if "<table" in line]
    for idx in table_indices:
        # Search surrounding lines (approx 5 lines before) for overflow-x-auto
        start_search = max(0, idx - 6)
        context = "\n".join(lines[start_search:idx+1])
        if "overflow-x-auto" not in context and "overflow-x-scroll" not in context:
            issues.append({
                "file": rel_path,
                "line": idx + 1,
                "type": "Tabela sem overflow responsivo",
                "snippet": lines[idx].strip(),
                "reason": "Tabelas grandes sem wrapper 'overflow-x-auto' quebram o layout em celulares."
            })

    # 2. Check for grid-cols-[2-9] without responsive prefixes
    grid_matches = re.finditer(r'grid-cols-([2-9])', content)
    for match in grid_matches:
        start_char = match.start()
        # Find line number
        line_num = content[:start_char].count('\n') + 1
        line_content = lines[line_num - 1]
        
        # Check if the grid-cols has a prefix like md:, lg:, sm:
        prefix_pattern = r'(sm:|md:|lg:|xl:)\s*grid-cols-'
        has_prefix = False
        # search within the line or nearby text
        if re.search(r'(sm:|md:|lg:|xl:|2xl:)grid-cols-' + match.group(1), line_content):
            has_prefix = True
            
        if not has_prefix and "grid-cols-1" not in line_content:
            issues.append({
                "file": rel_path,
                "line": line_num,
                "type": "Grid sem prefixo responsivo",
                "snippet": line_content.strip(),
                "reason": f"Usa '{match.group(0)}' diretamente. Deve começar com 'grid-cols-1' no mobile e aplicar colunas adicionais com prefixo (ex: 'md:{match.group(0)}')."
            })

    # 3. Check for w-[number px] where number > 350
    width_matches = re.finditer(r'w-\[(\d+)px\]', content)
    for match in width_matches:
        width_val = int(match.group(1))
        if width_val > 350:
            line_num = content[:match.start()].count('\n') + 1
            issues.append({
                "file": rel_path,
                "line": line_num,
                "type": "Largura fixa larga",
                "snippet": lines[line_num - 1].strip(),
                "reason": f"Usa largura fixa de {width_val}px, o que causará transbordamento em telas móveis. Use max-w ou porcentagens/flex-1."
            })

    # 4. Check for flex without flex-col on mobile or flex-wrap if it has items that might overflow
    # (Checking basic items like buttons or long lists in rows)
    # Simple check for flex-row that might be better as flex-col on mobile
    flex_row_matches = re.finditer(r'\bflex-row\b', content)
    for match in flex_row_matches:
        line_num = content[:match.start()].count('\n') + 1
        line_content = lines[line_num - 1]
        if "sm:flex-col" not in line_content and "md:flex-col" not in line_content and "sm:flex-row" not in line_content and "md:flex-row" not in line_content:
            # It's flex-row on mobile as well. Let's see if it's layout header or action buttons
            if any(k in line_content for k in ["gap-", "justify-between"]) and not "flex-wrap" in line_content:
                issues.append({
                    "file": rel_path,
                    "line": line_num,
                    "type": "Flex row sem colapso mobile",
                    "snippet": line_content.strip(),
                    "reason": "Usa 'flex-row' no mobile sem 'flex-wrap' ou sem reverter para 'flex-col'. Pode causar aperto de botões/texto."
                })

print(f"=== AUDITANDO RESPONSIVIDADE EM: {dashboard_dir} ===")
for root, dirs, files in os.walk(dashboard_dir):
    dirs[:] = [d for d in dirs if d not in ignore_folders]
    for file in files:
        if file.endswith(".tsx"):
            audit_file(os.path.join(root, file))

print(f"\nTotal de problemas em potencial encontrados: {len(issues)}")
for i, issue in enumerate(issues, 1):
    print(f"\n[{i}] Arquivo: {issue['file']} (Linha {issue['line']})")
    print(f"    Tipo: {issue['type']}")
    print(f"    Snippet: {issue['snippet']}")
    print(f"    Motivo: {issue['reason']}")
