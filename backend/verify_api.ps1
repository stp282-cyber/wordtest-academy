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

    Write-Host "`n2. Generating Test..."
    $generateBody = @{
        level = 1
        count = 2
        topic = "School"
    } | ConvertTo-Json

    $headers = @{
        Authorization = "Bearer $token"
    }

    $generateResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/listening/generate" -Method Post -Headers $headers -Body $generateBody -ContentType "application/json"
    
    Write-Host "Test Generation Successful."
    Write-Host "Questions generated: $($generateResponse.questions.Count)"
    $generateResponse.questions | ForEach-Object {
        Write-Host "- Q: $($_.question)"
        Write-Host "  Script: $($_.dialogue)"
    }

} catch {
    Write-Error "Error: $_"
    Write-Error "Details: $($_.Exception.Response.GetResponseStream() | %{ (New-Object IO.StreamReader $_).ReadToEnd() })"
}
