# PowerShell Script to distribute TransitOps files into 4 parts for Hackathon GitHub Upload

$destFolders = @("part1_platform", "part2_ui_core", "part3_operations", "part4_analytics")

# Create directories
foreach ($folder in $destFolders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    }
}

# --- PART 1: Platform & API Foundation ---
$part1Files = @(
    "server/package.json",
    "server/src/server.js",
    "server/src/app.js",
    "server/src/config/db.js",
    "server/src/config/seed.js",
    "server/src/utils/transaction.js",
    "server/src/models/User.js",
    "server/src/models/AuditLog.js",
    "server/src/middlewares/error.js",
    "server/src/middlewares/validate.js"
)
foreach ($file in $part1Files) {
    if (Test-Path $file) {
        $dest = Join-Path "part1_platform" (Split-Path $file -Parent)
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
        Copy-Item $file -Destination $dest -Force
    }
}

# --- PART 2: UI Shell & Client Core ---
$part2Files = @(
    "client/package.json",
    "client/vite.config.js",
    "client/tailwind.config.js",
    "client/postcss.config.js",
    "client/index.html",
    "client/src/index.css",
    "client/src/main.jsx",
    "client/src/App.jsx",
    "client/src/api/apiClient.js"
)
foreach ($file in $part2Files) {
    if (Test-Path $file) {
        $dest = Join-Path "part2_ui_core" (Split-Path $file -Parent)
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
        Copy-Item $file -Destination $dest -Force
    }
}
# Copy whole directories for part 2
Copy-Item "client/src/store" -Destination "part2_ui_core/client/src/store" -Recurse -Force
Copy-Item "client/src/components" -Destination "part2_ui_core/client/src/components" -Recurse -Force


# --- PART 3: Operations & Fleet Management ---
$part3Files = @(
    "server/src/models/Vehicle.js",
    "server/src/models/Driver.js",
    "server/src/models/Trip.js",
    "server/src/models/MaintenanceRequest.js",
    "server/src/controllers/vehicle.js",
    "server/src/controllers/driver.js",
    "server/src/controllers/trip.js",
    "server/src/controllers/maintenance.js",
    "server/src/routes/vehicles.js",
    "server/src/routes/drivers.js",
    "server/src/routes/trips.js",
    "server/src/routes/maintenance.js",
    "server/src/validators/vehicle.js",
    "server/src/validators/driver.js",
    "server/src/validators/trip.js",
    "server/src/validators/maintenance.js",
    "client/src/pages/Vehicles.jsx",
    "client/src/pages/Drivers.jsx",
    "client/src/pages/Trips.jsx",
    "client/src/pages/Maintenance.jsx"
)
foreach ($file in $part3Files) {
    if (Test-Path $file) {
        $dest = Join-Path "part3_operations" (Split-Path $file -Parent)
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
        Copy-Item $file -Destination $dest -Force
    }
}


# --- PART 4: Authentication, Analytics & Reporting ---
$part4Files = @(
    "server/src/models/FuelLog.js",
    "server/src/models/Expense.js",
    "server/src/middlewares/auth.js",
    "server/src/controllers/auth.js",
    "server/src/controllers/fuel.js",
    "server/src/controllers/expense.js",
    "server/src/controllers/dashboard.js",
    "server/src/controllers/report.js",
    "server/src/controllers/settings.js",
    "server/src/routes/auth.js",
    "server/src/routes/fuel.js",
    "server/src/routes/expenses.js",
    "server/src/routes/dashboard.js",
    "server/src/routes/reports.js",
    "server/src/routes/settings.js",
    "server/src/validators/auth.js",
    "server/src/validators/fuel.js",
    "server/src/validators/expense.js",
    "client/src/pages/Login.jsx",
    "client/src/pages/ForgotPassword.jsx",
    "client/src/pages/Dashboard.jsx",
    "client/src/pages/Fuel.jsx",
    "client/src/pages/Expenses.jsx",
    "client/src/pages/Reports.jsx",
    "client/src/pages/Settings.jsx"
)
foreach ($file in $part4Files) {
    if (Test-Path $file) {
        $dest = Join-Path "part4_analytics" (Split-Path $file -Parent)
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
        Copy-Item $file -Destination $dest -Force
    }
}

Write-Host "TransitOps files distributed successfully into 4 parts!"
