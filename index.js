function saveSelectedCourt(court) {
  localStorage.setItem('selectedCourt', court);
}

var arrivalDateInput = document.getElementById('arrival-date');

arrivalDateInput.addEventListener('change', function() {
  var selectedDate = arrivalDateInput.value;
  saveSelectedDate(selectedDate);

  // Update the selected day immediately
  var selectedDayElement = document.getElementById('selectedDay');
  if (selectedDayElement) {
    var selectedDay = getDayOfWeek(selectedDate);
    selectedDayElement.textContent = selectedDay;
  }
  
  // Check if the selected date is valid
  var currentDate = new Date();
  var inputDate = new Date(selectedDate);
  var errorMessageElement = document.getElementById('errorMessage');

  if (errorMessageElement) {
    if (inputDate < currentDate.setHours(0, 0, 0, 0)) {
      errorMessageElement.style.display = 'block';
    } else {
      errorMessageElement.style.display = 'none';
    }
  }

  restoreButtonStyles(); // Restore button styles for the new date
});

// Get the day of the week for a given date
function getDayOfWeek(date) {
  var daysOfWeek = ['Sunday' , 'Monday' , 'Tuesday' , 'Wednesday' , 'Thursday' , 'Friday' , 'Saturday'];
  var selectedDate = new Date(date);
  var currentDate = new Date();
  var dateDiff = selectedDate - currentDate;

  if (dateDiff >= 0 || dateDiff < 0) {
    var dayIndex = selectedDate.getDay();
    return daysOfWeek[dayIndex];
  }
}

function saveSelectedDate(date) {
  var selectedDate = new Date(date);
  var dayOptions = { weekday: 'long' };

  localStorage.setItem('selectedDate', date);
  localStorage.setItem('selectedDay', selectedDate.toLocaleDateString(undefined, dayOptions)); // Save the selected day

  calculateTotalCost(); // Update the total cost immediately after saving the selected date
}

// Retrieve the saved date on page load
window.addEventListener('load', function() {
  var savedDate = localStorage.getItem('selectedDate');
  if (savedDate) {
    arrivalDateInput.value = savedDate;
    saveSelectedDate(savedDate);

    // Update the selected day on page load
    var selectedDayElement = document.getElementById('selectedDay');
    if (selectedDayElement) {
      var selectedDay = getDayOfWeek(savedDate);
      selectedDayElement.textContent = selectedDay;
    }
  }

  restoreButtonStyles(); // Restore button styles on page load
});

function setButtonStyle(court, time, isActive) {
  var button = document.querySelector('[data-court="' + court + '"][data-time="' + time + '"]');
  if (button) {
    var selectedDate = localStorage.getItem('selectedDate');
    var selectedTime = new Date(selectedDate + ' ' + time);
    var currentTime = new Date();

    if (isActive) {
      // Toggle the button color and box shadow when clicked
      if (button.style.backgroundColor === '#CC8C18') {
        button.style.backgroundColor = 'black';
        button.style.boxShadow = '';
      } else {
        button.style.backgroundColor = '#CC8C18';
        button.style.boxShadow = '0 0 40px #CC8C18';
      }
      button.disabled = false; // Make the button clickable
    } else {
      if (currentTime.getTime() > selectedTime.getTime() || selectedDate < currentTime) {
        button.style.backgroundColor = '#E0E0E0';
        button.style.boxShadow = 'none';
        button.disabled = true; // Gray out and make the button unclickable
      } else {
        button.style.backgroundColor = 'black';
        button.style.boxShadow = '';
        button.disabled = false; // Make the button clickable
      }
    }
  }
}

// Saving all the necessary information
function saveSelectedTime(court, time) {
  var selectedDate = localStorage.getItem('selectedDate');
  var selectedDay = getDayOfWeek(selectedDate);
  var selectedTimes = JSON.parse(localStorage.getItem('selectedTimes')) || {};

  if (!selectedTimes[selectedDate]) {
    selectedTimes[selectedDate] = {};
  }

  if (!selectedTimes[selectedDate][court]) {
    selectedTimes[selectedDate][court] = {};
  }

  if (!selectedTimes[selectedDate][court][time]) {
    selectedTimes[selectedDate][court][time] = { day: selectedDay, count: 1 };
  } else {
    selectedTimes[selectedDate][court][time].count--;

    if (selectedTimes[selectedDate][court][time].count === 0) {
      delete selectedTimes[selectedDate][court][time];
    }
  }

  // Check if there are any remaining times for the selected court on the selected date
  if (Object.keys(selectedTimes[selectedDate][court]).length === 0) {
    delete selectedTimes[selectedDate][court];
  }

  // Check if there are any remaining courts for the selected date
  if (Object.keys(selectedTimes[selectedDate]).length === 0) {
    delete selectedTimes[selectedDate];
  }

  setButtonStyle(court, time, selectedTimes[selectedDate] && selectedTimes[selectedDate][court] && selectedTimes[selectedDate][court][time] && selectedTimes[selectedDate][court][time].count > 0);

  localStorage.setItem('selectedTimes', JSON.stringify(selectedTimes));

  var endTime = addMinutesToTime(time, 60);
  var formattedEndTime = formatTime(endTime); // Format the end time with "AM" or "PM"
  var timeSelected = time + ' - ' + formattedEndTime;

  calculateTotalCost();

  return timeSelected;
}

function calculateTotalCost() {
  var selectedTimes = JSON.parse(localStorage.getItem('selectedTimes')) || {};
  var totalCost = 0;

  var timePrices = {
    '09:00 am': 300,
    '09:30 am': 300,
    '10:00 am': 300,
    '10:30 am': 300,
    '11:00 am': 300,
    '11:30 am': 300,
    '12:00 pm': 300,
    '12:30 pm': 300,
    '01:00 pm': 300,
    '01:30 pm': 300,
    '02:00 pm': 300,
    '02:30 pm': 300,
    '03:00 pm': 300,
    '03:30 pm': 300,
    '04:00 pm': 300,
    '04:30 pm': 300,
  };

  for (var selectedDate in selectedTimes) {
    for (var court in selectedTimes[selectedDate]) {
      for (var time in selectedTimes[selectedDate][court]) {
        var count = selectedTimes[selectedDate][court][time].count; // Access the count property
        var price = timePrices[time];
        totalCost += count * price;
      }
    }
  }

  var totalCostElement = document.getElementById('totalCost');
  if (totalCostElement) {
    totalCostElement.textContent = '₱' + totalCost;
  }

  return totalCost;
}

//modal
var proceedButton = document.querySelector('.proceed');
var modal = document.getElementById('myModal');
var closeButton = document.querySelector('.close');

proceedButton.addEventListener('click', function() {
  var selectedTimes = JSON.parse(localStorage.getItem('selectedTimes'));
  var totalCost = calculateTotalCost();

  if (!selectedTimes || totalCost <= 0) {
    alert('Please Select Time To Proceed!');
    return;
  }

  var modalContent = document.querySelector('.modal-content');
  modalContent.innerHTML = ''; // Clear the modal content before populating

  var headingElement = document.createElement('h2');
  headingElement.innerHTML = 'Reservation Details: ';
  headingElement.style.textAlign = 'center';

  var closeButton = document.createElement('h2');
  closeButton.innerHTML = '&times;';
  closeButton.style.cursor = 'pointer';
  closeButton.style.marginLeft = 'auto'; // Align the close button to the right
  closeButton.style.marginTop = '0';
  closeButton.style.marginBottom = '0';

  var headingContainer = document.createElement('div');
  headingContainer.style.display = 'flex';
  headingContainer.style.alignItems = 'center';
  headingContainer.appendChild(headingElement);
  headingContainer.appendChild(closeButton);

  modalContent.appendChild(headingContainer);

  closeButton.addEventListener('click', function() {
    modal.style.display = 'none';
  });

  var dates = Object.keys(selectedTimes);
  dates.sort(); // Sort dates in ascending order
  var totalCost = 0; // Initialize total cost

  for (var i = 0; i < dates.length; i++) {
    var selectedDate = dates[i];
    var selectedDay = getDayOfWeek(selectedDate); // Get the day of the week for the selected date
    var courts = Object.keys(selectedTimes[selectedDate]); 
    courts.sort(); // Sort courts in ascending order

    var dateElement = document.createElement('p');
    dateElement.innerHTML = 'Date: ' + selectedDate + '(' + selectedDay + ')'; // Display the selected date
    dateElement.style.fontWeight = 'bold';
    modalContent.appendChild(dateElement);

    for (var j = 0; j < courts.length; j++) {
      var court = courts[j];
      var times = Object.keys(selectedTimes[selectedDate][court]);

      var courtElement = document.createElement('p');
      courtElement.innerHTML = 'Court: ' + court; // Display the selected court
      courtElement.style.fontWeight = 'bold';
      modalContent.appendChild(courtElement);

      var amTimes = []; // Array to store AM times
      var pmTimes = []; // Array to store PM times

      times.sort(); // Sort the times in ascending order

      for (var k = 0; k < times.length; k++) {
        var time = times[k];
        var endTime = addMinutesToTime(time, 60); // Calculate the end time
        var formattedEndTime = formatTime(endTime); // Format the end time with "AM" or "PM"

        var timeSelected = time + ' - ' + formattedEndTime; // Display the selected time range

        // Determine if it's AM or PM based on formattedEndTime
        if (time.includes('am') || (time.includes('pm') && (time === '12:00 pm' || time === '12:30 pm'))) {
          amTimes.push(timeSelected);
        } else {
          pmTimes.push(timeSelected);
        }
      }

      // Concatenate the AM and PM times arrays
      var allTimes = amTimes.concat(pmTimes);

      // Display the times in the order of AM followed by PM
      for (var t = 0; t < allTimes.length; t++) {
        var timeElement = document.createElement('p');
        timeElement.innerHTML = 'Time: ' + allTimes[t];
        timeElement.style.fontWeight = 'bold';
        modalContent.appendChild(timeElement);
      }
    }

    var hrElement = document.createElement('hr');
    modalContent.appendChild(hrElement);
    var hrElement = document.createElement('hr');
    modalContent.appendChild(hrElement);
  }

    var totalCost = calculateTotalCost();

    var totalCostElement = document.createElement('h2');
    totalCostElement.innerHTML = 'Total Cost: ₱' + totalCost; // Display the total cost
    totalCostElement.style.paddingBottom = '10px';
    modalContent.appendChild(totalCostElement);

    var modal = document.getElementById('myModal');
    modal.style.display = 'block';

    var proceedModalButton = document.createElement('button');
    proceedModalButton.innerHTML = 'Reserve Now';
    proceedModalButton.className = 'proceed-modal-button';
    proceedModalButton.style.cursor = 'pointer';
    proceedModalButton.style.fontSize = '20px';

    proceedModalButton.addEventListener('click', function() {
      modal.style.display = 'none';
      openInputModal(); // Call a function to open the input modal
    });

  modalContent.appendChild(proceedModalButton);
});

//input modal
function openInputModal() {
  var inputModal = document.getElementById('inputModal');
  inputModal.style.display = 'block';
}

function closeInputModal() {
  var inputModal = document.getElementById('inputModal');
  inputModal.style.display = 'none';
}

function validateInput() {
  var nameInput = document.getElementById('name');
  var phoneNumberInput = document.getElementById('phone-number');
  var amountInput = document.getElementById('amount');
  var totalCost = calculateTotalCost();

  var name = nameInput.value.trim();
  var phoneNumber = phoneNumberInput.value.trim();
  var amount = parseFloat(amountInput.value.trim());

  if (name === '') {
    alert('Please enter a name for the reservation.');
    return;
  }

  var phoneRegex = /^\d{11}$/;
  if (!phoneNumber.match(phoneRegex)) {
    alert('Please enter a valid phone number (11 digits).');
    return;
  }

  if (phoneNumber === '') {
    alert('Please enter a phone number.');
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount.');
    return;
  }

  if (totalCost > amount) {
    alert('You amount is not enough.');
    return;
  }

  inputModal.style.display = 'none';

    // Show the confirmation modal
    var confirmationModal = document.getElementById('confirmationModal');
    confirmationModal.style.display = 'block';

    showReceiptButton.addEventListener('click', function() {
  // Handle the action to show the receipt
    confirmationModal.style.display = 'none';
    
  showReceipt();
});
}

// Input Modal code
var inputModal = document.getElementById('inputModal');
var inputCloseButton = document.querySelector('.input-close');
var inputProceedButton = document.querySelector('.input-proceed');
var showReceiptButton = document.getElementById('showReceiptButton');

inputCloseButton.addEventListener('click', function() {
  inputModal.style.display = 'none';
});

var doneButton = document.getElementById('doneButton');
doneButton.addEventListener('click', function() {
  // Clear all stored data
  localStorage.removeItem('selectedCourt');
  localStorage.removeItem('selectedDate');
  localStorage.removeItem('selectedTimes');
  localStorage.removeItem('selectedDay');

  // Redirect to the front page
  window.location.href = 'index.html';
});


// Function to show the receipt
function showReceipt() {
  var name = document.getElementById('name').value;
  var phoneNumber = document.getElementById('phone-number').value;
  var amount = parseFloat(document.getElementById('amount').value);

  // Get the selected reservation details from localStorage
  var selectedTimes = JSON.parse(localStorage.getItem('selectedTimes')) || {};

  var receiptInfo = document.getElementById('receiptInfo');
  var receiptReservation = document.getElementById('receiptReservation');

  // Clear the receipt content before populating
  receiptInfo.innerHTML = '';
  receiptReservation.innerHTML = '';

  // Display the receipt information
  var nameElement = document.createElement('p');
  nameElement.innerHTML = 'Name: ' + name;
  receiptInfo.appendChild(nameElement);

  var phoneNumberElement = document.createElement('p');
  phoneNumberElement.innerHTML = 'Phone Number: ' + phoneNumber;
  receiptInfo.appendChild(phoneNumberElement);

  var amountElement = document.createElement('p');
  amountElement.innerHTML = 'Amount Paid: ₱' + amount.toFixed(2);
  receiptInfo.appendChild(amountElement);

  var totalCost = calculateTotalCost();
  var change = amount - totalCost;

  var totalCostElement = document.createElement('p');
  totalCostElement.innerHTML = 'Total Cost: ₱' + totalCost.toFixed(2);
  receiptInfo.appendChild(totalCostElement);

  var changeElement = document.createElement('p');
  changeElement.innerHTML = 'Change: ₱' + change.toFixed(2);
  receiptInfo.appendChild(changeElement);

  // Display the reservation details
  var reservationHeading = document.createElement('h2');
  reservationHeading.innerHTML = 'Reservation Details:';
  receiptReservation.appendChild(reservationHeading);
  
  var sortedDates = Object.keys(selectedTimes).sort(); // Sort the dates in ascending order
  
  for (var i = 0; i < sortedDates.length; i++) {
    var selectedDate = sortedDates[i];
    var selectedCourts = selectedTimes[selectedDate];
    var selectedDay = getDayOfWeek(selectedDate);
  
    var dateElement = document.createElement('p');
    dateElement.innerHTML = 'Date: ' + selectedDate + '(' + selectedDay + ')';
    receiptReservation.appendChild(dateElement);
  
    var sortedCourts = Object.keys(selectedCourts).sort(); // Sort the courts in ascending order
  
  for (var j = 0; j < sortedCourts.length; j++) {
      var selectedCourt = sortedCourts[j];
      var selectedCourtTimes = selectedCourts[selectedCourt];
  
      var courtElement = document.createElement('p');
      courtElement.innerHTML = 'Court: ' + selectedCourt;
      receiptReservation.appendChild(courtElement);
  
      var timesElement = document.createElement('p');
      timesElement.innerHTML = 'Times:';
      receiptReservation.appendChild(timesElement);
  
      var timesList = document.createElement('ul');
      receiptReservation.appendChild(timesList);
      
      var amTimes = []; // Array to store AM times
      var pmTimes = []; // Array to store PM times
      
      var times = []; // Array to store all the times
      
  for (var time in selectedCourtTimes) {
        if (time !== 'day') {
          times.push(time);
        }
      }
      
      times.sort(); // Sort the times in ascending order
      
  for (var k = 0; k < times.length; k++) {
        var time = times[k];
        var endTime = addMinutesToTime(time, 30); // Calculate the end time
        var formattedEndTime = formatTime(endTime); // Format the end time with "AM" or "PM"
      
        var timeSelected = time + ' - ' + formattedEndTime; // Display the selected time range
      
        // Determine if it's AM or PM based on formattedEndTime
  if (time.includes('am') ||(time.includes('pm') && (time === '12:00 pm' || time === '12:30 pm'))) {
          amTimes.push(timeSelected);
  } else { 
    pmTimes.push(timeSelected);
      }
    }
      
      // Concatenate the AM and PM times arrays
      var allTimes = amTimes.concat(pmTimes);
      
      // Display the times in the order of AM followed by PM
      for (var t = 0; t < allTimes.length; t++) {
        var timeElement = document.createElement('p');
        timeElement.innerHTML = allTimes[t];
        receiptReservation.appendChild(timeElement);
      }
    }
    var hrElement = document.createElement('hr');
    receiptReservation.appendChild(hrElement);
    var hrElement = document.createElement('hr');
    receiptReservation.appendChild(hrElement);
  }

  // Show the receipt modal
  var receiptModal = document.getElementById('receiptModal');
  receiptModal.style.display = 'block';
}

// Add a click event listener to the receipt modal close button
var receiptModalCloseButton = document.querySelector('#receiptModal .close');
receiptModalCloseButton.addEventListener('click', function() {
    // Clear all stored data
    localStorage.removeItem('selectedCourt');
    localStorage.removeItem('selectedDate');
    localStorage.removeItem('selectedTimes');
    localStorage.removeItem('selectedDay');
    
  var receiptModal = document.getElementById('receiptModal');
  receiptModal.style.display = 'none';

    // Redirect to the front page
    window.location.href = 'index.html';
});

function addMinutesToTime(time, minutes) {
  var parts = time.split(':');
  var hours = parseInt(parts[0]);
  var mins = parseInt(parts[1]);

  var newMins = mins + minutes;
  var newHours = hours + Math.floor(newMins / 60);
  newMins = newMins % 60;

  if (newHours >= 24) {
    newHours -= 24;
  } else if (newHours >= 12) {
    newHours -= 12; // Subtract 12 from hours greater than or equal to 12
  }

  if (newHours === 0 && newMins === 0) {
    newHours = 12; // Special case for 00:00, set hours to 12
  } else if (newHours === 0) {
    newHours = 12; // Special case for 12:00, set hours to 0
  }

  var newTime = padTime(newHours) + ':' + padTime(newMins);
  return newTime;
}

function padTime(time) {
  return time.toString().padStart(2, '0');
}

function formatTime(time) {
  var hours = parseInt(time.split(':')[0]);
  var minutes = parseInt(time.split(':')[1]);

  var ampm = hours >= 6 && hours < 12? 'am' : 'pm'; // Determine if it's AM or PM based on hours

  var formattedTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');

  return formattedTime + ' ' + ampm;
}

function restoreButtonStyles() {
  var buttons = document.querySelectorAll('.btn');
  buttons.forEach(function(button) {
    var court = button.getAttribute('data-court');
    var time = button.getAttribute('data-time');
    var selectedCourt = localStorage.getItem('selectedCourt');
    var selectedTimes = JSON.parse(localStorage.getItem('selectedTimes')) || {};
    var selectedDate = localStorage.getItem('selectedDate');
    var isActive = selectedDate && selectedCourt === court && selectedTimes[selectedDate] && selectedTimes[selectedDate][court] && selectedTimes[selectedDate][court][time];
    var currentTime = new Date();
    var selectedTime = new Date(selectedDate + ' ' + time);

    if (isActive) {
      setButtonStyle(court, time, true); // Set the button style as active
    } else {
      if (currentTime > selectedTime) {
        setButtonStyle(court, time, false); // Set the button style as inactive (grayed out)
      } else {
        setButtonStyle(court, time, false, true); // Set the button style as inactive (original color)
      }
    }
  });

  calculateTotalCost(); // Calculate and display the total cost
}

window.addEventListener('load', restoreButtonStyles);
