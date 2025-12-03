$ErrorActionPreference = "Stop"

try {
    Write-Host "1. Logging in as Academy Admin..."
    $loginBody = @{
        username = "admin"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login Successful. Token received."

    Write-Host "`n2. Fetching Students..."
    $headers = @{
        Authorization = "Bearer $token"
    }

    $studentsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/users/students" -Method Get -Headers $headers
    
    Write-Host "Students Fetch Successful."
    Write-Host "Count: $($studentsResponse.Count)"
    $studentsResponse | ForEach-Object {
        Write-Host "- Student: $($_.username) ($($_.full_name))"
    }

}
catch {
    Write-Error "Error: $_"
    Write-Error "Details: $($_.Exception.Response.GetResponseStream() | %{ (New-Object IO.StreamReader $_).ReadToEnd() })"
}
