$ErrorActionPreference = "Stop"
$pptxPath = "C:\SMARTECOSYS\pptx_build\output4.pptx"
$outDir = "C:\SMARTECOSYS\pptx_build\out4"
if (Test-Path $outDir) { Remove-Item "$outDir\*" -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $ppt.Presentations.Open($pptxPath, $true, $false, $false)
$i = 1
foreach ($slide in $pres.Slides) {
    $slide.Export((Join-Path $outDir ("slide-{0:D2}.png" -f $i)), "PNG", 1600, 900)
    $i++
}
$pres.Close(); $ppt.Quit()
Write-Host "DONE"
