$ErrorActionPreference = "Stop"
$pptxPath = "C:\SMARTECOSYS\pptx_build\source4.pptx"
$outDir = "C:\SMARTECOSYS\pptx_build\s4_slides"
if (Test-Path $outDir) { Remove-Item "$outDir\*" -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $ppt.Presentations.Open($pptxPath, $true, $false, $false)
$sw = $pres.PageSetup.SlideWidth
$sh = $pres.PageSetup.SlideHeight
Write-Host "SLIDES: $($pres.Slides.Count)  SIZE: ${sw}x${sh}"

$i = 1
foreach ($slide in $pres.Slides) {
    $slide.Export((Join-Path $outDir ("slide-{0:D2}.png" -f $i)), "PNG", 1600, 900)
    $i++
}
$pres.Close(); $ppt.Quit()
Write-Host "DONE"
