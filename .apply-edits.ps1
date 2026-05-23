$edits = $env:EDITS_JSON | ConvertFrom-Json
foreach ($edit in $edits) {
    $path = $edit.path
    $old = $edit.old
    $new = $edit.new
    if (-not (Test-Path $path)) { Write-Host "NOT FOUND: $path"; continue }
    $c = [System.IO.File]::ReadAllText($path)
    $idx = $c.IndexOf($old)
    if ($idx -lt 0) { Write-Host "NO MATCH: $path"; continue }
    $idx2 = $c.IndexOf($old, $idx + 1)
    if ($idx2 -ge 0) { Write-Host "MULTIPLE: $path"; continue }
    $c = $c.Substring(0, $idx) + $new + $c.Substring($idx + $old.Length)
    [System.IO.File]::WriteAllText($path, $c)
    Write-Host "OK: $path"
}
