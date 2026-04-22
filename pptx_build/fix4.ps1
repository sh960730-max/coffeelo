$ErrorActionPreference = "Stop"
$pptxSrc = "C:\SMARTECOSYS\pptx_build\source4.pptx"
$pptxOut = "C:\SMARTECOSYS\pptx_build\output4.pptx"
Copy-Item $pptxSrc $pptxOut -Force

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $ppt.Presentations.Open($pptxOut, $false, $false, $false)

# Colors (RGB values in VBA = R + G*256 + B*65536)
$GREEN    = 16 + 185*256 + 129*65536    # #10B981
$DARK     = 31 + 41*256 + 55*65536      # #1F2937
$LIGHT    = 156 + 163*256 + 175*65536   # #9CA3AF

function Copy-TemplateElements($targetSlide, [string[]]$names) {
    # Copy shapes from slide 3 by name
    $srcSlide = $pres.Slides.Item(3)
    foreach ($nm in $names) {
        foreach ($sh in $srcSlide.Shapes) {
            if ($sh.Name -eq $nm) {
                $sh.Copy()
                [void]$targetSlide.Shapes.Paste()
                break
            }
        }
    }
}

function Add-LeftAccentBar($slide) {
    # Check if already has left accent bar (width <= 15 and height >= 500 at L=0)
    $hasBar = $false
    foreach ($sh in $slide.Shapes) {
        if ($sh.Left -lt 5 -and $sh.Width -lt 20 -and $sh.Height -gt 500) {
            $hasBar = $true; break
        }
    }
    if ($hasBar) { return }

    # 1 = msoShapeRectangle
    $bar = $slide.Shapes.AddShape(1, 0, 0, 13, 540)
    $bar.Fill.ForeColor.RGB = $GREEN
    $bar.Fill.Solid()
    $bar.Line.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse
    # send to back so it doesn't cover other elements
    $bar.ZOrder(1)  # msoSendToBack = 1
}

function Add-BrandText($slide) {
    # 43, 22, 288, 25
    $tx = $slide.Shapes.AddTextbox(1, 43, 22, 288, 25)
    $tx.TextFrame.TextRange.Text = "SMARTECOSYS"
    $tx.TextFrame.TextRange.Font.Size = 14
    $tx.TextFrame.TextRange.Font.Bold = $true
    $tx.TextFrame.TextRange.Font.Color.RGB = $DARK
    $tx.TextFrame.MarginLeft = 0
    $tx.TextFrame.MarginTop = 0
}

function Add-PageNumber($slide, $num) {
    # remove existing page number near bottom-right (L ~ 920, T ~ 513) to avoid duplicates
    $remove = @()
    foreach ($sh in $slide.Shapes) {
        if ($sh.Left -gt 860 -and $sh.Top -gt 505 -and $sh.Width -lt 80 -and $sh.Height -lt 25) {
            # could be line or number
            $remove += $sh
        }
    }
    foreach ($sh in $remove) { $sh.Delete() }

    # green line (30 x 3)
    $line = $slide.Shapes.AddShape(1, 884, 518, 30, 3)
    $line.Fill.ForeColor.RGB = $GREEN
    $line.Fill.Solid()
    $line.Line.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse

    # page number text
    $tx = $slide.Shapes.AddTextbox(1, 915, 508, 30, 20)
    $tx.TextFrame.TextRange.Text = [string]$num
    $tx.TextFrame.TextRange.Font.Size = 9
    $tx.TextFrame.TextRange.Font.Color.RGB = $LIGHT
    $tx.TextFrame.MarginLeft = 0
    $tx.TextFrame.MarginTop = 0
}

function Remove-SmartEcoSysBrand($slide) {
    # Remove Image 3 (leaf) + Text 10 ("Smart EcoSys")
    $remove = @()
    foreach ($sh in $slide.Shapes) {
        if ($sh.HasTextFrame -eq -1 -and $sh.TextFrame.HasText -eq -1) {
            $t = $sh.TextFrame.TextRange.Text.Trim()
            if ($t -eq "Smart EcoSys") { $remove += $sh; continue }
        }
        # leaf icon near brand position (L ~48, T ~27, small size)
        if ($sh.Type -eq 13 -and $sh.Left -lt 80 -and $sh.Top -lt 50 -and $sh.Width -lt 30) {
            $remove += $sh
        }
    }
    foreach ($sh in $remove) { $sh.Delete() }
}

function Remove-TableColumn($slide, $tableShapeIdx, $colIdxFromEnd) {
    # $colIdxFromEnd: 1 means last column, 2 means last two columns etc.
    $shapeIdx = 0
    foreach ($sh in $slide.Shapes) {
        $shapeIdx++
        if ($sh.HasTable -eq -1) {
            if ($tableShapeIdx -eq 0 -or $shapeIdx -eq $tableShapeIdx) {
                $total = $sh.Table.Columns.Count
                for ($i = 0; $i -lt $colIdxFromEnd; $i++) {
                    $sh.Table.Columns.Item($sh.Table.Columns.Count).Delete()
                }
                return
            }
        }
    }
}

# ============================================================
# SLIDE 9: 좌측 바 + 페이지 번호 "13" → "9" 수정
# ============================================================
$s9 = $pres.Slides.Item(9)
Add-LeftAccentBar $s9
# Fix existing page number "13" to "9"
foreach ($sh in $s9.Shapes) {
    if ($sh.HasTextFrame -eq -1 -and $sh.TextFrame.HasText -eq -1) {
        $t = $sh.TextFrame.TextRange.Text.Trim()
        if ($t -eq "13") { $sh.TextFrame.TextRange.Text = "9" }
    }
}
Write-Host "Slide 9: Done"

# ============================================================
# SLIDE 10: 좌측 바 + 페이지 번호 추가
# ============================================================
$s10 = $pres.Slides.Item(10)
Add-LeftAccentBar $s10
Add-PageNumber $s10 10
Write-Host "Slide 10: Done"

# ============================================================
# SLIDE 14: 좌측 바 + 페이지 번호 추가
# ============================================================
$s14 = $pres.Slides.Item(14)
Add-LeftAccentBar $s14
Add-PageNumber $s14 14
Write-Host "Slide 14: Done"

# ============================================================
# SLIDE 15: 좌측 바 + Smart EcoSys 제거 + SMARTECOSYS 추가 + 페이지 "19" → "15" + 비고/빈 컬럼 제거
# ============================================================
$s15 = $pres.Slides.Item(15)
Add-LeftAccentBar $s15
Remove-SmartEcoSysBrand $s15
Add-BrandText $s15
# Fix page number "19" → "15"
foreach ($sh in $s15.Shapes) {
    if ($sh.HasTextFrame -eq -1 -and $sh.TextFrame.HasText -eq -1) {
        $t = $sh.TextFrame.TextRange.Text.Trim()
        if ($t -eq "19") { $sh.TextFrame.TextRange.Text = "15" }
    }
}
# Remove last 2 columns (빈 컬럼 + 비고)
Remove-TableColumn $s15 0 2
Write-Host "Slide 15: Done"

# ============================================================
# SLIDE 16: 좌측 바 + Smart EcoSys 제거 + SMARTECOSYS 추가 + 페이지 "20" → "16" + 비고/빈 컬럼 제거
# ============================================================
$s16 = $pres.Slides.Item(16)
Add-LeftAccentBar $s16
Remove-SmartEcoSysBrand $s16
Add-BrandText $s16
foreach ($sh in $s16.Shapes) {
    if ($sh.HasTextFrame -eq -1 -and $sh.TextFrame.HasText -eq -1) {
        $t = $sh.TextFrame.TextRange.Text.Trim()
        if ($t -eq "20") { $sh.TextFrame.TextRange.Text = "16" }
    }
}
Remove-TableColumn $s16 0 2
Write-Host "Slide 16: Done"

# ============================================================
# SLIDE 18: 좌측 바 + 페이지 번호 + 비고 컬럼 제거
# ============================================================
$s18 = $pres.Slides.Item(18)
Add-LeftAccentBar $s18
Add-PageNumber $s18 18
# Remove last column (비고)
Remove-TableColumn $s18 0 1
Write-Host "Slide 18: Done"

$pres.Save()
$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
Write-Host "`n=== ALL DONE ==="
