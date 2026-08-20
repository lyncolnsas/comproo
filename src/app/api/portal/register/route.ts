import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MikrotikAPI } from '@/lib/routeros';
import { whatsappService } from '@/services/whatsapp';
import fs from 'fs';
import path from 'path';
import { resolveTemplateDir } from '@/lib/portal-template-utils';

interface PortalConfig {
  enabled?: boolean;
  fields?: Record<string, boolean | string>;
  profile?: string;
  redirectUrl?: string;
}

function logEvent(type: string, data: any) {
  try {
    const logPath = path.join(process.cwd(), 'hotspot', 'error.log');
    const logMessage = `[${new Date().toISOString()}] [${type}] ${typeof data === 'string' ? data : JSON.stringify(data)}\n`;
    fs.appendFileSync(logPath, logMessage, 'utf8');
  } catch (err) {
    console.error('Failed to log event', err);
  }
}

function createResponse(
  data: { success: boolean; message: string; data?: any; config?: any },
  isForm: boolean,
  statusCode: number = 200,
  userAgent: string = '',
  linkOrig: string = ''
) {
  if (!isForm) {
    return NextResponse.json(data, { status: statusCode });
  }

  if (data.success) {
    const finalDst = data.config?.redirectUrl || data.data?.redirectUrl || '';
    const targetLoginUrl = data.data?.linkLoginOnly || 'http://192.168.88.1/login';
    const username = data.data?.username || '';
    const passwordStr = data.data?.password || '';

    // Detect Apple device (CNA or User-Agent)
    const isApple = 
      /iPhone|iPad|iPod|Macintosh/i.test(userAgent) || 
      linkOrig.includes('apple.com') || 
      linkOrig.includes('captive.apple.com');

    if (isApple) {
      let redirectUrl = targetLoginUrl;
      const urlParams = new URLSearchParams();
      urlParams.append('username', username);
      urlParams.append('password', passwordStr);
      if (finalDst) {
        urlParams.append('dst', finalDst);
      }
      
      if (redirectUrl.includes('?')) {
        redirectUrl = `${redirectUrl}&${urlParams.toString()}`;
      } else {
        redirectUrl = `${redirectUrl}?${urlParams.toString()}`;
      }

      logEvent('APPLE_CNA_REDIRECT', { redirectUrl, userAgent, linkOrig });
      return NextResponse.redirect(redirectUrl, 302);
    }

    const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Conectando...</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #0b1220;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }
          .card {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 16px;
            text-align: center;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          }
          h2 { color: #006eff; margin-top: 0; }
          p { color: #94a3b8; font-size: 14px; }
          .spinner {
            border: 4px solid rgba(255,255,255,0.1);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border-left-color: #006eff;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Cadastro Concluído!</h2>
          <div class="spinner"></div>
          <p>Conectando você à internet, por favor aguarde...</p>
        </div>
        
        <form name="login" action="${targetLoginUrl}" method="POST" style="display:none;">
          <input type="hidden" name="username" value="${username}" />
          <input type="hidden" name="password" value="${passwordStr}" />
          <input type="hidden" name="dst" value="${finalDst}" />
        </form>
        
        <script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              document.login.submit();
            }, 800);
          });
        </script>
      </body>
      </html>
    `;
    return new NextResponse(htmlResponse, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } else {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Erro no Cadastro</title>
        <style>
          body { font-family: -apple-system, sans-serif; background: #0b1220; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 16px; text-align: center; max-width: 400px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
          h2 { color: #ef4444; margin-top: 0; }
          p { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
          .btn { background: #006eff; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; cursor: pointer; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Falha ao Cadastrar</h2>
          <p>${data.message}</p>
          <a href="javascript:history.back()" class="btn">Voltar e Tentar Novamente</a>
        </div>
      </body>
      </html>
    `;
    return new NextResponse(errorHtml, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: statusCode
    });
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  const isForm = contentType.includes('application/x-www-form-urlencoded');

  try {
    // 1. Parse request body first
    let body: any = {};
    if (isForm) {
      try {
        const formData = await request.formData();
        formData.forEach((value, key) => {
          body[key] = value;
        });
        logEvent('START_REGISTRATION_FORM', { ...body, password: body.password ? '***' : null });
      } catch (formErr: any) {
        logEvent('MALFORMED_FORM', formErr?.message || formErr);
        return createResponse({ success: false, message: 'Dados de formulário inválidos.' }, isForm, 400);
      }
    } else {
      try {
        body = await request.json();
        logEvent('START_REGISTRATION_JSON', { ...body, password: body.password ? '***' : null });
      } catch (jsonErr: any) {
        logEvent('MALFORMED_JSON', jsonErr?.message || jsonErr);
        return createResponse({ success: false, message: 'JSON inválido.' }, isForm, 400);
      }
    }

    // 2. Determine template to load configuration from
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get('preview') === '1' || body.preview === '1' || body.preview === true;
    let template = searchParams.get('template') || body.template || '';

    if (!template) {
      try {
        const configRecord = await prisma.systemConfig.findUnique({
          where: { key: 'LAST_DEPLOYED_TEMPLATE' }
        });
        if (configRecord) {
          template = configRecord.value;
        }
      } catch (dbErr) {
        console.warn('Failed to fetch LAST_DEPLOYED_TEMPLATE in register API route:', dbErr);
      }
    }

    if (!template) {
      template = 'default';
    }

    const templateDir = resolveTemplateDir(template);
    let configPath = path.join(templateDir, 'config.json');

    // Fallback chain for config file path
    if (!fs.existsSync(configPath)) {
      configPath = path.join(process.cwd(), 'hotspot', 'default', 'config.json');
    }
    if (!fs.existsSync(configPath)) {
      configPath = path.join(process.cwd(), 'hotspot', 'config.json');
    }

    // 3. Read dynamic forms configuration
    let config: PortalConfig | null = null;
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (e) {
        console.error(`Failed to parse ${configPath} in register route`, e);
      }
    }

    const enabled = config?.enabled !== undefined ? config.enabled : true;
    if (!enabled) {
      logEvent('DISABLED', `Registration is disabled for template ${template}`);
      return createResponse({ success: false, message: 'O cadastro de clientes está desativado.' }, isForm, 400);
    }

    const fields = {
      nameEnabled: true,
      nameRequired: true,
      phoneEnabled: true,
      phoneRequired: true,
      birthDateEnabled: true,
      birthDateRequired: true,
      emailEnabled: true,
      emailRequired: false,
      cpfEnabled: true,
      cpfRequired: true,
      genderEnabled: true,
      genderRequired: true,
      passwordEnabled: true,
      passwordRequired: true,
      customFieldEnabled: false,
      customFieldLabel: 'Descreva aqui!',
      customFieldRequired: false,
      ...config?.fields
    };

    let { name, phone, username, birthDate, email, cpf, gender, password, customFieldValue, optInCourses } = body;
    
    // Parse optInCourses to boolean
    const isOptedIn = typeof optInCourses === 'boolean' ? optInCourses : (optInCourses === 'true' || optInCourses === 'on' || optInCourses === '1' || optInCourses === true);

    // Captive portal metadata parameters from hidden inputs or URL parameters
    const linkLoginOnly = body['link-login-only'] || '';
    const linkOrig = body['link-orig'] || '';

    // Reconstruct fields if they were posted separately via native HTML form
    const ddd = body['ddd'] || '';
    const celular = body['celular'] || '';
    if (!phone && ddd && celular) {
      phone = `${ddd.trim()}${celular.replace(/\D/g, '').trim()}`;
    }

    const birthYear = body['birthYear'] || '';
    const birthMonth = body['birthMonth'] || '';
    const birthDay = body['birthDay'] || '';
    if (!birthDate && birthYear && birthMonth && birthDay) {
      const mm = birthMonth.length < 2 ? `0${birthMonth}` : birthMonth;
      const ddVal = birthDay.length < 2 ? `0${birthDay}` : birthDay;
      birthDate = `${birthYear}-${mm}-${ddVal}`;
    }

    // 2. Validate fields dynamically
    if (fields.nameEnabled && fields.nameRequired && !name) {
      logEvent('VALIDATION_FAILED', 'Nome Completo é obrigatório.');
      return createResponse({ success: false, message: 'Nome Completo é obrigatório.' }, isForm, 400);
    }
    if (fields.phoneEnabled && !phone) {
      logEvent('VALIDATION_FAILED', 'Telefone/WhatsApp é obrigatório.');
      return createResponse({ success: false, message: 'Telefone/WhatsApp é obrigatório.' }, isForm, 400);
    }
    if (fields.emailEnabled && fields.emailRequired && !email) {
      logEvent('VALIDATION_FAILED', 'E-mail é obrigatório.');
      return createResponse({ success: false, message: 'E-mail é obrigatório.' }, isForm, 400);
    }
    if (fields.birthDateEnabled && fields.birthDateRequired && !birthDate) {
      logEvent('VALIDATION_FAILED', 'Data de nascimento é obrigatória.');
      return createResponse({ success: false, message: 'Data de nascimento é obrigatória.' }, isForm, 400);
    }
    if (fields.cpfEnabled && fields.cpfRequired && !cpf) {
      logEvent('VALIDATION_FAILED', 'CPF é obrigatório.');
      return createResponse({ success: false, message: 'CPF é obrigatório.' }, isForm, 400);
    }
    if (fields.genderEnabled && fields.genderRequired && !gender) {
      logEvent('VALIDATION_FAILED', 'Gênero é obrigatório.');
      return createResponse({ success: false, message: 'Gênero é obrigatório.' }, isForm, 400);
    }
    if (!password || !password.trim()) {
      logEvent('VALIDATION_FAILED', 'Senha é obrigatória.');
      return createResponse({ success: false, message: 'Senha é obrigatória.' }, isForm, 400);
    }
    if (fields.customFieldEnabled && fields.customFieldRequired && !customFieldValue) {
      logEvent('VALIDATION_FAILED', `${fields.customFieldLabel} é obrigatório.`);
      return createResponse({ success: false, message: `${fields.customFieldLabel} é obrigatório.` }, isForm, 400);
    }

    // 3. Format/Validate inputs
    if (!username || !username.trim()) {
      logEvent('VALIDATION_FAILED', 'Nome de usuário é obrigatório.');
      return createResponse({ success: false, message: 'Nome de usuário é obrigatório.' }, isForm, 400);
    }
    const hotspotUser = username.trim().toLowerCase();

    let rawPhone = '';
    if (fields.phoneEnabled) {
      rawPhone = phone ? phone.replace(/\D/g, '') : '';
      if (fields.phoneRequired && (!rawPhone || rawPhone.length < 10 || rawPhone.length > 11)) {
        logEvent('VALIDATION_FAILED', 'Telefone/WhatsApp inválido (com DDD).');
        return createResponse({ success: false, message: 'Telefone/WhatsApp inválido (com DDD).' }, isForm, 400);
      }
    }

    let rawCpf = null;
    if (fields.cpfEnabled && cpf) {
      rawCpf = cpf.replace(/\D/g, '');
      if (fields.cpfRequired && rawCpf.length !== 11) {
        logEvent('VALIDATION_FAILED', 'CPF deve conter exatamente 11 dígitos.');
        return createResponse({ success: false, message: 'CPF deve conter exatamente 11 dígitos.' }, isForm, 400);
      }
    }

    let parsedBirthDate: Date | null = null;
    if (birthDate && typeof birthDate === 'string' && birthDate.length >= 8) {
      parsedBirthDate = new Date(birthDate);
      if (isNaN(parsedBirthDate.getTime())) {
        parsedBirthDate = null;
      }
    }

    if (!parsedBirthDate && fields.birthDateEnabled && fields.birthDateRequired) {
      logEvent('VALIDATION_FAILED', 'Data de nascimento inválida ou não preenchida.');
      return createResponse({ success: false, message: 'Data de nascimento inválida ou não preenchida.' }, isForm, 400);
    }

    const finalName = name || 'Auto-Cadastrado';

    const passwordStr = password.trim();

    // 4. Save lead in Database
    let lead;
    try {
      lead = await prisma.hotspotLead.upsert({
        where: { hotspotUser },
        update: {
          name: finalName,
          phone: rawPhone || null,
          birthDate: parsedBirthDate,
          email: email || null,
          cpf: rawCpf,
          gender: gender || null,
          password: passwordStr,
          customFieldValue: customFieldValue || null,
          optInCourses: isOptedIn
        },
        create: {
          name: finalName,
          phone: rawPhone || null,
          birthDate: parsedBirthDate,
          email: email || null,
          cpf: rawCpf,
          gender: gender || null,
          password: passwordStr,
          customFieldValue: customFieldValue || null,
          optInCourses: isOptedIn,
          hotspotUser
        }
      });
      logEvent('DB_SAVE_SUCCESS', { leadId: lead.id, hotspotUser });
    } catch (dbErr: any) {
      logEvent('DATABASE_ERROR', { error: dbErr?.message || dbErr });
      console.error('Database Error:', dbErr);
      return createResponse({ success: false, message: 'Erro ao salvar o cadastro localmente.' }, isForm, 500);
    }

    // 5. Connect to MikroTik and create the user
    let mk;
    try {
      if (isPreview) {
        logEvent('MIKROTIK_BYPASS_PREVIEW', { hotspotUser });
        // Simular um atraso pequeno de rede para dar sensação de processamento
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        const activeRouter = await prisma.router.findFirst({ where: { active: true } });
        if (!activeRouter) {
          throw new Error('Nenhum roteador ativo encontrado no banco de dados.');
        }

        logEvent('MIKROTIK_CONNECT_START', { host: activeRouter.host, port: activeRouter.port, user: activeRouter.user });

        mk = new MikrotikAPI();
        const connected = await mk.connect(activeRouter.host, activeRouter.user, activeRouter.password, activeRouter.port);
        
        if (!connected) {
          throw new Error(`Falha ao conectar no MikroTik em ${activeRouter.host}:${activeRouter.port || 8728}`);
        }
        
        // Try to remove user if they already exist to avoid MikroTik errors
        try {
          const existingUsers = (await mk.getHotspotUsers()) as Record<string, unknown>[];
          const found = existingUsers.find(u => String(u['name']) === String(hotspotUser));
          const foundId = (found?.['id'] || found?.['.id']) as string | undefined;
          if (foundId) {
            logEvent('MIKROTIK_USER_EXISTS', { username: hotspotUser, id: foundId });
            await mk.removeHotspotUser(foundId);
            logEvent('MIKROTIK_USER_REMOVED', { username: hotspotUser });
          }
        } catch (e: any) {
          logEvent('MIKROTIK_CLEANUP_WARN', e?.message || e);
        }

        // Build a rich comment with all user information
        const commentParts = ['AutoCadastro'];
        if (name) commentParts.push(`Nome: ${name}`);
        if (email) commentParts.push(`Email: ${email}`);
        if (birthDate) commentParts.push(`Nasc: ${birthDate}`);
        if (rawCpf) commentParts.push(`CPF: ${rawCpf}`);
        if (gender) commentParts.push(`Gen: ${gender}`);
        if (customFieldValue) commentParts.push(`Resp: ${customFieldValue}`);
        
        const finalComment = commentParts.join(' | ').substring(0, 250);

        // Add user to MikroTik Hotspot with 15m limit-uptime
        const profileName = config?.profile || 'default';
        const addResult = await mk.addHotspotUser({
          name: hotspotUser,
          password: passwordStr,
          profile: profileName,
          comment: finalComment,
          server: 'all',
          'limit-uptime': '00:15:00'
        });

        logEvent('MIKROTIK_USER_CREATED', { username: hotspotUser, result: addResult });

        mk.disconnect();
      }

    } catch (mkErr: any) {
      if (mk) mk.disconnect();
      logEvent('MIKROTIK_ERROR', { error: mkErr?.message || mkErr });
      console.error('MikroTik Error:', mkErr);
      return createResponse({ 
        success: false, 
        message: 'Cadastro local efetuado, mas erro ao integrar com o Roteador. Tente novamente.' 
      }, isForm, 500);
    }

    logEvent('SUCCESS', { username: hotspotUser });

    // Send WhatsApp Welcome Message (only if opted in)
    if (lead?.phone && lead.optInCourses !== false) {
       const hostHeader = request.headers.get('host') || '192.168.88.254';
       const welcomeMsg = `Olá, ${finalName}! Seu cadastro na nossa rede Wi-Fi foi concluído.\n\nVocê ganhou *15 minutos de acesso gratuito*! 🥳\n\nPara escolher seu plano e continuar conectado após esse período, acesse: http://${hostHeader}/portal/planos`;
       
       // Fire and forget so we don't block the HTTP response
       whatsappService.sendWhatsAppMessage('admin', lead.phone, welcomeMsg).catch(e => console.error('Erro ao enviar WA', e));
    }

    const finalDst = config?.redirectUrl || linkOrig || 'https://www.google.com';
    
    // Obter host dinamicamente para construir a URL absoluta do safari-bypass
    const hostHeader = request.headers.get('host') || '192.168.88.254';
    const protocol = 'http'; // Forçar HTTP para evitar erros de HTTPS não configurado no roteador
    const bypassUrl = `${protocol}://${hostHeader}/api/portal/safari-bypass?url=${encodeURIComponent(finalDst)}`;

    const userAgent = request.headers.get('user-agent') || '';
    return createResponse({ 
      success: true, 
      message: 'Cadastro realizado com sucesso!',
      data: {
        username: hotspotUser,
        password: passwordStr,
        linkLoginOnly,
        redirectUrl: bypassUrl
      },
      config
    }, isForm, 200, userAgent, linkOrig);

  } catch (error: any) {
    console.error('Unhandled Registration Error:', error);
    try {
      const logMessage = `[${new Date().toISOString()}] Unhandled Registration Error: ${error?.message || error}\nStack: ${error?.stack || ''}\n\n`;
      fs.appendFileSync(path.join(process.cwd(), 'hotspot', 'error.log'), logMessage, 'utf8');
    } catch (logErr) {
      console.error('Failed to write to error.log', logErr);
    }
    return createResponse({ success: false, message: 'Erro interno no servidor.' }, isForm, 500);
  }
}
