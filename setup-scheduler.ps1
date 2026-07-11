# AI量化交易Agent - 每日数据收集定时任务
# 创建时间: 2026/7/10 20:49:38

$Action = New-ScheduledTaskAction -Execute "node" -Argument "E:\trae\Projects\1\data-collector.cjs" -WorkingDirectory "E:\trae\Projects\1"

# 每交易日 08:00 执行(开盘前)
$Trigger1 = New-ScheduledTaskTrigger -Daily -At "08:00"

# 收盘后 15:30 执行 
$Trigger2 = New-ScheduledTaskTrigger -Daily -At "15:30"

# 盘后 18:00 执行(生成日报)
$Trigger3 = New-ScheduledTaskTrigger -Daily -At "18:00"

$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# 注册任务
Register-ScheduledTask -TaskName "AI-TradingAgent-DataCollector" `
    -Action $Action `
    -Trigger @($Trigger1,$Trigger2,$Trigger3) `
    -Settings $Settings `
    -Description "AI量化交易Agent - 每日数据收集 (开盘前/收盘后/盘后)" `
    -RunLevel Highest

Write-Host "✅ 定时任务已创建!" -ForegroundColor Green
Write-Host "任务名称: AI-TradingAgent-DataCollector" -ForegroundColor Cyan
Write-Host "执行时间: 08:00 / 15:30 / 18:00" -ForegroundColor Cyan
Write-Host ""
Write-Host "查看任务: Get-ScheduledTask -TaskName 'AI-TradingAgent-DataCollector'" -ForegroundColor Yellow
Write-Host "删除任务: Unregister-ScheduledTask -TaskName 'AI-TradingAgent-DataCollector' -Confirm:$false" -ForegroundColor Yellow
