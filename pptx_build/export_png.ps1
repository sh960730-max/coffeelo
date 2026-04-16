$ErrorActionPreference = "Stop"
$pptxPath = "C:\SMARTECOSYS\pptx_build\output.pptx"
$outDir = "C:\SMARTECOSYS\pptx_build\slides"
if (Test-Path $outDir) { Remove-Item "$outDir\*" -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $ppt.Presentations.Open($pptxPath, $true, $false, $false)
$i = 1
foreach ($slide in $pres.Slides) {
    $name = "slide-{0:D2}.png" -f $i
    $out = Join-Path $outDir $name
    $slide.Export($out, "PNG", 1600, 900)
    Write-Host $out
    $i++
}
$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
