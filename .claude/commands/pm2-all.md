Start all services and open PM2 monitor.
```bash
cd "D:\Dev\Workspaces\Active\DMForge" && pm2 start ecosystem.config.cjs && start wt.exe -d "D:\Dev\Workspaces\Active\DMForge" pwsh -NoExit -c "pm2 monit"
```
