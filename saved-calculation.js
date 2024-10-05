document.addEventListener('DOMContentLoaded', function () {
  // Variables to hold chart instances
  let cashflowChartInstance = null;
  let growthChartInstance = null;

  // Function to calculate weekly repayment
  function calculateWeeklyRepayment(loanAmount, annualInterestRate, loanTermYears, loanType) {
    const paymentsPerYear = 52; // Weekly payments
    const totalNumberOfPayments = loanTermYears * paymentsPerYear;
    const periodicInterestRate = (annualInterestRate / 100) / paymentsPerYear; // Convert annual rate to periodic rate

    let weeklyRepayment;

    if (loanType === 'interestOnly') {
      // Interest-Only Loan
      weeklyRepayment = loanAmount * periodicInterestRate;
    } else if (loanType === 'principalAndInterest') {
      // Principal & Interest Loan (Amortizing Loan)
      const numerator = periodicInterestRate * Math.pow(1 + periodicInterestRate, totalNumberOfPayments);
      const denominator = Math.pow(1 + periodicInterestRate, totalNumberOfPayments) - 1;
      weeklyRepayment = loanAmount * (numerator / denominator);
    } else {
      // Default to zero if loan type is not recognized
      weeklyRepayment = 0;
    }

    return weeklyRepayment;
  }

  // Function to draw charts and show final numbers for Cash Flow Calculator
  function drawCharts(propertyValue, loanAmount, interestRate, loanTerm, employmentIncome, otherIncome, loanType, age, expectedWeeklyRent) {
    const paymentsPerYear = 52; // Weekly payments
    const totalNumberOfPayments = loanTerm * paymentsPerYear;
    const periodicInterestRate = (interestRate / 100) / paymentsPerYear;

    // Calculate weekly repayment
    const weeklyRepayment = calculateWeeklyRepayment(loanAmount, interestRate, loanTerm, loanType);

    // Calculate total interest paid
    const totalInterestPaid = (weeklyRepayment * totalNumberOfPayments) - loanAmount;

    // Estimate the property value after 10% annual growth for the loan term
    const estimatedPropertyValue = propertyValue * Math.pow(1 + 0.10, loanTerm);

    // Generate years for the x-axis
    const years = Array.from({ length: loanTerm }, (_, i) => i + 1);

    // Calculate weekly cashflow for each year
    const rentGrowthRate = 0.02; // 2% annual rent growth
    const cashflowValues = years.map(year => {
      const adjustedWeeklyRent = expectedWeeklyRent * Math.pow(1 + rentGrowthRate, year - 1);
      const weeklyCashflow = adjustedWeeklyRent - weeklyRepayment;
      return weeklyCashflow;
    });

    // Calculate property value growth
    const propertyValues = years.map(year => propertyValue * Math.pow(1 + 0.10, year));

    // Draw Cashflow Chart
    const cashflowCtx = document.getElementById('cashflowChart').getContext('2d');

    // Destroy existing chart instance if it exists
    if (cashflowChartInstance) {
      cashflowChartInstance.destroy();
    }

    cashflowChartInstance = new Chart(cashflowCtx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'Weekly Cashflow',
          data: cashflowValues,
          borderColor: 'blue',
          backgroundColor: 'rgba(0, 0, 255, 0.1)',
          fill: true
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Weekly Cashflow Projections'
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Year'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Weekly Cashflow ($)'
            }
          }
        }
      }
    });

    // Draw Growth Chart
    const growthCtx = document.getElementById('growthChart').getContext('2d');

    // Destroy existing chart instance if it exists
    if (growthChartInstance) {
      growthChartInstance.destroy();
    }

    growthChartInstance = new Chart(growthCtx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'Property Value',
          data: propertyValues,
          borderColor: 'green',
          backgroundColor: 'rgba(0, 128, 0, 0.1)',
          fill: true
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Growth Projections'
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Year'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Property Value ($)'
            }
          }
        }
      }
    });

    // Calculate total tax paid until retirement
    let yearsUntil65 = 65 - age;
    if (yearsUntil65 < 0) {
      yearsUntil65 = 0; // Already over 65
    }
    const totalIncome = employmentIncome + otherIncome;
    const currentTaxPerYear = totalIncome * 0.30; // Assuming flat 30% tax rate
    const totalTaxUntilRetirement = currentTaxPerYear * yearsUntil65;

    // Display final numbers (text results)
    document.getElementById('totalInterest').innerText = `$${totalInterestPaid.toLocaleString()}`;
    document.getElementById('propertyValueGrowth').innerText = `$${estimatedPropertyValue.toLocaleString()}`;
    document.getElementById('weeklyRepayment').innerText = `$${weeklyRepayment.toFixed(2)}`;
    document.getElementById('totalTaxUntilRetirement').innerText = `$${totalTaxUntilRetirement.toLocaleString()}`;

    // Display first year's weekly cashflow
    document.getElementById('estimatedWeeklyCashflow').innerText = `$${cashflowValues[0].toFixed(2)}`;
  }

  // Function to calculate Soft Purchasing Capacity
  function calculateSoftPurchasingCapacity() {
    const purchaserType = document.getElementById('purchaserType').value;
    const yearlyIncome1 = parseFloat(document.getElementById('yearlyIncome1').value) || 0;
    const yearlyIncome2 = parseFloat(document.getElementById('yearlyIncome2').value) || 0;
    const otherMonthlyIncome = parseFloat(document.getElementById('otherMonthlyIncome').value) || 0;
    const dependents = parseInt(document.getElementById('dependents').value) || 0;
    const totalSavings = parseFloat(document.getElementById('totalSavings').value) || 0;
    const remainingMortgage = parseFloat(document.getElementById('remainingMortgage').value) || 0;
    const creditCardLimits = parseFloat(document.getElementById('creditCardLimits').value) || 0;
    const personalLoanBalance = parseFloat(document.getElementById('personalLoanBalance').value) || 0;

    // Implement the formula
    const adjustedYearlyIncome2 = yearlyIncome2 * 0.9;
    const totalYearlyIncome = yearlyIncome1 + adjustedYearlyIncome2;
    let totalOtherIncome;

    if (purchaserType === 'Investor') {
      totalOtherIncome = (otherMonthlyIncome + 2000) * 12;
    } else {
      totalOtherIncome = otherMonthlyIncome * 12;
    }

    const incomeMultiplier = 5;
    const dependentsDeduction = dependents * 50000;
    const creditCardDeduction = creditCardLimits * 4.75;
    const personalLoanDeduction = personalLoanBalance * 2.7;

    const softPurchasingCapacity = ((totalYearlyIncome + totalOtherIncome) * incomeMultiplier)
      - dependentsDeduction
      - remainingMortgage
      - creditCardDeduction
      - personalLoanDeduction
      + totalSavings;

    // Display the result with color coding
    const capacityElement = document.getElementById('softPurchasingCapacity');
    capacityElement.innerText = `$${softPurchasingCapacity.toLocaleString()}`;

    if (softPurchasingCapacity < 450000) {
      capacityElement.classList.remove('result-positive');
      capacityElement.classList.add('result-negative');
    } else {
      capacityElement.classList.remove('result-negative');
      capacityElement.classList.add('result-positive');
    }
  }

  // Function to populate fields from URL parameters
  function populateFieldsFromURL() {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
      const inputElement = document.getElementById(key);
      if (inputElement) {
        inputElement.value = value;
      }
    });

    // Perform calculations automatically upon loading
    const age = parseInt(document.getElementById('age').value) || 0;
    const employmentIncome = parseFloat(document.getElementById('employmentIncome').value) || 0;
    const otherIncome = parseFloat(document.getElementById('otherIncome').value) || 0;
    const propertyValue = parseFloat(document.getElementById('propertyValue').value) || 0;
    const expectedWeeklyRent = parseFloat(document.getElementById('expectedWeeklyRent').value) || 0;
    const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const loanTerm = parseInt(document.getElementById('loanTerm').value) || 0;
    const loanType = document.getElementById('loanType').value;

    if (loanAmount > 0 && interestRate > 0 && loanTerm > 0) {
      drawCharts(
        propertyValue,
        loanAmount,
        interestRate,
        loanTerm,
        employmentIncome,
        otherIncome,
        loanType,
        age,
        expectedWeeklyRent
      );
    }
  }

  // Call the function on page load
  populateFieldsFromURL();

  // Event listener for the calculate button (Cash Flow Calculator)
  document.getElementById('calculateBtn').addEventListener('click', function () {
    // Get user inputs
    const age = parseInt(document.getElementById('age').value) || 0;
    const employmentIncome = parseFloat(document.getElementById('employmentIncome').value) || 0;
    const otherIncome = parseFloat(document.getElementById('otherIncome').value) || 0;
    const propertyValue = parseFloat(document.getElementById('propertyValue').value) || 0;
    const expectedWeeklyRent = parseFloat(document.getElementById('expectedWeeklyRent').value) || 0;
    const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const loanTerm = parseInt(document.getElementById('loanTerm').value) || 0;
    const loanType = document.getElementById('loanType').value;

    // Validate age
    if (age <= 0 || age > 100) {
      alert('Please enter a valid age.');
      return;
    }

    // Check if loanTerm is valid
    if (loanTerm <= 0) {
      alert('Please enter a valid loan term.');
      return;
    }

    // Draw the charts and display the final numbers
    drawCharts(propertyValue, loanAmount, interestRate, loanTerm, employmentIncome, otherIncome, loanType, age, expectedWeeklyRent);

    // Generate the shareable link
    const shareableLink = generateShareableLink();

    // Display the shareable link to the user
    const linkElement = document.getElementById('shareableLink');
    linkElement.value = shareableLink;
  });

  // Function to generate a shareable link
  function generateShareableLink() {
    const params = new URLSearchParams();

    // List of input IDs
    const inputIds = [
      'age', 'employmentIncome', 'otherIncome', 'propertyValue',
      'expectedWeeklyRent', 'loanAmount', 'interestRate', 'loanTerm', 'loanType'
    ];

    // Get values from input fields
    inputIds.forEach(function(id) {
      const inputElement = document.getElementById(id);
      if (inputElement && inputElement.value) {
        params.append(id, inputElement.value);
      }
    });

    // Generate the URL
    const extensionId = chrome.runtime.id;
    const baseUrl = `chrome-extension://${extensionId}/saved-calculation.html`;
    const shareableLink = `${baseUrl}?${params.toString()}`;

    return shareableLink;
  }

  // Event listener for the copy link button
  document.getElementById('copyLinkBtn').addEventListener('click', function () {
    const linkElement = document.getElementById('shareableLink');
    linkElement.select();
    linkElement.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand('copy');
    alert('Link copied to clipboard!');
  });

  // Navigation Logic
  document.getElementById('cashFlowBtn').addEventListener('click', function () {
    document.getElementById('cashFlowSection').style.display = 'block';
    document.getElementById('purchasingPowerSection').style.display = 'none';
  });

  document.getElementById('purchasingPowerBtn').addEventListener('click', function () {
    document.getElementById('cashFlowSection').style.display = 'none';
    document.getElementById('purchasingPowerSection').style.display = 'block';
  });

  // Event listener for the calculate button (Purchasing Power Calculator)
  document.getElementById('calculatePurchasingPowerBtn').addEventListener('click', function () {
    calculateSoftPurchasingCapacity();
  });

  // Open Full Screen button logic (if applicable)
  // Remove or adjust if not needed

  // Save user inputs to localStorage when they change
  const inputIds = [
    'age', 'employmentIncome', 'otherIncome', 'propertyValue', 'expectedWeeklyRent', 'loanAmount', 'interestRate', 'loanTerm', 'loanType',
    'applicant1Name', 'applicant2Name', 'purchaserType', 'yearlyIncome1', 'yearlyIncome2', 'otherMonthlyIncome',
    'dependents', 'totalSavings', 'remainingMortgage', 'creditCardLimits', 'personalLoanBalance'
  ];

  inputIds.forEach(function(id) {
    const inputElement = document.getElementById(id);
    if (inputElement) {
      // Load saved value from localStorage
      const savedValue = localStorage.getItem(id);
      if (savedValue !== null) {
        inputElement.value = savedValue;
      }

      // Add event listener to save value when it changes
      inputElement.addEventListener('input', function() {
        localStorage.setItem(id, inputElement.value);
      });
    }
  });
});
