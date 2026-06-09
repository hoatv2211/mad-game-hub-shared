[CmdletBinding()]
param(
  [string]$Root,
  [ValidateSet('ScreenshotFirst', 'AssetFirst')]
  [string]$Mode = 'ScreenshotFirst',
  [int]$Port = 13000,
  [int]$WaitMs = 8000,
  [int]$ViewportWidth = 960,
  [int]$ViewportHeight = 720,
  [int]$CaptureTimeoutMs = 45000,
  [int]$Limit = 0,
  [int]$StartNumber = 1
)

$ErrorActionPreference = 'Stop'

if (-not $Root) {
  $Root = Split-Path -Parent $PSScriptRoot
}

Add-Type -AssemblyName System.Drawing

$docsRoot = Join-Path $Root 'docs'
$gamesPath = Join-Path $docsRoot 'data/hub-games.json'
$gamesRoot = Join-Path $docsRoot 'hubgames'
$iconRoot = Join-Path $docsRoot 'assets/game-icons'
$tempRoot = Join-Path $Root '.tmp-game-icons'
$baseUrl = "http://localhost:$Port"

New-Item -ItemType Directory -Force -Path $iconRoot | Out-Null
New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

$supportedExt = @('.png', '.jpg', '.jpeg', '.gif', '.bmp')
$preferredNames = @(
  'icon-256',
  'loading-logo',
  'logo',
  'game_title_large',
  'game_title',
  'title',
  'cover',
  'thumbnail',
  'thumb',
  'splash',
  'banner',
  'build'
)

function Get-ImageScore {
  param(
    [System.IO.FileInfo]$File,
    [string]$GameFolder
  )

  $name = $File.BaseName.ToLowerInvariant()
  $ext = $File.Extension.ToLowerInvariant()
  $score = 0

  if ($File.Name -ieq 'Build.jpg') { $score += 220 }
  if ($name -eq 'icon-256') { $score += 200 }
  elseif ($name -eq 'loading-logo') { $score += 180 }
  elseif ($name -eq 'logo') { $score += 170 }

  foreach ($preferred in $preferredNames) {
    if ($name -like "*$preferred*") {
      $score += (100 - ([array]::IndexOf($preferredNames, $preferred) * 6))
      break
    }
  }

  if ($name -match 'icon|logo|title|cover|thumb|splash|banner') { $score += 40 }
  if ($name -like '*256*') { $score += 20 }
  if ($name -like '*512*' -or $name -like '*1024*') { $score += 16 }
  if ($ext -eq '.png') { $score += 12 }
  if ($ext -eq '.jpg' -or $ext -eq '.jpeg') { $score += 10 }
  if ($File.DirectoryName -match '\\icons?($|\\)') { $score += 14 }
  if ($File.DirectoryName -match '\\images?($|\\)') { $score += 8 }
  if ($File.DirectoryName -match '\\media($|\\)') { $score += 4 }
  if ($File.FullName -match [regex]::Escape($GameFolder)) { $score += 8 }
  $sizeBonus = [int][math]::Min([math]::Max(0, $File.Length / 50000), 20)
  $score += $sizeBonus
  return [int]$score
}

function Load-Image {
  param([string]$Path)

  $stream = [System.IO.File]::OpenRead($Path)
  try {
    $loaded = [System.Drawing.Image]::FromStream($stream)
    try {
      return New-Object System.Drawing.Bitmap($loaded)
    }
    finally {
      $loaded.Dispose()
    }
  }
  finally {
    $stream.Dispose()
  }
}

function Find-BrowserPath {
  $candidates = @(
    (Join-Path $env:LOCALAPPDATA 'ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-win64/chrome-headless-shell.exe'),
    (Join-Path $env:LOCALAPPDATA 'ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-win64/chrome-headless-shell.exe'),
    (Join-Path $env:LOCALAPPDATA 'ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-win64/chrome-headless-shell.exe'),
    (Join-Path $env:LOCALAPPDATA 'ms-playwright/chromium-1223/chrome-win64/chrome.exe'),
    (Join-Path $env:LOCALAPPDATA 'ms-playwright/chromium-1217/chrome-win64/chrome.exe'),
    (Join-Path $env:LOCALAPPDATA 'ms-playwright/chromium-1208/chrome-win64/chrome.exe'),
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe"
  )

  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path -LiteralPath $candidate)) {
      return $candidate
    }
  }

  $commands = @('msedge.exe', 'chrome.exe')
  foreach ($command in $commands) {
    $found = Get-Command $command -ErrorAction SilentlyContinue
    if ($found) { return $found.Source }
  }

  throw 'Cannot find Chrome or Edge for screenshot capture.'
}

function Test-LocalServer {
  param([string]$Url)

  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3
    return ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500)
  }
  catch {
    return $false
  }
}

function Test-GameUnsupported {
  param(
    [string]$BrowserPath,
    [string]$Url
  )

  $args = @(
    '--no-sandbox',
    '--disable-gpu',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--disable-software-rasterizer',
    '--disable-crash-reporter',
    '--dump-dom',
    $Url
  )

  $oldEap = $ErrorActionPreference
  $ErrorActionPreference = 'SilentlyContinue'
  try {
    $text = (& $BrowserPath @args 2>$null | Out-String)
  }
  finally {
    $ErrorActionPreference = $oldEap
  }
  return ($text -match 'notSupportedWrap' -or $text -match 'Software update needed' -or $text -match 'Missing features: WebGL')
}

function Start-LocalServer {
  param(
    [string]$DocsRoot,
    [int]$Port,
    [string]$BaseUrl
  )

  if (Test-LocalServer -Url $BaseUrl) {
    return $null
  }

  $python = Get-Command python -ErrorAction SilentlyContinue
  $pythonArgs = @('-m', 'http.server', [string]$Port, '--directory', $DocsRoot)
  if (-not $python) {
    $python = Get-Command py -ErrorAction SilentlyContinue
    $pythonArgs = @('-m', 'http.server', [string]$Port, '--directory', $DocsRoot)
  }
  if (-not $python) {
    throw 'Python was not found. Run run.bat first or install Python.'
  }

  $process = Start-Process -WindowStyle Hidden -FilePath $python.Source -ArgumentList $pythonArgs -PassThru
  $ready = $false
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 500
    if (Test-LocalServer -Url $BaseUrl) {
      $ready = $true
      break
    }
  }

  if (-not $ready) {
    try { Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue } catch {}
    throw "Local server did not start at $BaseUrl"
  }

  return $process
}

function Invoke-BrowserScreenshot {
  param(
    [string]$BrowserPath,
    [string]$Url,
    [string]$OutputPath,
    [int]$Width,
    [int]$Height,
    [int]$WaitMs,
    [int]$TimeoutMs,
    [string]$UserDataDir
  )

  if (Test-Path -LiteralPath $OutputPath) {
    Remove-Item -LiteralPath $OutputPath -Force
  }

  $args = @(
    '--headless=new',
    '--no-sandbox',
    '--single-process',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-dev-shm-usage',
    '--disable-crash-reporter',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-sync',
    '--hide-scrollbars',
    '--mute-audio',
    '--no-first-run',
    '--no-default-browser-check',
    '--use-gl=swiftshader',
    "--user-data-dir=$UserDataDir",
    "--window-size=$Width,$Height",
    "--screenshot=$OutputPath",
    $Url
  )

  $oldLocalAppData = $env:LOCALAPPDATA
  $oldUserProfile = $env:USERPROFILE
  $sandboxProfileRoot = Join-Path $UserDataDir 'env'
  $env:LOCALAPPDATA = Join-Path $sandboxProfileRoot 'localappdata'
  $env:USERPROFILE = Join-Path $sandboxProfileRoot 'userprofile'
  New-Item -ItemType Directory -Force -Path $env:LOCALAPPDATA, $env:USERPROFILE | Out-Null

  $process = Start-Process -FilePath $BrowserPath -ArgumentList $args -PassThru -WindowStyle Hidden
  try {
    if (-not $process.WaitForExit($TimeoutMs)) {
      try { Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue } catch {}
      throw "Screenshot timed out for $Url"
    }
  }
  finally {
    $env:LOCALAPPDATA = $oldLocalAppData
    $env:USERPROFILE = $oldUserProfile
  }

  if (-not (Test-Path -LiteralPath $OutputPath)) {
    throw "Screenshot was not created for $Url"
  }
}

function Save-SquareImage {
  param(
    [System.Drawing.Image]$Source,
    [string]$TargetPath,
    [int]$Size = 256
  )

  $square = [Math]::Min($Source.Width, $Source.Height)
  $x = [Math]::Floor(($Source.Width - $square) / 2)
  $y = [Math]::Floor(($Source.Height - $square) / 2)
  $cropRect = New-Object System.Drawing.Rectangle([int]$x, [int]$y, [int]$square, [int]$square)
  $canvas = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  try {
    $g.Clear([System.Drawing.Color]::FromArgb(18, 22, 43))
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($Source, (New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

    $framePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 56, 217, 255), 4)
    $g.DrawRectangle($framePen, 2, 2, $Size - 4, $Size - 4)
    $framePen.Dispose()

    $source.Dispose()

    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/png' } | Select-Object -First 1
    $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 90L)
    $canvas.Save($TargetPath, $encoder, $params)
    $params.Dispose()
  }
  finally {
    $g.Dispose()
    $canvas.Dispose()
  }
}

function Test-MeaningfulImage {
  param([System.Drawing.Bitmap]$Image)

  $samplePoints = @(
    @([int]($Image.Width * 0.2), [int]($Image.Height * 0.2)),
    @([int]($Image.Width * 0.5), [int]($Image.Height * 0.2)),
    @([int]($Image.Width * 0.8), [int]($Image.Height * 0.2)),
    @([int]($Image.Width * 0.2), [int]($Image.Height * 0.5)),
    @([int]($Image.Width * 0.5), [int]($Image.Height * 0.5)),
    @([int]($Image.Width * 0.8), [int]($Image.Height * 0.5)),
    @([int]($Image.Width * 0.2), [int]($Image.Height * 0.8)),
    @([int]($Image.Width * 0.5), [int]($Image.Height * 0.8)),
    @([int]($Image.Width * 0.8), [int]($Image.Height * 0.8))
  )

  $colors = New-Object System.Collections.Generic.HashSet[string]
  $brightness = 0

  foreach ($point in $samplePoints) {
    $x = [Math]::Min([Math]::Max(0, $point[0]), $Image.Width - 1)
    $y = [Math]::Min([Math]::Max(0, $point[1]), $Image.Height - 1)
    $c = $Image.GetPixel($x, $y)
    $brightness += ($c.R + $c.G + $c.B)
    [void]$colors.Add("$($c.R)-$($c.G)-$($c.B)-$($c.A)")
  }

  $avg = $brightness / ($samplePoints.Count * 3)
  return ($colors.Count -gt 2) -or ($avg -gt 20)
}

function Write-FallbackIcon {
  param(
    [string]$TargetPath,
    [int]$Number,
    [string]$Title
  )

  $size = 256
  $canvas = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  try {
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $hash = [int]([Math]::Abs(($Title.GetHashCode() -band 0x7fffffff)))
    $r1 = [int](34 + ($hash % 90))
    $g1 = [int](60 + ([math]::Floor($hash / 7) % 110))
    $b1 = [int](120 + ([math]::Floor($hash / 13) % 100))
    $r2 = [int](15 + ([math]::Floor($hash / 5) % 40))
    $g2 = [int](18 + ([math]::Floor($hash / 11) % 50))
    $b2 = [int](36 + ([math]::Floor($hash / 17) % 80))
    $c1 = [System.Drawing.Color]::FromArgb(255, $r1, $g1, $b1)
    $c2 = [System.Drawing.Color]::FromArgb(255, $r2, $g2, $b2)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
      (New-Object System.Drawing.Rectangle(0, 0, $size, $size)),
      $c1,
      $c2,
      45.0
    )
    $g.FillRectangle($brush, 0, 0, $size, $size)
    $brush.Dispose()

    $glow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 56, 217, 255))
    $g.FillEllipse($glow, -40, -30, 180, 180)
    $glow.Dispose()

    $band = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(28, 255, 255, 255))
    $g.FillRectangle($band, 0, 186, $size, 70)
    $band.Dispose()

    $border = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(140, 255, 255, 255), 4)
    $g.DrawRectangle($border, 2, 2, $size - 4, $size - 4)
    $border.Dispose()

    $numFont = New-Object System.Drawing.Font('Arial Black', 28, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $titleFont = New-Object System.Drawing.Font('Segoe UI', 18, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $smallFont = New-Object System.Drawing.Font('Segoe UI', 12, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $shadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 0, 0, 0))

    $numText = ('#{0:000}' -f $Number)
    $g.DrawString($numText, $numFont, $shadow, (New-Object System.Drawing.PointF(21, 21)))
    $g.DrawString($numText, $numFont, $white, (New-Object System.Drawing.PointF(18, 18)))

    $words = ($Title -replace '[^A-Za-z0-9 ]', ' ').Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)
    if ($words.Count -eq 0) { $words = @($Title) }
    $lines = New-Object System.Collections.Generic.List[string]
    $current = ''
    foreach ($word in $words) {
      $candidate = if ($current) { "$current $word" } else { $word }
      $bounds = $g.MeasureString($candidate, $titleFont, 190)
      if ($bounds.Width -gt 188 -and $current) {
        $lines.Add($current)
        $current = $word
      }
      else {
        $current = $candidate
      }
      if ($lines.Count -ge 2) { break }
    }
    if ($current -and $lines.Count -lt 3) { $lines.Add($current) }
    if ($lines.Count -gt 3) { $lines = $lines.GetRange(0, 3) }

    $y = 92.0
    foreach ($line in $lines) {
      $textSize = $g.MeasureString($line, $titleFont, 208)
      $x = [int](($size - $textSize.Width) / 2)
      $g.DrawString($line, $titleFont, $shadow, [single]($x + 2), [single]($y + 2))
      $g.DrawString($line, $titleFont, $white, [single]$x, [single]$y)
      $y += 26
    }

    $hintText = 'MAD HUB'
    $hintSize = $g.MeasureString($hintText, $smallFont)
    $hintX = [int](($size - $hintSize.Width) / 2)
    $hintY = 198
    $g.DrawString($hintText, $smallFont, $shadow, [single]($hintX + 2), [single]($hintY + 2))
    $g.DrawString($hintText, $smallFont, $white, [single]$hintX, [single]$hintY)

    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/png' } | Select-Object -First 1
    $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 90L)
    $canvas.Save($TargetPath, $encoder, $params)
    $params.Dispose()

    $numFont.Dispose()
    $titleFont.Dispose()
    $smallFont.Dispose()
    $white.Dispose()
    $shadow.Dispose()
  }
  finally {
    $g.Dispose()
    $canvas.Dispose()
  }
}

function Select-AssetImage {
  param(
    [string]$GameFolder,
    [object]$Game
  )

  $candidates = Get-ChildItem -LiteralPath $GameFolder -Recurse -File |
    Where-Object { $supportedExt -contains $_.Extension.ToLowerInvariant() }

  if ($candidates.Count -eq 0) { return $null }

  return $candidates |
    Sort-Object @{ Expression = { Get-ImageScore -File $_ -GameFolder $Game.folder }; Descending = $true }, @{ Expression = { $_.Length }; Descending = $true } |
    Select-Object -First 1
}

function Save-AssetFallback {
  param(
    [object]$Game,
    [string]$GameFolder,
    [string]$TargetPath
  )

  $selected = Select-AssetImage -GameFolder $GameFolder -Game $Game
  if ($selected) {
    try {
      $image = Load-Image -Path $selected.FullName
      try {
        if (-not (Test-MeaningfulImage -Image $image)) {
          throw 'blank image'
        }
        Save-SquareImage -Source $image -TargetPath $TargetPath -Size 256
        return 'asset'
      }
      catch {
        $image.Dispose()
        throw
      }
    }
    catch {}
  }

  Write-FallbackIcon -TargetPath $TargetPath -Number $Game.number -Title $Game.title
  return 'title'
}

function Save-ScreenshotIcon {
  param(
    [object]$Game,
    [string]$GameFolder,
    [string]$TargetPath,
    [string]$BrowserPath,
    [string]$BaseUrl,
    [int]$Width,
    [int]$Height,
    [int]$WaitMs,
    [int]$TimeoutMs,
    [string]$TempRoot
  )

  $safeName = $Game.folder -replace '[^A-Za-z0-9_.-]', '_'
  $screenshotPath = Join-Path $TempRoot "$safeName-full.png"
  $profilePath = Join-Path $TempRoot "$safeName-profile"
  if (Test-Path -LiteralPath $profilePath) {
    Remove-Item -LiteralPath $profilePath -Recurse -Force
  }
  New-Item -ItemType Directory -Force -Path $profilePath | Out-Null

  $url = "$BaseUrl/$($Game.playPath)"
  if (Test-GameUnsupported -BrowserPath $BrowserPath -Url $url) {
    return Save-AssetFallback -Game $Game -GameFolder $GameFolder -TargetPath $TargetPath
  }

  Invoke-BrowserScreenshot -BrowserPath $BrowserPath -Url $url -OutputPath $screenshotPath -Width $Width -Height $Height -WaitMs $WaitMs -TimeoutMs $TimeoutMs -UserDataDir $profilePath

  $image = Load-Image -Path $screenshotPath
  try {
    if (-not (Test-MeaningfulImage -Image $image)) {
      throw 'blank screenshot'
    }
    Save-SquareImage -Source $image -TargetPath $TargetPath -Size 256
    return 'screenshot'
  }
  catch {
    $image.Dispose()
    return Save-AssetFallback -Game $Game -GameFolder $GameFolder -TargetPath $TargetPath
  }
  finally {
    Remove-Item -LiteralPath $screenshotPath -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $profilePath -Recurse -Force -ErrorAction SilentlyContinue
  }
}

$json = Get-Content -LiteralPath $gamesPath -Raw | ConvertFrom-Json
$updated = @()
$counts = @{}
$serverProcess = $null
$browserPath = $null

if ($Mode -eq 'ScreenshotFirst') {
  $serverProcess = Start-LocalServer -DocsRoot $docsRoot -Port $Port -BaseUrl $baseUrl
  $browserPath = Find-BrowserPath
  Write-Host "Using browser: $browserPath"
}

try {
  $gamesToProcess = @($json.games | Where-Object { [int]$_.number -ge $StartNumber })
  if ($Limit -gt 0) {
    $gamesToProcess = @($gamesToProcess | Select-Object -First $Limit)
  }

  foreach ($game in @($json.games | Where-Object { [int]$_.number -lt $StartNumber })) {
    $updated += [pscustomobject]@{
      number = $game.number
      title = $game.title
      folder = $game.folder
      playPath = $game.playPath
      iconPath = $game.iconPath
    }
  }

  foreach ($game in $gamesToProcess) {
    $gameFolder = Join-Path $gamesRoot $game.folder
    if (-not (Test-Path -LiteralPath $gameFolder)) {
      throw "Missing game folder: $gameFolder"
    }

    $targetPath = Join-Path $iconRoot "$($game.folder).png"
    if ($Mode -eq 'ScreenshotFirst') {
      $source = Save-ScreenshotIcon -Game $game -GameFolder $gameFolder -TargetPath $targetPath -BrowserPath $browserPath -BaseUrl $baseUrl -Width $ViewportWidth -Height $ViewportHeight -WaitMs $WaitMs -TimeoutMs $CaptureTimeoutMs -TempRoot $tempRoot
    }
    else {
      $source = Save-AssetFallback -Game $game -GameFolder $gameFolder -TargetPath $targetPath
    }

    if (-not $counts.ContainsKey($source)) { $counts[$source] = 0 }
    $counts[$source]++
    $iconPath = "assets/game-icons/$($game.folder).png"

    $updated += [pscustomobject]@{
      number = $game.number
      title = $game.title
      folder = $game.folder
      playPath = $game.playPath
      iconPath = $iconPath
    }

    Write-Host ("{0:000} {1} -> {2}" -f $game.number, $game.title, $source)
  }
}
finally {
  if ($serverProcess) {
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
  }
}

$payload = [pscustomobject]@{ games = $updated }
$payload | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $gamesPath -Encoding UTF8

Write-Host "Generated $($updated.Count) game icons into $iconRoot"
foreach ($key in $counts.Keys) {
  Write-Host "$key=$($counts[$key])"
}
