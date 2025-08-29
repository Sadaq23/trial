document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Show/hide edit button based on login status
    const editBtn = document.getElementById('editBtn');
    if (isLoggedIn) {
        editBtn.style.display = 'block';
        loadContent();
    } else {
        editBtn.style.display = 'none';
    }
    
    let editingEnabled = false;
    
    // Edit button click handler
    editBtn.addEventListener('click', function() {
        editingEnabled = !editingEnabled;
        this.textContent = editingEnabled ? 'Stop Editing' : 'Edit';
        
        if (editingEnabled) {
            enableEditing();
            showSaveButton();
        } else {
            disableEditing();
            hideSaveButton();
        }
    });
    
    // Create save button
    let saveButton = null;
    
    function showSaveButton() {
        if (!saveButton) {
            saveButton = document.createElement('button');
            saveButton.id = 'saveBtn';
            saveButton.textContent = 'Save Changes';
            saveButton.className = 'btn';
            saveButton.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                background: #0288d1;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 30px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            
            saveButton.addEventListener('click', function() {
                if (confirm('Are you sure you want to save these changes?')) {
                    saveChanges();
                }
            });
            
            document.body.appendChild(saveButton);
        }
        saveButton.style.display = 'block';
    }
    
    function hideSaveButton() {
        if (saveButton) {
            saveButton.style.display = 'none';
        }
    }
    
    // Function to upload image to Imgur
    function uploadImageToImgur(file) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('image', file);
            
            // Using a public Imgur client ID for demo purposes
            // In production, you should register your own application
            const clientId = '28aaa2e823b03b1';
            
            fetch('https://api.imgur.com/3/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Client-ID ${clientId}`
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    resolve(data.data.link);
                } else {
                    reject(new Error('Failed to upload image'));
                }
            })
            .catch(error => {
                reject(error);
            });
        });
    }
    
    // Enable editing
    function enableEditing() {
        document.querySelectorAll('[data-editable="true"]').forEach(element => {
            element.contentEditable = true;
            element.style.border = '2px dashed #2e7d32';
            element.style.padding = '5px';
            element.style.borderRadius = '4px';
            element.style.backgroundColor = 'rgba(46, 125, 50, 0.05)';
            element.style.transition = 'all 0.3s ease';
            
            // For images, add a click handler to change src
            if (element.tagName === 'IMG') {
                element.style.cursor = 'pointer';
                element.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Create a modal for image options
                    const modal = document.createElement('div');
                    modal.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.8);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 10000;
                    `;
                    
                    const modalContent = document.createElement('div');
                    modalContent.style.cssText = `
                        background: white;
                        padding: 30px;
                        border-radius: 10px;
                        max-width: 500px;
                        width: 90%;
                        text-align: center;
                    `;
                    
                    const title = document.createElement('h3');
                    title.textContent = 'Change Image';
                    title.style.marginBottom = '20px';
                    
                    const urlOption = document.createElement('button');
                    urlOption.textContent = 'Enter Image URL';
                    urlOption.className = 'btn';
                    urlOption.style.margin = '10px';
                    urlOption.addEventListener('click', function() {
                        const newSrc = prompt('Enter new image URL:', element.src);
                        if (newSrc) {
                            element.src = newSrc;
                            document.body.removeChild(modal);
                        }
                    });
                    
                    const uploadOption = document.createElement('button');
                    uploadOption.textContent = 'Upload from Computer';
                    uploadOption.className = 'btn';
                    uploadOption.style.margin = '10px';
                    uploadOption.addEventListener('click', function() {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = function(e) {
                            const file = e.target.files[0];
                            if (file) {
                                showNotification('Uploading image...', 'success');
                                uploadImageToImgur(file)
                                    .then(url => {
                                        element.src = url;
                                        document.body.removeChild(modal);
                                        showNotification('Image uploaded successfully!', 'success');
                                    })
                                    .catch(error => {
                                        console.error('Error uploading image:', error);
                                        showNotification('Error uploading image. Please try again.', 'error');
                                    });
                            }
                        };
                        input.click();
                    });
                    
                    const cancelOption = document.createElement('button');
                    cancelOption.textContent = 'Cancel';
                    cancelOption.className = 'btn btn-outline';
                    cancelOption.style.margin = '10px';
                    cancelOption.addEventListener('click', function() {
                        document.body.removeChild(modal);
                    });
                    
                    modalContent.appendChild(title);
                    modalContent.appendChild(urlOption);
                    modalContent.appendChild(uploadOption);
                    modalContent.appendChild(cancelOption);
                    modal.appendChild(modalContent);
                    document.body.appendChild(modal);
                });
            }
            
            // For icons, add a click handler to change class
            if (element.tagName === 'I' && element.getAttribute('data-type') === 'icon') {
                element.style.cursor = 'pointer';
                element.addEventListener('click', function(e) {
                    e.preventDefault();
                    const newIcon = prompt('Enter new Font Awesome icon class (e.g., fas fa-leaf):', this.className);
                    if (newIcon) {
                        this.className = newIcon;
                    }
                });
            }
            
            // For links, add a click handler to change href
            if (element.tagName === 'A') {
                element.addEventListener('click', function(e) {
                    if (editingEnabled) {
                        e.preventDefault();
                        const newHref = prompt('Enter new link URL:', this.href);
                        if (newHref) {
                            this.href = newHref;
                        }
                    }
                });
            }
            
            // For inputs and textareas, make them editable
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.removeAttribute('readonly');
                element.style.backgroundColor = 'rgba(46, 125, 50, 0.05)';
            }
        });
        
        showNotification('Editing mode enabled. Click on any content to edit it.', 'success');
    }
    
    // Disable editing
    function disableEditing() {
        document.querySelectorAll('[data-editable="true"]').forEach(element => {
            element.contentEditable = false;
            element.style.border = 'none';
            element.style.padding = '';
            element.style.borderRadius = '';
            element.style.backgroundColor = '';
            element.style.cursor = '';
            
            // Remove event listeners
            element.replaceWith(element.cloneNode(true));
        });
        
        // Re-attach event listeners for links
        document.querySelectorAll('[data-editable="true"][href]').forEach(link => {
            link.addEventListener('click', function(e) {
                if (!editingEnabled) {
                    // Normal link behavior
                }
            });
        });
        
        showNotification('Editing mode disabled.', 'success');
    }
    
    // Load content from JSON file
    function loadContent() {
        fetch('content.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(content => {
                // Update global content
                if (content.global) {
                    document.title = content.global.siteTitle;
                    document.querySelectorAll('[data-id="site-title"]').forEach(el => {
                        el.textContent = content.global.siteTitle;
                    });
                    document.querySelectorAll('[data-id="site-tagline"]').forEach(el => {
                        el.textContent = content.global.siteTagline;
                    });
                    document.querySelectorAll('[data-id="footer-copyright"]').forEach(el => {
                        el.innerHTML = content.global.footerCopyright;
                    });
                }
                
                // Update navigation
                if (content.navigation) {
                    Object.keys(content.navigation).forEach(key => {
                        document.querySelectorAll(`[data-id="nav-${key}"]`).forEach(el => {
                            el.textContent = content.navigation[key];
                        });
                        document.querySelectorAll(`[data-id="footer-nav-${key}"]`).forEach(el => {
                            el.textContent = content.navigation[key];
                        });
                    });
                }
                
                // Update hero content
                if (content.hero) {
                    document.querySelectorAll('[data-id="hero-title"]').forEach(el => {
                        el.textContent = content.hero.title;
                    });
                    document.querySelectorAll('[data-id="hero-description"]').forEach(el => {
                        el.textContent = content.hero.description;
                    });
                    document.querySelectorAll('[data-id="hero-primary-button"]').forEach(el => {
                        el.textContent = content.hero.primaryButtonText;
                    });
                    document.querySelectorAll('[data-id="hero-secondary-button"]').forEach(el => {
                        el.textContent = content.hero.secondaryButtonText;
                    });
                }
                
                // Update about content
                if (content.about) {
                    document.querySelectorAll('[data-id="about-title"]').forEach(el => {
                        el.textContent = content.about.title;
                    });
                    document.querySelectorAll('[data-id="about-description1"]').forEach(el => {
                        el.textContent = content.about.description1;
                    });
                    document.querySelectorAll('[data-id="about-description2"]').forEach(el => {
                        el.textContent = content.about.description2;
                    });
                    
                    // Update stats
                    if (content.about.stats) {
                        content.about.stats.forEach((stat, index) => {
                            document.querySelectorAll(`[data-id="about-stat${index+1}-value"]`).forEach(el => {
                                el.textContent = stat.value;
                                el.setAttribute('data-target', stat.value);
                            });
                            document.querySelectorAll(`[data-id="about-stat${index+1}-label"]`).forEach(el => {
                                el.textContent = stat.label;
                            });
                        });
                    }
                    
                    // Update about image
                    document.querySelectorAll('[data-id="about-image"]').forEach(el => {
                        el.src = content.about.imageUrl;
                    });
                }
                
                // Update services
                if (content.services) {
                    content.services.forEach((service, index) => {
                        document.querySelectorAll(`[data-id="service-${index}-title"]`).forEach(el => {
                            el.textContent = service.title;
                        });
                        document.querySelectorAll(`[data-id="service-${index}-description"]`).forEach(el => {
                            el.textContent = service.description;
                        });
                        document.querySelectorAll(`[data-id="service-${index}-icon"]`).forEach(el => {
                            el.className = service.icon;
                        });
                        document.querySelectorAll(`[data-id="service-${index}-link"]`).forEach(el => {
                            el.innerHTML = `Learn more <i class="fas fa-arrow-right"></i>`;
                        });
                    });
                }
                
                // Update what we do
                if (content.whatWeDo) {
                    content.whatWeDo.forEach((activity, index) => {
                        document.querySelectorAll(`[data-id="activity-${index}-title"]`).forEach(el => {
                            el.textContent = activity.title;
                        });
                        document.querySelectorAll(`[data-id="activity-${index}-description"]`).forEach(el => {
                            el.textContent = activity.description;
                        });
                        document.querySelectorAll(`[data-id="activity-${index}-icon"]`).forEach(el => {
                            el.className = activity.icon;
                        });
                    });
                }
                
                // Update mission and vision
                if (content.missionVision) {
                    document.querySelectorAll('[data-id="vision-title"]').forEach(el => {
                        el.textContent = 'Our Vision';
                    });
                    document.querySelectorAll('[data-id="vision-text"]').forEach(el => {
                        el.textContent = content.missionVision.vision;
                    });
                    document.querySelectorAll('[data-id="mission-title"]').forEach(el => {
                        el.textContent = 'Our Mission';
                    });
                    document.querySelectorAll('[data-id="mission-text"]').forEach(el => {
                        el.textContent = content.missionVision.mission;
                    });
                }
                
                // Update contact
                if (content.contact) {
                    document.querySelectorAll('[data-id="contact-title"]').forEach(el => {
                        el.textContent = content.contact.title;
                    });
                    document.querySelectorAll('[data-id="contact-getintouch"]').forEach(el => {
                        el.textContent = content.contact.getInTouch;
                    });
                    document.querySelectorAll('[data-id="contact-sendmessage"]').forEach(el => {
                        el.textContent = content.contact.sendMessage;
                    });
                    document.querySelectorAll('[data-id="contact-address"]').forEach(el => {
                        el.textContent = content.contact.address;
                    });
                    document.querySelectorAll('[data-id="contact-phone"]').forEach(el => {
                        el.textContent = content.contact.phone;
                        el.href = `tel:${content.contact.phone.replace(/\s/g, '')}`;
                    });
                    document.querySelectorAll('[data-id="contact-email"]').forEach(el => {
                        el.textContent = content.contact.email;
                        el.href = `mailto:${content.contact.email}`;
                    });
                    document.querySelectorAll('[data-id="contact-website"]').forEach(el => {
                        el.textContent = content.contact.website;
                        el.href = content.contact.websiteUrl;
                    });
                    document.querySelectorAll('[data-id="contact-website-button"]').forEach(el => {
                        el.textContent = 'Visit Our Website';
                        el.href = content.contact.websiteUrl;
                    });
                    
                    // Update form labels
                    document.querySelectorAll('[data-id="contact-form-name-label"]').forEach(el => {
                        el.textContent = 'Name';
                    });
                    document.querySelectorAll('[data-id="contact-form-email-label"]').forEach(el => {
                        el.textContent = 'Email';
                    });
                    document.querySelectorAll('[data-id="contact-form-message-label"]').forEach(el => {
                        el.textContent = 'Message';
                    });
                    document.querySelectorAll('[data-id="contact-form-submit"]').forEach(el => {
                        el.textContent = 'Send Message';
                    });
                }
                
                // Update newsletter
                if (content.newsletter) {
                    document.querySelectorAll('[data-id="newsletter-title"]').forEach(el => {
                        el.textContent = content.newsletter.title;
                    });
                    document.querySelectorAll('[data-id="newsletter-description"]').forEach(el => {
                        el.textContent = content.newsletter.description;
                    });
                    document.querySelectorAll('[data-id="newsletter-placeholder"]').forEach(el => {
                        el.placeholder = content.newsletter.placeholder;
                    });
                    document.querySelectorAll('[data-id="newsletter-button"]').forEach(el => {
                        el.textContent = content.newsletter.buttonText;
                    });
                }
                
                // Update footer
                document.querySelectorAll('[data-id="footer-title"]').forEach(el => {
                    el.textContent = 'SCADER';
                });
                document.querySelectorAll('[data-id="footer-tagline"]').forEach(el => {
                    el.textContent = 'Somali Centre For Agricultural Development & Resilience';
                });
                
                // Update section titles
                document.querySelectorAll('[data-id="services-title"]').forEach(el => {
                    el.textContent = 'Our Services';
                });
                document.querySelectorAll('[data-id="whatwedo-title"]').forEach(el => {
                    el.textContent = 'What We Do';
                });
                document.querySelectorAll('[data-id="missionvision-title"]').forEach(el => {
                    el.textContent = 'Our Mission & Vision';
                });
            })
            .catch(error => {
                console.error('Error loading content:', error);
                showNotification('Error loading content. Using default content.', 'error');
            });
    }
    
    // Save changes to JSON file and commit to GitHub
    function saveChanges() {
        const content = {
            global: {
                siteTitle: document.querySelector('[data-id="site-title"]').textContent,
                siteTagline: document.querySelector('[data-id="site-tagline"]').textContent,
                footerCopyright: document.querySelector('[data-id="footer-copyright"]').innerHTML
            },
            navigation: {
                home: document.querySelector('[data-id="nav-home"]').textContent,
                about: document.querySelector('[data-id="nav-about"]').textContent,
                services: document.querySelector('[data-id="nav-services"]').textContent,
                whatWeDo: document.querySelector('[data-id="nav-whatwedo"]').textContent,
                contact: document.querySelector('[data-id="nav-contact"]').textContent
            },
            hero: {
                title: document.querySelector('[data-id="hero-title"]').textContent,
                description: document.querySelector('[data-id="hero-description"]').textContent,
                primaryButtonText: document.querySelector('[data-id="hero-primary-button"]').textContent,
                secondaryButtonText: document.querySelector('[data-id="hero-secondary-button"]').textContent
            },
            about: {
                title: document.querySelector('[data-id="about-title"]').textContent,
                description1: document.querySelector('[data-id="about-description1"]').textContent,
                description2: document.querySelector('[data-id="about-description2"]').textContent,
                stats: [
                    {
                        label: document.querySelector('[data-id="about-stat1-label"]').textContent,
                        value: parseInt(document.querySelector('[data-id="about-stat1-value"]').textContent)
                    },
                    {
                        label: document.querySelector('[data-id="about-stat2-label"]').textContent,
                        value: parseInt(document.querySelector('[data-id="about-stat2-value"]').textContent)
                    },
                    {
                        label: document.querySelector('[data-id="about-stat3-label"]').textContent,
                        value: parseInt(document.querySelector('[data-id="about-stat3-value"]').textContent)
                    }
                ],
                imageUrl: document.querySelector('[data-id="about-image"]').src
            },
            services: [],
            whatWeDo: [],
            missionVision: {
                vision: document.querySelector('[data-id="vision-text"]').textContent,
                mission: document.querySelector('[data-id="mission-text"]').textContent
            },
            contact: {
                title: document.querySelector('[data-id="contact-title"]').textContent,
                getInTouch: document.querySelector('[data-id="contact-getintouch"]').textContent,
                sendMessage: document.querySelector('[data-id="contact-sendmessage"]').textContent,
                address: document.querySelector('[data-id="contact-address"]').textContent,
                phone: document.querySelector('[data-id="contact-phone"]').textContent,
                email: document.querySelector('[data-id="contact-email"]').textContent,
                website: document.querySelector('[data-id="contact-website"]').textContent,
                websiteUrl: document.querySelector('[data-id="contact-website"]').href
            },
            newsletter: {
                title: document.querySelector('[data-id="newsletter-title"]').textContent,
                description: document.querySelector('[data-id="newsletter-description"]').textContent,
                placeholder: document.querySelector('[data-id="newsletter-placeholder"]').placeholder,
                buttonText: document.querySelector('[data-id="newsletter-button"]').textContent
            }
        };
        
        // Collect services data
        for (let i = 0; i < 6; i++) {
            const serviceTitle = document.querySelector(`[data-id="service-${i}-title"]`);
            const serviceDescription = document.querySelector(`[data-id="service-${i}-description"]`);
            const serviceIcon = document.querySelector(`[data-id="service-${i}-icon"]`);
            
            if (serviceTitle && serviceDescription && serviceIcon) {
                content.services.push({
                    title: serviceTitle.textContent,
                    description: serviceDescription.textContent,
                    icon: serviceIcon.className
                });
            }
        }
        
        // Collect what we do data
        for (let i = 0; i < 4; i++) {
            const activityTitle = document.querySelector(`[data-id="activity-${i}-title"]`);
            const activityDescription = document.querySelector(`[data-id="activity-${i}-description"]`);
            const activityIcon = document.querySelector(`[data-id="activity-${i}-icon"]`);
            
            if (activityTitle && activityDescription && activityIcon) {
                content.whatWeDo.push({
                    title: activityTitle.textContent,
                    description: activityDescription.textContent,
                    icon: activityIcon.className
                });
            }
        }
        
        // Convert to JSON
        const jsonContent = JSON.stringify(content, null, 2);
        
        // Save to localStorage as backup
        localStorage.setItem('siteContent', jsonContent);
        
        // Commit to GitHub
        commitToGitHub(jsonContent);
    }
    
    // Commit changes to GitHub
    function commitToGitHub(content) {
        const githubToken = ''; // Replace with your GitHub token
        const repo = 'YOUR_USERNAME/YOUR_REPO'; // Replace with your repo
        const filePath = 'content.json';
        
        // Get current file SHA
        fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
            headers: {
                'Authorization': `token ${githubToken}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const sha = data.sha;
            
            // Commit new content
            fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Update site content',
                    content: btoa(content),
                    sha: sha
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.commit) {
                    showNotification('Changes saved to GitHub! Netlify will deploy shortly.', 'success');
                    // Reload page after a short delay
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    showNotification('Error saving to GitHub: ' + (data.message || 'Unknown error'), 'error');
                }
            })
            .catch(error => {
                console.error('Error committing to GitHub:', error);
                showNotification('Error saving changes. Please check your GitHub token and repository access.', 'error');
            });
        })
        .catch(error => {
            console.error('Error getting file SHA:', error);
            showNotification('Error accessing GitHub repository. Please check your token and repository name.', 'error');
        });
    }
    
    // Show notification function
    function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const icon = notification.querySelector('.notification-icon i');
        const title = notification.querySelector('.notification-title');
        const text = notification.querySelector('.notification-text');
        
        // Set notification content
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
            title.textContent = 'Success!';
            notification.classList.add('success');
            notification.classList.remove('error');
        } else {
            icon.className = 'fas fa-exclamation-circle';
            title.textContent = 'Error!';
            notification.classList.add('error');
            notification.classList.remove('success');
        }
        
        text.textContent = message;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }
});