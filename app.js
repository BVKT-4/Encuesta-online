document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('antigravity-survey');
    const formSection = document.getElementById('survey-form-section');
    const successSection = document.getElementById('success-card-section');
    const resetBtn = document.getElementById('reset-btn');

    // Success elements
    const summaryId = document.getElementById('summary-id');
    const summarySatisfaccion = document.getElementById('summary-satisfaccion');
    const summaryClaridad = document.getElementById('summary-claridad');
    const summaryAplicabilidad = document.getElementById('summary-aplicabilidad');

    // Dynamic background movement based on mouse
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        const orb1 = document.querySelector('.orb-1');
        const orb2 = document.querySelector('.orb-2');
        const orb3 = document.querySelector('.orb-3');
        
        if (orb1) {
            orb1.style.transform = `translate(${x * 50}px, ${y * 50}px)`;
        }
        if (orb2) {
            orb2.style.transform = `translate(${x * -60}px, ${y * -60}px)`;
        }
        if (orb3) {
            orb3.style.transform = `translate(${x * 30 - 15}px, ${y * 30 - 15}px)`;
        }
    });

    // Form Submission & Validation
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;

        // Reset previous validation styles
        document.querySelectorAll('.invalid-field').forEach(el => {
            el.classList.remove('invalid-field');
        });

        // 1. Validate Student ID
        const idEstudiante = document.getElementById('id_estudiante');
        if (!idEstudiante.value.trim()) {
            idEstudiante.closest('.input-group').classList.add('invalid-field');
            isValid = false;
        }

        // 2. Validate Ratings
        const ratingGroups = [
            { name: 'nivel_satisfaccion', labelId: 'error-satisfaccion' },
            { name: 'claridad_contenido', labelId: 'error-claridad' },
            { name: 'aplicabilidad_practica', labelId: 'error-aplicabilidad' }
        ];

        ratingGroups.forEach(group => {
            const selected = form.querySelector(`input[name="${group.name}"]:checked`);
            if (!selected) {
                const groupContainer = form.querySelector(`input[name="${group.name}"]`).closest('.rating-group');
                groupContainer.classList.add('invalid-field');
                isValid = false;
            }
        });

        // If form is valid, show success card
        if (isValid) {
            const data = {
                id: idEstudiante.value.trim(),
                satisfaccion: form.querySelector('input[name="nivel_satisfaccion"]:checked').value,
                claridad: form.querySelector('input[name="claridad_contenido"]:checked').value,
                aplicabilidad: form.querySelector('input[name="aplicabilidad_practica"]:checked').value,
            };

            // Setup loading state
            const submitBtn = form.querySelector('.submit-btn');
            const submitBtnText = submitBtn.querySelector('span');
            const globalError = document.getElementById('global-error');
            
            submitBtn.disabled = true;
            submitBtnText.textContent = 'Enviando...';
            globalError.classList.add('hidden');

            const comentarios = document.getElementById('comentarios_adicionales').value.trim();

            // Send to n8n Webhook (which will now handle Airtable registration and email notification securely)
            fetch('https://bvkt.app.n8n.cloud/webhook/8ac3cdd3-a11a-4c69-9b72-cbb80c1a64b0', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    IDEstudiante: data.id,
                    NivelSatisfaccion: parseInt(data.satisfaccion, 10),
                    ClaridadContenido: parseInt(data.claridad, 10),
                    AplicabilidadPractica: parseInt(data.aplicabilidad, 10),
                    ComentariosAdicionales: comentarios
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Fallo al procesar la solicitud en el servidor');
                }
                return response.json().catch(() => ({}));
            })
            .then(() => {
                // Populate success card
                summaryId.textContent = data.id;
                summarySatisfaccion.textContent = data.satisfaccion;
                summaryClaridad.textContent = data.claridad;
                summaryAplicabilidad.textContent = data.aplicabilidad;

                // Transition Animation
                formSection.style.opacity = '0';
                formSection.style.transform = 'scale(0.9) rotateY(-90deg)';
                
                setTimeout(() => {
                    formSection.classList.add('hidden');
                    successSection.classList.remove('hidden');
                    
                    // Force layout reflow
                    successSection.offsetHeight;
                    
                    successSection.style.opacity = '1';
                    successSection.style.transform = 'scale(1) rotateY(0deg)';
                }, 400);
            })
            .catch(err => {
                console.error(err);
                globalError.classList.remove('hidden');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtnText.textContent = 'Enviar Encuesta';
            });
        }
    });

    // Remove validation errors immediately upon user input/interaction
    const textInputs = form.querySelectorAll('input[type="text"], textarea');
    textInputs.forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.input-group');
            if (group && group.classList.contains('invalid-field')) {
                group.classList.remove('invalid-field');
            }
        });
    });

    const radioInputs = form.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(radio => {
        radio.addEventListener('change', () => {
            const group = radio.closest('.rating-group');
            if (group && group.classList.contains('invalid-field')) {
                group.classList.remove('invalid-field');
            }
        });
    });

    // Reset button functionality
    resetBtn.addEventListener('click', () => {
        // Reset form inputs
        form.reset();
        
        // Remove validation classes just in case
        document.querySelectorAll('.invalid-field').forEach(el => {
            el.classList.remove('invalid-field');
        });

        // Transition back to form
        successSection.style.opacity = '0';
        successSection.style.transform = 'scale(0.9) rotateY(90deg)';
        
        setTimeout(() => {
            successSection.classList.add('hidden');
            formSection.classList.remove('hidden');
            
            // Force layout reflow
            formSection.offsetHeight;
            
            formSection.style.opacity = '1';
            formSection.style.transform = 'scale(1) rotateY(0deg)';
        }, 400);
    });
});
