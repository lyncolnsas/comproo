import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.88.253', port=22, username='hotspot', password='22101844')

# Adiciona arm_64bit=1 se nao existir
script = """
echo "22101844" | sudo -S sh -c "echo 'arm_64bit=1' >> /boot/firmware/config.txt"
grep arm_64bit /boot/firmware/config.txt
echo "22101844" | sudo -S reboot
"""

stdin, stdout, stderr = c.exec_command(script)
print(stdout.read().decode('utf-8', errors='ignore'))
print("Comando de reboot com arm_64bit enviado!")
c.close()
