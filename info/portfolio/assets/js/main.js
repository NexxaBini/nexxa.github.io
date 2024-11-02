/*=============== EMAIL JS ===============*/
const contactForm = document.getElementById('contact-form'),
      contactMessage = document.getElementById('contact-message')

const sendEmail = (e) => {
    e.preventDefault()

    // serviceID - templateID - #form - publicKey
    emailjs.sendForm('service_o85owq6', 'template_k528op2', '#contact-form', 'CZ8Pl1UfYX47f9kt0')
        .then(() => {
            // Show sent message
            contactMessage.textContent = 'Message sent successfully ✅'

            // Remove message after five seconds
            setTimeout(() => {
                contactMessage.textContent = ''
            }, 5000)

            // Clear input fields
            contactForm.reset()
        }, () => {
            // Show error message
            contactMessage.textContent = 'Message not sent (service error) ❌'
        })
}

contactForm.addEventListener('submit', sendEmail)

/*=============== SHOW SCROLL UP ===============*/ 
const scrollUp = () => {
    const scrollUp = document.getElementById('scroll-up')
    // When the scroll is higher than 350 viewport height, add the show-scroll class
    this.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
                       : scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () => {
    const scrollY = window.pageYOffset

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 58,
              sectionId = current.getAttribute('id'),
              sectionsClass = document.querySelector('.nav__link[href*=' + sectionId + ']')

        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            sectionsClass.classList.add('active-link')
        } else {
            sectionsClass.classList.remove('active-link')
        }
    })
}
window.addEventListener('scroll', scrollActive)

/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2500,
    delay: 400,
    // reset: true // Animations repeat
})

// Home section animations
sr.reveal('.home__container', {
    origin: 'top',
    distance: '60px',
    duration: 2000,
    delay: 400
})

// Info, About, and Skills section animations
sr.reveal('.info', {
    origin: 'left',
    duration: 2000,
    delay: 600
})

sr.reveal('.about', {
    origin: 'right',
    duration: 2000,
    delay: 600
})

sr.reveal('.skills', {
    origin: 'left',
    duration: 2000,
    delay: 600
})

// Projects section animation
sr.reveal('.projects__container', {
    origin: 'top',
    duration: 2000,
    delay: 400,
    distance: '100px'
})

// Services section animation
sr.reveal('.services__container', {
    origin: 'top',
    duration: 2000,
    delay: 400,
    distance: '100px'
})

// Experience section animation
sr.reveal('.experience__container', {
    origin: 'top',
    duration: 2000,
    delay: 400,
    distance: '100px'
})

// Contact section animation
sr.reveal('.contact__container', {
    origin: 'top',
    duration: 2000,
    delay: 400,
    distance: '100px'
})