param(
  [int]$BackendPort = 5192,
  [string]$PublicUrl = '',
  [string]$PublicHostOrIp = '',
  [string]$ExpectedModel = 'cu-loan-advisor:latest'
)

$ErrorActionPreference = 'Stop'

function Add-Check {
  param(
    [System.Collections.Generic.List[object]]$Checks,
    [string]$Name,
    [bool]$Ok,
    [string]$Detail
  )

  $Checks.Add([pscustomobject]@{
    Name = $Name
    Ok = $Ok
    Detail = $Detail
  }) | Out-Null
}

function Invoke-AdvisorChat {
  param([string]$BaseUrl)

  $body = @{
    messages = @(
      @{
        role = 'assistant'
        content = 'I can help complete the Consumer Loan Application. To start, how much would you like to borrow, and what is the money for?'
      },
      @{
        role = 'user'
        content = 'I need 30000'
      }
    )
  } | ConvertTo-Json -Depth 5

  Invoke-RestMethod `
    -Method Post `
    -Uri "$BaseUrl/api/advisor/chat" `
    -ContentType 'application/json' `
    -Body $body `
    -TimeoutSec 45
}

$checks = [System.Collections.Generic.List[object]]::new()

try {
  $tags = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 10
  $models = @($tags.models | ForEach-Object { $_.name })
  Add-Check $checks 'Local Ollama API' ($models -contains $ExpectedModel) "Models: $($models -join ', ')"
} catch {
  Add-Check $checks 'Local Ollama API' $false $_.Exception.Message
}

try {
  $localBase = "http://127.0.0.1:$BackendPort"
  $page = Invoke-WebRequest -Uri "$localBase/cu-loan-advisor/" -UseBasicParsing -TimeoutSec 15
  Add-Check $checks 'Local dashboard page' ($page.StatusCode -eq 200 -and $page.Content.Contains('CU Loan Advisor')) "HTTP $($page.StatusCode)"
} catch {
  Add-Check $checks 'Local dashboard page' $false $_.Exception.Message
}

try {
  $reply = Invoke-AdvisorChat -BaseUrl "http://127.0.0.1:$BackendPort"
  Add-Check $checks 'Local advisor chat' ($reply.model -eq $ExpectedModel -and $reply.message.content) $reply.message.content
} catch {
  Add-Check $checks 'Local advisor chat' $false $_.Exception.Message
}

if ($PublicUrl) {
  $normalizedPublicUrl = $PublicUrl.TrimEnd('/')
  try {
    $page = Invoke-WebRequest -Uri "$normalizedPublicUrl/cu-loan-advisor/" -UseBasicParsing -TimeoutSec 25
    Add-Check $checks 'Public dashboard page' ($page.StatusCode -eq 200 -and $page.Content.Contains('CU Loan Advisor')) "HTTP $($page.StatusCode)"
  } catch {
    Add-Check $checks 'Public dashboard page' $false $_.Exception.Message
  }

  try {
    $reply = Invoke-AdvisorChat -BaseUrl $normalizedPublicUrl
    Add-Check $checks 'Public advisor chat' ($reply.model -eq $ExpectedModel -and $reply.message.content) $reply.message.content
  } catch {
    Add-Check $checks 'Public advisor chat' $false $_.Exception.Message
  }
}

if ($PublicHostOrIp) {
  try {
    $raw = Invoke-WebRequest -Uri "http://$PublicHostOrIp:11434/api/tags" -UseBasicParsing -TimeoutSec 10
    Add-Check $checks 'Raw public Ollama blocked' $false "Unexpectedly reachable with HTTP $($raw.StatusCode)"
  } catch {
    Add-Check $checks 'Raw public Ollama blocked' $true 'Not reachable, as expected.'
  }
}

$checks | Format-Table -AutoSize

if ($checks.Where({ -not $_.Ok }).Count -gt 0) {
  exit 1
}
