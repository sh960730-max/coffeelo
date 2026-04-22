$ErrorActionPreference = "Stop"
$pptxPath = "C:\SMARTECOSYS\pptx_build\output4.pptx"

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $ppt.Presentations.Open($pptxPath, $false, $false, $false)

$GREEN     = 16 + 185*256 + 129*65536
$GREENDRK  = 4 + 120*256 + 87*65536
$GREENSFT  = 236 + 253*256 + 245*65536
$WHITE     = 255 + 255*256 + 255*65536
$DARK      = 31 + 41*256 + 55*65536
$BODY      = 75 + 85*256 + 99*65536
$MUTED     = 107 + 114*256 + 128*65536
$BORDER    = 229 + 231*256 + 235*65536
$ALTROW    = 248 + 250*256 + 252*65536
$YELLOWSFT = 254 + 243*256 + 199*65536

$ppAlignLeft = 1
$ppAlignCenter = 2
$ppAlignRight = 3

function Style-Cell {
    param($cell, $bgColor, $fontColor, $bold, $alignment, $fontSize)
    $cell.Shape.Fill.Solid()
    $cell.Shape.Fill.ForeColor.RGB = $bgColor
    $range = $cell.Shape.TextFrame.TextRange
    $range.Font.Color.RGB = $fontColor
    $range.Font.Bold = [bool]$bold
    if ($fontSize -gt 0) { $range.Font.Size = $fontSize }
    $range.ParagraphFormat.Alignment = $alignment
    for ($bi = 1; $bi -le 4; $bi++) {
        try {
            $b = $cell.Borders.Item($bi)
            $b.ForeColor.RGB = $BORDER
            $b.Weight = 0.5
        } catch {}
    }
}

function Style-Row {
    param($tbl, $r, $cols, $bgColor, $fontColor, $bold, $alignment, $fontSize)
    for ($c = 1; $c -le $cols; $c++) {
        Style-Cell $tbl.Cell($r, $c) $bgColor $fontColor $bold $alignment $fontSize
    }
}

function Get-AltBg {
    param($r)
    if (($r % 2) -eq 0) { return $ALTROW }
    return $WHITE
}

function Remove-RightBgAccent {
    param($slide)
    $removeShapes = @()
    foreach ($sh in $slide.Shapes) {
        $dL = [Math]::Abs($sh.Left - 670)
        $dT = [Math]::Abs($sh.Top - 72)
        $dW = [Math]::Abs($sh.Width - 240)
        if ($dL -lt 10 -and $dT -lt 10 -and $dW -lt 20) {
            $removeShapes += $sh
        }
    }
    foreach ($sh in $removeShapes) { $sh.Delete() }
}

function Fix-TextShape {
    param($slide, $minWidth, $top, $fontSize, $color, $bold)
    # Finds first text shape at specified top (+- 10) and width > minWidth, applies left align
    foreach ($sh in $slide.Shapes) {
        if ($sh.HasTextFrame -ne -1) { continue }
        if ($sh.TextFrame.HasText -ne -1) { continue }
        if ($sh.Width -lt $minWidth) { continue }
        if ([Math]::Abs($sh.Top - $top) -gt 20) { continue }
        $sh.TextFrame.TextRange.ParagraphFormat.Alignment = $ppAlignLeft
        $sh.TextFrame.TextRange.Font.Size = $fontSize
        $sh.TextFrame.TextRange.Font.Bold = [bool]$bold
        $sh.TextFrame.TextRange.Font.Color.RGB = $color
        $sh.Left = 43
        return $sh
    }
    return $null
}

# ============================================================
# SLIDE 14 (7 cols, 17 rows; subtotals at r=11, r=16)
# ============================================================
Write-Host "Slide 14"
$s14 = $pres.Slides.Item(14)
Remove-RightBgAccent $s14

# Move title to top-left (was centered at T=90)
$titleShape = Fix-TextShape $s14 500 90 24 $DARK $true
if ($titleShape -ne $null) {
    $titleShape.Top = 75
    $titleShape.Width = 864
}
# Subtitle
$subShape = Fix-TextShape $s14 500 121 10 $MUTED $false
if ($subShape -ne $null) {
    $subShape.Top = 128
}

foreach ($sh in $s14.Shapes) {
    if ($sh.HasTable -eq -1) {
        $sh.Top = 160
        $tbl = $sh.Table
        $rows = $tbl.Rows.Count
        $cols = $tbl.Columns.Count

        # Row 1: green header
        Style-Row $tbl 1 $cols $GREEN $WHITE $true $ppAlignCenter 11

        # Subtotal rows (합계): r=11, r=16
        $subRows = @(11, 16)
        for ($r = 2; $r -le $rows; $r++) {
            if ($subRows -contains $r) {
                Style-Row $tbl $r $cols $GREENSFT $GREENDRK $true $ppAlignCenter 10
            } elseif ($r -eq 17) {
                # Empty trailing row - hide by making it white minimal
                Style-Row $tbl $r $cols $WHITE $BODY $false $ppAlignLeft 9
            } else {
                $bg = Get-AltBg $r
                for ($c = 1; $c -le $cols; $c++) {
                    $cell = $tbl.Cell($r, $c)
                    if ($c -le 2) {
                        Style-Cell $cell $bg $DARK $true $ppAlignCenter 10
                    } else {
                        Style-Cell $cell $bg $BODY $false $ppAlignRight 10
                    }
                }
            }
        }
        break
    }
}

# ============================================================
# SLIDE 18 (6 cols, 17 rows; subtotal r=5, r=15; miniheader r=16; totals r=17)
# ============================================================
Write-Host "Slide 18"
$s18 = $pres.Slides.Item(18)
Remove-RightBgAccent $s18

$titleShape = Fix-TextShape $s18 500 90 24 $DARK $true
if ($titleShape -ne $null) {
    $titleShape.Top = 75
    $titleShape.Width = 864
}
$subShape = Fix-TextShape $s18 500 121 10 $MUTED $false
if ($subShape -ne $null) {
    $subShape.Top = 128
}

foreach ($sh in $s18.Shapes) {
    if ($sh.HasTable -eq -1) {
        $sh.Top = 160
        try { $sh.Line.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse } catch {}
        try { $sh.Line.Weight = 0 } catch {}

        $tbl = $sh.Table
        $rows = $tbl.Rows.Count
        $cols = $tbl.Columns.Count

        # Row 1: green header
        Style-Row $tbl 1 $cols $GREEN $WHITE $true $ppAlignCenter 11

        $subtotalRows = @(5, 15)   # 수입 계, 지출 계
        $miniHeaderRow = 16
        $grandTotalRow = 17

        for ($r = 2; $r -le $rows; $r++) {
            if ($subtotalRows -contains $r) {
                Style-Row $tbl $r $cols $YELLOWSFT $DARK $true $ppAlignCenter 10
            } elseif ($r -eq $miniHeaderRow) {
                Style-Row $tbl $r $cols $ALTROW $DARK $true $ppAlignCenter 10
            } elseif ($r -eq $grandTotalRow) {
                Style-Row $tbl $r $cols $GREENSFT $GREENDRK $true $ppAlignCenter 11
            } else {
                $bg = Get-AltBg $r
                for ($c = 1; $c -le $cols; $c++) {
                    $cell = $tbl.Cell($r, $c)
                    if ($c -le 2) {
                        Style-Cell $cell $bg $DARK $true $ppAlignCenter 10
                    } else {
                        Style-Cell $cell $bg $BODY $false $ppAlignRight 10
                    }
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
