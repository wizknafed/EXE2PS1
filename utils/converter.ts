export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const b64 = (reader.result as string).split(',')[1];
      resolve(b64);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const generatePowerShellScript = (fileName: string, base64Data: string): string => {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `$f = "${sanitizedName}"
$p = Join-Path $env:TEMP $f
$d = @"
${base64Data}
"@

Write-Host "Extracting $f..." -ForegroundColor Cyan

try {
    $b = [Convert]::FromBase64String($d)
    [IO.File]::WriteAllBytes($p, $b)
    
    Write-Host "Running $f..." -ForegroundColor Green
    $proc = Start-Process -FilePath $p -Wait -PassThru
    
    Write-Host "Done. Exit code: $($proc.ExitCode)" -ForegroundColor Cyan
}
catch {
    Write-Error "Error: $($_.Exception.Message)"
}
finally {
    if (Test-Path $p) {
        Remove-Item -Path $p -Force
    }
}
`;
};

export const formatBytes = (bytes: number, precision = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const p = precision < 0 ? 0 : precision;
  const s = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(p)) + ' ' + s[i];
};