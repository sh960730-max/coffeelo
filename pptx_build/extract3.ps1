$ErrorActionPreference = "Stop"
$pptxPath = "C:\SMARTECOSYS\pptx_build\source3.pptx"
$outDir = "C:\SMARTECOSYS\pptx_build\s3_slides"
$imgDir = "C:\SMARTECOSYS\pptx_build\s3_images"
$metaPath = "C:\SMARTECOSYS\pptx_build\s3_meta.json"
$textPath = "C:\SMARTECOSYS\pptx_build\s3_text.txt"

foreach ($d in @($outDir, $imgDir)) {
    if (Test-Path $d) { Remove-Item "$d\*" -Force -ErrorAction SilentlyContinue }
    New-Item -ItemType Directory -Force -Path $d | Out-Null
}

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $ppt.Presentations.Open($pptxPath, $true, $false, $false)

$sw = $pres.PageSetup.SlideWidth
$sh = $pres.PageSetup.SlideHeight
Write-Host "SLIDES: $($pres.Slides.Count)  SIZE: ${sw}x${sh}"

"" | Out-File -FilePath $textPath -Encoding utf8
$slidesData = @()

$si = 1
foreach ($slide in $pres.Slides) {
    # Export PNG
    $slide.Export((Join-Path $outDir ("slide-{0:D2}.png" -f $si)), "PNG", 1600, 900)

    # Extract text
    Add-Content -Path $textPath -Value "===== SLIDE $si =====" -Encoding utf8
    foreach ($shape in $slide.Shapes) {
        if ($shape.HasTextFrame -eq -1 -and $shape.TextFrame.HasText -eq -1) {
            $t = $shape.TextFrame.TextRange.Text
            if ($t.Trim().Length -gt 0) { Add-Content -Path $textPath -Value $t -Encoding utf8 }
        }
    }
    Add-Content -Path $textPath -Value "" -Encoding utf8

    # Extract images
    $shapes = @()
    $pi = 1
    foreach ($shape in $slide.Shapes) {
        if ($shape.Type -eq 13 -or $shape.Type -eq 11) {
            $name = "s${si}_p${pi}.png"
            try {
                $shape.Export((Join-Path $imgDir $name), 2)
                $shapes += @{ file=$name; left=[double]$shape.Left; top=[double]$shape.Top; width=[double]$shape.Width; height=[double]$shape.Height }
                $pi++
            } catch {}
        }
    }
    $slidesData += @{ slide=$si; shapes=$shapes }
    $si++
}

(@{ slideWidth=[double]$sw; slideHeight=[double]$sh; slides=$slidesData } | ConvertTo-Json -Depth 10) | Out-File -FilePath $metaPath -Encoding utf8

$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
Write-Host "DONE"
