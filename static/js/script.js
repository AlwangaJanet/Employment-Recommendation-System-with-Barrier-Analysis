document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const descriptionInput = document.getElementById('description-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultContainer = document.getElementById('result-container');
    const barrierResult = document.getElementById('barrier-result');
    const interventionResult = document.getElementById('intervention-result');
    const confidenceResult = document.getElementById('confidence-result');
    const explanationElement = document.getElementById('explanation');
    
    // Chart elements
    let barrierChart;
    let employmentChart;
    let educationChart;
    let interventionChart;
    
    // Resource elements
    const skillsList = document.getElementById('skills-list');
    const opportunityList = document.getElementById('opportunity-list');
    const fundingList = document.getElementById('funding-list');
    const careerList = document.getElementById('career-list');
    const locationList = document.getElementById('location-list');
    
    // Load statistics, resources and initialize charts
    loadStats();
    loadResources();
    
    // Event listeners
    analyzeBtn.addEventListener('click', analyzeEmploymentSituation);
    
    // Barrier explanations
    const barrierExplanations = {
        'Skills_Gap': "You appear to be facing challenges related to skills or training. This often means that the jobs available require specific skills, certifications, or training that you currently don't have. This is a common challenge in rapidly evolving sectors like technology, but it's highly solvable with targeted training.",
        
        'Opportunity_Shortage': 'Your challenge seems to be a lack of job opportunities in your area or field. This is a structural issue that affects many regions in Kenya, especially outside major urban centers. While this is challenging, there are strategies to find hidden opportunities or create your own.',
        
        'Resource_Constraints': 'Your main barrier appears to be related to resources needed for your job search or entrepreneurship journey. This includes financial resources for transportation to interviews, capital for starting businesses, or sustaining yourself during an extended job search.',
        
        'Market_Mismatch': "Your education or experience doesn't seem to align with current market demands. This is common when educational institutions aren't fully aligned with evolving employer needs, or when industry disruption changes job requirements. Career redirection can help bridge this gap.",
        
        'Geographic_Barrier': 'Your location appears to be limiting your access to employment opportunities. This is a common challenge in Kenya, where jobs are concentrated in specific areas while talent is distributed throughout the country. Mobility solutions or remote work can help address this barrier.'
    };
    
    // Functions
    function analyzeEmploymentSituation() {
        const description = descriptionInput.value.trim();
        
        if (!description) {
            alert('Please describe your employment situation or challenge.');
            return;
        }
        
        // Send request to server
        fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description: description })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            
            // Display results
            resultContainer.classList.remove('hidden');
            
            barrierResult.textContent = `Your main barrier: ${formatBarrierName(data.barrier)}`;
            interventionResult.textContent = `Recommended solution: ${data.intervention}`;
            confidenceResult.textContent = `Confidence: ${data.confidence}%`;
            
            // Add explanation
            explanationElement.textContent = barrierExplanations[data.barrier];
            
            // Highlight relevant resources
            highlightResources(data.barrier);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while analyzing your situation.');
        });
    }
    
    function formatBarrierName(barrier) {
        return barrier.replace('_', ' ');
    }
    
    function highlightResources(barrier) {
        // Reset all resource cards
        document.querySelectorAll('.resource-card').forEach(card => {
            card.classList.remove('highlighted');
        });
        
        // Highlight relevant resource card
        if (barrier === 'Skills_Gap') {
            document.getElementById('skills-resources').classList.add('highlighted');
        } else if (barrier === 'Opportunity_Shortage') {
            document.getElementById('opportunity-resources').classList.add('highlighted');
        } else if (barrier === 'Resource_Constraints') {
            document.getElementById('funding-resources').classList.add('highlighted');
        } else if (barrier === 'Market_Mismatch') {
            document.getElementById('career-resources').classList.add('highlighted');
        } else if (barrier === 'Geographic_Barrier') {
            document.getElementById('location-resources').classList.add('highlighted');
        }
    }
    
    function loadStats() {
        fetch('/stats')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error loading stats:', data.error);
                return;
            }
            
            // Initialize charts
            initBarrierChart(data.barrier_counts);
            initEmploymentChart(data.employment_counts);
            initEducationChart(data.education_counts);
            initInterventionChart(data.intervention_counts);
        })
        .catch(error => {
            console.error('Error fetching stats:', error);
        });
    }
    
    function loadResources() {
        // Kenya-specific employment resources
        const resources = {
            skills: [
                "Ajira Digital Program - Free digital skills training",
                "Google Digital Skills for Africa - Free online courses",
                "Kenya Youth Employment and Opportunities Project (KYEOP)",
                "Technical and Vocational Education and Training (TVET) institutions",
                "KCB Foundation 2jiajiri - Technical training for entrepreneurs"
            ],
            
            opportunity: [
                "Kazi Mtaani - Government public works program",
                "Ajira Digital Platform - Freelance opportunities",
                "Kenya Private Sector Alliance (KEPSA) job matching program",
                "County Youth Service programs",
                "Generation Kenya - Youth employment initiatives"
            ],
            
            funding: [
                "Youth Enterprise Development Fund - Low-interest loans",
                "Women Enterprise Fund - Female entrepreneur support",
                "Uwezo Fund - Youth and women group financing",
                "KCB Lion's Den - Entrepreneur funding",
                "Kenya Youth Employment and Opportunities Project grants"
            ],
            
            career: [
                "Kenya Institute of Curriculum Development (KICD) career guidance",
                "CAP Youth Empowerment Institute - Career counseling",
                "University career service centers",
                "Kenya Association of Professional Counsellors",
                "Ministry of Labour career advisory services"
            ],
            
            location: [
                "Konza Technopolis - Tech hub with remote work options",
                "Ajira Digital Centers across counties",
                "Digital Talent Program - Remote work training",
                "Decentralized government services (Huduma Centers)",
                "Rural Internet connectivity initiatives"
            ]
        };
        
        // Populate resource lists
        populateResourceList(skillsList, resources.skills);
        populateResourceList(opportunityList, resources.opportunity);
        populateResourceList(fundingList, resources.funding);
        populateResourceList(careerList, resources.career);
        populateResourceList(locationList, resources.location);
    }
    
    function populateResourceList(listElement, resources) {
        listElement.innerHTML = '';
        resources.forEach(resource => {
            const li = document.createElement('li');
            li.textContent = resource;
            listElement.appendChild(li);
        });
    }
    
    function initBarrierChart(barrierCounts) {
        const ctx = document.getElementById('barrier-chart').getContext('2d');
        
        barrierChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(barrierCounts).map(barrier => formatBarrierName(barrier)),
                datasets: [{
                    data: Object.values(barrierCounts),
                    backgroundColor: [
                        '#4caf50',  // Skills Gap - Green
                        '#2196f3',  // Opportunity Shortage - Blue
                        '#ff9800',  // Resource Constraints - Orange
                        '#9c27b0',  // Market Mismatch - Purple
                        '#f44336'   // Geographic Barrier - Red
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    function initEmploymentChart(employmentCounts) {
        const ctx = document.getElementById('employment-chart').getContext('2d');
        
        employmentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(employmentCounts),
                datasets: [{
                    label: 'Count',
                    data: Object.values(employmentCounts),
                    backgroundColor: '#00796b',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    function initEducationChart(educationCounts) {
        const ctx = document.getElementById('education-chart').getContext('2d');
        
        educationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(educationCounts),
                datasets: [{
                    label: 'Count',
                    data: Object.values(educationCounts),
                    backgroundColor: '#0277bd',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    function initInterventionChart(interventionCounts) {
        const ctx = document.getElementById('intervention-chart').getContext('2d');
        
        // Get top 5 interventions
        const interventions = Object.entries(interventionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        const labels = interventions.map(item => item[0]);
        const data = interventions.map(item => item[1]);
        
        interventionChart = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Frequency',
                    data: data,
                    backgroundColor: '#558b2f',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});