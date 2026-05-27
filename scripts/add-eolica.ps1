$idxPath = "C:\Users\Usuario\Documents\GitHub\web-.ve\frontend\public\index.html"
$galPath = "C:\Users\Usuario\Documents\GitHub\web-.ve\frontend\public\galeria\index.html"

function New-RandStr($len=11) {
    -join ((1..$len) | % { 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[(Get-Random -Max 62)] })
}

function Replace-NucClasses($html) {
    $classes = [regex]::Matches($html, 'n-uc-[a-zA-Z0-9]+').Value | Sort -Unique
    $map = @{}
    $classes | Sort Length -Desc | % { $map[$_] = "n-uc-$($(New-RandStr))" }
    foreach ($old in $map.Keys) { $html = $html -replace [regex]::Escape($old), $map[$old] }
    $html
}

function Process-File($path, $mode) {
    Write-Host "=== $mode ===" -ForegroundColor Cyan
    $c = Get-Content $path -Raw
    
    # Find backgrounds container
    $bgC = $c.IndexOf('n2-ss-slide-backgrounds n2-ow-all')
    $bgD = $c.LastIndexOf('<div', $bgC)
    # Find first slider-4 HTML element after backgrounds
    $s4Marker = '<div class="n2-ss-slider-4 n2-ow"'
    $s4Pos = $c.IndexOf($s4Marker, $bgC)
    # Backgrounds container ends here
    $bgEnd = $c.IndexOf('</div>', $c.LastIndexOf('</div>', $s4Pos - 1)) + 6
    
    # Extract backgrounds
    $bgs = @(); $pos = $bgD
    while ($pos -lt $bgEnd) {
        $bs = $c.IndexOf('<div class="n2-ss-slide-background"', $pos)
        if ($bs -eq -1 -or $bs -ge $bgEnd) { break }
        $sub = $c.Substring($bs); $d=0; $be=-1
        for ($i=0; $i -lt $sub.Length -and ($bs+$i) -le $bgEnd; $i++) {
            if ($sub[$i] -eq '<') {
                $r = $sub.Substring($i)
                if ($r -match '^</div>') { if ($d -eq 0) { $be = $bs+$i+6; break } $d--; $i+=5 }
                elseif ($r -match '^<div[>\s]') { $d++; $i+=3 }
                elseif ($i+1 -lt $sub.Length -and $sub[$i+1] -match '[a-zA-Z]') { $i++; while ($i -lt $sub.Length -and $sub[$i] -ne '>') { $i++ } }
            }
        }
        if ($be -eq -1) { break }
        $pid = if ($c.Substring($bs, $be-$bs) -match 'data-public-id="(\d+)"') { [int]$Matches[1] } else { 0 }
        $bgs += @{ H = $c.Substring($bs,$be-$bs); S=$bs; E=$be; P=$pid }
        $pos = $be
    }
    Write-Host "  BGs: $($bgs.Count) IDs: $($bgs.P -join ',')"
    
    # Extract slides within slider-4
    $s4DivStart = $s4Pos
    $svgEnd = $c.IndexOf('</svg>', $s4DivStart) + 6
    $controlsPos = $c.IndexOf('n2-ss-slider-controls', $s4DivStart)
    
    $slides = @(); $pos = $svgEnd
    while ($pos -lt $controlsPos) {
        $ss = $c.IndexOf('<div data-', $pos)
        if ($ss -eq -1 -or $ss -ge $controlsPos) { break }
        $sub = $c.Substring($ss); $d=0; $se=-1
        for ($i=0; $i -lt $sub.Length -and ($ss+$i) -le $controlsPos; $i++) {
            if ($sub[$i] -eq '<') {
                $r = $sub.Substring($i)
                if ($r -match '^</div>') { if ($d -eq 0) { $se = $ss+$i+6; break } $d--; $i+=5 }
                elseif ($r -match '^<div[>\s]') { $d++; $i+=3 }
                elseif ($i+1 -lt $sub.Length -and $sub[$i+1] -match '[a-zA-Z]') { $i++; while ($i -lt $sub.Length -and $sub[$i] -ne '>') { $i++ } }
            }
        }
        if ($se -eq -1) { break }
        $pid = if ($c.Substring($ss,$se-$ss) -match 'data-slide-public-id="(\d+)"') { [int]$Matches[1] } else { 0 }
        $slides += @{ H = $c.Substring($ss,$se-$ss); S=$ss; E=$se; P=$pid }
        $pos = $se
    }
    Write-Host "  Slides: $($slides.Count) IDs: $($slides.P -join ',')"
    
    if ($mode -eq 'index') {
        # Add Eolica as 3rd BG
        $newBg = $bgs[1].H -replace 'data-public-id="2"','data-public-id="3"' -replace 'Presentes768\.png','Eolica.png' -replace 'alt="[^"]*"','alt="Soluciones Eólicas SIM Energy"'
        $c = $c.Substring(0,$bgs[1].E) + $newBg + $c.Substring($bgs[1].E)
        
        # Add Eolica as 3rd slide (clone slide 2)
        $newSl = $slides[1].H -replace 'data-slide-public-id="2"','data-slide-public-id="3"' -replace 'data-id="73"','data-id="1000"' -replace 'n2-ss-slide-73\b','n2-ss-slide-1000' -replace '\s*data-first="[^"]*"',''
        $newSl = Replace-NucClasses $newSl
        $c = $c.Substring(0,$slides[1].E) + $newSl + $c.Substring($slides[1].E)
        Write-Host "  Added Eolica as slide 3" -ForegroundColor Green
    }
    elseif ($mode -eq 'galeria') {
        # Identify slides: [0]=pub1(Presentes5), [1]=pub3(Presentes768), [2]=pub2(Venezuela)
        $s5 = $slides | ? P -eq 1
        $s768 = $slides | ? P -eq 3
        $sVen = $slides | ? P -eq 2
        
        # Create new Eolica slide from Presentes768
        $sEolH = $s768.H -replace 'data-slide-public-id="3"','data-slide-public-id="3"' -replace 'data-id="999"','data-id="1001"' -replace 'n2-ss-slide-999\b','n2-ss-slide-1001'
        $sEolH = Replace-NucClasses $sEolH
        
        # Build new backgrounds order
        $bg768New = $bgs[2].H -replace 'data-public-id="3"','data-public-id="2"'
        $bgVenNew = $bgs[1].H -replace 'data-public-id="2"','data-public-id="4"'
        $bgEolNew = $bgs[2].H -replace 'data-public-id="3"','data-public-id="3"' -replace 'Presentes768\.png','Eolica.png' -replace 'alt="[^"]*"','alt="Soluciones Eólicas SIM Energy"'
        $newBgs = $bgs[0].H + $bg768New + $bgEolNew + $bgVenNew
        $c = $c.Substring(0,$bgs[0].S) + $newBgs + $c.Substring($bgs[$bgs.Count-1].E)
        
        # Build new slides order
        $s768New = $s768.H -replace 'data-slide-public-id="3"','data-slide-public-id="2"'
        $sVenNew = $sVen.H -replace 'data-slide-public-id="2"','data-slide-public-id="4"'
        $newSlides = $s5.H + $s768New + $sEolH + $sVenNew
        $c = $c.Substring(0,$slides[0].S) + $newSlides + $c.Substring($slides[$slides.Count-1].E)
        Write-Host "  Reordered: 5, 768?2, Eolica?3, Venezuela?4" -ForegroundColor Green
    }
    
    Set-Content $path $c -NoNewline
    Write-Host "$mode DONE" -ForegroundColor Green
}

Process-File $idxPath 'index'
Process-File $galPath 'galeria'
