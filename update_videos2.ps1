$pattern = '(?s)function initAdTimerSetup\(\)\s*\{\s*startAdTimer\(10\);\s*\}'
$newStr = @"
      let _adTimerStarted = false;
      function initAdTimerSetup() {
        const video = document.querySelector('#adModal video');
        if (video) {
          if (video.duration) {
            _adTimerStarted = true;
            startAdTimer(Math.ceil(video.duration));
          } else {
            video.addEventListener('loadedmetadata', function() {
              if (!_adTimerStarted) {
                _adTimerStarted = true;
                startAdTimer(Math.ceil(video.duration));
              }
            });
            setTimeout(function() {
              if (!_adTimerStarted) {
                _adTimerStarted = true;
                startAdTimer(10);
              }
            }, 3000);
          }
        } else {
          _adTimerStarted = true;
          startAdTimer(10);
        }
      }
"@

$files = Get-ChildItem -Path "c:\Users\lyncoln.silva\OneDrive - Adventistas\Documentos\Projetos-\Mikhmon\mikhmon\mikrogestor-voucher" -Recurse -Filter "login.html"
$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match $pattern) {
        $content = $content -replace $pattern, $newStr
        Set-Content -Path $file.FullName -Value $content
        $count++
    }
}
Write-Host "Updated $count files."
