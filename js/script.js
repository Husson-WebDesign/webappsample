/* =====================================================
   Northern Bloom Floral & Events
   Phase 3 - JavaScript and Interactive Features
===================================================== */
/*
   Contents
   1. Page Setup
   2. Mobile Navigation
   3. Contact Form Validation
   4. Service Shortcut and Description
   5. FAQ Accordion
*/

// =========================
// Page Setup
// =========================
// Tells the CSS that JavaScript is running. The menu button and the FAQ
// panels only change their layout when this class is present, so the site
// still works if the script fails to load.
document.documentElement.classList.add("js");


// =========================
// Mobile Navigation
// =========================
const menuButton = document.querySelector(".menu-toggle");
const mainNavigation = document.querySelector("#main-navigation");
const desktopLayoutQuery = window.matchMedia("(min-width: 901px)");

// Opens or closes the menu and keeps the button's ARIA state in sync.
function setMenuState(isOpen) {
    mainNavigation.classList.toggle("open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
}

function toggleMenu() {
    const menuIsOpen = mainNavigation.classList.contains("open");
    setMenuState(!menuIsOpen);
}

if (menuButton && mainNavigation) {
    menuButton.addEventListener("click", toggleMenu);

    // Escape closes the menu and returns focus to the button.
    document.addEventListener("keydown", function (event) {
        const menuIsOpen = mainNavigation.classList.contains("open");

        if (event.key === "Escape" && menuIsOpen) {
            setMenuState(false);
            menuButton.focus();
        }
    });

    // Reset the menu when the window grows to the desktop layout.
    desktopLayoutQuery.addEventListener("change", function (event) {
        if (event.matches) {
            setMenuState(false);
        }
    });
}


// =========================
// Contact Form Validation
// =========================
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// One validator per field id. Each receives the trimmed value and returns
// an error message, or an empty string when the value is acceptable.
const validators = {
    name: function (value) {
        if (value === "") {
            return "Please enter your full name.";
        }
        return "";
    },

    email: function (value) {
        if (value === "") {
            return "Please enter your email address.";
        }
        if (!emailPattern.test(value)) {
            return "Please enter a valid email address, such as name@example.com.";
        }
        return "";
    },

    // Optional: only checked when something has been typed.
    phone: function (value) {
        if (value === "") {
            return "";
        }
        const digitCount = value.replace(/\D/g, "").length;
        const usesPhoneCharactersOnly = /^[+\d\s().-]+$/.test(value);

        if (!usesPhoneCharactersOnly || digitCount < 7 || digitCount > 15) {
            return "Please enter a valid phone number, or leave this field blank.";
        }
        return "";
    },

    service: function (value) {
        if (value === "") {
            return "Please choose the service you are interested in.";
        }
        return "";
    },

    // Optional: only checked when a date has been chosen.
    "event-date": function (value) {
        if (value === "") {
            return "";
        }
        const chosenDate = new Date(value + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (chosenDate < today) {
            return "Please choose today's date or a date in the future.";
        }
        return "";
    },

    message: function (value) {
        if (value === "") {
            return "Please enter a message.";
        }
        if (value.length < 10) {
            return "Please write at least 10 characters so we understand your request.";
        }
        return "";
    }
};

// Every form control that has a validator.
const formFields = contactForm
    ? Array.from(contactForm.querySelectorAll("input, select, textarea")).filter(function (field) {
          return field.id in validators;
      })
    : [];

function showError(field, message) {
    document.querySelector("#" + field.id + "-error").textContent = message;
    field.setAttribute("aria-invalid", "true");
    field.closest(".form-group").classList.add("has-error");
}

function clearError(field) {
    document.querySelector("#" + field.id + "-error").textContent = "";
    field.removeAttribute("aria-invalid");
    field.closest(".form-group").classList.remove("has-error");
}

// Checks one field. Returns true when valid, false when an error was shown.
function validateField(field) {
    const errorMessage = validators[field.id](field.value.trim());

    if (errorMessage !== "") {
        showError(field, errorMessage);
        return false;
    }

    clearError(field);
    return true;
}

// Checks every field and returns the list of fields that failed.
function validateForm() {
    const invalidFields = [];

    formFields.forEach(function (field) {
        if (!validateField(field)) {
            invalidFields.push(field);
        }
    });

    return invalidFields;
}

function setFormStatus(message, statusType) {
    formStatus.textContent = message;
    formStatus.classList.remove("success", "error");

    if (statusType) {
        formStatus.classList.add(statusType);
    }
}

function handleFormSubmit(event) {
    // GitHub Pages has no server to receive the form, so the browser's
    // default submit is always stopped. This is a front-end demonstration.
    event.preventDefault();

    const invalidFields = validateForm();

    if (invalidFields.length > 0) {
        const fieldWord = invalidFields.length === 1 ? "field needs" : "fields need";
        setFormStatus(
            "Error: " + invalidFields.length + " " + fieldWord +
            " your attention. Please read the message under each highlighted field.",
            "error"
        );
        invalidFields[0].focus();
        return;
    }

    const visitorName = contactForm.querySelector("#name").value.trim().split(/\s+/)[0];

    contactForm.reset();
    updateServiceDescription();
    setFormStatus(
        "Success: Thank you, " + visitorName + ". Your message passed our checks. " +
        "This website is a front-end demonstration, so nothing was actually sent.",
        "success"
    );
    formStatus.scrollIntoView({ block: "nearest" });
}

// Re-checks a field while the visitor fixes it, so the message disappears
// as soon as the problem is solved.
function revalidateIfShowingError(field) {
    if (field.closest(".form-group").classList.contains("has-error")) {
        validateField(field);
    }
}

if (contactForm) {
    // Our own messages replace the browser's pop-up bubbles. Without
    // JavaScript the attribute is never added and native validation still works.
    contactForm.setAttribute("novalidate", "");
    contactForm.addEventListener("submit", handleFormSubmit);

    formFields.forEach(function (field) {
        // Leaving an empty field alone avoids scolding people who are
        // only tabbing through; empty fields are caught on submit.
        field.addEventListener("blur", function () {
            const hasValue = field.value.trim() !== "";
            const hasError = field.closest(".form-group").classList.contains("has-error");

            if (hasValue || hasError) {
                validateField(field);
            }
        });

        field.addEventListener("input", function () {
            revalidateIfShowingError(field);
        });

        field.addEventListener("change", function () {
            revalidateIfShowingError(field);
        });
    });

    // Past dates cannot be picked in the date picker.
    const eventDateField = contactForm.querySelector("#event-date");
    const todayInputValue = new Date().toLocaleDateString("en-CA");
    eventDateField.setAttribute("min", todayInputValue);
}


// =========================
// Service Shortcut and Description
// =========================
// The "Request" links on the Services page open the contact form with the
// matching service already chosen (contact.html?service=event).
function preselectServiceFromUrl() {
    const serviceSelect = document.querySelector("#service");

    if (!serviceSelect) {
        return;
    }

    const requestedService = new URLSearchParams(window.location.search).get("service");
    const isKnownService = Array.from(serviceSelect.options).some(function (option) {
        return option.value !== "" && option.value === requestedService;
    });

    if (isKnownService) {
        serviceSelect.value = requestedService;
    }
}

// Shows a short description under the service menu, read from each
// option's data-description attribute.
const serviceSelect = document.querySelector("#service");
const serviceDescription = document.querySelector("#service-description");

function updateServiceDescription() {
    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    serviceDescription.textContent = selectedOption.dataset.description || "";
}

if (serviceSelect && serviceDescription) {
    serviceSelect.addEventListener("change", updateServiceDescription);
}

preselectServiceFromUrl();

if (serviceSelect && serviceDescription) {
    updateServiceDescription();
}


// =========================
// FAQ Accordion
// =========================
const faqQuestions = document.querySelectorAll(".faq-question");

// Opens or closes one answer and updates the button's ARIA state.
function toggleFaqItem(questionButton) {
    const faqItem = questionButton.closest(".faq-item");
    const isOpen = faqItem.classList.toggle("open");

    questionButton.setAttribute("aria-expanded", String(isOpen));
}

faqQuestions.forEach(function (questionButton) {
    questionButton.addEventListener("click", function () {
        toggleFaqItem(questionButton);
    });
});
