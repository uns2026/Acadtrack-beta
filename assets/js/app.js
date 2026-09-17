/* AcadTrack shared runtime — lifted verbatim from the original Blogger theme. */
// Dynamic Role-selection Translation Labels mapping
    const roleLabels = {
      en: {
        demo: "Demo",
        student: "Student",
        teacher: "Professor",
        admin: "Admin",
        'platform-admin': "Platform Admin"
      },
      fr: {
        demo: "Démo",
        student: "Étudiant",
        teacher: "Enseignant",
        admin: "Admin",
        'platform-admin': "Admin Plateforme"
      },
      ar: {
        demo: "العرض",
        student: "طالب",
        teacher: "أستاذ",
        admin: "رئيس قسم",
        'platform-admin': "مدير النظام"
      }
    };

    // Role-specific Font Awesome Icon mapping
    const roleIcons = {
      demo: "fa-flask",
      student: "fa-graduation-cap",
      teacher: "fa-chalkboard-user",
      admin: "fa-user-tie",
      'platform-admin': "fa-server"
    };

    // Multilingual Time-of-Day Dynamic Greetings Matrix
    const greetingTranslations = {
      morning: {
        en: "Good Morning",
        fr: "Bonjour",
        ar: "صباح الخير"
      },
      afternoon: {
        en: "Good Afternoon",
        fr: "Bon après-midi",
        ar: "مساء الخير"
      },
      evening: {
        en: "Good Evening",
        fr: "Bonsoir",
        ar: "مساء الخير"
      },
      night: {
        en: "Good Night",
        fr: "Bonne nuit",
        ar: "تصبح على خير"
      }
    };

    // Customized SaaS Batna 1 University Psychology Department Mock Database
    const demoUsers = {
      guest: null,
      student: {
        uid: "demo_student_batna1",
        name: "Imad AZIZI",
        email: "imad.azizi@univ-batna1.dz",
        role: "student",
        studentId: "202312345",
        level: "Licence 3 Psychologie",
        group: "L3 Psychologie Clinique",
        department: "Psychologie",
        university: "Université Batna 1 - El Hadj Lakhdar",
        grades: [
          { module: "Psychologie Clinique", teacher: "Pr. Zakia CHENNA", score: 82, grade: "B+" },
          { module: "Méthodologie de Recherche", teacher: "Dr. Ammar CHOUCHANE", score: 76, grade: "B" }
        ],
        attendance: { present: 42, total: 48, rate: "87.5%" }
      },
      teacher: {
        uid: "demo_teacher_batna1",
        name: "Pr. Zakia CHENNA",
        title: "Professeur des Universités",
        role: "teacher",
        department: "Psychologie",
        university: "Université Batna 1 - El Hadj Lakhdar",
        load: [
          { module: "Psychologie Clinique", level: "L3 Psychologie", students: 54 }
        ]
      },
      admin: {
        uid: "demo_dept_admin_batna1",
        name: "Dr. Ammar CHOUCHANE",
        title: "Maître de Conférences Classe A",
        role: "admin",
        position: "Chef de Département de Psychologie",
        university: "Université Batna 1 - El Hadj Lakhdar"
      },
      'platform-admin': {
        uid: "demo_super_admin",
        name: "Mr. Uns MAHMOUDI",
        role: "platform-admin",
        permissions: "Full global access"
      }
    };

    function selectSaaSRole(role) {
      if (role === 'guest') {
        localStorage.removeItem('acadtrack_currentUser');
        localStorage.removeItem('acadtrack_demoMode');
        applySessionState(null);
        if (window.location.pathname.includes('-dashboard')) {
          window.location.href = "/";
        }
      } else {
        const user = demoUsers[role];
        localStorage.setItem('acadtrack_currentUser', JSON.stringify(user));
        localStorage.setItem('acadtrack_demoMode', 'true');
        applySessionState(user);
        
        // Prototype dashboard redirection map
        const dashboardMap = {
          student: "/student-dashboard",
          teacher: "/teacher-dashboard",
          admin: "/dept-admin-dashboard",
          'platform-admin': "/platform-admin-dashboard"
        };
        
        if (window.location.pathname.includes('-dashboard')) {
          window.location.href = dashboardMap[role];
        }
      }
      closeAllHeaderDropdowns();
    }

    function logoutUser() {
      localStorage.removeItem('acadtrack_currentUser');
      localStorage.removeItem('acadtrack_demoMode');
      applySessionState(null);
      window.location.href = "/";
    }

    function resetDemoSession() {
      const storedUser = localStorage.getItem('acadtrack_currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        selectSaaSRole(user.role);
      } else {
        selectSaaSRole('guest');
      }
    }

    function applySessionState(user) {
      const body = document.body;
      body.classList.remove('logged-in', 'role-student', 'role-teacher', 'role-admin', 'role-platform-admin');
      
      const currentLang = localStorage.getItem('acadtrack-lang') || 'en';
      const activeRole = user ? user.role : 'demo';
      
      // Update label in desktop navigation
      const activeLabel = roleLabels[currentLang] ? roleLabels[currentLang][activeRole] : roleLabels['en'][activeRole];
      const demoActiveLabel = document.getElementById('demoActiveLabel');
      if (demoActiveLabel) {
        demoActiveLabel.textContent = activeLabel;
      }
      
      // Update label in mobile navigation accordion header
      const demoActiveLabelMobile = document.getElementById('demoActiveLabelMobile');
      if (demoActiveLabelMobile) {
        demoActiveLabelMobile.textContent = activeLabel;
      }

      // Update dynamic role icons in navigation
      const activeIconClass = roleIcons[activeRole] || 'fa-flask';
      const demoActiveIcon = document.getElementById('demoActiveIcon');
      if (demoActiveIcon) {
        demoActiveIcon.className = `fa-solid ${activeIconClass}`;
      }
      const demoActiveIconMobile = document.getElementById('demoActiveIconMobile');
      if (demoActiveIconMobile) {
        demoActiveIconMobile.className = `fa-solid ${activeIconClass}`;
      }

      if (user) {
        body.classList.add('logged-in');
        body.classList.add('role-' + user.role);
        
        // Dynamically update profile names inside dropdowns
        document.querySelectorAll('.studentName').forEach(el => el.textContent = user.name);
        
        // Show exit demo options inside accordion and dropdown menu
        document.querySelectorAll('.exit-demo-option').forEach(el => el.classList.add('visible'));
        
        // Highlight active role in desktop dropdown options list
        document.querySelectorAll('.demo-role-option').forEach(el => {
          el.classList.remove('active');
          if (el.getAttribute('data-demo-role') === user.role) {
            el.classList.add('active');
          }
        });
      } else {
        body.classList.add('not-logged-in');
        document.querySelectorAll('.exit-demo-option').forEach(el => el.classList.remove('visible'));
        document.querySelectorAll('.demo-role-option').forEach(el => {
          el.classList.remove('active');
        });
      }
      
      // Sync translations matrix
      updateDynamicGreetings(currentLang);
    }

    function updateDynamicGreetings(lang) {
      const hour = new Date().getHours();
      let timePeriod = 'night';
      if (hour >= 5 && hour < 12) timePeriod = 'morning';
      else if (hour >= 12 && hour < 17) timePeriod = 'afternoon';
      else if (hour >= 17 && hour < 21) timePeriod = 'evening';

      const greeting = greetingTranslations[timePeriod][lang] || greetingTranslations[timePeriod]['en'];
      document.querySelectorAll('.saasGreeting').forEach(el => {
        el.textContent = greeting;
      });
    }

    let currentLang = localStorage.getItem('acadtrack-lang');
    function applyLanguage(lang) {
      document.body.className = document.body.className.replace(/lang-\w+/g, '').trim();
      document.body.classList.add('lang-' + lang);
      localStorage.setItem('acadtrack-lang', lang);
      const flagMap = { en: 'us', fr: 'fr', ar: 'dz' };
      document.querySelectorAll('.active-lang-flag').forEach(flag => flag.src = `https://kapowaz.github.io/circle-flags/flags/${flagMap[lang]}.svg`);
      
      // Update role label translations and greetings on language change
      const storedUser = localStorage.getItem('acadtrack_currentUser');
      applySessionState(storedUser ? JSON.parse(storedUser) : null);
      
      closeLangDropdowns();
    }
    function setLanguage(lang) { applyLanguage(lang); }
    function closeLangDropdowns() { document.querySelectorAll('.lang-dropdown').forEach(dd => dd.classList.remove('active')); }
    
    document.addEventListener('DOMContentLoaded', () => {
      // Dynamic Default Language Configuration Picker Loader
      if (!currentLang) {
        const configEl = document.getElementById('defaultLangConfig');
        currentLang = configEl ? configEl.textContent.trim() : 'en';
      }
      applyLanguage(currentLang);
      
      const storedUser = localStorage.getItem('acadtrack_currentUser');
      if (storedUser) {
        applySessionState(JSON.parse(storedUser));
      } else {
        applySessionState(null);
      }
    });

    var menuToggle = document.getElementById('menuToggle');
    var mobileNav = document.getElementById('mobileNav');
    var mobileOverlay = document.getElementById('mobileOverlay');
    var isMenuOpen = false;
    
    var userToggle = document.getElementById('userToggle');
    var userDropdown = document.getElementById('userDropdown');
    var userSidebar = document.getElementById('userSidebar');
    var userSidebarOverlay = document.getElementById('userSidebarOverlay');
    var isUserOpen = false;

    // Notification dropdown desktop triggers
    var notifBtnDesktop = document.getElementById('notifBtnDesktop');
    var notifDropdownDesktop = document.getElementById('notifDropdownDesktop');
    var isNotifOpen = false;

    // Integrated Demo Dropdown triggers (Desktop)
    var demoBtnDesktop = document.getElementById('demoBtnDesktop');
    var demoNavContainer = document.getElementById('demoNavContainer');
    var isDemoOpen = false;

    // Dynamic Language Dropdown trigger (Desktop)
    var langToggleDesktop = document.getElementById('langToggleDesktop');
    var langDropdownDesktop = document.getElementById('langDropdownDesktop');

    function openMenu() { 
      isMenuOpen = true; 
      if (menuToggle) { menuToggle.classList.add('active'); menuToggle.setAttribute('aria-expanded', 'true'); }
      if (mobileNav) mobileNav.classList.add('active'); 
      if (mobileOverlay) mobileOverlay.classList.add('active'); 
      document.body.classList.add('menu-open'); 
    }
    function closeMenu() { 
      isMenuOpen = false; 
      if (menuToggle) { menuToggle.classList.remove('active'); menuToggle.setAttribute('aria-expanded', 'false'); }
      if (mobileNav) mobileNav.classList.remove('active'); 
      if (mobileOverlay) mobileOverlay.classList.remove('active'); 
      document.body.classList.remove('menu-open'); 
    }
    function openUserMenu() { 
      isUserOpen = true; 
      if (window.innerWidth >= 768) { 
        if (userDropdown) userDropdown.classList.add('active'); 
      } else { 
        if (userSidebar) userSidebar.classList.add('active'); 
        if (userSidebarOverlay) userSidebarOverlay.classList.add('active'); 
        document.body.classList.add('menu-open'); 
      } 
    }
    function closeUserMenu() { 
      isUserOpen = false; 
      if (userDropdown) userDropdown.classList.remove('active'); 
      if (userSidebar) userSidebar.classList.remove('active'); 
      if (userSidebarOverlay) userSidebarOverlay.classList.remove('active'); 
      document.body.classList.remove('menu-open'); 
    }

    function openNotifDropdown() {
      isNotifOpen = true;
      if (notifDropdownDesktop) notifDropdownDesktop.classList.add('active');
    }
    function closeNotifDropdown() {
      isNotifOpen = false;
      if (notifDropdownDesktop) notifDropdownDesktop.classList.remove('active');
    }

    // Safe trigger verification for dynamically injected Elements
    function verifyLayoutTriggerElements() {
      notifBtnDesktop = document.getElementById('notifBtnDesktop');
      notifDropdownDesktop = document.getElementById('notifDropdownDesktop');
      langToggleDesktop = document.getElementById('langToggleDesktop');
      langDropdownDesktop = document.getElementById('langDropdownDesktop');
      
      if (notifBtnDesktop) {
        notifBtnDesktop.removeEventListener('click', handleNotifClick);
        notifBtnDesktop.addEventListener('click', handleNotifClick);
      }
      if (langToggleDesktop) {
        langToggleDesktop.removeEventListener('click', handleLangClick);
        langToggleDesktop.addEventListener('click', handleLangClick);
      }
    }

    function handleNotifClick(e) {
      e.stopPropagation();
      if (isUserOpen) closeUserMenu();
      if (isDemoOpen) closeDemoDropdown();
      if (isNotifOpen) { closeNotifDropdown(); } else { closeAllHeaderDropdowns(); openNotifDropdown(); }
    }

    function handleLangClick(e) {
      e.stopPropagation();
      if (isUserOpen) closeUserMenu();
      if (isNotifOpen) closeNotifDropdown();
      if (isDemoOpen) closeDemoDropdown();
      const isActive = langDropdownDesktop ? langDropdownDesktop.classList.contains('active') : false;
      closeAllHeaderDropdowns();
      if (!isActive && langDropdownDesktop) langDropdownDesktop.classList.add('active');
    }

    function openDemoDropdown() {
      isDemoOpen = true;
      if (demoNavContainer) demoNavContainer.classList.add('active');
    }
    function closeDemoDropdown() {
      isDemoOpen = false;
      if (demoNavContainer) demoNavContainer.classList.remove('active');
    }

    function closeAllHeaderDropdowns() {
      closeLangDropdowns();
      closeUserMenu();
      closeNotifDropdown();
      closeDemoDropdown();
    }

    // Toggle menu-accordion for mobile accordion items
    function toggleAccordion(id) {
      var content = document.getElementById(id);
      if (content) {
        content.classList.toggle('active');
        var icon = content.previousElementSibling.querySelector('.fa-chevron-down');
        if (icon) {
          icon.style.transform = content.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
          icon.style.transition = 'transform 0.20s ease';
        }
        
        // Explicit inline style display management to prevent layout overrides
        if (content.classList.contains('active')) {
          content.style.setProperty('display', 'block', 'important');
        } else {
          content.style.setProperty('display', 'none', 'important');
        }
      }
    }

    // Robust Global Event-delegation Accordion Handler (Sanitizer-Immune)
    document.addEventListener('click', function(e) {
      var header = e.target.closest('.menu-accordion-header');
      if (header) {
        e.preventDefault();
        e.stopPropagation();
        var content = header.nextElementSibling;
        if (content && content.classList.contains('menu-accordion-content')) {
          var id = content.id;
          toggleAccordion(id);
        }
      }
    });

    if (menuToggle) {
      menuToggle.addEventListener('click', function() { 
        if (isUserOpen) closeUserMenu(); 
        if (isDemoOpen) closeDemoDropdown();
        if (isMenuOpen) { closeMenu(); } else { openMenu(); } 
      });
    }
    if (userToggle) {
      userToggle.addEventListener('click', function(e) { 
        e.stopPropagation(); 
        if (isMenuOpen) closeMenu(); 
        if (isDemoOpen) closeDemoDropdown();
        if (isUserOpen) { closeUserMenu(); } else { closeAllHeaderDropdowns(); openUserMenu(); } 
      });
    }
    if (demoBtnDesktop) {
      demoBtnDesktop.addEventListener('click', function(e) {
        e.stopPropagation();
        if (isUserOpen) closeUserMenu();
        if (notifDropdownDesktop) closeNotifDropdown();
        if (isDemoOpen) { closeDemoDropdown(); } else { closeAllHeaderDropdowns(); openDemoDropdown(); }
      });
    }
    
    mobileOverlay.addEventListener('click', closeMenu);
    userSidebarOverlay.addEventListener('click', closeUserMenu);

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.lang-toggle') && !e.target.closest('.mobile-lang-list')) { closeLangDropdowns(); }
      if (window.innerWidth >= 768 && isUserOpen && !userDropdown.contains(e.target) && !userToggle.contains(e.target)) { closeUserMenu(); }
      if (isNotifOpen && notifDropdownDesktop && !notifDropdownDesktop.contains(e.target) && !notifBtnDesktop.contains(e.target)) { closeNotifDropdown(); }
      if (isDemoOpen && !demoNavContainer.contains(e.target) && !demoBtnDesktop.contains(e.target)) { closeDemoDropdown(); }
    });

    document.addEventListener('keydown', function(e) { 
      if (e.key === 'Escape') { 
        if (isMenuOpen) { closeMenu(); menuToggle.focus(); } 
        if (isUserOpen) { closeUserMenu(); userToggle.focus(); } 
        if (isNotifOpen) { closeNotifDropdown(); if (notifBtnDesktop) notifBtnDesktop.focus(); }
        if (isDemoOpen) { closeDemoDropdown(); demoBtnDesktop.focus(); }
        closeLangDropdowns(); 
      } 
    });
    window.addEventListener('resize', function() { if (window.innerWidth >= 768 && isMenuOpen) closeMenu(); });
    
    // Bind triggers after Blogger renders Widget configurations
    window.addEventListener('load', verifyLayoutTriggerElements);
    document.addEventListener('DOMSubtreeModified', verifyLayoutTriggerElements);
