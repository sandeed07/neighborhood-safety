document.addEventListener('DOMContentLoaded', () => {
    // Form 1 Elements (Hero Section)
    const emailForm1 = document.getElementById('email-form-1');
    const emailInput1 = document.getElementById('email-input-1');
    const successMessage1 = document.getElementById('success-message-1');
    const errorMessage1 = document.getElementById('error-message-1');

    // Form 2 Elements (Final CTA Section)
    const emailForm2 = document.getElementById('email-form-2');
    const emailInput2 = document.getElementById('email-input-2');
    const zipInput2 = document.getElementById('zip-input-2');
    const successMessage2 = document.getElementById('success-message-2');
    const errorMessage2 = document.getElementById('error-message-2');

    // Scroll buttons and sections
    const scrollDownBtn = document.querySelector('.scroll-down-btn');
    const scrollUpBtn = document.querySelector('.scroll-up-btn');
    const finalCtaSection = document.getElementById('final-cta-section');
    const heroSection = document.getElementById('hero-container');

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    // Generic function to handle form submission
    const handleFormSubmission = async (form, emailInput, successMsg, errorMsg) => {
        successMsg.style.display = 'none';
        errorMsg.style.display = 'none';
        
        const email = emailInput.value.trim();

        if (!validateEmail(email)) {
            errorMsg.textContent = 'Please enter a valid email address.';
            errorMsg.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });

            if (response.ok) {
                successMsg.style.display = 'block';
                form.reset();
            } else if (response.status === 409) {
                errorMsg.textContent = 'This email is already registered. Please use a different one.';
                errorMsg.style.display = 'block';
            } else {
                errorMsg.textContent = 'Submission failed. Please try again.';
                errorMsg.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            errorMsg.textContent = 'Something went wrong. Please check your server is running.';
            errorMsg.style.display = 'block';
        }
    };

    // Event listener for the first form
    if (emailForm1) {
        emailForm1.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmission(emailForm1, emailInput1, successMessage1, errorMessage1);
        });
    }

    // Event listener for the second form
    if (emailForm2) {
        emailForm2.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmission(emailForm2, emailInput2, successMessage2, errorMessage2);
        });
    }

    // Scroll button event listeners
    if (scrollDownBtn) {
        scrollDownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (finalCtaSection) {
                finalCtaSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (scrollUpBtn) {
        scrollUpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (heroSection) {
                heroSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2 // Trigger when 20% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once the animation is triggered
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-animate').forEach(element => {
        observer.observe(element);
    });
});