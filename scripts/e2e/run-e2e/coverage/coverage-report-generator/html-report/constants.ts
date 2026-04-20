export const HTML_REPORT_STYLES = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      border-bottom: 2px solid #6b2ca6;
      padding-bottom: 10px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    .metric {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      text-align: center;
    }
    .metric-value {
      font-size: 2em;
      font-weight: bold;
      color: #6b2ca6;
    }
    .metric-label {
      color: #666;
      margin-top: 5px;
    }
    .metric.good { border-left: 4px solid #28a745; }
    .metric.warning { border-left: 4px solid #ffc107; }
    .metric.danger { border-left: 4px solid #dc3545; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #6b2ca6;
      color: white;
      font-weight: 600;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .coverage-bar {
      height: 20px;
      background: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
    }
    .coverage-fill {
      height: 100%;
      background: linear-gradient(90deg, #dc3545 0%, #ffc107 50%, #28a745 100%);
      transition: width 0.3s ease;
    }
    .timestamp {
      color: #666;
      font-size: 0.9em;
      margin-top: 20px;
    }
    .uncovered {
      color: #dc3545;
      font-size: 0.85em;
    }`;
