$ErrorActionPreference = "Stop"
$pptxPath = "C:\SMARTECOSYS\pptx_build\source.pptx"
$imgDir = "C:\SMARTECOSYS\pptx_build\source_images"
$metaPath = "C:\SMARTECOSYS\pptx_build\source_meta.json"

if (Test-Path $imgDir) { Remove-Item "$imgDir\*" -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Force -Path $imgDir | Out-Null

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $ppt.Presentations.Open($pptxPath, $true, $false, $false)

# Slide dimensions in points
$sw = $pres.PageSetup.SlideWidth   # 960
$sh = $pres.PageSetup.SlideHeight  # 540

$slidesData = @()

$si = 1
foreach ($slide in $pres.Slides) {
    $shapes = @()
    $pi = 1
    foreach ($shape in $slide.Shapes) {
        # msoPicture = 13, msoLinkedPicture = 11
        if ($shape.Type -eq 13 -or $shape.Type -eq 11) {
            $name = "slide${si}_pic${pi}.png"
            $out = Join-Path $imgDir $name
            try {
                $shape.Export($out, 2)  # ppShapeFormatPNG = 2
            } catch {
                Write-Host "Failed export $name : $_"
                continue
            }
            $shapes += @{
                file = $name
                left = [double]$shape.Left
                top = [double]$shape.Top
                width = [double]$shape.Width
                height = [double]$shape.Height
            }
            $pi++
        }
    }
    $slidesData += @{
        slide = $si
        shapes = $shapes
    }
    $si++
}

$json = @{
    slideWidth = [double]$sw
    slideHeight = [double]$sh
    slides = $slidesData
} | ConvertTo-Json -Depth 10
$json | Out-File -FilePath $metaPath -Encoding utf8

$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
Write-Host "DONE"
