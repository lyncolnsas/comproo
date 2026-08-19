const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/dashboard/portal/page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Normalize line endings to find indices
const isCRLF = content.includes('\r\n');
const normalized = content.replace(/\r\n/g, '\n');

const startMarker = 'PORTAL_TEMPLATE_EDITOR';
const endMarker = '{/* TAB: CSS PRO LIVE */}';

const startIndex = normalized.indexOf(startMarker);
const endIndex = normalized.indexOf(endMarker);

console.log({ startIndex, endIndex });

const tabSwitcherAndStudio = `PORTAL_TEMPLATE_EDITOR</span>
              <div className="ml-auto rack-screw" />
            </div>
            
            {/* Tabs Selector */}
            <div className="flex flex-wrap gap-2 p-3 bg-[#0a0a18]/20 border-b border-[#0a0a18] overflow-x-auto">
              <button 
                onClick={() => { setActiveTab('studio'); setPreviewScreen('login'); }}
                type="button"
                className={\`retro-btn text-xs py-1.5 px-3 \${
                  activeTab === 'studio' ? 'retro-btn-primary' : 'retro-btn-dark'
                }\`}
              >
                🎨 Studio Inspector (Figma UI)
              </button>

              <button 
                onClick={() => { setActiveTab('fields'); setPreviewScreen('register'); }}
                type="button"
                className={\`retro-btn text-xs py-1.5 px-3 \${
                  activeTab === 'fields' ? 'retro-btn-primary' : 'retro-btn-dark'
                }\`}
              >
                📋 Form de Cadastro
              </button>

              <button 
                onClick={() => { setActiveTab('ad'); setPreviewScreen('login'); }}
                type="button"
                className={\`retro-btn text-xs py-1.5 px-3 \${
                  activeTab === 'ad' ? 'retro-btn-primary' : 'retro-btn-dark'
                }\`}
              >
                📢 Publicidade & Mídia
              </button>

              <button 
                onClick={() => { setActiveTab('logo'); setPreviewScreen('login'); }}
                type="button"
                className={\`retro-btn text-xs py-1.5 px-3 \${
                  activeTab === 'logo' ? 'retro-btn-primary' : 'retro-btn-dark'
                }\`}
              >
                👤 Logo do Hotspot
              </button>

              <button 
                onClick={() => { setActiveTab('custom'); setPreviewScreen('login'); }}
                type="button"
                className={\`retro-btn text-xs py-1.5 px-3 \${
                  activeTab === 'custom' ? 'retro-btn-primary' : 'retro-btn-dark'
                }\`}
              >
                💻 CSS Pro
              </button>

              <button 
                onClick={() => { setActiveTab('ftp'); setPreviewScreen('login'); }}
                type="button"
                className={\`retro-btn text-xs py-1.5 px-3 \${
                  activeTab === 'ftp' ? 'retro-btn-primary' : 'retro-btn-dark'
                }\`}
              >
                ⚡ Deploy (FTP)
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 flex-1 min-h-[460px]">
              
              {/* TAB: STUDIO INSPECTOR */}
              {activeTab === 'studio' && (
                <div className="space-y-6 animate-fade-in">
                  <StudioInspector
                    template={template}
                    setTemplate={setTemplate}
                    businessName={businessName}
                    setBusinessName={setBusinessName}
                    message={message}
                    setMessage={setMessage}
                    colors={colors}
                    setColors={setColors}
                    effects={effects}
                    setEffects={setEffects}
                    studio={studio}
                    setStudio={setStudio}
                    social={social}
                    setSocial={setSocial}
                    badges={badges}
                    setBadges={setBadges}
                    bg={bg}
                    setBg={setBg}
                    handleBgUpload={handleBgUpload}
                    bgUploadLoading={bgUploadLoading}
                    COLOR_PRESETS={COLOR_PRESETS}
                    NICHE_EFFECTS={NICHE_EFFECTS}
                  />
                </div>
              )}

              `;

let newNormalized = normalized.substring(0, startIndex) + tabSwitcherAndStudio + normalized.substring(endIndex);
if (isCRLF) {
  newNormalized = newNormalized.replace(/\n/g, '\r\n');
}
fs.writeFileSync(targetFile, newNormalized, 'utf8');
console.log('Updated portal page successfully!');
