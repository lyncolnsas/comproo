import sqlite3, paramiko

conn = sqlite3.connect('prisma/dev.db')
cursor = conn.cursor()
cursor.execute('SELECT user, password FROM Router LIMIT 1')
u, p = cursor.fetchone()
conn.close()

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect('192.168.88.1', port=22, username=u, password=p, timeout=5)
    print('SSH MikroTik autenticado!')
    
    # 1. Verifica se já existe binding para o Raspberry Pi
    stdin, stdout, stderr = c.exec_command('/ip hotspot ip-binding print where mac-address="b8:27:eb:29:db:cf"')
    out = stdout.read().decode('utf-8', errors='ignore')
    print('Binding existente:', out.strip())
    
    if 'b8:27:eb:29:db:cf' not in out.lower():
        stdin, stdout, stderr = c.exec_command('/ip hotspot ip-binding add mac-address=b8:27:eb:29:db:cf type=bypassed comment="RaspberryPi"')
        print('Adicionado bypass no Hotspot!')
    else:
        stdin, stdout, stderr = c.exec_command('/ip hotspot ip-binding set [find mac-address="b8:27:eb:29:db:cf"] type=bypassed')
        print('Atualizado para bypassed!')
    c.close()
except Exception as e:
    print('Erro MikroTik:', e)
