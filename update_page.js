const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'dashboard', 'portal', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Add states
if (!content.includes('const [templates, setTemplates]')) {
  content = content.replace(
    /const \[logoPreviewUrl, setLogoPreviewUrl\] = useState\('\/api\/portal\/logo'\);/,
    `const [logoPreviewUrl, setLogoPreviewUrl] = useState('/api/portal/logo');
  const [selectedTemplate, setSelectedTemplate] = useState('hotspot');
  const [templates, setTemplates] = useState<string[]>(['hotspot']);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);`
  );
}

// 2. Fetch templates & Update loadConfig
if (!content.includes('fetchTemplates')) {
  content = content.replace(
    /const loadConfig = async \(\) => {/,
    `const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/portal/templates');
        const data = await res.json();
        if (data.success && data.templates) {
          setTemplates(data.templates);
        }
      } catch (err) {}
    };

    const loadConfig = async () => {`
  );
  content = content.replace(
    /const res = await fetch\('\/api\/portal\/config'\);/,
    `const res = await fetch(\`/api/portal/config?template=\${selectedTemplate}\`);`
  );
  content = content.replace(
    /loadConfig\(\);\n\s*fetchServerIp\(\);/,
    `fetchTemplates();
    loadConfig();
    fetchServerIp();`
  );
}

// 3. Update useEffect dependencies for selectedTemplate
if (!content.includes('useEffect(() => {\n    if (selectedTemplate)')) {
  content = content.replace(
    /fetchServerIp\(\);\n  }, \[\]\);/,
    `fetchServerIp();
  }, [selectedTemplate]);` // loadConfig is redefined inside useEffect, but since we modify its body, we need to ensure selectedTemplate changes trigger it. Wait, loadConfig is inside useEffect so we can just add selectedTemplate to deps.
  );
}

// 4. Update Deploy
content = content.replace(
  /body: JSON\.stringify\({ ftpPort }\)/g,
  `body: JSON.stringify({ ftpPort, template: selectedTemplate })`
);

// 5. Update Logo URL
content = content.replace(
  /setLogoPreviewUrl\('\/api\/portal\/logo\?t=' \+ Date\.now\(\)\);/g,
  `setLogoPreviewUrl(\`/api/portal/logo?template=\${selectedTemplate}&t=\` + Date.now());`
);

// 6. Update Logo Upload
if (!content.includes(`formData.append('template', selectedTemplate)`)) {
  content = content.replace(
    /formData\.append\('type', 'logo'\);/,
    `formData.append('type', 'logo');\n    formData.append('template', selectedTemplate);`
  );
}

// 7. Add UI for Template Selection
const uiCode = `
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 gap-4">
                    <div className="flex-1 w-full">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Modelo de Hotspot Ativo</label>
                      <select 
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                      >
                        {templates.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <p className="text-xs text-slate-500 mt-1">Este modelo será editado e enviado ao roteador.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1 invisible">Ações</label>
                      <button 
                        onClick={() => document.getElementById('templateZipInput')?.click()}
                        disabled={uploadingTemplate}
                        className="flex items-center gap-2 h-10 px-4 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {uploadingTemplate ? 'Enviando...' : '⬆️ Subir Novo Modelo (.zip)'}
                      </button>
                      <input 
                        type="file" 
                        id="templateZipInput" 
                        accept=".zip" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingTemplate(true);
                          const fd = new FormData();
                          fd.append('file', file);
                          try {
                            const res = await fetch('/api/portal/templates', { method: 'POST', body: fd });
                            const data = await res.json();
                            if (data.success) {
                              alert('Modelo adicionado!');
                              setTemplates(prev => [...prev, data.template]);
                              setSelectedTemplate(data.template);
                            } else {
                              alert('Erro: ' + data.message);
                            }
                          } catch(err) {
                            alert('Falha ao subir arquivo');
                          } finally {
                            setUploadingTemplate(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
`;

if (!content.includes('Modelo de Hotspot Ativo')) {
  content = content.replace(
    /<h3 className="text-lg font-bold text-slate-800 mb-4">Cores da Interface<\/h3>/,
    uiCode + `\n                  <h3 className="text-lg font-bold text-slate-800 mb-4">Cores da Interface</h3>`
  );
}

fs.writeFileSync(pagePath, content);
console.log('Frontend page updated');
