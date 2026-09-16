module.exports = {
  apps: [
    {
      name: 'dmforge-3000',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'dev --hostname 0.0.0.0 --port 3000',
      interpreter: 'D:/Programs/nodejs/node.exe',
      interpreter_args: '--max-old-space-size=512',
      env: { NODE_ENV: 'development' }
    }
  ]
}
