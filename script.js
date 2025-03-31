const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-button');
const tagsFilter = document.getElementById('tags-filter');
const filterGoButton = document.querySelector('.filter-go-button');
const schematicsContainer = document.querySelector('.schematics-container');
const uploadButton = document.getElementById('uploadButton');
const adminNames = ["Entiy1234", "Väsen_Entity", "King__Of__Death", "King_Of_Death"]; // Array of admin usernames

function openUploadForm() {
    document.getElementById("uploadModal").style.display = "block";
}

function closeUploadForm() {
    document.getElementById("uploadModal").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("uploadModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const author = document.getElementById('upload-author').value;
    const title = document.getElementById('upload-title').value;
    const imageFile = document.getElementById('upload-image').files[0];
    const schematicFile = document.getElementById('upload-file').files[0]; // Get the schematic file
    const description = document.getElementById('upload-description').value;
    const tags = Array.from(document.querySelectorAll('input[name="tags"]:checked')).map(cb => cb.value);

    const imageReader = new FileReader();
    const fileReader = new FileReader(); // Reader for the schematic file

    let imageDataURL = 'https://via.placeholder.com/350x200/ccc/666?Text=No+Image';
    let fileDataURL = null;

    function handleSubmission() {
        let displayAuthor = author;
        if (adminNames.includes(author)) {
            displayAuthor = `<span class="admin-badge">[Admin]</span> ${author}`;
        }
        const newSubmission = {
            title: title,
            image: imageDataURL,
            tags: tags,
            creator: displayAuthor,
            description: description,
            fileContent: fileDataURL, // Store the file content
            fileName: schematicFile ? schematicFile.name : null // Store the file name
        };

        saveSubmission(newSubmission);
        loadSubmissions();
        closeUploadForm();
        alert('Upload submitted and saved!');
    }

    imageReader.onloadend = function() {
        imageDataURL = imageReader.result;
        if (schematicFile) {
            fileReader.onloadend = function() {
                fileDataURL = fileReader.result;
                handleSubmission();
            };
            fileReader.readAsDataURL(schematicFile); // Read schematic file as Data URL
        } else {
            handleSubmission();
        }
    };

    if (imageFile) {
        imageReader.readAsDataURL(imageFile);
    } else {
        if (schematicFile) {
            fileReader.onloadend = function() {
                fileDataURL = fileReader.result;
                handleSubmission();
            };
            fileReader.readAsDataURL(schematicFile);
        } else {
            handleSubmission();
        }
    }
});

function getSubmissions() {
    const storedSubmissions = localStorage.getItem('bloxdSchematics');
    if (storedSubmissions) {
        return JSON.parse(storedSubmissions);
    }
    return [];
}

function saveSubmission(submission) {
    const submissions = getSubmissions();
    submissions.push(submission);
    localStorage.setItem('bloxdSchematics', JSON.stringify(submissions));
}

function renderSubmissions(submissionsToRender) {
    schematicsContainer.innerHTML = '';
    if (submissionsToRender.length === 0) {
        schematicsContainer.innerHTML = '<p>No schematics found.</p>';
        return;
    }

    submissionsToRender.forEach((submission, index) => {
        const card = document.createElement('div');
        card.classList.add('schematic-card');
        card.innerHTML = `
            <div class="schematic-image-container">
                <img src="${submission.image}" alt="${submission.title}" class="schematic-image">
            </div>
            <div class="schematic-details">
                <h2 class="schematic-title">${submission.title}</h2>
                <div class="schematic-tags">
                    Tags : ${submission.tags.map(tag => `<span class="tag">${tag}</span>`).join(', ')}
                </div>
                <p>${submission.description}</p>
                <a href="#" class="download-button" data-index="${index}">Download</a>
                <p class="creator-info">Creator : ${submission.creator}</p>
            </div>
        `;
        schematicsContainer.appendChild(card);
    });

    const downloadButtons = document.querySelectorAll('.download-button');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            downloadFile(index);
        });
    });
}

function loadSubmissions() {
    const allSubmissions = getSubmissions();
    renderSubmissions(allSubmissions);
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const allSubmissions = getSubmissions();
    const filteredSubmissions = allSubmissions.filter(submission =>
        submission.title.toLowerCase().includes(searchTerm) ||
        submission.creator.toLowerCase().includes(searchTerm) ||
        submission.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        submission.description.toLowerCase().includes(searchTerm)
    );
    renderSubmissions(filteredSubmissions);
}

searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

filterGoButton.addEventListener('click', function() {
    const selectedTag = tagsFilter.value;
    const allSubmissions = getSubmissions();
    let filteredSubmissions;

    if (selectedTag === 'None') {
        filteredSubmissions = allSubmissions;
    } else {
        filteredSubmissions = allSubmissions.filter(submission =>
            submission.tags.includes(selectedTag)
        );
    }
    renderSubmissions(filteredSubmissions);
});

function downloadFile(submissionIndex) {
    const submissions = getSubmissions();
    if (submissions[submissionIndex] && submissions[submissionIndex].fileContent) {
        const fileDataURL = submissions[submissionIndex].fileContent;
        const fileName = submissions[submissionIndex].fileName || 'schematic.dat'; // Default filename

        const link = document.createElement('a');
        link.href = fileDataURL;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Clean up the temporary link
    } else {
        alert('No file available for download.');
    }
}

uploadButton.addEventListener('click', openUploadForm);
window.onload = loadSubmissions;