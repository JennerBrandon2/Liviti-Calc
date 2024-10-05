// popup.js

document.addEventListener('DOMContentLoaded', function () {
  // Variables to hold chart instances
  let usableEquityChartInstance = null;
  let loanToValueChartInstance = null;
  let portfolioCashflowChartInstance = null;
  let equityPositionChartInstance = null;
  let passiveIncomeChartInstance = null;

  // Navigation buttons
  const personalDetailsBtn = document.getElementById('personalDetailsBtn');
  const cashFlowBtn = document.getElementById('cashFlowBtn');
  const purchasingPowerBtn = document.getElementById('purchasingPowerBtn');
  const dashboardBtn = document.getElementById('dashboardBtn');
  const assumptionsBtn = document.getElementById('assumptionsBtn');
  const portfolioBtn = document.getElementById('portfolioBtn');
  const fullScreenBtn = document.getElementById('fullScreenBtn');

  // Sections
  const personalDetailsSection = document.getElementById('personalDetailsSection');
  const cashFlowSection = document.getElementById('cashFlowSection');
  const purchasingPowerSection = document.getElementById('purchasingPowerSection');
  const dashboardSection = document.getElementById('dashboardSection');
  const assumptionsSection = document.getElementById('assumptionsSection');
  const portfolioSection = document.getElementById('portfolioSection');

  // Global variables to store property data
  let propertiesData = [];
  let numberOfProperties = parseInt(localStorage.getItem('numberOfProperties')) || 1;

  // Event listeners for navigation buttons
  personalDetailsBtn.addEventListener('click', function () {
    showSection('personalDetailsSection');
    initializePersonalDetails();
  });

  cashFlowBtn.addEventListener('click', function () {
    showSection('cashFlowSection');
  });

  purchasingPowerBtn.addEventListener('click', function () {
    showSection('purchasingPowerSection');
  });

  dashboardBtn.addEventListener('click', function () {
    showSection('dashboardSection');
    updateDashboardCharts();
  });

  assumptionsBtn.addEventListener('click', function () {
    showSection('assumptionsSection');
  });

  portfolioBtn.addEventListener('click', function () {
    showSection('portfolioSection');
    updatePortfolioCharts();
  });

  fullScreenBtn.addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: 'openFullScreen' });
  });

  function showSection(sectionId) {
    // Hide all sections
    const sections = [
      personalDetailsSection,
      cashFlowSection,
      purchasingPowerSection,
      dashboardSection,
      assumptionsSection,
      portfolioSection
    ];
    sections.forEach(section => {
      section.style.display = 'none';
    });

    // Show the selected section
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
      sectionToShow.style.display = 'block';
    }
  }

  // Initialize the first section
  showSection('cashFlowSection');

  // Function to initialize Personal Details Section
  function initializePersonalDetails() {
    const personalDetailsContent = document.getElementById('personalDetailsContent');
    personalDetailsContent.innerHTML = ''; // Clear previous content

    // Check if user details are already saved
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      // Display the profile directly
      displayPersonalDetailsSummary(JSON.parse(userDetails));
    } else {
      // Proceed with progressive questions
      displayPersonalDetailsQuestions();
    }
  }

  function displayPersonalDetailsQuestions() {
    const personalDetailsContent = document.getElementById('personalDetailsContent');
    personalDetailsContent.innerHTML = ''; // Clear previous content

    // Questions Data
    const questions = [
      {
        id: 'nameQuestion',
        question: 'What is your name?',
        type: 'text',
        key: 'userName'
      },
      {
        id: 'maritalStatusQuestion',
        question: 'What is your marital status?',
        type: 'radio',
        options: ['Single', 'Married'],
        key: 'maritalStatus'
      },
      {
        id: 'kidsQuestion',
        question: 'Do you have any kids?',
        type: 'radio',
        options: ['Yes', 'No'],
        key: 'hasKids'
      },
      {
        id: 'riskProfileQuestion',
        question: 'What is your risk profile?',
        type: 'radio',
        options: ['Conservative', 'Moderate', 'Aggressive'],
        key: 'riskProfile'
      },
      {
        id: 'passiveIncomeGoalQuestion',
        question: 'How much passive income do you require for retirement?',
        type: 'select',
        options: ['65000', '80000', '100000', '200000', '350000', '500000', '750000', '1000000'],
        key: 'passiveIncomeGoal'
      },
      {
        id: 'desiredRetirementAgeQuestion',
        question: 'What is your desired retirement age?',
        type: 'slider',
        min: 45,
        max: 80,
        key: 'desiredRetirementAge'
      },
      {
        id: 'emailQuestion',
        question: 'What is your email address? (Optional)',
        type: 'text',
        key: 'email'
      },
      {
        id: 'phoneQuestion',
        question: 'What is your phone number? (Optional)',
        type: 'text',
        key: 'phone'
      }
    ];

    // Create question elements
    questions.forEach((q, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'personal-question';
      questionDiv.id = q.id;
      if (index === 0) questionDiv.classList.add('active'); // Show the first question

      questionDiv.innerHTML = `
        <h3>${q.question}</h3>
        <div class="input-row">
          ${generateInputField(q)}
        </div>
      `;

      personalDetailsContent.appendChild(questionDiv);

      // Bind event listener for slider to show the number
      if (q.type === 'slider') {
        const slider = questionDiv.querySelector('.input-element');
        const valueDisplay = questionDiv.querySelector(`#${q.id}Value`);
        slider.addEventListener('input', function () {
          valueDisplay.textContent = slider.value;
        });
      }
    });

    // Navigation Buttons
    const navigationDiv = document.createElement('div');
    navigationDiv.id = 'personalDetailsNavigation';
    navigationDiv.innerHTML = `
      <button id="prevQuestionBtn" disabled>Previous</button>
      <button id="nextQuestionBtn">Next</button>
    `;
    personalDetailsContent.appendChild(navigationDiv);

    // Event Listeners for Navigation
    let currentQuestionIndex = 0;

    const prevBtn = document.getElementById('prevQuestionBtn');
    const nextBtn = document.getElementById('nextQuestionBtn');

    prevBtn.addEventListener('click', function () {
      if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
      }
    });

    nextBtn.addEventListener('click', function () {
      const currentQuestion = questions[currentQuestionIndex];
      const inputElement = document.querySelector(`#${currentQuestion.id} .input-element`);

      // Save the answer
      const answer = getInputValue(inputElement, currentQuestion.type);
      localStorage.setItem(currentQuestion.key, answer);

      if (currentQuestionIndex < questions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
      } else {
        // Show summary
        showSummary(questions);
      }
    });

    function showQuestion(index) {
      const questionDivs = document.querySelectorAll('.personal-question');
      questionDivs[currentQuestionIndex].classList.remove('active');
      questionDivs[index].classList.add('active');
      currentQuestionIndex = index;

      // Update navigation buttons
      prevBtn.disabled = currentQuestionIndex === 0;
      nextBtn.textContent = currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next';
    }

    function showSummary(questions) {
      const userDetails = {};
      questions.forEach(q => {
        userDetails[q.key] = localStorage.getItem(q.key);
      });
      localStorage.setItem('userDetails', JSON.stringify(userDetails));

      displayPersonalDetailsSummary(userDetails);
    }

    function generateInputField(question) {
      switch (question.type) {
        case 'text':
          return `<input type="text" class="input-element">`;
        case 'radio':
          return question.options.map(option => `
            <label>
              <input type="radio" name="${question.id}" value="${option}" class="input-element"> ${option}
            </label>
          `).join('<br>');
        case 'select':
          return `
            <select class="input-element">
              ${question.options.map(option => `<option value="${option}">$${parseInt(option).toLocaleString()}</option>`).join('')}
            </select>
          `;
        case 'slider':
          return `
            <input type="range" min="${question.min}" max="${question.max}" value="${(question.min + question.max) / 2}" class="input-element" id="${question.id}Slider">
            <span id="${question.id}Value">${(question.min + question.max) / 2}</span>
          `;
        default:
          return '';
      }
    }

    function getInputValue(inputElement, type) {
      switch (type) {
        case 'text':
          return inputElement.value.trim();
        case 'radio':
          const checkedOption = document.querySelector(`input[name="${inputElement.name}"]:checked`);
          return checkedOption ? checkedOption.value : '';
        case 'select':
          return inputElement.value;
        case 'slider':
          return inputElement.value;
        default:
          return '';
      }
    }
  }

  function displayPersonalDetailsSummary(userDetails) {
    const personalDetailsContent = document.getElementById('personalDetailsContent');
    personalDetailsContent.innerHTML = ''; // Clear previous content

    const summaryDiv = document.createElement('div');
    summaryDiv.id = 'personalDetailsSummary';

    summaryDiv.innerHTML = `
      <h3>${userDetails.userName}'s Profile</h3>
      <div class="summary-content">
        <div class="summary-item">
          <h4>Marital Status</h4>
          <div>${userDetails.maritalStatus}</div>
        </div>
        <div class="summary-item">
          <h4>Has Kids</h4>
          <div>${userDetails.hasKids}</div>
        </div>
        <div class="summary-item">
          <h4>Risk Profile</h4>
          <div>${userDetails.riskProfile}</div>
        </div>
        <div class="summary-item">
          <h4>Passive Income Goal</h4>
          <div>$${parseInt(userDetails.passiveIncomeGoal).toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <h4>Desired Retirement Age</h4>
          <div>${userDetails.desiredRetirementAge}</div>
        </div>
        <div class="summary-item">
          <h4>Email</h4>
          <div>${userDetails.email || 'Not provided'}</div>
        </div>
        <div class="summary-item">
          <h4>Phone</h4>
          <div>${userDetails.phone || 'Not provided'}</div>
        </div>
      </div>
      <button id="editProfileBtn">Edit Profile</button>
    `;

    // Additional calculations and messages
    const age = parseInt(localStorage.getItem('age')) || 0;
    const desiredRetirementAge = parseInt(userDetails.desiredRetirementAge) || 65;
    let yearsUntilRetirement = desiredRetirementAge - age;
    if (yearsUntilRetirement < 0) yearsUntilRetirement = 0;

    const passiveIncomeGoal = parseInt(userDetails.passiveIncomeGoal) || 65000;

    // Use the passive income at retirement age from portfolio data
    const totalPassiveIncome = getPassiveIncomeAtRetirement(yearsUntilRetirement);

    const additionalPropertiesNeeded = calculateAdditionalPropertiesNeeded(passiveIncomeGoal, totalPassiveIncome);

    const additionalMessage = document.createElement('div');
    additionalMessage.className = 'additional-message';
    additionalMessage.innerHTML = `
      <h4>Additional Information</h4>
      <div>
        <strong>Years until retirement:</strong> ${yearsUntilRetirement > 0 ? yearsUntilRetirement : 'Already at or past retirement age'}
        <br>
        <strong>Current passive income at retirement:</strong> $${totalPassiveIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        <br>
        <strong>Passive income goal:</strong> $${passiveIncomeGoal.toLocaleString()}
        <br>
        <strong>Additional properties needed:</strong> ${additionalPropertiesNeeded}
      </div>
      <p><em>The additional properties needed is calculated by dividing the income gap by the average passive income per property at retirement.</em></p>
    `;
    summaryDiv.appendChild(additionalMessage);

    personalDetailsContent.appendChild(summaryDiv);

    // Add event listener to Edit Profile button
    document.getElementById('editProfileBtn').addEventListener('click', function () {
      localStorage.removeItem('userDetails');
      initializePersonalDetails();
    });
  }

  function getPassiveIncomeAtRetirement(yearsUntilRetirement) {
    if (propertiesData.length === 0) {
      return 0;
    }

    const totalPassiveIncome = calculateTotalPassiveIncomeForYear(yearsUntilRetirement);

    return totalPassiveIncome * 52; // Convert weekly to annual
  }

  function calculateTotalPassiveIncomeForYear(year) {
    let totalPassiveIncome = 0;
    propertiesData.forEach(p => {
      const passiveCashflow = calculatePassiveCashflowForYear(p, year);
      totalPassiveIncome += passiveCashflow;
    });
    return totalPassiveIncome;
  }

  function calculatePassiveCashflowForYear(p, year) {
    // Calculate adjusted weekly rent
    const rentGrowthRate = 0.02; // 2% annual rent growth
    const adjustedWeeklyRent = p.expectedWeeklyRent * Math.pow(1 + rentGrowthRate, year - 1);

    // Calculate weekly repayment based on the year
    const weeklyRepayment = calculateWeeklyRepaymentForYear(p, year);

    const passiveCashflow = adjustedWeeklyRent - weeklyRepayment;
    return passiveCashflow;
  }

  function calculateWeeklyRepaymentForYear(p, year) {
    const paymentsPerYear = 52; // Weekly payments
    const annualInterestRate = p.interestRate / 100;
    const IOPeriodYears = p.IOPeriodYears || 0;
    const loanTermYears = p.loanTerm;

    let weeklyRepayment = 0;

    if (year <= IOPeriodYears) {
      // Interest-Only Period
      weeklyRepayment = (p.loanAmount * annualInterestRate) / paymentsPerYear;
    } else if (year <= loanTermYears) {
      // Principal & Interest Period
      const r = annualInterestRate / paymentsPerYear;
      const nPI = (loanTermYears - IOPeriodYears) * paymentsPerYear;
      const numerator = r * Math.pow(1 + r, nPI);
      const denominator = Math.pow(1 + r, nPI) - 1;
      weeklyRepayment = p.loanAmount * (numerator / denominator);
    } else {
      // Post-Loan Period (Loan is paid off)
      weeklyRepayment = 0;
    }

    return weeklyRepayment;
  }

  function calculateAdditionalPropertiesNeeded(goal, currentIncome) {
    const incomeGap = goal - currentIncome;
    if (incomeGap <= 0) {
      return 0;
    }
    // Assume average passive income per property at retirement
    const yearsUntilRetirement = parseInt(localStorage.getItem('desiredRetirementAge')) - (parseInt(localStorage.getItem('age')) || 0);
    const averagePassiveIncomePerProperty = propertiesData.length > 0
      ? calculateTotalPassiveIncomeForYear(yearsUntilRetirement) / propertiesData.length * 52 // Annualize
      : 0;
    if (averagePassiveIncomePerProperty === 0) {
      return 'Cannot determine without property data.';
    }
    return Math.ceil(incomeGap / averagePassiveIncomePerProperty);
  }

  // Function to generate property input fields
  function generatePropertyInputs() {
    const propertiesContainer = document.getElementById('propertiesContainer');
    propertiesContainer.innerHTML = ''; // Clear previous inputs

    for (let i = 1; i <= numberOfProperties; i++) {
      const propertySection = document.createElement('div');
      propertySection.className = 'property-section';
      propertySection.innerHTML = `
        <h4>Property ${i}</h4>
        <div class="input-group">
          <div class="input-row">
            <label>Property Value</label>
            <input type="number" id="propertyValue${i}" placeholder="Property Value">
          </div>
          <div class="input-row">
            <label>Loan Amount</label>
            <input type="number" id="loanAmount${i}" placeholder="Loan Amount">
          </div>
          <div class="input-row">
            <label>Expected Weekly Rent</label>
            <input type="number" id="expectedWeeklyRent${i}" placeholder="Expected Weekly Rent">
          </div>
          <div class="input-row">
            <label>Interest Rate (%)</label>
            <input type="number" id="interestRate${i}" placeholder="Interest Rate">
          </div>
          <div class="input-row">
            <label>Loan Term (years)</label>
            <input type="number" id="loanTerm${i}" placeholder="Loan Term">
          </div>
          <div class="input-row">
            <label>Interest-Only Period (years)</label>
            <input type="number" id="IOPeriodYears${i}" placeholder="Interest-Only Period">
          </div>
          <div class="input-row">
            <label>Loan Type</label>
            <select id="loanType${i}">
              <option value="interestOnly">Interest Only</option>
              <option value="principalAndInterest">Principal & Interest</option>
            </select>
          </div>
        </div>
      `;
      propertiesContainer.appendChild(propertySection);

      // Load saved values for each property
      loadPropertyInputs(i);
    }
  }

  // Generate property inputs on page load
  generatePropertyInputs();

  // Update property inputs when number of properties changes
  const numberOfPropertiesInput = document.getElementById('numberOfProperties');
  numberOfPropertiesInput.value = numberOfProperties;
  numberOfPropertiesInput.addEventListener('input', function () {
    numberOfProperties = parseInt(this.value) || 1;
    localStorage.setItem('numberOfProperties', numberOfProperties);
    generatePropertyInputs();
  });

  // Function to save property inputs
  function savePropertyInputs(propertyIndex) {
    const propertyFields = ['propertyValue', 'loanAmount', 'expectedWeeklyRent', 'interestRate', 'loanTerm', 'loanType', 'IOPeriodYears'];
    propertyFields.forEach(field => {
      const element = document.getElementById(`${field}${propertyIndex}`);
      if (element) {
        localStorage.setItem(`${field}${propertyIndex}`, element.value);
      }
    });
  }

  // Function to load property inputs
  function loadPropertyInputs(propertyIndex) {
    const propertyFields = ['propertyValue', 'loanAmount', 'expectedWeeklyRent', 'interestRate', 'loanTerm', 'loanType', 'IOPeriodYears'];
    propertyFields.forEach(field => {
      const element = document.getElementById(`${field}${propertyIndex}`);
      if (element) {
        const savedValue = localStorage.getItem(`${field}${propertyIndex}`);
        if (savedValue !== null) {
          element.value = savedValue;
        }
        // Add event listener to save value when it changes
        element.addEventListener('input', function () {
          localStorage.setItem(`${field}${propertyIndex}`, element.value);
        });
      }
    });
  }

  // Cash Flow Calculator Logic
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

  // Function to calculate and store property data
  function calculatePropertiesData() {
    propertiesData = []; // Reset data
    const age = parseInt(document.getElementById('age').value) || 0;
    const employmentIncome = parseFloat(document.getElementById('employmentIncome').value) || 0;
    const otherIncome = parseFloat(document.getElementById('otherIncome').value) || 0;

    let totalInterestPaid = 0;
    let totalEstimatedPropertyValue = 0;
    let totalWeeklyRepayment = 0;
    let totalEstimatedWeeklyCashflow = 0;

    for (let i = 1; i <= numberOfProperties; i++) {
      const propertyValue = parseFloat(document.getElementById(`propertyValue${i}`).value) || 0;
      const loanAmount = parseFloat(document.getElementById(`loanAmount${i}`).value) || 0;
      const expectedWeeklyRent = parseFloat(document.getElementById(`expectedWeeklyRent${i}`).value) || 0;
      const interestRate = parseFloat(document.getElementById(`interestRate${i}`).value) || 0;
      const loanTerm = parseInt(document.getElementById(`loanTerm${i}`).value) || 0;
      const IOPeriodYears = parseInt(document.getElementById(`IOPeriodYears${i}`).value) || 0;
      const loanTypeElement = document.getElementById(`loanType${i}`);
      const loanType = loanTypeElement ? loanTypeElement.value : 'interestOnly';

      // Validate inputs
      if (loanAmount <= 0 || interestRate <= 0 || loanTerm <= 0 || propertyValue <= 0) {
        alert(`Please enter valid inputs for Property ${i}.`);
        return;
      }

      if (IOPeriodYears < 0 || IOPeriodYears > loanTerm) {
        alert(`Please enter a valid Interest-Only Period for Property ${i}. It should be between 0 and the loan term.`);
        return;
      }

      const weeklyRepayment = calculateWeeklyRepayment(loanAmount, interestRate, loanTerm, loanType);
      const totalNumberOfPayments = loanTerm * 52;

      let interestPaid;
      if (loanType === 'interestOnly') {
        // Interest Only Loan
        interestPaid = loanAmount * (interestRate / 100) * loanTerm;
      } else {
        // Principal & Interest Loan
        interestPaid = (weeklyRepayment * totalNumberOfPayments) - loanAmount;
      }

      const growthRate = parseFloat(document.getElementById('assumptionGrowthRate').value) / 100 || 0.05;
      // Estimated property value after loan term
      const estimatedPropertyValue = propertyValue * Math.pow(1 + growthRate, loanTerm);

      const adjustedWeeklyRent = expectedWeeklyRent; // Initial weekly rent
      const weeklyCashflow = adjustedWeeklyRent - weeklyRepayment;

      propertiesData.push({
        propertyValue,
        loanAmount,
        expectedWeeklyRent,
        interestRate,
        loanTerm,
        loanType,
        weeklyRepayment,
        interestPaid,
        estimatedPropertyValue,
        weeklyCashflow,
        IOPeriodYears, // Add this line
      });

      totalInterestPaid += interestPaid;
      totalEstimatedPropertyValue += estimatedPropertyValue;
      totalWeeklyRepayment += weeklyRepayment;
      totalEstimatedWeeklyCashflow += weeklyCashflow;

      // Save property inputs
      savePropertyInputs(i);
    }

    // Calculate total tax until retirement
    let yearsUntilRetirement = (parseInt(localStorage.getItem('desiredRetirementAge')) || 65) - age;
    if (yearsUntilRetirement < 0) {
      yearsUntilRetirement = 0; // Already at or past retirement age
    }
    const totalIncome = employmentIncome + otherIncome;
    const currentTaxPerYear = totalIncome * 0.30; // Assuming flat 30% tax rate
    const totalTaxUntilRetirement = currentTaxPerYear * yearsUntilRetirement;

    // Display final numbers (text results)
    document.getElementById('totalInterest').innerText = `$${totalInterestPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('totalPropertyValueGrowth').innerText = `$${totalEstimatedPropertyValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('totalWeeklyRepayment').innerText = `$${totalWeeklyRepayment.toFixed(2)}`;
    document.getElementById('totalTaxUntilRetirement').innerText = `$${totalTaxUntilRetirement.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('totalEstimatedWeeklyCashflow').innerText = `$${totalEstimatedWeeklyCashflow.toFixed(2)}`;
  }

  // Event listener for the calculate button (Cash Flow Calculator)
  const calculateBtn = document.getElementById('calculateBtn');
  calculateBtn.addEventListener('click', function () {
    calculatePropertiesData();
    alert('Calculations completed! You can now view the Dashboard and Portfolio Details.');
  });

  // Purchasing Power Calculator Logic
  // Function to calculate Soft Purchasing Capacity
  function calculateSoftPurchasingCapacity() {
    // Get user inputs
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
    capacityElement.innerText = `$${softPurchasingCapacity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (softPurchasingCapacity < 450000) {
      capacityElement.classList.remove('result-positive');
      capacityElement.classList.add('result-negative');
    } else {
      capacityElement.classList.remove('result-negative');
      capacityElement.classList.add('result-positive');
    }
  }

  // Event listener for the calculate button (Purchasing Power Calculator)
  const calculatePurchasingPowerBtn = document.getElementById('calculatePurchasingPowerBtn');
  calculatePurchasingPowerBtn.addEventListener('click', function () {
    calculateSoftPurchasingCapacity();
  });

  // Functions to update Dashboard Charts
  function updateDashboardCharts() {
    console.log('updateDashboardCharts called');
    console.log('Properties Data:', propertiesData);

    if (propertiesData.length === 0) {
      alert('Please perform calculations in the Cash Flow Calculator first.');
      showSection('cashFlowSection');
      return;
    }

    // Prepare data for charts
    const propertyLabels = propertiesData.map((_, index) => `Property ${index + 1}`);

    // Usable Equity Calculation
    const usableEquityData = propertiesData.map(p => {
      const equity = (p.propertyValue * 0.8) - p.loanAmount; // Usable equity is 80% of current property value minus loan amount
      return equity > 0 ? equity : 0; // Ensure usable equity is not negative
    });

    const totalLoanAmount = propertiesData.reduce((sum, p) => sum + p.loanAmount, 0);
    const totalPropertyValue = propertiesData.reduce((sum, p) => sum + p.propertyValue, 0);

    const cashflowData = propertiesData.map(p => p.weeklyCashflow); // Weekly cashflow

    // Update Usable Equity Chart
    const usableEquityCtx = document.getElementById('usableEquityChart').getContext('2d');
    if (usableEquityChartInstance) usableEquityChartInstance.destroy();
    usableEquityChartInstance = new Chart(usableEquityCtx, {
      type: 'bar',
      data: {
        labels: propertyLabels,
        datasets: [{
          label: 'Usable Equity',
          data: usableEquityData,
          backgroundColor: 'rgba(0, 128, 128, 0.6)'
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Usable Equity Overview'
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `$${context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return `$${value.toLocaleString()}`;
              }
            }
          }
        }
      }
    });

    // Update Loan to Value Ratio Chart (Total LVR as Pie Chart)
    const loanToValueCtx = document.getElementById('loanToValueChart').getContext('2d');
    if (loanToValueChartInstance) loanToValueChartInstance.destroy();
    loanToValueChartInstance = new Chart(loanToValueCtx, {
      type: 'pie',
      data: {
        labels: ['Loan Amount', 'Equity'],
        datasets: [{
          data: [totalLoanAmount, totalPropertyValue - totalLoanAmount],
          backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)']
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Total Loan to Value Ratio (LVR)'
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed;
                return `${label}: $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              }
            }
          }
        }
      }
    });

    // Update Portfolio Cashflow Chart
    const portfolioCashflowCtx = document.getElementById('portfolioCashflowChart').getContext('2d');
    if (portfolioCashflowChartInstance) portfolioCashflowChartInstance.destroy();
    portfolioCashflowChartInstance = new Chart(portfolioCashflowCtx, {
      type: 'bar',
      data: {
        labels: propertyLabels,
        datasets: [{
          label: 'Weekly Cashflow',
          data: cashflowData,
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Portfolio Weekly Cashflow'
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `$${context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return `$${value.toLocaleString()}`;
              }
            }
          }
        }
      }
    });
  }

  // Function to update Portfolio Details Charts
  function updatePortfolioCharts() {
    console.log('updatePortfolioCharts called');
    console.log('Properties Data:', propertiesData);

    if (propertiesData.length === 0) {
      alert('Please perform calculations in the Cash Flow Calculator first.');
      showSection('cashFlowSection');
      return;
    }

    // Prepare data for charts
    const yearsToProject = 30;
    const years = Array.from({ length: yearsToProject }, (_, i) => `Year ${i + 1}`);
    const totalEquity = [];
    const totalPassiveIncome = [];

    for (let year = 1; year <= yearsToProject; year++) {
      let equity = 0;
      let passiveIncome = 0;
      propertiesData.forEach(p => {
        const growthRate = parseFloat(document.getElementById('assumptionGrowthRate').value) / 100 || 0.05;
        const rentGrowthRate = 0.02; // 2% annual rent growth
        const paymentsPerYear = 52; // Weekly payments

        // Calculate property value growth
        const propertyValue = p.propertyValue * Math.pow(1 + growthRate, year);

        // Loan balance remains constant in this simplified model (since we don't track principal reductions)
        const loanBalance = p.loanAmount;

        equity += propertyValue - loanBalance;

        // Calculate adjusted weekly rent
        const adjustedWeeklyRent = p.expectedWeeklyRent * Math.pow(1 + rentGrowthRate, year - 1);

        // Determine the weekly repayment for this year
        let weeklyRepayment = 0;

        const annualInterestRate = p.interestRate / 100;
        const IOPeriodYears = p.IOPeriodYears || 0;
        const loanTermYears = p.loanTerm;

        if (year <= IOPeriodYears) {
          // Interest-Only Period
          weeklyRepayment = (p.loanAmount * annualInterestRate) / paymentsPerYear;
        } else if (year <= loanTermYears) {
          // Principal & Interest Period
          const r = annualInterestRate / paymentsPerYear;
          const nPI = (loanTermYears - IOPeriodYears) * paymentsPerYear;
          const numerator = r * Math.pow(1 + r, nPI);
          const denominator = Math.pow(1 + r, nPI) - 1;
          weeklyRepayment = p.loanAmount * (numerator / denominator);
        } else {
          // Post-Loan Period (Loan is paid off)
          weeklyRepayment = 0;
        }

        const passiveCashflow = adjustedWeeklyRent - weeklyRepayment;
        passiveIncome += passiveCashflow;
      });
      totalEquity.push(equity);
      totalPassiveIncome.push(passiveIncome);
    }

    // Equity Position Chart
    const equityPositionCtx = document.getElementById('equityPositionChart').getContext('2d');
    if (equityPositionChartInstance) equityPositionChartInstance.destroy();
    equityPositionChartInstance = new Chart(equityPositionCtx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'Total Equity',
          data: totalEquity,
          borderColor: 'green',
          backgroundColor: 'rgba(0, 128, 0, 0.1)',
          fill: true
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Equity Position Over Time'
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `$${context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function (value) {
                return `$${value.toLocaleString()}`;
              }
            }
          }
        }
      }
    });

    // Passive Income Chart (Per Week)
    const passiveIncomeCtx = document.getElementById('passiveIncomeChart').getContext('2d');
    if (passiveIncomeChartInstance) passiveIncomeChartInstance.destroy();
    passiveIncomeChartInstance = new Chart(passiveIncomeCtx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'Total Passive Income Per Week',
          data: totalPassiveIncome,
          borderColor: 'orange',
          backgroundColor: 'rgba(255, 165, 0, 0.1)',
          fill: true
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Passive Income Growth Per Week Over Time'
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `$${context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function (value) {
                return `$${value.toLocaleString()}`;
              }
            }
          }
        }
      }
    });
  }

  // Save user inputs to localStorage when they change
  const inputIds = [
    'age', 'employmentIncome', 'otherIncome',
    'numberOfProperties', 'assumptionGrowthRate', 'assumptionInterestRate', 'occupancyRate',
    'applicant1Name', 'applicant2Name', 'purchaserType', 'yearlyIncome1', 'yearlyIncome2', 'otherMonthlyIncome',
    'dependents', 'totalSavings', 'remainingMortgage', 'creditCardLimits', 'personalLoanBalance'
  ];

  inputIds.forEach(function (id) {
    const inputElement = document.getElementById(id);
    if (inputElement) {
      // Load saved value from localStorage
      const savedValue = localStorage.getItem(id);
      if (savedValue !== null) {
        inputElement.value = savedValue;
      }

      // Add event listener to save value when it changes
      inputElement.addEventListener('input', function () {
        localStorage.setItem(id, inputElement.value);
      });
    }
  });
});
