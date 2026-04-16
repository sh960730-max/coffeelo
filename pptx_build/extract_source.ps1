$ErrorActionPreference = "Stop"
$pptxPath = "C:\SMARTECOSYS\pptx_build\source.pptx"
$outDir = "C:\SMARTECOSYS\pptx_build\source_slides"
if (Test-Path $outDir) { Remove-Item "$outDir\*" -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $ppt.Presentations.Open($pptxPath, $true, $false, $false)

$slideCount = $pres.Slides.Count
Write-Host "SLIDE_COUNT: $slideCount"
Write-Host "WIDTH: $($pres.PageSetup.SlideWidth) HEIGHT: $($pres.PageSetup.SlideHeight)"

$textOut = "C:\SMARTECOSYS\pptx_build\source_text.txt"
"" | Out-File -FilePath $textOut -Encoding utf8

$i = 1
foreach ($slide in $pres.Slides) {
    $name = "slide-{0:D2}.png" -f $i
    $out = Join-Path $outDir $name
    $slide.Export($out, "PNG", 1280, 720)

    Add-Content -Path $textOut -Value "===== SLIDE $i =====" -Encoding utf8
    foreach ($shape in $slide.Shapes) {
        if ($shape.HasTextFrame -eq -1) {
            if ($shape.TextFrame.HasText -eq -1) {
                $t = $shape.TextFrame.TextRange.Text
                if ($t.Trim().Length -gt 0) { Add-Content -Path $textOut -Value $t -Encoding utf8 }
            }
        }
    }
    Add-Content -Path $textOut -Value "" -Encoding utf8
    Write-Host $out
    $i++
}
$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
