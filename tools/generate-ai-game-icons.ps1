[CmdletBinding()]
param(
  [int[]]$Numbers,
  [string]$NumberList = '',
  [switch]$NoReference,
  [string]$Model = 'cx/gpt-5.5-image',
  [int]$Size = 256
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$docsRoot = Join-Path $root 'docs'
$gamesPath = Join-Path $docsRoot 'data/hub-games.json'
$iconRoot = Join-Path $docsRoot 'assets/game-icons'
$draftRoot = Join-Path $root '.tmp-captures/9router-icons'
$envPath = Join-Path $root '.env'

New-Item -ItemType Directory -Force -Path $draftRoot | Out-Null
New-Item -ItemType Directory -Force -Path $iconRoot | Out-Null

function Import-DotEnv {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return }
  foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
    $parts = $line -split '=', 2
    $name = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"').Trim("'")
    if ($name) { [Environment]::SetEnvironmentVariable($name, $value, 'Process') }
  }
}

function Resize-Png {
  param([string]$SourcePath, [string]$TargetPath, [int]$TargetSize)

  Add-Type -AssemblyName System.Drawing
  $img = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $SourcePath).Path)
  try {
    $bmp = New-Object System.Drawing.Bitmap $TargetSize, $TargetSize, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.DrawImage($img, 0, 0, $TargetSize, $TargetSize)
    }
    finally { $g.Dispose() }
  }
  finally { $img.Dispose() }

  $tmp = "$TargetPath.tmp.png"
  $bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Move-Item -LiteralPath $tmp -Destination $TargetPath -Force
}

function Get-ThemeHint {
  param([string]$Title)
  switch -Regex ($Title) {
    '2-3-4 Player' { return 'party mini-game collection, four colorful player panels, dice, racing, soccer and arcade symbols' }
    '2048 Balls' { return 'glossy numbered balls merging on a bright puzzle board, 2048 style' }
    'Russian Billiards' { return 'green billiards table, cue ball, black 8 ball, realistic pool lighting' }
    'Arena Of Janissary' { return 'two Janissary fighters in a small pixel arena, arrows, shields, desert fortress colors' }
    'Axe Throw' { return 'flying axe hitting a wooden target, crisp arcade action, sparks and impact' }
    'Bees Love' { return 'cute bees, honeycomb puzzle tiles, golden honey, cheerful match game look' }
    'Block8' { return 'wooden block puzzle grid, clean square tiles, satisfying puzzle board' }
    default { return 'clear gameplay subject, vivid arcade colors, readable small icon composition' }
  }
}

Import-DotEnv -Path $envPath
$base = $env:NINEROUTER_URL
$key = $env:NINEROUTER_KEY
if (-not $base) { throw 'NINEROUTER_URL missing' }
if (-not $key) { throw 'NINEROUTER_KEY missing' }
$base = $base.TrimEnd('/')

$games = (Get-Content -LiteralPath $gamesPath -Raw | ConvertFrom-Json).games
$targetNumbers = @()
if ($NumberList) {
  $targetNumbers = @($NumberList -split '[,\s]+' | Where-Object { $_ } | ForEach-Object { [int]$_ })
}
elseif ($Numbers -and $Numbers.Count -gt 0) {
  $targetNumbers = @($Numbers | ForEach-Object { [int]$_ })
}

if ($targetNumbers.Count -gt 0) {
  $games = @($games | Where-Object { $targetNumbers -contains [int]$_.number })
}

foreach ($game in $games) {
  $folder = $game.folder
  $sourceIcon = Join-Path $iconRoot "$folder.png"
  $draft = Join-Path $draftRoot "$folder-1024.png"
  $final = Join-Path $iconRoot "$folder.png"
  $theme = Get-ThemeHint -Title $game.title

  $prompt = @"
Create a polished square mobile game app icon for "$($game.title)".
Theme: $theme.
Preserve the game's likely identity and genre, centered subject, high contrast, crisp professional app icon style.
No browser chrome, no watermarks, no UI buttons, no random extra text. Avoid title text unless a tiny mark is essential.
Use bold readable shapes that still work at 64px.
"@

  $body = [ordered]@{
    model = $Model
    prompt = $prompt
    size = '1024x1024'
    output_format = 'png'
    background = 'opaque'
    image_detail = 'high'
  }

  if (-not $NoReference -and (Test-Path -LiteralPath $sourceIcon)) {
    $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $sourceIcon).Path)
    $body.image = 'data:image/png;base64,' + [Convert]::ToBase64String($bytes)
  }

  $json = $body | ConvertTo-Json -Depth 8
  $headers = @{ Authorization = "Bearer $key"; 'Content-Type' = 'application/json' }
  $uri = "$base/images/generations?response_format=binary"
  Write-Host ("AI {0:000} {1}" -f $game.number, $game.title)
  Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -Body $json -OutFile $draft -TimeoutSec 120 | Out-Null
  Resize-Png -SourcePath $draft -TargetPath $final -TargetSize $Size
  Write-Host ("saved {0}" -f $final)
}
