import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
console.log('Reached')
  console.log('API Log handler called:', req.body);
  if (req.method === 'POST') {
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'apiLogs.json');

    try {
      // Ensure the logs directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
        console.log(`Created logs directory at: ${logDir}`);
      }

      // Read existing logs
      let logs = [];
      if (fs.existsSync(logFile)) {
        const data = fs.readFileSync(logFile, 'utf8');
        logs = JSON.parse(data || '[]');
      }

      // Add new log entry
      logs.push(req.body);
      console.log('Adding new log entry:', req.body);

      // Write updated logs back to the file
      fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
      console.log('Log entry saved successfully.');

      res.status(200).json({ message: 'Log saved successfully' });
    } catch (error) {
      console.error('Error writing log:', error);
      res.status(500).json({ message: 'Error saving log' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
