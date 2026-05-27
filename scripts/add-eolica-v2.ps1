param(
    [string]$IndexPath = "C:\Users\Usuario\Documents\GitHub\web-.ve\frontend\public\index.html",
    [string]$GaleriaPath = "C:\Users\Usuario\Documents\GitHub\web-.ve\frontend\public\galeria\index.html"
)

function New-RandStr {
    param([int]$Length = 11)
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum 62)] })
}

function Replace-NucClasses {
    param([string]$Html)
    $matches = [regex]::Matches($Html, 'n-uc-[a-zA-Z0-9]+')
    $classes = @{}
    foreach ($m in $matches) { $classes[$m.Value] = $true }
    $map = @{}
    foreach ($c in $classes.Keys) { $map[$c] = "n-uc-$($(New-RandStr 11))" }
    $sorted = $map.Keys | Sort-Object Length -Descending
    $result = $Html
    foreach ($old in $sorted) { $result = $result -replace [regex]::Escape($old), $map[$old] }
    return $result
}

function Extract-Bgs {
    param([string]$Html, [int]$Start, [int]$End)
    $result = @()
    $pos = $Start
    while ($pos -lt $End) {
        $bs = $Html.IndexOf('<div class="n2-ss-slide-background"', $pos)
        if ($bs -eq -1 -or $bs -ge $End) { break }
        
        # Count div depth from this position
        $depth = 0
        $be = -1
        for ($i = $bs; $i -lt $Html.Length -and $i -le $End + 5000; $i++) {
            $ch = $Html[$i]
            if ($ch -eq '<') {
                # Check if this is a closing tag
                if ($i + 5 -lt $Html.Length -and $Html[$i+1] -eq '/' -and $Html[$i+2] -eq 'd' -and $Html[$i+3] -eq 'i' -and $Html[$i+4] -eq 'v' -and ($Html[$i+5] -eq '>' -or [char]::IsWhiteSpace($Html[$i+5]))) {
                    # </div>
                    if ($depth -eq 0) { $be = $i + 6; break }
                    $depth--
                    $i += 5
                }
                elseif ($i + 3 -lt $Html.Length -and $Html[$i+1] -eq 'd' -and $Html[$i+2] -eq 'i' -and $Html[$i+3] -eq 'v' -and ($Html[$i+4] -eq '>' -or [char]::IsWhiteSpace($Html[$i+4]) -or $Html[$i+4] -eq '-' -or $Html[$i+4] -eq ':')) {
                    # <div ...> or <div> or <div-... or <div:...
                    # Check it's not </div (already handled above)
                    if ($Html[$i+1] -ne '/') {
                        $depth++
                        $i += 3
                    }
                }
                else {
                    # Any other tag - skip to end
                    $ci = $i + 1
                    while ($ci -lt $Html.Length -and $Html[$ci] -ne '>') { $ci++ }
                    if ($ci -lt $Html.Length) { $i = $ci }
                }
            }
        }
        if ($be -eq -1) { break }
        
        $item = New-Object PSObject -Property @{
            Html = $Html.Substring($bs, $be - $bs)
            Start = $bs
            End = $be
            PublicId = 0
        }
        $idMatch = [regex]::Match($Html.Substring($bs, $be - $bs), 'data-public-id="(\d+)"')
        if ($idMatch.Success) { $item.PublicId = [int]$idMatch.Groups[1].Value }
        
        $result += $item
        $pos = $be
    }
    return $result
}

function Extract-Slides {
    param([string]$Html, [int]$Start, [int]$End)
    $result = @()
    $pos = $Start
    while ($pos -lt $End) {
        $ss = $Html.IndexOf('<div data-', $pos)
        if ($ss -eq -1 -or $ss -ge $End) { break }
        
        $depth = 0
        $se = -1
        for ($i = $ss; $i -lt $Html.Length -and $i -le $End + 5000; $i++) {
            $ch = $Html[$i]
            if ($ch -eq '<') {
                if ($i + 5 -lt $Html.Length -and $Html[$i+1] -eq '/' -and $Html[$i+2] -eq 'd' -and $Html[$i+3] -eq 'i' -and $Html[$i+4] -eq 'v' -and ($Html[$i+5] -eq '>' -or [char]::IsWhiteSpace($Html[$i+5]))) {
                    if ($depth -eq 0) { $se = $i + 6; break }
                    $depth--
                    $i += 5
                }
                elseif ($i + 3 -lt $Html.Length -and $Html[$i+1] -eq 'd' -and $Html[$i+2] -eq 'i' -and $Html[$i+3] -eq 'v' -and ($Html[$i+4] -eq '>' -or [char]::IsWhiteSpace($Html[$i+4]) -or $Html[$i+4] -eq '-' -or $Html[$i+4] -eq ':')) {
                    if ($Html[$i+1] -ne '/') {
                        $depth++
                        $i += 3
                    }
                }
                else {
                    $ci = $i + 1
                    while ($ci -lt $Html.Length -and $Html[$ci] -ne '>') { $ci++ }
                    if ($ci -lt $Html.Length) { $i = $ci }
                }
            }
        }
        if ($se -eq -1) { break }
        
        $item = New-Object PSObject -Property @{
            Html = $Html.Substring($ss, $se - $ss)
            Start = $ss
            End = $se
            PublicId = 0
        }
        $idMatch = [regex]::Match($Html.Substring($ss, $se - $ss), 'data-slide-public-id="(\d+)"')
        if ($idMatch.Success) { $item.PublicId = [int]$idMatch.Groups[1].Value }
        
        $result += $item
        $pos = $se
    }
    return $result
}

function Process-File {
    param([string]$Path, [string]$Mode)
    
    Write-Host "=== Processing $Mode ===" -ForegroundColor Cyan
    $html = Get-Content -Path $Path -Raw
    
    # Locate main slider sections
    $bgContainerPos = $html.IndexOf('n2-ss-slide-backgrounds n2-ow-all')
    $bgDivStart = $html.LastIndexOf('<div', $bgContainerPos)
    $s4Marker = '<div class="n2-ss-slider-4 n2-ow"'
    $s4Pos = $html.IndexOf($s4Marker, $bgContainerPos)
    $lastClosure = $html.LastIndexOf('</div>', $s4Pos - 1)
    $bgEnd = $lastClosure + 6
    
    Write-Host "  Range: BgDivStart=$bgDivStart BgEnd=$bgEnd S4Pos=$s4Pos"
    
    # Extract backgrounds within range
    $bgs = Extract-Bgs -Html $html -Start $bgDivStart -End $bgEnd
    Write-Host "  Found $($bgs.Count) backgrounds"
    foreach ($bg in $bgs) { Write-Host "    ID=$($bg.PublicId) at $($bg.Start)-$($bg.End)" }
    
    if ($bgs.Count -lt 2 -and $Mode -eq 'index') { Write-Error "Expected 2+ backgrounds in index, found $($bgs.Count)"; exit 1 }
    if ($bgs.Count -lt 3 -and $Mode -eq 'galeria') { Write-Error "Expected 3+ backgrounds in galeria, found $($bgs.Count)"; exit 1 }
    
    # Extract slides
    $s4DivStart = $s4Pos
    $svgEnd = $html.IndexOf('</svg>', $s4DivStart) + 6
    $controlsPos = $html.IndexOf('n2-ss-slider-controls', $s4DivStart)
    if ($controlsPos -eq -1) { $controlsPos = $html.IndexOf('</div></div></div></div>', $s4DivStart) + 24 }
    
    $slides = Extract-Slides -Html $html -Start $svgEnd -End $controlsPos
    Write-Host "  Found $($slides.Count) slides"
    foreach ($sl in $slides) { Write-Host "    ID=$($sl.PublicId) at $($sl.Start)-$($sl.End)" }
    
    if ($slides.Count -lt 2 -and $Mode -eq 'index') { Write-Error "Expected 2+ slides in index, found $($slides.Count)"; exit 1 }
    if ($slides.Count -lt 3 -and $Mode -eq 'galeria') { Write-Error "Expected 3+ slides in galeria, found $($slides.Count)"; exit 1 }
    
    # ===== Modify content =====
    if ($Mode -eq 'index') {
        # Add Eolica as 3rd background (clone background 2)
        $newBgHtml = $bgs[1].Html -replace 'data-public-id="2"', 'data-public-id="3"'
        $newBgHtml = $newBgHtml -replace 'Presentes768\.png', 'Eolica.png'
        $newBgHtml = $newBgHtml -replace 'alt="[^"]*"', 'alt="Soluciones Eólicas SIM Energy"'
        $html = $html.Substring(0, $bgs[1].End) + $newBgHtml + $html.Substring($bgs[1].End)
        
        # Add Eolica as 3rd slide (clone slide 2)
        $newSlideHtml = $slides[1].Html -replace 'data-slide-public-id="2"', 'data-slide-public-id="3"'
        $newSlideHtml = $newSlideHtml -replace 'data-id="73"', 'data-id="1000"'
        $newSlideHtml = $newSlideHtml -replace 'n2-ss-slide-73\b', 'n2-ss-slide-1000'
        $newSlideHtml = $newSlideHtml -replace '\s*data-first="[^"]*"', ''
        $newSlideHtml = Replace-NucClasses -Html $newSlideHtml
        $html = $html.Substring(0, $slides[1].End) + $newSlideHtml + $html.Substring($slides[1].End)
        
        Write-Host "  [OK] Added Eolica as slide 3" -ForegroundColor Green
    }
    elseif ($Mode -eq 'galeria') {
        # Identify slides by public ID
        $s1 = $slides | Where-Object { $_.PublicId -eq 1 }
        $s2 = $slides | Where-Object { $_.PublicId -eq 2 }
        $s3 = $slides | Where-Object { $_.PublicId -eq 3 }
        $b1 = $bgs | Where-Object { $_.PublicId -eq 1 }
        $b2 = $bgs | Where-Object { $_.PublicId -eq 2 }
        $b3 = $bgs | Where-Object { $_.PublicId -eq 3 }
        
        if (-not $s1 -or -not $s2 -or -not $s3) { Write-Error "Cannot identify all slides by ID"; exit 1 }
        
        # Build new background order: 1(Presentes5), 3(Presentes768)?2, Eolica?3, 2(Venezuela)?4
        $bg768New = $b3.Html -replace 'data-public-id="3"', 'data-public-id="2"'
        $bgVenNew = $b2.Html -replace 'data-public-id="2"', 'data-public-id="4"'
        $bgEolNew = $b3.Html -replace 'data-public-id="3"', 'data-public-id="3"' -replace 'Presentes768\.png', 'Eolica.png' -replace 'alt="[^"]*"', 'alt="Soluciones Eólicas SIM Energy"'
        $newBgsHtml = $b1.Html + $bg768New + $bgEolNew + $bgVenNew
        $html = $html.Substring(0, $b1.Start) + $newBgsHtml + $html.Substring($b3.End)
        
        # Build new slide order
        $s768New = $s3.Html -replace 'data-slide-public-id="3"', 'data-slide-public-id="2"'
        $sVenNew = $s2.Html -replace 'data-slide-public-id="2"', 'data-slide-public-id="4"'
        $sEolHtml = $s3.Html -replace 'data-slide-public-id="3"', 'data-slide-public-id="3"'
        $sEolHtml = $sEolHtml -replace 'data-id="999"', 'data-id="1001"'
        $sEolHtml = $sEolHtml -replace 'n2-ss-slide-999\b', 'n2-ss-slide-1001'
        $sEolHtml = Replace-NucClasses -Html $sEolHtml
        
        $newSlidesHtml = $s1.Html + $s768New + $sEolHtml + $sVenNew
        
        # Find slide area to replace
        $firstSlideStart = $slides[0].Start
        $lastSlideEnd = $slides[$slides.Count-1].End
        $html = $html.Substring(0, $firstSlideStart) + $newSlidesHtml + $html.Substring($lastSlideEnd)
        
        Write-Host "  [OK] Reordered: 1(Presentes5), 2(Presentes768), 3(Eolica), 4(Venezuela)" -ForegroundColor Green
    }
    
    Set-Content -Path $Path -Value $html -NoNewline
    Write-Host "$Mode DONE" -ForegroundColor Green
}

Process-File -Path $IndexPath -Mode 'index'
Process-File -Path $GaleriaPath -Mode 'galeria'
Write-Host "`nAll done!" -ForegroundColor Cyan
