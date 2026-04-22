$ErrorActionPreference = "Stop"
$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $ppt.Presentations.Open("C:\SMARTECOSYS\pptx_build\output4.pptx", $true, $false, $false)
foreach ($n in @(14, 15, 16, 18)) {
    $s = $pres.Slides.Item($n)
    foreach ($sh in $s.Shapes) {
        if ($sh.HasTable -eq -1) {
            Write-Host "Slide ${n}: Rows=$($sh.Table.Rows.Count) Cols=$($sh.Table.Columns.Count)"
            for ($r = 1; $r -le $sh.Table.Rows.Count; $r++) {
                $c1 = $sh.Table.Cell($r, 1).Shape.TextFrame.TextRange.Text
                $c2 = ""
                if ($sh.Table.Columns.Count -ge 2) { $c2 = $sh.Table.Cell($r, 2).Shape.TextFrame.TextRange.Text }
                $len1 = $c1.Length
                $len2 = $c2.Length
                $h1 = if ($len1 -gt 0) { [int][char]$c1[0] } else { 0 }
                $h2 = if ($len2 -gt 0) { [int][char]$c2[0] } else { 0 }
                Write-Host ("  R{0}: c1_len={1} c1_h0={2:X} | c2_len={3} c2_h0={4:X}" -f $r, $len1, $h1, $len2, $h2)
            }
            break
        }
    }
}
$pres.Close(); $ppt.Quit()
