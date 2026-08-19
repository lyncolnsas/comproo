const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando configuração do banco de dados...');
  
  // Verifica se já existe algum usuário
  const userCount = await prisma.user.count();
  
  if (userCount === 0) {
    console.log('Nenhum usuário encontrado. Criando usuário administrador padrão...');
    await prisma.user.create({
      data: {
        username: 'admin',
        password: '123',
        name: 'Administrador',
        role: 'ADMIN'
      }
    });
    console.log('Usuário criado com sucesso!');
    console.log('Login: admin');
    console.log('Senha: 123');
  } else {
    console.log('O banco de dados já possui usuários. Nenhuma ação necessária.');
  }
}

main()
  .catch((e) => {
    console.error('Erro ao configurar banco de dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
