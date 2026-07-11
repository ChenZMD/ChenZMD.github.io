/**
 * Windows 定时任务配置脚本
 * 用于设置每日自动运行数据收集器
 * 
 * 使用方法:
 * 1. 以管理员权限运行 PowerShell
 * 2. 执行: .\setup-scheduler.ps1
 */

// 生成 PowerShell 脚本内容
const schedulerScript = `# AI量化交易Agent - 每日数据收集定时任务
# 创建时间: ${new Date().toLocaleString('zh-CN')}

$Action = New-ScheduledTaskAction -Execute "node" -Argument "${process.cwd()}\\data-collector.cjs" -WorkingDirectory "${process.cwd()}"

# 每交易日 08:00 执行(开盘前)
$Trigger1 = New-ScheduledTaskTrigger -Daily -At "08:00"

# 收盘后 15:30 执行 
$Trigger2 = New-ScheduledTaskTrigger -Daily -At "15:30"

# 盘后 18:00 执行(生成日报)
$Trigger3 = New-ScheduledTaskTrigger -Daily -At "18:00"

$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# 注册任务
Register-ScheduledTask -TaskName "AI-TradingAgent-DataCollector" \`
    -Action $Action \`
    -Trigger @($Trigger1,$Trigger2,$Trigger3) \`
    -Settings $Settings \`
    -Description "AI量化交易Agent - 每日数据收集 (开盘前/收盘后/盘后)" \`
    -RunLevel Highest

Write-Host "✅ 定时任务已创建!" -ForegroundColor Green
Write-Host "任务名称: AI-TradingAgent-DataCollector" -ForegroundColor Cyan
Write-Host "执行时间: 08:00 / 15:30 / 18:00" -ForegroundColor Cyan
Write-Host ""
Write-Host "查看任务: Get-ScheduledTask -TaskName 'AI-TradingAgent-DataCollector'" -ForegroundColor Yellow
Write-Host "删除任务: Unregister-ScheduledTask -TaskName 'AI-TradingAgent-DataCollector' -Confirm:$false" -ForegroundColor Yellow
`;

const fs = require('fs');
fs.writeFileSync('setup-scheduler.ps1', schedulerScript, 'utf8');
console.log('✅ 定时任务脚本已创建: setup-scheduler.ps1');
console.log('');
console.log('使用方式:');
console.log('  1. 以管理员权限打开 PowerShell');
console.log('  2. 执行: .\\setup-scheduler.ps1');
console.log('');
console.log('任务将每交易日自动运行3次:');
console.log('  08:00 - 开盘前数据收集');
console.log('  15:30 - 收盘后数据归档');
console.log('  18:00 - 盘后日报生成');
