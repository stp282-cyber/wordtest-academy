$ErrorActionPreference = "Stop"

try {
    Write-Host "1. Logging in..."
    $loginBody = @{
        username = "stp282"
        password = "rudwlschl83"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login Successful. Token received."

    Write-Host "`n2. Generating Audio..."
    $audioBody = @{
        text  = "Hello, this is a test for audio generation."
        voice = "en-US-AriaNeural"
    } | ConvertTo-Json

    $headers = @{
        Authorization = "Bearer $token"
    }

    $audioResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/listening/audio" -Method Post -Headers $headers -Body $audioBody -ContentType "application/json"
    
    Write-Host "Audio Generation Successful."
    Write-Host "Audio URL: $($audioResponse.audioUrl)"

}
catch {
    Write-Error "Error: $_"
    Write-Error "Details: $($_.Exception.Response.GetResponseStream() | %{ (New-Object IO.StreamReader $_).ReadToEnd() })"
}
