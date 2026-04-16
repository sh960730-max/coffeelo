$ErrorActionPreference = "Stop"
$pptxPath = "C:\SMARTECOSYS\pptx_build\output2.pptx"
$outDir = "C:\SMARTECOSYS\pptx_build\out2"
if (Test-Path $outDir) { Remove-Item "$outDir\*" -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $ppt.Presentations.Open($pptxPath, $true, $false, $false)
$i = 1
foreach ($slide in $pres.Slides) {
    $name = "slide-{0:D2}.png" -f $i
    $slide.Export((Join-Path $outDir $name), "PNG", 1600, 900)
    $i++
}
$pres.Close()
$ppt.Quit()
