module.exports = {
   apps: [
      {
         name: 'run-consumer-app',
         cwd: '/home/linuxuser/email-kemtan-app', 
         script: 'pnpm',
         args: 'start:prod',
         interpreter: 'none',           

         // ENV for runtime server Next.js (server-side)
         env: {
            NODE_ENV: 'production',
            HOSTNAME: '127.0.0.1',
            PORT: '4203', 
         },

         watch: false,
         max_memory_restart: '512M',
         merge_logs: true,
      },
   ],
};