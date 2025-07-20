# 检查常见应用的实际进程名
Write-Host "=== 检查常见应用的实际进程名 ===" -ForegroundColor Green
Write-Host ""

# 定义要检查的应用程序
$appsToCheck = @(
    @{Name="微信"; Patterns=@("*wechat*", "*WeChat*", "*WECHAT*")},
    @{Name="Firefox"; Patterns=@("*firefox*", "*Firefox*")},
    @{Name="Chrome"; Patterns=@("*chrome*", "*Chrome*")},
    @{Name="Edge"; Patterns=@("*edge*", "*Edge*", "*msedge*")},
    @{Name="QQ"; Patterns=@("*qq*", "*QQ*")},
    @{Name="钉钉"; Patterns=@("*dingtalk*", "*DingTalk*")},
    @{Name="腾讯会议"; Patterns=@("*wemeet*", "*WeMeet*", "*tencent*")}
)

Write-Host "当前运行的相关进程:" -ForegroundColor Yellow
foreach ($app in $appsToCheck) {
    Write-Host "`n[$($app.Name)]:" -ForegroundColor Cyan
    $found = $false
    foreach ($pattern in $app.Patterns) {
        $processes = Get-Process | Where-Object { $_.ProcessName -like $pattern } | Select-Object ProcessName, Id -Unique
        if ($processes) {
            $found = $true
            foreach ($proc in $processes) {
                Write-Host "  - $($proc.ProcessName).exe (PID: $($proc.Id))" -ForegroundColor White
            }
        }
    }
    if (-not $found) {
        Write-Host "  未找到相关进程" -ForegroundColor Gray
    }
}

Write-Host "`n=== 常见应用的正确进程名 ===" -ForegroundColor Green
Write-Host "微信: WeChat.exe 或 WeChatAppEx.exe"
Write-Host "Firefox: firefox.exe"
Write-Host "Chrome: chrome.exe"
Write-Host "Edge: msedge.exe"
Write-Host "QQ: QQ.exe"
Write-Host "钉钉: DingTalk.exe"
Write-Host "腾讯会议: wemeet.exe 或 WeMeet.exe"

Write-Host "`n=== 建议 ===" -ForegroundColor Yellow
Write-Host "1. 使用任务管理器查看实际的进程名称"
Write-Host "2. 进程名称区分大小写，必须完全匹配"
Write-Host "3. 某些应用可能有多个进程，需要都添加"
Write-Host "4. 建议使用 Get-Process 命令查看准确的进程名"