$apiData = Get-Content -Raw "d:\Autours\frontend\api.json" | ConvertFrom-Json

$srcDir = "d:\Autours\frontend\src"
$files = Get-ChildItem -Path $srcDir -Recurse -Include *.ts,*.tsx,*.js,*.jsx

$foundEndpoints = @()
$axiosRegex = [regex]'(?:api|axios)\.(?:get|post|put|delete|patch)\([''"`]([^''"`]+)[''"`]'

foreach ($file in $files) {
    $content = Get-Content -Raw $file.FullName
    $matches = $axiosRegex.Matches($content)
    foreach ($match in $matches) {
        $foundEndpoints += $match.Groups[1].Value.Split('?')[0] -replace '\$\{.*?\}', '{id}'
    }
}

$foundEndpoints += '/blog-categories'
$foundEndpoints += '/blogs'
$foundEndpoints += '/filter/vehicles'
$foundEndpoints = $foundEndpoints | Select-Object -Unique

$documentedEndpoints = @()
$endpointMap = @{}

foreach ($section in $apiData.api_documentation.sections) {
    foreach ($ep in $section.endpoints) {
        $documentedEndpoints += $ep.path
        $endpointMap[$ep.path] = $ep
    }
}

$usedEndpoints = @()
$unusedEndpoints = @()

foreach ($ep in $documentedEndpoints) {
    $isUsed = $false
    foreach ($used in $foundEndpoints) {
        if ($ep -match [regex]::Escape($used) -or $used -match [regex]::Escape($ep)) {
            $isUsed = $true
            break
        }
    }
    if ($isUsed) {
        $usedEndpoints += $ep
    } else {
        $unusedEndpoints += $ep
    }
}

$unusedEndpoints | ConvertTo-Json -Depth 5 | Set-Content "d:\Autours\frontend\unused_endpoints.json"

$missing = @()
foreach ($used in $foundEndpoints) {
    $found = $false
    foreach ($ep in $documentedEndpoints) {
        if ($ep -match [regex]::Escape($used) -or $used -match [regex]::Escape($ep)) {
            $found = $true
            break
        }
    }
    if (-not $found) {
        $missing += $used
    }
}

$newSection = @{
    name = "Newly Added Endpoints"
    description = "Endpoints that were used but not documented"
    endpoints = @()
}

foreach ($m in $missing) {
    $newSection.endpoints += @{
        method = "ANY"
        path = $m
        description = "Auto-detected endpoint"
        responses = @{ "200" = @{ description = "Success" } }
    }
}

$apiData.api_documentation.sections += $newSection

$apiData | ConvertTo-Json -Depth 10 | Set-Content "d:\Autours\frontend\api_updated.json"

Write-Output "Done. Check unused_endpoints.json and api_updated.json"
