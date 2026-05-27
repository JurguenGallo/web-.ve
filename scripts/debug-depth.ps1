param([string]$Path = "C:\Users\Usuario\Documents\GitHub\web-.ve\frontend\public\index.html")
$html = Get-Content -Raw $Path

$bgContainerPos = $html.IndexOf('n2-ss-slide-backgrounds n2-ow-all')
$bgDivStart = $html.LastIndexOf('<div', $bgContainerPos)
$s4Marker = '<div class="n2-ss-slider-4 n2-ow"'
$s4Pos = $html.IndexOf($s4Marker, $bgContainerPos)
$lastClosure = $html.LastIndexOf('</div>', $s4Pos - 1)
$bgEnd = $lastClosure + 6

Write-Host "bgDivStart=$bgDivStart s4Pos=$s4Pos bgEnd=$bgEnd"

$sub = $html.Substring($bgDivStart, $bgEnd - $bgDivStart)

$firstBgMarker = '<div class="n2-ss-slide-background"'
$firstBgPos = $sub.IndexOf($firstBgMarker)
Write-Host "First background at offset: $firstBgPos"

# For each character at position <, print what tag it is
$sub2 = $sub.Substring($firstBgPos)
Write-Host "sub2 length: " $sub2.Length

# Find all div-related tags
$depth = 0
$foundAt = -1
$events = @()

for ($idx = 0; $idx -lt $sub2.Length - 6 -and $idx -lt 5000; $idx++) {
    if ($sub2[$idx] -eq '<') {
        # Check closing div
        $isCloseDiv = ($sub2[$idx+1] -eq '/' -and $sub2[$idx+2] -eq 'd' -and $sub2[$idx+3] -eq 'i' -and $sub2[$idx+4] -eq 'v' -and $sub2[$idx+5] -eq '>')
        
        if ($isCloseDiv) {
            if ($depth -eq 0) { 
                $foundAt = $idx + 6
                break
            }
            $depth--
            $idx += 5
        }
        elseif ($sub2[$idx+1] -eq 'd' -and $sub2[$idx+2] -eq 'i' -and $sub2[$idx+3] -eq 'v' -and ($sub2[$idx+4] -eq '>' -or [char]::IsWhiteSpace($sub2[$idx+4]) -or $sub2[$idx+4] -eq '-')) {
            $depth++
            $idx += 3
        }
        else {
            $c = $idx + 1
            while ($c -lt $sub2.Length -and $sub2[$c] -ne '>') { $c++ }
            if ($c -lt $sub2.Length) { $idx = $c }
        }
    }
}

Write-Host "foundAt=$foundAt depth=$depth"

# Show the </div> positions
Write-Host "`nAll </div> positions in sub2:"
for ($dx = 0; $dx -lt $sub2.Length - 6; $dx++) {
    if ($sub2[$dx] -eq '<' -and $sub2[$dx+1] -eq '/' -and $sub2[$dx+2] -eq 'd' -and $sub2[$dx+3] -eq 'i' -and $sub2[$dx+4] -eq 'v' -and $sub2[$dx+5] -eq '>') {
        Write-Host "  </div> at offset $dx"
    }
}
