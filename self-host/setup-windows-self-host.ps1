param(
  [string]$Domain = 'cu-loan.goodwinefinancialservices.com',
  [int]$BackendPort = 5192,
  [string]$AdminEmail = 'admin@goodwinefinancialservices.com',
  [switch]$InstallCaddy,
  [switch]$ConfigureFirewall,
  [switch]$InstallStartupTasks,
  [switch]$HardenOllamaLocalhost
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$CaddyfileLocal = Join-Path $PSScriptRoot 'Caddyfile.local'

function Test-IsAdministrator {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = [Security.Principal.WindowsPrincipal] $identity
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Ensure-FirewallRule {
  param(
    [string]$DisplayName,
    [string]$Direction,
    [string]$Action,
    [string]$Protocol,
    [int]$LocalPort
  )

  $existing = Get-NetFirewallRule -DisplayName $DisplayName -ErrorAction SilentlyContinue
  if ($existing) {
    return
  }

  New-NetFirewallRule `
    -DisplayName $DisplayName `
    -Direction $Direction `
    -Action $Action `
    -Protocol $Protocol `
    -LocalPort $LocalPort `
    -Profile Any | Out-Null
}

$isAdmin = Test-IsAdministrator

if ($InstallCaddy -and -not (Get-Command caddy -ErrorAction SilentlyContinue)) {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw 'winget is not available. Install Caddy manually from https://caddyserver.com/download and rerun this script.'
  }

  winget install CaddyServer.Caddy --silent --accept-source-agreements --accept-package-agreements
}

if ($HardenOllamaLocalhost) {
  [Environment]::SetEnvironmentVariable('OLLAMA_HOST', '127.0.0.1:11434', 'User')
  Write-Host 'Set user OLLAMA_HOST=127.0.0.1:11434. Restart Ollama for this to take effect.'
}

$caddyfile = @"
{
  email $AdminEmail
}

$Domain {
  encode zstd gzip

  header {
    X-Content-Type-Options nosniff
    Referrer-Policy strict-origin-when-cross-origin
    -Server
  }

  reverse_proxy 127.0.0.1:$BackendPort
}
"@

Set-Content -LiteralPath $CaddyfileLocal -Value $caddyfile -Encoding UTF8
Write-Host "Wrote $CaddyfileLocal"

$envPath = Join-Path $RepoRoot '.env'
if (-not (Test-Path -LiteralPath $envPath)) {
  @"
PORT=$BackendPort
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=cu-loan-advisor:latest
OLLAMA_TIMEOUT_MS=30000
"@ | Set-Content -LiteralPath $envPath -Encoding UTF8
  Write-Host "Wrote $envPath"
}

if ($ConfigureFirewall) {
  if (-not $isAdmin) {
    throw 'Firewall changes require an elevated PowerShell window. Re-run as Administrator with -ConfigureFirewall.'
  }

  Ensure-FirewallRule -DisplayName 'GFS Dashboard HTTPS 443' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 443
  Ensure-FirewallRule -DisplayName 'GFS Dashboard HTTP 80' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 80
  Ensure-FirewallRule -DisplayName 'Block Public Ollama API 11434' -Direction Inbound -Action Block -Protocol TCP -LocalPort 11434
  Write-Host 'Configured Windows Firewall for public dashboard access and blocked raw Ollama API inbound access.'
}

if ($InstallStartupTasks) {
  $trigger = New-ScheduledTaskTrigger -AtLogOn
  $dashboardAction = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$PSScriptRoot\start-dashboard.ps1`" -BackendPort $BackendPort"
  $caddyAction = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$PSScriptRoot\start-caddy.ps1`" -Caddyfile `"$CaddyfileLocal`""

  Register-ScheduledTask `
    -TaskName 'GFSDashboards Self Host' `
    -Action $dashboardAction `
    -Trigger $trigger `
    -Description 'Start the GFS dashboard backend for CU Loan Advisor self-hosting.' `
    -Force | Out-Null

  Register-ScheduledTask `
    -TaskName 'GFSDashboards Caddy HTTPS' `
    -Action $caddyAction `
    -Trigger $trigger `
    -Description 'Start Caddy HTTPS reverse proxy for the GFS dashboard.' `
    -Force | Out-Null

  Write-Host 'Registered startup tasks for the dashboard and Caddy.'
}

Write-Host ''
Write-Host 'Next manual network steps:'
Write-Host "1. Point DNS for $Domain to this site's public IP."
Write-Host '2. On the router/firewall, forward TCP 80 and 443 to this computer.'
Write-Host '3. Do not forward TCP 11434.'
Write-Host "4. Verify with: npm run selfhost:verify -- -PublicUrl https://$Domain -PublicHostOrIp $Domain"
