# Kalangala Village Data Import - PowerShell Helper
# Run this script from the nrm-server directory

Write-Host "🚀 Kalangala Village Data Import Helper" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green

# Check current directory
$currentDir = Get-Location
Write-Host "📁 Current directory: $currentDir" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found" -ForegroundColor Red
    Write-Host "Please run this script from the nrm-server directory" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Excel file exists
$excelPath = "2025/internal elections/KALANGALA VILLAGE PARTY STRUCTURES RESULT  2025.xlsx"
if (-not (Test-Path $excelPath)) {
    Write-Host "❌ Error: Excel file not found at: $excelPath" -ForegroundColor Red
    Write-Host "Please ensure the Excel file is in the correct location" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Excel file found" -ForegroundColor Green

# Show menu
function Show-Menu {
    Write-Host "`n📋 Available Actions:" -ForegroundColor Yellow
    Write-Host "1. Validate database administrative units" -ForegroundColor White
    Write-Host "2. Inspect Excel file structure" -ForegroundColor White
    Write-Host "3. Process data (DRY RUN - no database insertion)" -ForegroundColor White
    Write-Host "4. View processing results" -ForegroundColor White
    Write-Host "5. Exit" -ForegroundColor White
    Write-Host "`n💡 Note: Database insertion requires manual code edit for safety" -ForegroundColor Cyan
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "`nSelect an option (1-5)"
    
    switch ($choice) {
        "1" {
            Write-Host "`n🏛️ Validating administrative units..." -ForegroundColor Yellow
            npm run validate-admin
            Write-Host "`n✅ Validation complete" -ForegroundColor Green
            Read-Host "Press Enter to continue"
        }
        
        "2" {
            Write-Host "`n📊 Inspecting Excel file..." -ForegroundColor Yellow
            npm run inspect-excel
            Write-Host "`n✅ Inspection complete" -ForegroundColor Green
            Read-Host "Press Enter to continue"
        }
        
        "3" {
            Write-Host "`n🔄 Processing Kalangala data (DRY RUN)..." -ForegroundColor Yellow
            Write-Host "This will NOT insert data into database yet" -ForegroundColor Cyan
            npm run process-kalangala
            Write-Host "`n✅ Processing complete" -ForegroundColor Green
            Write-Host "📁 Check scripts/kalangala_village_processed_data.csv for results" -ForegroundColor Cyan
            Read-Host "Press Enter to continue"
        }
        
        "4" {
            $csvPath = "scripts/kalangala_village_processed_data.csv"
            if (Test-Path $csvPath) {
                Write-Host "`n📊 Opening CSV file..." -ForegroundColor Yellow
                try {
                    # Try to open with default CSV viewer
                    Start-Process $csvPath
                    Write-Host "✅ CSV file opened" -ForegroundColor Green
                } catch {
                    Write-Host "❌ Could not open CSV file automatically" -ForegroundColor Red
                    Write-Host "📁 File location: $csvPath" -ForegroundColor Cyan
                }
            } else {
                Write-Host "`n❌ No results file found" -ForegroundColor Red
                Write-Host "Please run option 3 first to process the data" -ForegroundColor Yellow
            }
            Read-Host "Press Enter to continue"
        }
        
        "5" {
            Write-Host "`n👋 Goodbye!" -ForegroundColor Green
            break
        }
        
        default {
            Write-Host "`n❌ Invalid option. Please select 1-5" -ForegroundColor Red
            Read-Host "Press Enter to continue"
        }
    }
} while ($choice -ne "5")

Write-Host "`n📚 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "  - scripts/STEP_BY_STEP_GUIDE.md" -ForegroundColor White
Write-Host "  - scripts/README_KALANGALA_IMPORT.md" -ForegroundColor White
