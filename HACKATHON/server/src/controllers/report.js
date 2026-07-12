import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';
import MaintenanceRequest from '../models/MaintenanceRequest.js';

export const getReportData = async (req, res, next) => {
  try {
    const { type } = req.params;
    let data = [];

    switch (type) {
      case 'vehicles':
        data = await Vehicle.find({});
        break;
      case 'drivers':
        data = await Driver.find({});
        break;
      case 'trips':
        data = await Trip.find({}).populate('vehicleId driverId');
        break;
      case 'fuel':
        data = await FuelLog.find({}).populate('vehicleId tripId');
        break;
      case 'expenses':
        data = await Expense.find({}).populate('vehicleId tripId');
        break;
      case 'maintenance':
        data = await MaintenanceRequest.find({}).populate('vehicleId');
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const exportReport = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { format = 'csv' } = req.query;
    
    let data = [];
    switch (type) {
      case 'vehicles':
        data = await Vehicle.find({});
        break;
      case 'drivers':
        data = await Driver.find({});
        break;
      case 'trips':
        data = await Trip.find({}).populate('vehicleId driverId');
        break;
      case 'fuel':
        data = await FuelLog.find({}).populate('vehicleId');
        break;
      case 'expenses':
        data = await Expense.find({}).populate('vehicleId');
        break;
      case 'maintenance':
        data = await MaintenanceRequest.find({}).populate('vehicleId');
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=transitops_report_${type}.csv`);
      
      let csvContent = '';
      if (type === 'vehicles') {
        csvContent += 'Registration Number,Name,Type,Capacity (kg),Odometer (km),Status\n';
        data.forEach(item => {
          csvContent += `"${item.registrationNumber}","${item.name}","${item.type}",${item.capacityKg},${item.odometerKm},"${item.status}"\n`;
        });
      } else if (type === 'drivers') {
        csvContent += 'Name,Email,License Number,Category,Safety Score,Status\n';
        data.forEach(item => {
          csvContent += `"${item.name}","${item.email}","${item.licenseNumber}","${item.category}",${item.safetyScore},"${item.status}"\n`;
        });
      } else if (type === 'trips') {
        csvContent += 'Trip Number,Source,Destination,Distance (km),Cargo Weight (kg),Revenue,Status\n';
        data.forEach(item => {
          csvContent += `"${item.tripNumber}","${item.source}","${item.destination}",${item.distanceKm},${item.cargoWeightKg},${item.revenue},"${item.status}"\n`;
        });
      } else if (type === 'fuel') {
        csvContent += 'Vehicle,Liters,Cost,Fuel Station,Odometer (km),Filled At\n';
        data.forEach(item => {
          csvContent += `"${item.vehicleId?.registrationNumber || 'N/A'}",${item.liters},${item.cost},"${item.fuelStation}",${item.odometerKm},"${item.filledAt.toISOString()}"\n`;
        });
      } else if (type === 'expenses') {
        csvContent += 'Category,Amount,Status,Description,Incurred At\n';
        data.forEach(item => {
          csvContent += `"${item.category}",${item.amount},"${item.status}","${item.description}","${item.incurredAt.toISOString()}"\n`;
        });
      } else if (type === 'maintenance') {
        csvContent += 'Vehicle,Type,Status,Garage,Cost,Scheduled Date\n';
        data.forEach(item => {
          csvContent += `"${item.vehicleId?.registrationNumber || 'N/A'}","${item.type}","${item.status}","${item.garage}",${item.cost},"${item.scheduledDate.toISOString()}"\n`;
        });
      }
      return res.status(200).send(csvContent);
    } else if (format === 'pdf') {
      // Return a professional-looking printable document or structured JSON formatted for PDF print client-side
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename=transitops_report_${type}.pdf`);
      
      let htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #1e293b; }
              h1 { color: #2563eb; font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; font-size: 13px; }
              th { background-color: #f8fafc; font-weight: bold; color: #475569; }
              .footer { margin-top: 30px; font-size: 11px; color: #64748b; text-align: center; }
            </style>
          </head>
          <body>
            <h1>TransitOps Operational Report: ${type.toUpperCase()}</h1>
            <p>Generated at: ${new Date().toLocaleString()}</p>
            <table>
              <thead>
      `;

      if (type === 'vehicles') {
        htmlContent += `
          <tr>
            <th>Reg No</th><th>Name</th><th>Type</th><th>Capacity (kg)</th><th>Odometer (km)</th><th>Status</th>
          </tr></thead><tbody>`;
        data.forEach(item => {
          htmlContent += `<tr><td>${item.registrationNumber}</td><td>${item.name}</td><td>${item.type}</td><td>${item.capacityKg}</td><td>${item.odometerKm}</td><td>${item.status}</td></tr>`;
        });
      } else if (type === 'drivers') {
        htmlContent += `
          <tr>
            <th>Name</th><th>Email</th><th>License</th><th>Category</th><th>Safety Score</th><th>Status</th>
          </tr></thead><tbody>`;
        data.forEach(item => {
          htmlContent += `<tr><td>${item.name}</td><td>${item.email}</td><td>${item.licenseNumber}</td><td>${item.category}</td><td>${item.safetyScore}</td><td>${item.status}</td></tr>`;
        });
      } else if (type === 'trips') {
        htmlContent += `
          <tr>
            <th>Trip No</th><th>Source</th><th>Destination</th><th>Distance (km)</th><th>Cargo (kg)</th><th>Revenue</th><th>Status</th>
          </tr></thead><tbody>`;
        data.forEach(item => {
          htmlContent += `<tr><td>${item.tripNumber}</td><td>${item.source}</td><td>${item.destination}</td><td>${item.distanceKm}</td><td>${item.cargoWeightKg}</td><td>$${item.revenue}</td><td>${item.status}</td></tr>`;
        });
      } else {
        htmlContent += `
          <tr>
            <th>ID / Category</th><th>Description / Details</th><th>Date</th><th>Amount / Cost</th>
          </tr></thead><tbody>`;
        data.forEach(item => {
          htmlContent += `<tr><td>${item.category || item.type || 'Log'}</td><td>${item.description || item.fuelStation || 'N/A'}</td><td>${new Date(item.incurredAt || item.filledAt || item.scheduledDate).toLocaleDateString()}</td><td>$${item.amount || item.cost || 0}</td></tr>`;
        });
      }

      htmlContent += `
            </tbody>
          </table>
          <div class="footer">TransitOps Fleet & Transport Logistics Platform - Enterprise Grade</div>
        </body>
      </html>`;
      return res.status(200).send(htmlContent);
    }

    res.status(400).json({ success: false, message: 'Invalid format requested' });
  } catch (error) {
    next(error);
  }
};
