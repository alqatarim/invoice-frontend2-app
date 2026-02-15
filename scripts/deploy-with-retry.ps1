# Deploy Frontend to Railway with auto-fix retry
# Monitors deployment, fetches logs on failure, attempts fixes, redeploys
# Usage: cd frontend; .\scripts\deploy-with-retry.ps1

$ErrorActionPreference = "Continue"
$maxAttempts = 10
$pollIntervalSeconds = 45
$maxWaitSeconds = 600  # 10 min per attempt

function Get-DeploymentStatus {
    $list = railway deployment list --json 2>$null | ConvertFrom-Json
    if ($list -and $list.Count -gt 0) { return $list[0] }
    return $null
}

function Get-BuildLogs {
    railway logs --build --latest --lines 300 2>&1
}

function Deploy-Frontend {
    Write-Host "`n>>> Deploying to Railway..." -ForegroundColor Cyan
    railway up
}

function Wait-ForDeployment {
    param([string]$deploymentId)
    $elapsed = 0
    while ($elapsed -lt $maxWaitSeconds) {
        Start-Sleep -Seconds $pollIntervalSeconds
        $elapsed += $pollIntervalSeconds
        $deploy = Get-DeploymentStatus
        if (-not $deploy) { continue }
        if ($deploy.id -ne $deploymentId) { continue }
        $status = $deploy.status
        Write-Host "  Status: $status (${elapsed}s elapsed)" -ForegroundColor Gray
        if ($status -eq "SUCCESS") { return "SUCCESS" }
        if ($status -eq "FAILED" -or $status -eq "CRASHED") { return "FAILED" }
    }
    return "TIMEOUT"
}

function Try-FixFromLogs {
    param([string]$logs)
    $fixed = $false

    # Module not found - wrong import paths
    if ($logs -match "Module not found.*Can't resolve '([^']+)'") {
        $badPath = $Matches[1]
        Write-Host "  Detected: Module not found '$badPath'" -ForegroundColor Yellow
        # Would need file+path mapping; skip auto-fix for now, too many variants
    }

    # useSearchParams / prerender auth/error
    if ($logs -match "prerendering page.*/auth/error" -or $logs -match "Export encountered errors.*auth/error") {
        $path = "src\app\auth\error\page.jsx"
        if ((Test-Path $path) -and ((Get-Content $path -Raw) -notmatch "Suspense")) {
            Write-Host "  Fix: Adding Suspense to auth/error page" -ForegroundColor Green
            $content = Get-Content $path -Raw
            # Wrap useSearchParams usage in Suspense
            $content = $content -replace "export default function AuthError\(\) \{[^}]*const searchParams = useSearchParams\(\);", "function AuthErrorContent() { const searchParams = useSearchParams();"
            # Simple replacement: wrap in Suspense
            $newContent = @'
'use client';

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  return (
    <div>
      <h1>Authentication Error</h1>
      <p>{error ? `Error: ${error}` : 'An unknown error occurred.'}</p>
      <Link href="/">Go back to Home</Link>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<div><h1>Authentication Error</h1><p>Loading...</p><Link href="/">Go back to Home</Link></div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
'@
            Set-Content -Path $path -Value $newContent -NoNewline
            $fixed = $true
        }
    }

    # Client component (useState/useEffect) without 'use client' - extract file from Import trace
    if ($logs -match "needs (useState|useEffect)" -and $logs -match "Import trace for requested module:[\s\S]*?\./([\w/\.\(\)]+\.jsx)") {
        $relPath = $Matches[1] -replace "/", "\"
        $filePath = "src\$relPath"
        if ((Test-Path $filePath) -and ((Get-Content $filePath -First 1) -notmatch "'use client'")) {
            Write-Host "  Fix: Adding 'use client' to $filePath" -ForegroundColor Green
            $content = Get-Content $filePath -Raw
            Set-Content -Path $filePath -Value ("'use client';`n" + $content) -NoNewline
            $fixed = $true
        }
    }

    # Next.js security vulnerability
    if ($logs -match "SECURITY VULNERABILITIES DETECTED" -or $logs -match "next@\d+\.\d+\.\d+.*Upgrade to") {
        Write-Host "  Fix: Upgrade Next.js (run: npm install next@^14.2.35 --legacy-peer-deps)" -ForegroundColor Green
        npm install next@^14.2.35 --legacy-peer-deps 2>$null
        $fixed = $true
    }

    return $fixed
}

# Main
Push-Location $PSScriptRoot\..
try {
    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        Write-Host "`n========== Attempt $attempt of $maxAttempts ==========" -ForegroundColor Magenta
        Deploy-Frontend
        
        $deploy = Get-DeploymentStatus
        if (-not $deploy) {
            Write-Host "Could not get deployment ID. Retrying..." -ForegroundColor Red
            continue
        }
        $deployId = $deploy.id
        Write-Host "Deployment ID: $deployId" -ForegroundColor Gray

        $result = Wait-ForDeployment -deploymentId $deployId
        
        if ($result -eq "SUCCESS") {
            Write-Host "`n*** Deployment SUCCESSFUL ***" -ForegroundColor Green
            railway domain 2>$null
            exit 0
        }

        if ($result -eq "TIMEOUT") {
            Write-Host "Deployment timed out. Check Railway dashboard." -ForegroundColor Yellow
        }

        Write-Host "`nDeployment failed. Fetching logs..." -ForegroundColor Yellow
        $logs = Get-BuildLogs

        Write-Host "`n--- Last 50 lines of build output ---" -ForegroundColor DarkGray
        ($logs -split "`n")[-50..-1] | ForEach-Object { Write-Host $_ }

        Write-Host "`nAttempting automatic fix..." -ForegroundColor Cyan
        $fixed = Try-FixFromLogs -logs $logs
        
        if (-not $fixed) {
            Write-Host "`nNo automatic fix available. Please fix manually and rerun." -ForegroundColor Red
            Write-Host "Build logs above show the error." -ForegroundColor Red
            exit 1
        }
        
        Write-Host "`nFix applied. Redeploying..." -ForegroundColor Green
    }

    Write-Host "`nMax attempts reached. Deployment failed." -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
