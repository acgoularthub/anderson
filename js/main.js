/**
 * ============================================
 * PORTFOLIO - MAIN JAVASCRIPT
 * Anderson Coelho Goulart
 * ============================================
 * 
 * Este arquivo contém todas as funcionalidades JavaScript do portfólio:
 * - Sistema de tema claro/escuro com preferência do sistema
 * - Navegação mobile responsiva
 * - Efeito de digitação no hero
 * - Validação e envio do formulário de contato
 * - Animações de scroll
 * - Botão voltar ao topo
 * 
 * ============================================
 */

(function() {
    'use strict';

    // ============================================
    // CONSTANTES E CONFIGURAÇÕES
    // ============================================
    
    const CONFIG = {
        // Textos para efeito de digitação
        typingTexts: [
            'Desenvolvedor Backend',
            'Engenheiro de Suporte',
            'DevOps Enthusiast',
            'SRE em Formação'
        ],
        typingSpeed: 100,        // Velocidade de digitação (ms)
        deletingSpeed: 50,       // Velocidade de apagar (ms)
        pauseBetween: 2000,      // Pausa entre textos (ms)
        
        // Scroll
        scrollThreshold: 100,    // Pixels para mostrar back-to-top
        navbarScrollThreshold: 50,
        
        // Validação
        minNameLength: 2,
        maxNameLength: 100,
        minMessageLength: 10,
        maxMessageLength: 2000
    };

    // ============================================
    // SELETORES DOM
    // ============================================
    
    const DOM = {
        // Navegação
        navbar: document.getElementById('navbar'),
        navToggle: document.getElementById('navToggle'),
        navMenu: document.getElementById('navMenu'),
        navLinks: document.querySelectorAll('.nav-link'),
        
        // Tema
        themeToggle: document.getElementById('themeToggle'),
        
        // Hero
        typingText: document.getElementById('typingText'),
        
        // Formulário
        contactForm: document.getElementById('contactForm'),
        formStatus: document.getElementById('formStatus'),
        nameInput: document.getElementById('name'),
        emailInput: document.getElementById('email'),
        messageInput: document.getElementById('message'),
        nameError: document.getElementById('nameError'),
        emailError: document.getElementById('emailError'),
        messageError: document.getElementById('messageError'),
        submitBtn: document.querySelector('.btn-submit'),
        
        // Outros
        backToTop: document.getElementById('backToTop'),
        currentYear: document.getElementById('currentYear')
    };

    // ============================================
    // SISTEMA DE TEMA (CLARO/ESCURO)
    // ============================================
    
    const ThemeManager = {
        init() {
            // Verificar preferência salva ou do sistema
            const savedTheme = localStorage.getItem('theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme) {
                this.setTheme(savedTheme);
            } else if (systemPrefersDark) {
                this.setTheme('dark');
            } else {
                this.setTheme('light');
            }
            
            // Listener para mudanças na preferência do sistema
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
            
            // Toggle button
            if (DOM.themeToggle) {
                DOM.themeToggle.addEventListener('click', () => this.toggle());
            }
        },
        
        setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        },
        
        toggle() {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        }
    };

    // ============================================
    // NAVEGAÇÃO MOBILE
    // ============================================
    
    const MobileNav = {
        init() {
            if (!DOM.navToggle || !DOM.navMenu) return;
            
            DOM.navToggle.addEventListener('click', () => this.toggle());
            
            // Fechar menu ao clicar em um link
            DOM.navLinks.forEach(link => {
                link.addEventListener('click', () => this.close());
            });
            
            // Fechar menu ao clicar fora
            document.addEventListener('click', (e) => {
                if (!DOM.navbar.contains(e.target) && DOM.navMenu.classList.contains('active')) {
                    this.close();
                }
            });
            
            // Fechar menu ao pressionar Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && DOM.navMenu.classList.contains('active')) {
                    this.close();
                }
            });
        },
        
        toggle() {
            const isOpen = DOM.navMenu.classList.toggle('active');
            DOM.navToggle.setAttribute('aria-expanded', isOpen);
        },
        
        close() {
            DOM.navMenu.classList.remove('active');
            DOM.navToggle.setAttribute('aria-expanded', 'false');
        }
    };

    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    
    const NavbarScroll = {
        init() {
            if (!DOM.navbar) return;
            
            this.handleScroll();
            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        },
        
        handleScroll() {
            if (window.scrollY > CONFIG.navbarScrollThreshold) {
                DOM.navbar.classList.add('scrolled');
            } else {
                DOM.navbar.classList.remove('scrolled');
            }
        }
    };

    // ============================================
    // EFEITO DE DIGITAÇÃO
    // ============================================
    
    const TypingEffect = {
        currentTextIndex: 0,
        currentCharIndex: 0,
        isDeleting: false,
        
        init() {
            if (!DOM.typingText) return;
            this.type();
        },
        
        type() {
            const currentText = CONFIG.typingTexts[this.currentTextIndex];
            
            if (this.isDeleting) {
                // Apagando texto
                DOM.typingText.textContent = currentText.substring(0, this.currentCharIndex - 1);
                this.currentCharIndex--;
                
                if (this.currentCharIndex === 0) {
                    this.isDeleting = false;
                    this.currentTextIndex = (this.currentTextIndex + 1) % CONFIG.typingTexts.length;
                    setTimeout(() => this.type(), 500);
                    return;
                }
            } else {
                // Digitando texto
                DOM.typingText.textContent = currentText.substring(0, this.currentCharIndex + 1);
                this.currentCharIndex++;
                
                if (this.currentCharIndex === currentText.length) {
                    this.isDeleting = true;
                    setTimeout(() => this.type(), CONFIG.pauseBetween);
                    return;
                }
            }
            
            const speed = this.isDeleting ? CONFIG.deletingSpeed : CONFIG.typingSpeed;
            setTimeout(() => this.type(), speed);
        }
    };

    // ============================================
    // VALIDAÇÃO E ENVIO DO FORMULÁRIO
    // ============================================
    
    const ContactForm = {
        init() {
            if (!DOM.contactForm) return;
            
            // Validação em tempo real
            DOM.nameInput?.addEventListener('blur', () => this.validateName());
            DOM.emailInput?.addEventListener('blur', () => this.validateEmail());
            DOM.messageInput?.addEventListener('blur', () => this.validateMessage());
            
            // Limpar erros ao digitar
            DOM.nameInput?.addEventListener('input', () => this.clearError('name'));
            DOM.emailInput?.addEventListener('input', () => this.clearError('email'));
            DOM.messageInput?.addEventListener('input', () => this.clearError('message'));
            
            // Envio do formulário
            DOM.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
        },
        
        // Sanitização de input para prevenir XSS
        sanitize(str) {
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        },
        
        validateName() {
            const value = DOM.nameInput?.value.trim() || '';
            
            if (!value) {
                this.showError('name', 'Por favor, informe seu nome.');
                return false;
            }
            
            if (value.length < CONFIG.minNameLength) {
                this.showError('name', `O nome deve ter pelo menos ${CONFIG.minNameLength} caracteres.`);
                return false;
            }
            
            if (value.length > CONFIG.maxNameLength) {
                this.showError('name', `O nome deve ter no máximo ${CONFIG.maxNameLength} caracteres.`);
                return false;
            }
            
            // Verificar caracteres válidos (letras, espaços, hífens, apóstrofos)
            const namePattern = /^[a-zA-ZÀ-ÿ\s'-]+$/;
            if (!namePattern.test(value)) {
                this.showError('name', 'O nome contém caracteres inválidos.');
                return false;
            }
            
            this.clearError('name');
            return true;
        },
        
        validateEmail() {
            const value = DOM.emailInput?.value.trim() || '';
            
            if (!value) {
                this.showError('email', 'Por favor, informe seu email.');
                return false;
            }
            
            // Regex mais robusto para validação de email
            const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if (!emailPattern.test(value)) {
                this.showError('email', 'Por favor, informe um email válido.');
                return false;
            }
            
            this.clearError('email');
            return true;
        },
        
        validateMessage() {
            const value = DOM.messageInput?.value.trim() || '';
            
            if (!value) {
                this.showError('message', 'Por favor, escreva sua mensagem.');
                return false;
            }
            
            if (value.length < CONFIG.minMessageLength) {
                this.showError('message', `A mensagem deve ter pelo menos ${CONFIG.minMessageLength} caracteres.`);
                return false;
            }
            
            if (value.length > CONFIG.maxMessageLength) {
                this.showError('message', `A mensagem deve ter no máximo ${CONFIG.maxMessageLength} caracteres.`);
                return false;
            }
            
            this.clearError('message');
            return true;
        },
        
        showError(field, message) {
            const errorEl = document.getElementById(`${field}Error`);
            const inputEl = document.getElementById(field);
            
            if (errorEl) {
                errorEl.textContent = message;
            }
            
            if (inputEl) {
                inputEl.style.borderColor = '#e74c3c';
            }
        },
        
        clearError(field) {
            const errorEl = document.getElementById(`${field}Error`);
            const inputEl = document.getElementById(field);
            
            if (errorEl) {
                errorEl.textContent = '';
            }
            
            if (inputEl) {
                inputEl.style.borderColor = '';
            }
        },
        
        async handleSubmit(e) {
            e.preventDefault();
            
            // Validar todos os campos
            const isNameValid = this.validateName();
            const isEmailValid = this.validateEmail();
            const isMessageValid = this.validateMessage();
            
            if (!isNameValid || !isEmailValid || !isMessageValid) {
                return;
            }
            
            // Mostrar loading
            this.setLoading(true);
            
            try {
                const formData = new FormData(DOM.contactForm);
                
                // Sanitizar dados antes do envio
                formData.set('name', this.sanitize(formData.get('name')));
                formData.set('message', this.sanitize(formData.get('message')));
                
                const response = await fetch(DOM.contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    this.showStatus('success', 'Mensagem enviada com sucesso! Entrarei em contato em breve.');
                    DOM.contactForm.reset();
                } else {
                    throw new Error('Erro no servidor');
                }
            } catch (error) {
                console.error('Erro ao enviar formulário:', error);
                this.showStatus('error', 'Ocorreu um erro ao enviar. Por favor, tente novamente ou envie um email diretamente.');
            } finally {
                this.setLoading(false);
            }
        },
        
        setLoading(isLoading) {
            const btnText = DOM.submitBtn?.querySelector('.btn-text');
            const btnLoading = DOM.submitBtn?.querySelector('.btn-loading');
            
            if (isLoading) {
                if (btnText) btnText.style.display = 'none';
                if (btnLoading) btnLoading.style.display = 'inline';
                if (DOM.submitBtn) DOM.submitBtn.disabled = true;
            } else {
                if (btnText) btnText.style.display = 'inline';
                if (btnLoading) btnLoading.style.display = 'none';
                if (DOM.submitBtn) DOM.submitBtn.disabled = false;
            }
        },
        
        showStatus(type, message) {
            if (!DOM.formStatus) return;
            
            DOM.formStatus.textContent = message;
            DOM.formStatus.className = `form-status ${type}`;
            
            // Auto-hide após 5 segundos
            setTimeout(() => {
                DOM.formStatus.className = 'form-status';
                DOM.formStatus.textContent = '';
            }, 5000);
        }
    };

    // ============================================
    // BOTÃO VOLTAR AO TOPO
    // ============================================
    
    const BackToTop = {
        init() {
            if (!DOM.backToTop) return;
            
            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
            DOM.backToTop.addEventListener('click', () => this.scrollToTop());
        },
        
        handleScroll() {
            if (window.scrollY > CONFIG.scrollThreshold) {
                DOM.backToTop.classList.add('visible');
            } else {
                DOM.backToTop.classList.remove('visible');
            }
        },
        
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    // ============================================
    // ACTIVE NAV LINK ON SCROLL
    // ============================================
    
    const ActiveNavLink = {
        init() {
            if (!DOM.navLinks.length) return;
            
            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
            this.handleScroll(); // Checar no carregamento
        },
        
        handleScroll() {
            const sections = document.querySelectorAll('section[id]');
            const scrollPosition = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    DOM.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }
    };

    // ============================================
    // ANO ATUAL NO FOOTER
    // ============================================
    
    const CurrentYear = {
        init() {
            if (DOM.currentYear) {
                DOM.currentYear.textContent = new Date().getFullYear();
            }
        }
    };

    // ============================================
    // SMOOTH SCROLL PARA ÂNCORAS
    // ============================================
    
    const SmoothScroll = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector(anchor.getAttribute('href'));
                    
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }
    };

    // ============================================
    // ANIMAÇÃO DE ELEMENTOS AO SCROLL
    // ============================================
    
    const ScrollAnimation = {
        init() {
            // Usar Intersection Observer para performance
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            
            // Observar elementos que devem animar
            const animateElements = document.querySelectorAll(
                '.timeline-item, .project-card, .skill-category, .education-card, .highlight-card'
            );
            
            animateElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        }
    };

    // Adicionar classe de animação via CSS
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    
    function init() {
        ThemeManager.init();
        MobileNav.init();
        NavbarScroll.init();
        TypingEffect.init();
        ContactForm.init();
        BackToTop.init();
        ActiveNavLink.init();
        CurrentYear.init();
        SmoothScroll.init();
        ScrollAnimation.init();
        
        console.log('🚀 Portfolio initialized successfully!');
    }

    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
