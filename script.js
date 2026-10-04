(() => {
    const categoryToggle = document.querySelector(".category-toggle");
    const specialProject = document.querySelector("#special-project");
    const pageBottomSentinel = document.querySelector(".page-bottom-sentinel");

    if (categoryToggle && specialProject && pageBottomSentinel) {
        const bottomObserver = new IntersectionObserver(([entry]) => {
            categoryToggle.dataset.visible = String(entry.isIntersecting);
        });
        bottomObserver.observe(pageBottomSentinel);

        categoryToggle.addEventListener("click", () => {
            const isVisible = categoryToggle.getAttribute("aria-checked") !== "true";
            categoryToggle.setAttribute("aria-checked", String(isVisible));
            specialProject.hidden = !isVisible;

            if (isVisible) {
                specialProject.scrollIntoView({
                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                        ? "auto"
                        : "smooth",
                    block: "start"
                });
            }
        });
    }

    const navigation = document.querySelector(".navigation");
    const topSentinel = document.querySelector(".top-sentinel");
    const sections = [...document.querySelectorAll("[data-nav-tone]")];
    const sectionLinks = [...document.querySelectorAll("[data-nav-link]")];

    if (!navigation || !topSentinel || sections.length === 0) {
        return;
    }

    const tones = {
        ink: "rgba(22, 35, 42, .72)",
        moss: "rgba(10, 17, 21, .72)",
        fern: "rgba(44, 74, 82, .6)"
    };

    let activeSection = null;
    let isAtTop = true;
    let sectionObserver;

    const setTone = (section) => {
        const tone = section?.dataset.navTone || "ink";
        navigation.style.setProperty("--nav-bg", tones[tone] || tones.ink);
        navigation.style.setProperty("--nav-border", "rgba(124, 155, 163, .22)");
        sectionLinks.forEach((link) => {
            if (section && link.dataset.navLink === section.id) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    };

    const updateNavigationState = () => {
        navigation.dataset.scrolled = String(!isAtTop);
        if (isAtTop) {
            navigation.style.setProperty("--nav-bg", "transparent");
            navigation.style.setProperty("--nav-border", "transparent");
            sectionLinks.forEach((link) => link.removeAttribute("aria-current"));
        } else {
            setTone(activeSection);
        }
    };

    updateNavigationState();

    const topObserver = new IntersectionObserver(([entry]) => {
        isAtTop = entry.isIntersecting;
        updateNavigationState();
    });
    topObserver.observe(topSentinel);

    const observeSections = () => {
        sectionObserver?.disconnect();
        const headerHeight = navigation.getBoundingClientRect().height;
        sectionObserver = new IntersectionObserver((entries) => {
            const intersecting = entries
                .filter((entry) => entry.isIntersecting)
                .map((entry) => entry.target);

            if (intersecting.length) {
                activeSection = intersecting.reduce((nearest, section) => {
                    const sectionTop = Math.abs(section.getBoundingClientRect().top - headerHeight);
                    const nearestTop = Math.abs(nearest.getBoundingClientRect().top - headerHeight);
                    return sectionTop < nearestTop ? section : nearest;
                });
                if (!isAtTop) {
                    setTone(activeSection);
                }
            } else if (entries.some((entry) => entry.target === activeSection)) {
                activeSection = null;
                if (!isAtTop) {
                    setTone(null);
                }
            }
        }, {
            rootMargin: `0px 0px -${window.innerHeight - headerHeight}px 0px`,
            threshold: 0
        });

        sections.forEach((section) => sectionObserver.observe(section));
    };

    observeSections();
    window.addEventListener("resize", observeSections, { passive: true });
})();
