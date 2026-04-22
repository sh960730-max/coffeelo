$ErrorActionPreference = "Stop"
$pptxPath = "C:\SMARTECOSYS\pptx_build\output4.pptx"

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $ppt.Presentations.Open($pptxPath, $false, $false, $false)

$s18 = $pres.Slides.Item(18)
foreach ($sh in $s18.Shapes) {
    if ($sh.HasTable -eq -1) {
        Write-Host "Found table. Type=$($sh.Type)"
        # Try multiple ways to remove outline
        try {
            $sh.Line.ForeColor.RGB = 16777215  # white
            Write-Host "Set line color white"
        } catch { Write-Host "Line.ForeColor failed: $_" }
        try {
            $sh.Line.Weight = 0.01
            Write-Host "Set line weight 0"
        } catch { Write-Host "Line.Weight failed: $_" }
        try {
            $sh.Line.Transparency = 1.0
            Write-Host "Set line transparent"
        } catch { Write-Host "Line.Transparency failed: $_" }

        # Iterate all cells and remove their outer borders explicitly
        $tbl = $sh.Table
        $rows = $tbl.Rows.Count
        $cols = $tbl.Columns.Count
        for ($r = 1; $r -le $rows; $r++) {
            for ($c = 1; $c -le $cols; $c++) {
                $cell = $tbl.Cell($r, $c)
                for ($bi = 1; $bi -le 4; $bi++) {
                    try {
                        $b = $cell.Borders.Item($bi)
                        $b.ForeColor.RGB = 16777215  # white, basically invisible on white slide
                        # Then reset with our border color
                        $b.ForeColor.RGB = (229 + 231*256 + 235*65536)
                        $b.Weight = 0.5
                    } catch {}
                }
            }
        }

        break
    }
}

$pres.Save()
$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
Write-Host "Done"
