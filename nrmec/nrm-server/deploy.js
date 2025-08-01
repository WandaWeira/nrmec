const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🚂 Starting Railway deployment process...');

// Function to run a command and return a promise
function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const childProcess = spawn(command, args, { 
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    childProcess.on('error', (error) => {
      reject(error);
    });
  });
}

// Main deployment process
async function deploy() {
  try {
    // Step 1: Run database migrations
    console.log('📊 Running database migrations...');
    await runCommand('npx', ['sequelize-cli', 'db:migrate']);
    
    // Step 2: Run database seeds
    console.log('🌱 Seeding database...');
    await runCommand('npx', ['sequelize-cli', 'db:seed:all']);
    
    // Step 3: Start the server
    console.log('🚀 Starting server...');
    const server = spawn('node', ['app.js'], { 
      stdio: 'inherit',
      detached: false
    });
    
    // Log server process ID
    console.log(`Server started with PID: ${server.pid}`);
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    // Set up proper exit handling
    process.on('SIGINT', () => {
      console.log('Gracefully shutting down server...');
      server.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.log('Termination signal received, shutting down...');
      server.kill('SIGTERM');
    });
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Execute deployment
deploy();