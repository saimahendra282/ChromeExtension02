// Chrome Extension Content Script for Attendance Calculator
(function() {
    'use strict';

    // Add LTPS weight constants
    const LTPS_WEIGHTS = {
        'L': 100,
        'T': 25,
        'P': 50,
        'S': 25
    };

    // Function to add buttons to the form
    function addCalculatorButtons() {
        // Find the form group with Search and Reset buttons
        const buttonGroup = document.querySelector('.form-group.text-center');
        
        if (buttonGroup && !document.getElementById('calc-average-btn')) {
            // Create Calculate Average button
            const calcAverageBtn = document.createElement('button');
            calcAverageBtn.type = 'button';
            calcAverageBtn.id = 'calc-average-btn';
            calcAverageBtn.className = 'btn btn-success btnloader';
            calcAverageBtn.style.marginLeft = '10px';
            calcAverageBtn.innerHTML = 'Calculate Average';
            
            // Create Reset Results button
            const resetBtn = document.createElement('button');
            resetBtn.type = 'button';
            resetBtn.id = 'reset-results-btn';
            resetBtn.className = 'btn btn-danger btnloader';
            resetBtn.style.marginLeft = '10px';
            resetBtn.style.display = 'none'; // Initially hidden
            resetBtn.innerHTML = 'Reset Results';
            
            // Add buttons to the form
            buttonGroup.appendChild(calcAverageBtn);
            buttonGroup.appendChild(resetBtn);
            
            // Add event listeners
            calcAverageBtn.addEventListener('click', calculateAverage);
            resetBtn.addEventListener('click', resetAllResults);
        }
    }

    // Function to add individual bunking buttons to each row
    function addIndividualBunkingButtons() {
        const rows = document.querySelectorAll('.table.table-striped.table-bordered tbody tr');
        
        if (!rows.length) return;
        
        rows.forEach((row, index) => {
            if (row.classList.contains('individual-result-row')) return;
            
            const registerCell = row.querySelector('td:last-child');
            if (!registerCell) return;
            
            // Check for both class and text content
            const registerLink = registerCell.querySelector('a.crudjax');
            if (!registerLink || registerLink.textContent.trim() !== 'Register') return;
            
            // Check if button already exists
            if (!registerCell.querySelector('.individual-bunk-btn')) {
                // Create individual bunking button
                const bunkBtn = document.createElement('button');
                bunkBtn.type = 'button';
                bunkBtn.className = 'btn btn-warning btn-sm individual-bunk-btn';
                bunkBtn.style.marginLeft = '5px';
                bunkBtn.style.fontSize = '11px';
                bunkBtn.style.padding = '2px 6px';
                bunkBtn.innerHTML = 'Bunk Calc';
                bunkBtn.setAttribute('data-row-index', index);
                
                // Add event listener
                bunkBtn.addEventListener('click', function() {
                    calculateIndividualBunking(row, index);
                });
                
                // Append button to the register cell
                registerCell.appendChild(bunkBtn);
            }
        });
    }

    // Function to calculate individual subject bunking
    function calculateIndividualBunking(row, rowIndex) {
        const cells = row.querySelectorAll('td');
        
        if (cells.length < 14) {
            alert('Invalid row data!');
            return;
        }
        
        const courseName = cells[2].textContent.trim(); // Column 2: Coursedesc
        const conducted = parseInt(cells[8].textContent) || 0; // Column 8: Total Conducted
        const attended = parseInt(cells[9].textContent) || 0; // Column 9: Total Attended
        const currentPercentage = parseFloat(cells[12].textContent.replace('%', '')) || 0; // Column 12: Percentage
        
        // Ask user for number of hours they plan to bunk
        const hoursInput = prompt(`How many hours are you planning to bunk for "${courseName}"?`, '0');
        
        if (hoursInput === null) return; // User cancelled
        
        const hoursToBunk = parseInt(hoursInput) || 0;
        
        if (hoursToBunk < 0) {
            alert('Please enter a valid positive number!');
            return;
        }
        
        // Calculate new percentage after bunking
        // Formula: (total attended / (total conducted + hours to bunk)) * 100
        const newConducted = conducted + hoursToBunk;
        const newPercentage = ((attended / newConducted) * 100).toFixed(2);
        
        // Create result display
        const resultDiv = document.createElement('div');
        resultDiv.id = `individual-result-${rowIndex}`;
        resultDiv.className = 'alert alert-info';
        resultDiv.style.marginTop = '10px';
        resultDiv.style.fontSize = '12px';
        
        let statusClass = 'text-success';
        let statusText = 'Safe';
        let recommendation = '';
        
        if (newPercentage < 75) {
            statusClass = 'text-danger';
            statusText = 'Below 75%';
            recommendation = `<br><strong style="color: red;">⚠️ Warning: Your attendance will drop below 75%!</strong>`;
        } else if (newPercentage < 80) {
            statusClass = 'text-warning';
            statusText = 'Close to limit';
            recommendation = `<br><strong style="color: orange;">⚠️ Caution: Getting close to 75% limit!</strong>`;
        }
        
        resultDiv.innerHTML = `
            <strong>Bunking Analysis for "${courseName}"</strong><br>
            <strong>Current Attendance:</strong> ${attended}/${conducted} (${currentPercentage}%)<br>
            <strong>After bunking ${hoursToBunk} hours:</strong> ${attended}/${newConducted} (<span class="${statusClass}">${newPercentage}%</span>)<br>
            <strong>Status:</strong> <span class="${statusClass}">${statusText}</span>
            ${recommendation}
        `;
        
        // Remove existing result for this row if any
        const existingResult = document.getElementById(`individual-result-${rowIndex}`);
        if (existingResult) {
            existingResult.remove();
        }
        
        // Add result after the current row
        const nextRow = row.nextElementSibling;
        if (nextRow) {
            row.parentNode.insertBefore(createResultRow(resultDiv.innerHTML, cells.length), nextRow);
        } else {
            row.parentNode.appendChild(createResultRow(resultDiv.innerHTML, cells.length));
        }
        
        // Show reset button after displaying results
        const resetBtn = document.getElementById('reset-results-btn');
        if (resetBtn) {
            resetBtn.style.display = 'inline-block';
        }
    }
    
    // Helper function to create a result row that spans all columns
    function createResultRow(content, colspan) {
        const resultRow = document.createElement('tr');
        resultRow.className = 'individual-result-row';
        resultRow.innerHTML = `<td colspan="${colspan}" style="background-color: #f8f9fa; border-left: 4px solid #007bff;">${content}</td>`;
        return resultRow;
    }
    
    // Function to calculate overall attendance average
    function calculateAverage() {
        const attendanceTable = document.querySelector('.table.table-striped.table-bordered tbody');
        
        if (!attendanceTable) {
            alert('Please search for attendance data first!');
            return;
        }
        
        // Object to store course-wise data
        const courseData = {};
        
        const rows = attendanceTable.querySelectorAll('tr');
        rows.forEach(row => {
            if (row.classList.contains('individual-result-row')) return;
            
            const cells = row.querySelectorAll('td');
            if (cells.length >= 14) {
                const courseCode = cells[1].textContent.trim();
                const courseName = cells[2].textContent.trim();
                const ltpsType = cells[3].textContent.trim();
                const conducted = parseInt(cells[8].textContent) || 0;
                const attended = parseInt(cells[9].textContent) || 0;
                
                if (!courseData[courseCode]) {
                    courseData[courseCode] = {
                        name: courseName,
                        components: {},
                        totalWeight: 0
                    };
                }
                
                // Calculate percentage for this component
                const percentage = conducted > 0 ? (attended / conducted) * 100 : 0;
                const weight = LTPS_WEIGHTS[ltpsType] || 0;
                
                courseData[courseCode].components[ltpsType] = {
                    percentage,
                    weight
                };
                courseData[courseCode].totalWeight += weight;
            }
        });
        
        // Calculate weighted averages for each course
        let resultHTML = '<h4>Course-wise Weighted Attendance</h4>';
        
        for (const [courseCode, data] of Object.entries(courseData)) {
            let weightedSum = 0;
            
            for (const [type, comp] of Object.entries(data.components)) {
                weightedSum += (comp.percentage * comp.weight);
            }
            
            const finalPercentage = data.totalWeight > 0 ? 
                (weightedSum / data.totalWeight).toFixed(2) : 0;
            
            const status = finalPercentage >= 75 ? 
                '<span class="text-success">Safe</span>' : 
                '<span class="text-danger">Below 75%</span>';
            
            resultHTML += `
                <div class="course-result" style="margin-top: 10px; padding: 10px; border-left: 4px solid #007bff; background-color: #f8f9fa;">
                    <strong>${courseCode} - ${data.name}</strong><br>
                    Components: ${Object.entries(data.components)
                        .map(([type, comp]) => 
                            `${type}(${comp.percentage.toFixed(1)}% × ${comp.weight}%)`
                        ).join(', ')}<br>
                    <strong>Weighted Average: ${finalPercentage}% - ${status}</strong>
                </div>
            `;
        }
        
        // Display results
        const resultDiv = document.createElement('div');
        resultDiv.id = 'average-result';
        resultDiv.className = 'alert alert-info';
        resultDiv.style.marginTop = '20px';
        resultDiv.innerHTML = resultHTML;
        
        // Remove existing result if any
        const existingResult = document.getElementById('average-result');
        if (existingResult) {
            existingResult.remove();
        }
        
        // Add result after the table
        const tableContainer = document.querySelector('#printTable');
        if (tableContainer) {
            tableContainer.parentNode.insertBefore(resultDiv, tableContainer.nextSibling);
        }
        
        // Show reset button
        const resetBtn = document.getElementById('reset-results-btn');
        if (resetBtn) {
            resetBtn.style.display = 'inline-block';
        }
    }
    
    // Function to clean up individual result rows
    function cleanupIndividualResults() {
        const resultRows = document.querySelectorAll('.individual-result-row');
        resultRows.forEach(row => row.remove());
    }
    
    // Function to reset all results
    function resetAllResults() {
        // Clean up individual bunking results
        cleanupIndividualResults();
        
        // Remove average result
        const averageResult = document.getElementById('average-result');
        if (averageResult) {
            averageResult.remove();
        }
        
        // Hide reset button
        const resetBtn = document.getElementById('reset-results-btn');
        if (resetBtn) {
            resetBtn.style.display = 'none';
        }
    }

    // Function to initialize the extension
    function init() {
        // Add buttons when page loads
        addCalculatorButtons();
        addIndividualBunkingButtons();
        
        // Also add buttons after AJAX requests (when search is clicked)
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    const attendanceTable = document.querySelector('.table.table-striped.table-bordered');
                    if (attendanceTable) {
                        setTimeout(() => {
                            addCalculatorButtons();
                            addIndividualBunkingButtons();
                        }, 100);
                    }
                }
            });
        });
        
        // Start observing the entire document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Add click event listener for AJAX links
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('crudjax')) {
                setTimeout(() => {
                    addIndividualBunkingButtons();
                }, 500);
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();