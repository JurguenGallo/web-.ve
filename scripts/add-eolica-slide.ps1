param(
    [string]$IndexPath = "C:\Users\Usuario\Documents\GitHub\web-.ve\frontend\public\index.html",
    [string]$GaleriaPath = "C:\Users\Usuario\Documents\GitHub\web-.ve\frontend\public\galeria\index.html"
)

Write-Host "=== Add Eolica Slide to Index and Galeria ===" -ForegroundColor Cyan

# -----------------------------------------------------------
# Helper: generate a random 11-char alphanumeric for n-uc-XXXXX
# -----------------------------------------------------------
function New-RandomNuc {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    -join ((1..11) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}

# -----------------------------------------------------------
# Helper: find all unique n-uc-XXXXX... class names in a slide
# -----------------------------------------------------------
function Get-UniqueClassNames {
    param([string]$Html)
    $result = [System.Collections.Generic.HashSet[string]]::new()
    # match n-uc- followed by word chars (covers n-uc-XXXXX sequences)
    [regex]::Matches($Html, 'n-uc-[a-zA-Z0-9]+') | ForEach-Object {
        $null = $result.Add($_.Value)
    }
    $result
}

# -----------------------------------------------------------
# Helper: replace all n-uc-XXXXX class names with new random ones
# -----------------------------------------------------------
function Replace-NucClasses {
    param([string]$Html)
    $classes = Get-UniqueClassNames $Html
    $map = @{}
    foreach ($c in $classes) {
        $map[$c] = "n-uc-$((New-RandomNuc))"
    }
    # Sort descending by length to avoid partial replacements
    $sorted = $map.Keys | Sort-Object Length -Descending
    foreach ($old in $sorted) {
        $Html = $Html -replace [regex]::Escape($old), $map[$old]
    }
    $Html
}

# -----------------------------------------------------------
# 1. INDEX: add 3rd slide (Eolica) after slide 2
# -----------------------------------------------------------
Write-Host "`n>> Processing INDEX: $IndexPath" -ForegroundColor Yellow
$idxContent = Get-Content -Path $IndexPath -Raw

# --- BACKGROUNDS ---
# Find the closing of the backgrounds container: </div><div class="n2-ss-slider-4"
$bgEndMarker = '</div></div><div class="n2-ss-slider-4 n2-ow">'

# Find the second background (public-id="2") - this is Presentes768
$bgPid2Start = '<div class="n2-ss-slide-background" data-public-id="2"'
$idxAfterPid2 = $idxContent.IndexOf($bgPid2Start)
if ($idxAfterPid2 -eq -1) { Write-Error "INDEX: Cannot find background public-id=2"; exit 1 }

# Extract background 2 HTML (from its opening tag to its closing </div>)
$bg2Open = $idxAfterPid2
$bgDepth = 0
$bg2End = -1
$temp = $idxContent.Substring($bg2Open)
for ($i = 0; $i -lt $temp.Length; $i++) {
    if ($temp[$i] -eq '<') {
        $rest = $temp.Substring($i)
        if ($rest -match '^</div>') {
            if ($bgDepth -eq 0) { $bg2End = $bg2Open + $i + 6; break }
            $bgDepth--
            $i += 5
        } elseif ($rest -match '^<div[>\s]') {
            $bgDepth++
            $i += 3
        } elseif ($rest -match '^<[a-zA-Z]') {
            $i += 1
            while ($i -lt $temp.Length -and $temp[$i] -ne '>') { $i++ }
        }
    }
}
if ($bg2End -eq -1) { Write-Error "INDEX: Cannot find end of background 2"; exit 1 }

$bg2Html = $idxContent.Substring($bg2Open, $bg2End - $bg2Open)

# Create new background 3 (Eolica) by cloning background 2
$bg3Html = $bg2Html -replace 'data-public-id="2"', 'data-public-id="3"'
$bg3Html = $bg3Html -replace 'Presentes768\.png', 'Eolica.png'
$bg3Html = $bg3Html -replace 'alt="[^"]*"', 'alt="Soluciones Eólicas SIM Energy"'
$bg3Html = $bg3Html -replace 'Personal t[^"]*', 'Soluciones Eólicas'

# Insert new background before the closing </div> of the backgrounds container
$bgContainerClose = $idxContent.IndexOf('</div><div class="n2-ss-slider-4 n2-ow">', $bg2End)
if ($bgContainerClose -eq -1) { Write-Error "INDEX: Cannot find backgrounds container close"; exit 1 }

$idxContent = $idxContent.Substring(0, $bgContainerClose) + $bg3Html + $idxContent.Substring($bgContainerClose)

Write-Host "  Added Eolica background" -ForegroundColor Green

# --- SLIDES ---
# Find slide 2 (data-slide-public-id="2" / data-id="73")
$slide2Marker = 'data-slide-public-id="2"'
$slide2Start = $idxContent.IndexOf($slide2Marker)
if ($slide2Start -eq -1) { Write-Error "INDEX: Cannot find slide 2 marker"; exit 1 }

# Go backwards to find the <div that starts this slide
$slide2DivStart = $idxContent.LastIndexOf('<div ', $slide2Start)
if ($slide2DivStart -eq -1) { Write-Error "INDEX: Cannot find slide 2 div start"; exit 1 }

# Find the full slide 2 HTML by counting div depth
$slide2Full = $idxContent.Substring($slide2DivStart)
$depth = 0
$slide2End = -1
for ($i = 0; $i -lt $slide2Full.Length; $i++) {
    if ($slide2Full[$i] -eq '<') {
        $rest = $slide2Full.Substring($i)
        if ($rest -match '^</div>') {
            if ($depth -eq 0) { $slide2End = $slide2DivStart + $i + 6; break }
            $depth--
            $i += 5
        } elseif ($rest -match '^<div[>\s]') {
            $depth++
            $i += 3
        } elseif ($slide2Full[$i] -eq '<' -and $i + 1 -lt $slide2Full.Length -and $slide2Full[$i+1] -match '[a-zA-Z]') {
            $i++
            while ($i -lt $slide2Full.Length -and $slide2Full[$i] -ne '>') { $i++ }
        }
    }
}
if ($slide2End -eq -1) { Write-Error "INDEX: Cannot find end of slide 2"; exit 1 }

$slide2Html = $idxContent.Substring($slide2DivStart, $slide2End - $slide2DivStart)

# Clone slide 2 for Eolica slide 3
$slide3Html = $slide2Html

# Update public-id
$slide3Html = $slide3Html -replace 'data-slide-public-id="2"', 'data-slide-public-id="3"'

# Update data-id to new unique ID
$slide3Html = $slide3Html -replace 'data-id="73"', 'data-id="1000"'

# Update class n2-ss-slide-73 to n2-ss-slide-1000
$slide3Html = $slide3Html -replace 'n2-ss-slide-73\b', 'n2-ss-slide-1000'

# Remove data-first attribute
$slide3Html = $slide3Html -replace '\s*data-first="[^"]*"', ''

# Update href from solucionesfotovoltaicas to something appropriate
# (keep COTIZA AQUI button but point to a relevant page)
$slide3Html = $slide3Html -replace 'href="/solucionesfotovoltaicas/"', 'href="/solucionesfotovoltaicas/"'
$slide3Html = $slide3Html -replace 'href="/quienes-somos/"', 'href="/solucionesfotovoltaicas/"'

# Replace all n-uc-XXXXX class names with new random ones
$slide3Html = Replace-NucClasses $slide3Html

# Insert after slide 2
$idxContent = $idxContent.Substring(0, $slide2End) + $slide3Html + $idxContent.Substring($slide2End)

# Save
Set-Content -Path $IndexPath -Value $idxContent -NoNewline
Write-Host "  [+ Added Eolica slide (data-id=1000) to index]" -ForegroundColor Green
Write-Host "  [SAVED INDEX]" -ForegroundColor Green


# -----------------------------------------------------------
# 2. GALERIA: reorder slides and add Eolica
# -----------------------------------------------------------
Write-Host "`n>> Processing GALERIA: $GaleriaPath" -ForegroundColor Yellow
$galContent = Get-Content -Path $GaleriaPath -Raw

# --- LOCATE SLIDER SECTIONS ---
# Find main backgrounds container and slider-4 container in galeria
# The galeria has a showcase slider (n2-ss-showcase-horizontal) which is different.
# But it also has the standard slider (n2-ss-slider-4) with the slides we need.

# Let's find the specific slider with the Presentes slides
$galBgContainer = 'n2-ss-slide-backgrounds n2-ow-all'
$galBgIdx = $galContent.IndexOf($galBgContainer)
if ($galBgIdx -eq -1) { Write-Error "GALERIA: Cannot find backgrounds container"; exit 1 }

# Now let's extract background sections
$bgSection = $galContent.Substring($galBgIdx)

# Find all background divs in sequence
function Get-Backgrounds {
    param([string]$Html)
    $result = @()
    $searchFrom = 0
    while ($true) {
        $bgStartMarker = '<div class="n2-ss-slide-background" data-public-id="'
        $startIdx = $Html.IndexOf($bgStartMarker, $searchFrom)
        if ($startIdx -eq -1) { break }
        
        # Extract the background div
        $sub = $Html.Substring($startIdx)
        $depth = 0
        $endIdx = -1
        for ($i = 0; $i -lt $sub.Length; $i++) {
            if ($sub[$i] -eq '<') {
                $rest = $sub.Substring($i)
                if ($rest -match '^</div>') {
                    if ($depth -eq 0) { $endIdx = $startIdx + $i + 6; break }
                    $depth--
                    $i += 5
                } elseif ($rest -match '^<div[>\s]') {
                    $depth++
                    $i += 3
                } elseif ($i + 1 -lt $sub.Length -and $sub[$i+1] -match '[a-zA-Z]') {
                    $i++
                    while ($i -lt $sub.Length -and $sub[$i] -ne '>') { $i++ }
                }
            }
        }
        if ($endIdx -eq -1) { break }
        
        $result += @{
            FullHtml  = $Html.Substring($startIdx, $endIdx - $startIdx)
            StartIdx  = $startIdx
            EndIdx    = $endIdx
            PublicId  = if ($Html.Substring($startIdx) -match 'data-public-id="(\d+)"') { [int]$Matches[1] } else { 0 }
        }
        $searchFrom = $endIdx
    }
    $result
}

$bgs = Get-Backgrounds $galContent
Write-Host "  Found $($bgs.Count) backgrounds in galeria"

if ($bgs.Count -lt 3) { Write-Error "GALERIA: Expected at least 3 backgrounds"; exit 1 }

# Current order from bgs:
# [0] public-id=1 -> Presentes5.png
# [1] public-id=2 -> portada-venezuela (Venezuela)
# [2] public-id=3 -> Presentes768.png

# Desired order:
# public-id=1 -> Presentes5.png (stays)
# public-id=2 -> Presentes768.png (was 3)
# public-id=3 -> Eolica.png (NEW)
# public-id=4 -> portada-venezuela (was 2)

# Create new Eolica background (clone Presentes768 background which is bgs[2])
$bgPresentes768 = $bgs[2].FullHtml
$bgEolica = $bgPresentes768 -replace 'data-public-id="3"', 'data-public-id="3"'
$bgEolica = $bgEolica -replace 'Presentes768\.png', 'Eolica.png'
$bgEolica = $bgEolica -replace 'alt="[^"]*"', 'alt="Soluciones Eólicas SIM Energy"'

# But we need to renumber: Presentes768 becomes 2, Eolica is 3, Venezuela is 4
$bgPresentes768New = $bgPresentes768 -replace 'data-public-id="3"', 'data-public-id="2"'

$bgVenezuela = $bgs[1].FullHtml
$bgVenezuelaNew = $bgVenezuela -replace 'data-public-id="2"', 'data-public-id="4"'

# Rebuild backgrounds section
$bgPresentes5 = $bgs[0].FullHtml

# Preserve the content before the first background and after the last
$beforeBg = $galContent.Substring(0, $bgs[0].StartIdx)
$afterBg = $galContent.Substring($bgs[$bgs.Count-1].EndIdx)

$newBackgroundsHtml = $beforeBg + $bgPresentes5 + $bgPresentes768New + $bgEolica + $bgVenezuelaNew + $afterBg
$galContent = $newBackgroundsHtml

Write-Host "  Reordered backgrounds: 1->Presentes5, 2->Presentes768, 3->Eolica, 4->Venezuela" -ForegroundColor Green

# --- SLIDES: reorder in n2-ss-slider-4 ---
# Find the n2-ss-slider-4 section
$slider4Marker = 'n2-ss-slider-4 n2-ow">'
$slider4Idx = $galContent.IndexOf($slider4Marker)
if ($slider4Idx -eq -1) { Write-Error "GALERIA: Cannot find n2-ss-slider-4"; exit 1 }

# The slides start after the SVG in slider-4
$svgs = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460'
$svgIdx = $galContent.IndexOf($svgs, $slider4Idx)
if ($svgIdx -eq -1) {
    $svgs2 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 900'
    $svgIdx = $galContent.IndexOf($svgs2, $slider4Idx)
}
if ($svgIdx -eq -1) { Write-Error "GALERIA: Cannot find SVG in slider-4"; exit 1 }

$svgEnd = $galContent.IndexOf('</svg>', $svgIdx) + 6
if ($svgEnd -eq -1) { Write-Error "GALERIA: Cannot find SVG end"; exit 1 }

# Content between SVG end and the next section (slider controls)
# Slides end when we hit 'n2-ss-slider-controls' or the closing </div></div> of slider-4
$endOfSlidesMarker = '<div class="n2-ss-slider-controls'
$endSlidesIdx = $galContent.IndexOf($endOfSlidesMarker, $svgEnd)
if ($endSlidesIdx -eq -1) { 
    # Try alternative: find the end of slider-4 container
    $endSlidesIdx = $galContent.IndexOf('</div></div></div></div>', $svgEnd)
}

# Extract the slides area
$slidesArea = $galContent.Substring($svgEnd, $endSlidesIdx - $svgEnd)

# Extract individual slide divs
function Get-Slides {
    param([string]$Html)
    $result = @()
    $searchFrom = 0
    while ($true) {
        $slideStart = $Html.IndexOf('<div data-slide-duration', $searchFrom)
        if ($slideStart -eq -1) {
            $slideStart = $Html.IndexOf('<div data-first=', $searchFrom)
        }
        if ($slideStart -eq -1) { break }
        
        $sub = $Html.Substring($slideStart)
        $depth = 0
        $endIdx = -1
        for ($i = 0; $i -lt $sub.Length; $i++) {
            if ($sub[$i] -eq '<') {
                $rest = $sub.Substring($i)
                if ($rest -match '^</div>') {
                    if ($depth -eq 0) { $endIdx = $slideStart + $i + 6; break }
                    $depth--
                    $i += 5
                } elseif ($rest -match '^<div[>\s]') {
                    $depth++
                    $i += 3
                } elseif ($i + 1 -lt $sub.Length -and $sub[$i+1] -match '[a-zA-Z]') {
                    $i++
                    while ($i -lt $sub.Length -and $sub[$i] -ne '>') { $i++ }
                }
            }
        }
        if ($endIdx -eq -1) { break }
        
        $fullHtml = $Html.Substring($slideStart, $endIdx - $slideStart)
        $pubId = 0
        if ($fullHtml -match 'data-slide-public-id="(\d+)"') { $pubId = [int]$Matches[1] }
        
        $result += @{
            FullHtml  = $fullHtml
            StartIdx  = $svgEnd + $searchFrom
            EndIdx    = $svgEnd + $endIdx - $slideStart
            PublicId  = $pubId
        }
        $searchFrom += ($endIdx - $slideStart)
    }
    $result
}

$slides = Get-Slides $slidesArea
Write-Host "  Found $($slides.Count) slides in galeria"

if ($slides.Count -lt 3) { Write-Error "GALERIA: Expected at least 3 slides in slider-4"; exit 1 }

# Identify which slide is which by content
$slidePresentes5 = $null
$slidePresentes768 = $null
$slideVenezuela = $null

foreach ($s in $slides) {
    if ($s.PublicId -eq 1) { $slidePresentes5 = $s }
    elseif ($s.PublicId -eq 2) { 
        # public-id=2 is Venezuela (portada-venezuela)
        $slideVenezuela = $s
    }
    elseif ($s.PublicId -eq 3) { 
        # public-id=3 is Presentes768
        $slidePresentes768 = $s
    }
}

if (-not $slidePresentes5 -or -not $slidePresentes768 -or -not $slideVenezuela) {
    Write-Error "GALERIA: Could not identify all slides"
    exit 1
}

# Create Eolica slide (clone Presentes768 which has COTIZA AQUI button)
$slideEolicaHtml = $slidePresentes768.FullHtml
$slideEolicaHtml = $slideEolicaHtml -replace 'data-slide-public-id="3"', 'data-slide-public-id="3"'
$slideEolicaHtml = $slideEolicaHtml -replace 'data-slide-public-id="\d+"', 'data-slide-public-id="3"'

# Create new data-id for Eolica
$eolicaDataId = 1001
$slideEolicaHtml = $slideEolicaHtml -replace 'data-id="999"', "data-id=`"$eolicaDataId`""
$slideEolicaHtml = $slideEolicaHtml -replace 'n2-ss-slide-999\b', "n2-ss-slide-$eolicaDataId"

# Remove data-first attribute
$slideEolicaHtml = $slideEolicaHtml -replace '\s*data-first="[^"]*"', ''

# Update slide title
$slideEolicaHtml = $slideEolicaHtml -replace 'data-title="[^"]*"', 'data-title="Soluciones Eólicas"'

# Replace all n-uc-XXXXX class names with new random ones
$slideEolicaHtml = Replace-NucClasses $slideEolicaHtml

# Now renumber existing slides:
# Presentes768 (was public-id=3) becomes public-id=2
$slidePresentes768New = $slidePresentes768.FullHtml
$slidePresentes768New = $slidePresentes768New -replace 'data-slide-public-id="3"', 'data-slide-public-id="2"'

# Venezuela (was public-id=2) becomes public-id=4
$slideVenezuelaNew = $slideVenezuela.FullHtml
$slideVenezuelaNew = $slideVenezuelaNew -replace 'data-slide-public-id="2"', 'data-slide-public-id="4"'

# Build new slides area
$newSlidesHtml = $slidePresentes5.FullHtml + $slidePresentes768New + $slideEolicaHtml + $slideVenezuelaNew

# Replace the slides area in the content
$galContent = $galContent.Substring(0, $svgEnd) + $newSlidesHtml + $galContent.Substring($endSlidesIdx)

# Save
Set-Content -Path $GaleriaPath -Value $galContent -NoNewline
Write-Host "  [+ Added Eolica slide (data-id=$eolicaDataId) to galeria]" -ForegroundColor Green
Write-Host "  [SAVED GALERIA]" -ForegroundColor Green

Write-Host "`n=== DONE ===" -ForegroundColor Cyan
