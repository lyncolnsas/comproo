const fs = require('fs');

const file = 'src/app/dashboard/portal/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const \[provReconnectStatus, setProvReconnectStatus\] = useState\(''\);/g, 'const [provReconnectStatus, setProvReconnectStatus] = useState<React.ReactNode>(\'\');');
content = content.replace(/const \[provFixApiRuleMsg, setProvFixApiRuleMsg\] = useState\(''\);/g, 'const [provFixApiRuleMsg, setProvFixApiRuleMsg] = useState<React.ReactNode>(\'\');');
content = content.replace(/const \[provReconnectStatus, setProvReconnectStatus\] = useState<string>\(''\);/g, 'const [provReconnectStatus, setProvReconnectStatus] = useState<React.ReactNode>(\'\');');
content = content.replace(/const \[provFixApiRuleMsg, setProvFixApiRuleMsg\] = useState<string>\(''\);/g, 'const [provFixApiRuleMsg, setProvFixApiRuleMsg] = useState<React.ReactNode>(\'\');');

// Also fix the import Globe
if (!content.includes('Globe')) {
  content = content.replace('import { Zap, Paintbrush', 'import { Globe, Zap, Paintbrush');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed TS errors in page.tsx');
