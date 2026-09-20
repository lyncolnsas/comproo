const fs = require('fs');

const file = 'src/app/dashboard/portal/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update interface
content = content.replace(
  /blue: string; \/\/ Login button\n\s*green: string; \/\/ Register button/g,
  "blue: string; // Login button\n  green: string; // Register button\n  trialButtonBg?: string; // Cor de fundo do botão de acesso teste\n  trialButtonText?: string; // Cor do texto do botão de acesso teste"
);

// 2. Update useState<Colors>
content = content.replace(
  /blue: '#2563eb',\n\s*green: '#10b981'/g,
  "blue: '#2563eb',\n    green: '#10b981',\n    trialButtonBg: '#1E90FF',\n    trialButtonText: '#FFFFFF'"
);

// 3. Inject Color Pickers
const pickerHtml = `
                      {/* Cor Botão Acesso Teste */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Fundo Botão Acesso Teste</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer shrink-0"
                            value={colors.trialButtonBg || '#1E90FF'}
                            onChange={(e) => handleColorChange('trialButtonBg', e.target.value)}
                          />
                          <input 
                            type="text" 
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            value={colors.trialButtonBg || '#1E90FF'}
                            onChange={(e) => handleColorChange('trialButtonBg', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Cor Texto Botão Acesso Teste */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Texto Botão Acesso Teste</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer shrink-0"
                            value={colors.trialButtonText || '#FFFFFF'}
                            onChange={(e) => handleColorChange('trialButtonText', e.target.value)}
                          />
                          <input 
                            type="text" 
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            value={colors.trialButtonText || '#FFFFFF'}
                            onChange={(e) => handleColorChange('trialButtonText', e.target.value)}
                          />
                        </div>
                      </div>
`;
content = content.replace(
  /{colors\.green}<\/span>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>/g,
  "{colors.green}</span>\n                        </div>\n                      </div>\n" + pickerHtml + "\n                    </div>\n                  </div>"
);

// 4. Update the Trial Link Preview (button)
const oldPreview = `{/* Trial Link Preview */}
                      {trialEnabled && (
                        <div className="mt-4 text-center">
                          <span className="text-[10px]" style={{ color: colors.muted }}>
                            {trialText}{' '}
                            <span style={{ color: colors.brand, cursor: 'pointer', textDecoration: 'underline' }}>
                              {trialLinkText}
                            </span>
                          </span>
                        </div>
                      )}`;

const newPreview = `{/* Trial Button Preview */}
                      {trialEnabled && (
                        <div className="mt-4 flex flex-col items-center gap-2 w-full">
                          <div className="text-[13px] text-center" style={{ color: colors.muted }}>
                            {trialText}
                          </div>
                          <button
                            type="button"
                            className="w-full h-10 rounded-xl font-bold text-xs flex items-center justify-center shadow-sm transition-opacity hover:opacity-90 font-sans"
                            style={{ 
                              backgroundColor: colors.trialButtonBg || '#1E90FF', 
                              color: colors.trialButtonText || '#FFFFFF',
                              cursor: 'pointer'
                            }}
                          >
                            {trialLinkText}
                          </button>
                        </div>
                      )}`;

content = content.replace(oldPreview, newPreview);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Trial Button Settings safely.');
