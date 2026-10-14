/**
 * Home Page Controller
 * Handles live calculator, station preview fetching, and quick actions
 */

document.addEventListener('DOMContentLoaded', () => {
  initCalculator();
  loadLiveStationStatus();
});

function initCalculator() {
  const vehicleTypeSelect = document.getElementById('calcVehicleType');
  const batteryCapacityInput = document.getElementById('calcBatteryCapacity');
  const chargeAmountRange = document.getElementById('calcChargeAmount');
  const chargeAmountVal = document.getElementById('calcChargeAmountVal');
  const costDisplay = document.getElementById('calcEstimatedCost');

  if (!chargeAmountRange) return;

  function calculate() {
    const vType = vehicleTypeSelect ? vehicleTypeSelect.value : '4-Wheeler';
    const capacity = parseFloat(batteryCapacityInput ? batteryCapacityInput.value : 30) || 30;
    const percent = parseInt(chargeAmountRange.value) || 80;

    if (chargeAmountVal) chargeAmountVal.textContent = `${percent}%`;

    // Base rate ₹18 per kWh
    let ratePerKwh = 18;
    if (vType.includes('2')) ratePerKwh = 14;
    if (vType.includes('Bus') || vType.includes('Heavy')) ratePerKwh = 22;

    const energyNeeded = (capacity * percent) / 100;
    const totalCost = energyNeeded * ratePerKwh;

    if (costDisplay) {
      costDisplay.textContent = `₹ ${totalCost.toFixed(2)}`;
    }
  }

  if (vehicleTypeSelect) vehicleTypeSelect.addEventListener('change', calculate);
  if (batteryCapacityInput) batteryCapacityInput.addEventListener('input', calculate);
  if (chargeAmountRange) chargeAmountRange.addEventListener('input', calculate);

  calculate();
}

async function loadLiveStationStatus() {
  const container = document.getElementById('homeLiveStationsList');
  if (!container) return;

  try {
    const data = await API.get('/stations');
    if (data.success && data.stations) {
      const topStations = data.stations.slice(0, 3);
      container.innerHTML = topStations.map(stn => `
        <div class="station-live-item">
          <div class="station-info">
            <div class="name">📍 ${stn.name}</div>
            <div class="distance">${stn.distance || '2.5 km'} • ₹${stn.pricePerKwh}/kWh</div>
          </div>
          <span class="status-badge ${stn.status.toLowerCase() === 'available' ? 'available' : 'busy'}">
            ${stn.status} (${stn.availableChargers}/${stn.totalChargers})
          </span>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load stations', err);
  }
}
