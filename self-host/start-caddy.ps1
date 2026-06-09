param(
  [string]$Caddyfile = (Join-Path $PSScriptRoot 'Caddyfile.local')
)

$ErrorActionPreference = 'Stop'
$ResolvedCaddyfile = Resolve-Path $Caddyfile

if (-not (Get-Command caddy -ErrorAction SilentlyContinue)) {
  throw 'Caddy is not installed or is not on PATH. Run self-host/setup-windows-self-host.ps1 -InstallCaddy first, or install Caddy manually.'
}

caddy run --config $ResolvedCaddyfile --adapter caddyfile
