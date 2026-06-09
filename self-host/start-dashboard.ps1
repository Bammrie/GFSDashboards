param(
  [int]$BackendPort = 5192,
  [string]$OllamaBaseUrl = 'http://127.0.0.1:11434',
  [string]$OllamaModel = 'cu-loan-advisor:latest'
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')

$env:PORT = [string]$BackendPort
$env:OLLAMA_BASE_URL = $OllamaBaseUrl
$env:OLLAMA_MODEL = $OllamaModel

Push-Location $RepoRoot
try {
  npm start
} finally {
  Pop-Location
}
