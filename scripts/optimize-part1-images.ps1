Add-Type -AssemblyName System.Drawing

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)

$dir = 'frontend\public\images\toeic'
$files = Get-ChildItem "$dir\*.jpg"

$totalBefore = ($files | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Starting optimization of $($files.Count) images (Total before: $([math]::Round($totalBefore, 2)) MB)..."

$count = 0
foreach ($file in $files) {
    $count++
    $tempFile = "$($file.FullName).tmp"
    
    # Load image safely
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $ms = New-Object System.IO.MemoryStream($bytes, $false)
    $img = [System.Drawing.Image]::FromStream($ms)
    
    $origW = $img.Width
    $origH = $img.Height
    
    # Calculate target dimensions (max 1200px width/height)
    $maxDim = 1200
    if ($origW -gt $maxDim -or $origH -gt $maxDim) {
        if ($origW -ge $origH) {
            $newW = $maxDim
            $newH = [int](($origH * $maxDim) / $origW)
        } else {
            $newH = $maxDim
            $newW = [int](($origW * $maxDim) / $origH)
        }
    } else {
        $newW = $origW
        $newH = $origH
    }
    
    $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphics.DrawImage($img, 0, 0, $newW, $newH)
    $graphics.Dispose()
    $img.Dispose()
    $ms.Dispose()
    
    $bmp.Save($tempFile, $codec, $encoderParams)
    $bmp.Dispose()
    
    # Only replace if optimized file is valid and smaller or resized
    $origLen = (Get-Item $file.FullName).Length
    $newLen = (Get-Item $tempFile).Length
    
    if ($newLen -lt $origLen -or $origW -gt $maxDim) {
        Move-Item -Path $tempFile -Destination $file.FullName -Force
    } else {
        Remove-Item -Path $tempFile -Force
    }
}

$filesAfter = Get-ChildItem "$dir\*.jpg"
$totalAfter = ($filesAfter | Measure-Object -Property Length -Sum).Sum / 1MB
$saved = $totalBefore - $totalAfter
$percent = ($saved / $totalBefore) * 100

Write-Host "Optimization Complete!"
Write-Host "Total Size Before: $([math]::Round($totalBefore, 2)) MB"
Write-Host "Total Size After:  $([math]::Round($totalAfter, 2)) MB"
Write-Host "Saved:             $([math]::Round($saved, 2)) MB ($([math]::Round($percent, 1))% reduction)"
