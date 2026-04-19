document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // CASCADING DROPDOWNS DATA
    // ==========================================
    const locationData = {
        "Madurai": {
            "Madurai North": ["Tallakulam", "Sellur", "Bibikulam", "Narimedu"],
            "Madurai South": ["Avaniyapuram", "Kochadai", "Palanganatham", "Thiruparankundram"],
            "Melur": ["Melur", "Kottampatti", "Keelavalavu", "Therkkutheru"]
        },
        "Coimbatore": {
            "Coimbatore North": ["Saravanampatti", "Thudiyalur", "Kavundampalayam", "GN Mills"],
            "Coimbatore South": ["Singanallur", "Ondipudur", "Podanur", "Irugur"],
            "Pollachi": ["Pollachi", "Kinathukadavu", "Anaimalai", "Zamin Uthukuli"]
        },
        "Chennai": {
            "Egmore-Nungambakkam": ["Nungambakkam", "Chetpet", "Egmore", "Kilpauk"],
            "Mylapore": ["Mylapore", "Mandaveli", "Santhome", "Royapettah"],
            "Tambaram": ["Tambaram", "Chromepet", "Selaiyur", "Mudichur"]
        }
    };

    // ==========================================
    // ENTRY FORM LOGIC
    // ==========================================
    const form = document.getElementById('studentForm');
    
    if (form) {
        // --- 1. Validation Logic ---
        const nameInput = document.getElementById('name');
        const mobileInput = document.getElementById('mobile');
        const addressInput = document.getElementById('address');
        const addressCounter = document.getElementById('addressCounter');
        const emailInput = document.getElementById('email');

        nameInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^A-Za-z\s]/g, '');
        });

        mobileInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });

        if (emailInput) {
            emailInput.addEventListener('input', function() {
                this.value = this.value.split('@')[0].replace(/\s/g, '');
            });
        }

        addressInput.addEventListener('input', function() {
            const len = this.value.length;
            addressCounter.textContent = len;
            if(len >= 200) {
                addressCounter.style.color = 'var(--error)';
            } else {
                addressCounter.style.color = 'var(--text-muted)';
            }
        });

        // --- 2. Cascading Dropdowns ---
        const distSelect = document.getElementById('district');
        const talukSelect = document.getElementById('taluk');
        const villageSelect = document.getElementById('village');
        const locDisplay = document.getElementById('locationDisplay');

        distSelect.addEventListener('change', function() {
            talukSelect.innerHTML = '<option value="">Select Taluk</option>';
            villageSelect.innerHTML = '<option value="">Select Village</option>';
            villageSelect.disabled = true;
            updateLocationDisplay();
            
            const dist = this.value;
            if (dist && locationData[dist]) {
                talukSelect.disabled = false;
                for (let t in locationData[dist]) {
                    talukSelect.innerHTML += `<option value="${t}">${t}</option>`;
                }
            } else {
                talukSelect.disabled = true;
            }
        });

        talukSelect.addEventListener('change', function() {
            villageSelect.innerHTML = '<option value="">Select Village</option>';
            updateLocationDisplay();

            const dist = distSelect.value;
            const taluk = this.value;
            if (taluk && locationData[dist][taluk]) {
                villageSelect.disabled = false;
                locationData[dist][taluk].forEach(v => {
                    villageSelect.innerHTML += `<option value="${v}">${v}</option>`;
                });
            } else {
                villageSelect.disabled = true;
            }
        });

        villageSelect.addEventListener('change', updateLocationDisplay);

        function updateLocationDisplay() {
            const d = distSelect.value;
            const t = talukSelect.value;
            const v = villageSelect.value;
            
            if (d || t || v) {
                locDisplay.style.display = 'block';
                document.getElementById('displayDistrict').textContent = d || '...';
                document.getElementById('displayTaluk').textContent = t || '...';
                document.getElementById('displayVillage').textContent = v || '...';
            } else {
                locDisplay.style.display = 'none';
            }
        }

        // --- 3. Dynamic Mark Calculations ---
        const subjectTableBody = document.getElementById('subjectTableBody');
        const addSubjectBtn = document.getElementById('addSubjectBtn');
        
        function getRemark(mark) {
            if (mark === '') return '-';
            mark = parseFloat(mark);
            if (isNaN(mark)) return '-';
            if (mark < 35) return 'Fail';
            if (mark === 35) return 'Pass';
            if (mark <= 60) return 'Poor';
            if (mark <= 80) return 'Average';
            if (mark <= 90) return 'Good';
            if (mark <= 100) return 'Excellent';
            return '-';
        }

        function getRemarkColor(remark) {
            if(remark === 'Fail') return 'var(--error)';
            if(remark === 'Excellent' || remark === 'Good' || remark === 'Pass') return 'var(--success)';
            return 'var(--text-main)';
        }

        function calculateMarks() {
            let total = 0;
            let count = 0;
            const rows = subjectTableBody.querySelectorAll('.subject-row');

            rows.forEach(row => {
                const markInput = row.querySelector('.mark-input');
                const remarkCell = row.querySelector('.remark-cell');
                let val = markInput.value;
                
                if (val !== '' && parseFloat(val) > 100) {
                    markInput.value = 100;
                    val = 100;
                }
                
                const remark = getRemark(val);
                remarkCell.textContent = remark;
                remarkCell.style.color = getRemarkColor(remark);
                remarkCell.style.fontWeight = '600';

                if (val !== '' && !isNaN(val)) {
                    total += parseFloat(val);
                }
                count++;
            });

            const maxTotal = count * 100;
            document.getElementById('totalMarks').textContent = `${total} / ${maxTotal}`;
            const avg = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
            document.getElementById('averageMarks').textContent = `${avg.toFixed(2)} %`;

            const removeBtns = subjectTableBody.querySelectorAll('.btn-remove');
            removeBtns.forEach(btn => {
                btn.disabled = rows.length <= 1;
            });
        }

        subjectTableBody.addEventListener('input', function(e) {
            if (e.target.classList.contains('mark-input')) {
                calculateMarks();
            }
        });

        subjectTableBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-remove')) {
                const row = e.target.closest('.subject-row');
                if (subjectTableBody.querySelectorAll('.subject-row').length > 1) {
                    row.remove();
                    calculateMarks();
                }
            }
        });

        if (addSubjectBtn) {
            addSubjectBtn.addEventListener('click', function() {
                const newRow = document.createElement('tr');
                newRow.className = 'subject-row';
                newRow.innerHTML = `
                    <td><input type="text" class="sub-name-input" placeholder="Enter subject name" required></td>
                    <td>
                        <div class="mark-input-wrapper">
                            <input type="number" class="mark-input" min="0" max="100" required> / 100
                        </div>
                    </td>
                    <td class="remark-cell">-</td>
                    <td><button type="button" class="btn-remove">Remove</button></td>
                `;
                subjectTableBody.appendChild(newRow);
                calculateMarks();
            });
        }

        // --- 4. CAPTCHA Logic ---
        function loadCaptcha() {
            fetch('/api/captcha')
                .then(r => r.json())
                .then(data => {
                    document.getElementById('captchaImage').textContent = data.captcha;
                });
        }
        
        document.getElementById('refreshCaptcha').addEventListener('click', loadCaptcha);
        loadCaptcha(); // Initial load

        // --- 5. Form Submission ---
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate mobile
            if (mobileInput.value.length !== 10) {
                alert("Mobile number must be exactly 10 digits.");
                return;
            }

            // Gather Data
            const subjectsArray = [];
            document.querySelectorAll('.subject-row').forEach(row => {
                const subName = row.querySelector('.sub-name-input').value.trim();
                const mark = row.querySelector('.mark-input').value;
                subjectsArray.push({
                    subject: subName,
                    mark: parseFloat(mark) || 0
                });
            });

            const payload = {
                name: nameInput.value,
                mobile: mobileInput.value,
                email: document.getElementById('email').value + '@gmail.com',
                address: addressInput.value,
                district: distSelect.value,
                taluk: talukSelect.value,
                village: villageSelect.value,
                subjects: subjectsArray,
                total: parseFloat(document.getElementById('totalMarks').textContent.split(' ')[0]),
                average: parseFloat(document.getElementById('averageMarks').textContent.split(' ')[0]),
                captcha: document.getElementById('captchaInput').value
            };

            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Application';
                
                if (data.success) {
                    document.getElementById('modalAckNumber').textContent = data.acknowledgement_number;
                    document.getElementById('successModal').classList.add('active');
                } else {
                    alert('Error: ' + data.message);
                    if (data.message === 'Invalid CAPTCHA') {
                        loadCaptcha();
                        document.getElementById('captchaInput').value = '';
                    }
                }
            })
            .catch(err => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Application';
                alert('An error occurred. Please try again.');
            });
        });
    }

    // ==========================================
    // VIEW FORM LOGIC
    // ==========================================
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = document.getElementById('searchInput').value.trim();
            if (!query) return;

            const btn = this;
            btn.textContent = 'Searching...';
            btn.disabled = true;

            fetch(`/api/students/search?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    btn.textContent = 'Search Records';
                    btn.disabled = false;
                    
                    const container = document.getElementById('resultsContainer');
                    const noResults = document.getElementById('noResults');
                    const template = document.getElementById('studentCardTemplate');
                    
                    container.innerHTML = ''; // clear

                    if (data.length === 0) {
                        noResults.style.display = 'block';
                    } else {
                        noResults.style.display = 'none';
                        
                        data.forEach(student => {
                            const clone = template.content.cloneNode(true);
                            
                            clone.querySelector('.ack-badge').textContent = `ACK: ${student.acknowledgement_number}`;
                            clone.querySelector('.t-name').textContent = student.name;
                            clone.querySelector('.t-mobile').textContent = student.mobile;
                            clone.querySelector('.t-email').textContent = student.email;
                            clone.querySelector('.t-address').textContent = student.address;
                            clone.querySelector('.t-district').textContent = student.district;
                            clone.querySelector('.t-taluk').textContent = student.taluk;
                            clone.querySelector('.t-village').textContent = student.village;
                            
                            // Marks
                            const tBody = clone.querySelector('.t-subjects-body');
                            let subjects = [];
                            try {
                                subjects = JSON.parse(student.subjects);
                            } catch (e) {}

                            const getRemarkLocal = (mark) => {
                                if (mark < 35) return 'Fail';
                                if (mark === 35) return 'Pass';
                                if (mark <= 60) return 'Poor';
                                if (mark <= 80) return 'Average';
                                if (mark <= 90) return 'Good';
                                if (mark <= 100) return 'Excellent';
                                return '-';
                            };

                            subjects.forEach(sub => {
                                const tr = document.createElement('tr');
                                const r = getRemarkLocal(sub.mark);
                                let rColor = 'var(--text-main)';
                                if(r === 'Fail') rColor = 'var(--error)';
                                else if (r === 'Excellent' || r === 'Good' || r === 'Pass') rColor = 'var(--success)';
                                
                                tr.innerHTML = `
                                    <td>${sub.subject}</td>
                                    <td>${sub.mark}</td>
                                    <td style="font-weight: 600; color: ${rColor}">${r}</td>
                                `;
                                tBody.appendChild(tr);
                            });
                            
                            const maxTotal = subjects.length * 100;
                            clone.querySelector('.t-total').textContent = `${student.total} / ${maxTotal}`;
                            clone.querySelector('.t-average').textContent = `${student.average.toFixed(2)} %`;
                            
                            container.appendChild(clone);
                        });
                    }
                })
                .catch(err => {
                    btn.textContent = 'Search Records';
                    btn.disabled = false;
                    alert('Failed to search records.');
                });
        });
        
        // Enter to search
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if(e.key === 'Enter') searchBtn.click();
        });
    }
});
