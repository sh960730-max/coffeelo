$ErrorActionPreference = "Stop"
$pptxPath = "C:\SMARTECOSYS\pptx_build\source4.pptx"
$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $ppt.Presentations.Open($pptxPath, $true, $false, $false)

$targets = @(3, 9, 10, 14, 15, 16, 18)
foreach ($n in $targets) {
    $slide = $pres.Slides.Item($n)
    Write-Host "`n===== SLIDE $n (Shapes: $($slide.Shapes.Count)) ====="
    $si = 1
    foreach ($shape in $slide.Shapes) {
        $t = ""
        if ($shape.HasTextFrame -eq -1 -and $shape.TextFrame.HasText -eq -1) {
            $t = $shape.TextFrame.TextRange.Text.Substring(0, [Math]::Min(60, $shape.TextFrame.TextRange.Text.Length)).Replace("`r`n", " | ").Replace("`n", " | ")
        }
        Write-Host ("  [{0}] Type={1} Name={2} L={3:F0} T={4:F0} W={5:F0} H={6:F0} | {7}" -f $si, $shape.Type, $shape.Name, $shape.Left, $shape.Top, $shape.Width, $shape.Height, $t)
        $si++
    }
}
$pres.Close(); $ppt.Quit()
