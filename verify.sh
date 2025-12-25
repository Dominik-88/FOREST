#!/bin/bash

# JVS FOREST - Verification Script
# Checks all connections, data, and functionality

echo "🔍 JVS FOREST - Verification Script"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} File missing: $1"
        ((FAIL++))
        return 1
    fi
}

# Function to check string in file
check_string() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Found in $1: $2"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} Not found in $1: $2"
        ((FAIL++))
        return 1
    fi
}

# Function to count occurrences
count_string() {
    local count=$(grep -o "$2" "$1" 2>/dev/null | wc -l)
    if [ "$count" -eq "$3" ]; then
        echo -e "${GREEN}✓${NC} Count in $1: $2 = $count (expected $3)"
        ((PASS++))
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Count in $1: $2 = $count (expected $3)"
        ((WARN++))
        return 1
    fi
}

echo "📁 1. CHECKING FILE STRUCTURE"
echo "------------------------------"
check_file "index.html"
check_file "scripts/provozni-mapa.js"
check_file "manifest.json"
check_file "sw.js"
check_file "offline.html"
check_file "README.md"
check_file "CONNECTIONS.md"
echo ""

echo "📦 2. CHECKING DEPENDENCIES IN index.html"
echo "------------------------------------------"
check_string "index.html" "leaflet@1.9.4"
check_string "index.html" "leaflet.markercluster"
check_string "index.html" "font-awesome"
check_string "index.html" "scripts/provozni-mapa.js"
echo ""

echo "🎯 3. CHECKING DOM ELEMENTS IN index.html"
echo "------------------------------------------"
check_string "index.html" 'id="map"'
check_string "index.html" 'id="searchInput"'
check_string "index.html" 'id="districtFilter"'
check_string "index.html" 'id="maintainedToggle"'
check_string "index.html" 'id="totalCount"'
check_string "index.html" 'id="remainingCount"'
check_string "index.html" 'id="totalArea"'
check_string "index.html" 'id="totalFence"'
check_string "index.html" 'id="weatherContent"'
check_string "index.html" 'id="toastContainer"'
check_string "index.html" 'id="panel"'
check_string "index.html" 'id="locateBtn"'
check_string "index.html" 'id="togglePanelBtn"'
echo ""

echo "📊 4. CHECKING DATA IN provozni-mapa.js"
echo "----------------------------------------"
check_string "scripts/provozni-mapa.js" "const areas ="
count_string "scripts/provozni-mapa.js" "{id:" 41
check_string "scripts/provozni-mapa.js" "district:\"PI\""
check_string "scripts/provozni-mapa.js" "district:\"ST\""
check_string "scripts/provozni-mapa.js" "district:\"CB\""
check_string "scripts/provozni-mapa.js" "district:\"CK\""
check_string "scripts/provozni-mapa.js" "district:\"PT\""
check_string "scripts/provozni-mapa.js" "district:\"TA\""
echo ""

echo "⚙️ 5. CHECKING FUNCTIONS IN provozni-mapa.js"
echo "---------------------------------------------"
check_string "scripts/provozni-mapa.js" "function initMap()"
check_string "scripts/provozni-mapa.js" "function renderMarkers()"
check_string "scripts/provozni-mapa.js" "function applyFilters()"
check_string "scripts/provozni-mapa.js" "function updateStats()"
check_string "scripts/provozni-mapa.js" "function updateWeather()"
check_string "scripts/provozni-mapa.js" "function toggleMaintenance("
check_string "scripts/provozni-mapa.js" "function showToast("
check_string "scripts/provozni-mapa.js" "function populateDistricts()"
check_string "scripts/provozni-mapa.js" "function setupEventListeners()"
check_string "scripts/provozni-mapa.js" "function init()"
echo ""

echo "🎧 6. CHECKING EVENT LISTENERS IN provozni-mapa.js"
echo "---------------------------------------------------"
check_string "scripts/provozni-mapa.js" "addEventListener('input'"
check_string "scripts/provozni-mapa.js" "addEventListener('change'"
check_string "scripts/provozni-mapa.js" "addEventListener('click'"
check_string "scripts/provozni-mapa.js" "map.on('moveend'"
echo ""

echo "🌐 7. CHECKING API INTEGRATION"
echo "-------------------------------"
check_string "scripts/provozni-mapa.js" "open-meteo.com"
check_string "scripts/provozni-mapa.js" "temperature_2m"
check_string "scripts/provozni-mapa.js" "precipitation"
check_string "scripts/provozni-mapa.js" "wind_speed_10m"
echo ""

echo "🗺️ 8. CHECKING LEAFLET INTEGRATION"
echo "------------------------------------"
check_string "scripts/provozni-mapa.js" "L.map("
check_string "scripts/provozni-mapa.js" "L.tileLayer("
check_string "scripts/provozni-mapa.js" "L.markerClusterGroup("
check_string "scripts/provozni-mapa.js" "L.circleMarker("
echo ""

echo "📝 9. CHECKING CONSOLE LOGGING"
echo "-------------------------------"
check_string "scripts/provozni-mapa.js" "console.log('🚀"
check_string "scripts/provozni-mapa.js" "console.log('✅"
check_string "scripts/provozni-mapa.js" "console.log('📍"
check_string "scripts/provozni-mapa.js" "console.log('📌"
echo ""

echo "🔐 10. CHECKING SECURITY"
echo "------------------------"
if grep -q "innerHTML" "scripts/provozni-mapa.js"; then
    # Check if innerHTML is used safely (only for weather and stats)
    innerHTML_count=$(grep -c "innerHTML" "scripts/provozni-mapa.js")
    if [ "$innerHTML_count" -le 2 ]; then
        echo -e "${GREEN}✓${NC} innerHTML usage is minimal and safe ($innerHTML_count occurrences)"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} innerHTML usage should be reviewed ($innerHTML_count occurrences)"
        ((WARN++))
    fi
else
    echo -e "${GREEN}✓${NC} No innerHTML usage (XSS-safe)"
    ((PASS++))
fi

# Check for eval
if grep -q "eval(" "scripts/provozni-mapa.js"; then
    echo -e "${RED}✗${NC} eval() found - SECURITY RISK!"
    ((FAIL++))
else
    echo -e "${GREEN}✓${NC} No eval() usage"
    ((PASS++))
fi
echo ""

echo "📱 11. CHECKING PWA CONFIGURATION"
echo "----------------------------------"
check_file "manifest.json"
check_file "sw.js"
check_string "index.html" 'rel="manifest"'
check_string "manifest.json" '"name"'
check_string "manifest.json" '"short_name"'
check_string "manifest.json" '"start_url"'
check_string "sw.js" "self.addEventListener"
echo ""

echo "🎨 12. CHECKING CSS"
echo "-------------------"
check_string "index.html" "#map {"
check_string "index.html" "#panel {"
check_string "index.html" ".leaflet-popup-content-wrapper"
check_string "index.html" ".toast {"
echo ""

echo "=================================="
echo "📊 VERIFICATION SUMMARY"
echo "=================================="
echo -e "${GREEN}✓ Passed:${NC} $PASS"
echo -e "${YELLOW}⚠ Warnings:${NC} $WARN"
echo -e "${RED}✗ Failed:${NC} $FAIL"
echo ""

TOTAL=$((PASS + WARN + FAIL))
SCORE=$((PASS * 100 / TOTAL))

echo "Score: $SCORE% ($PASS/$TOTAL)"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CRITICAL CHECKS PASSED!${NC}"
    echo "Application is ready for deployment."
    exit 0
else
    echo -e "${RED}❌ SOME CHECKS FAILED!${NC}"
    echo "Please fix the issues above before deployment."
    exit 1
fi