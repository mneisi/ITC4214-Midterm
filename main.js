/*
Mostafa Neisi 
ITC4214 - Internet Programming
The American College of Greece
Dr. Leonardos Mageiros
*/


// Priority classes using theme context
function getPriorityClass(priority) {
    var currentDark = $('body').hasClass('dark-mode');
    switch (priority.toLowerCase()) {
        case 'high': return 'bg-danger';
        case 'medium': return currentDark ? 'bg-warning text-dark' : 'bg-warning';
        case 'low': return 'bg-success';
        default: return 'bg-secondary';
    }
}

// ================== Home & Dark Mode =================== //

$(document).ready(function() {
    // Check stored preference and update dark mode accordingly
    var isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    if (isDarkMode) {
      $('body').addClass('dark-mode');
    }
    
    // Optionally, if a dark mode toggle exists on the page
    var $darkModeToggle = $('#darkModeToggle');
    if ($darkModeToggle.length) {
      $darkModeToggle.text($('body').hasClass('dark-mode') ? 'Light Mode' : 'Dark Mode');
      $darkModeToggle.on('click', function() {
        var newMode = !$('body').hasClass('dark-mode');
        $('body').toggleClass('dark-mode', newMode);
        localStorage.setItem('darkMode', newMode ? 'enabled' : 'disabled');
        $darkModeToggle.text(newMode ? 'Light Mode' : 'Dark Mode');
        
        updateDarkModeButton();
      });
    }
    displayRecentTasks();
    
    function updateDarkModeButton() {
      var $navbar = $('.navbar');
      $navbar.removeClass('navbar-dark navbar-light');
      if ($('body').hasClass('dark-mode')) {
        $navbar.addClass('navbar-dark');
      } else {
        $navbar.addClass('navbar-light');
      }
    }
    
    // Activity Display Function
    function displayRecentTasks() {
      var $activitySection = $('#activity');
      var tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      
      // Sort tasks by descending id and take the top 5
      tasks.sort(function(a, b) {
        return b.id - a.id;
      });
      var recentTasks = tasks.slice(0, 5);
      
      var currentDark = $('body').hasClass('dark-mode');
      var activityHTML = recentTasks.map(function(task) {
        return `
          <div class="activity-item mb-3 p-3 border rounded">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-1">${task.name}</h5>
                <small class="${currentDark ? 'text-muted-dark' : 'text-muted'}">
                  Due: ${task.dueDate}
                </small>
              </div>
              <span class="badge ${getPriorityClass(task.priority)}">
                ${task.priority}
              </span>
            </div>
            ${task.description ? `<p class="mt-2 mb-0">${task.description}</p>` : ''}
          </div>
        `;
      }).join('');
      
      if (!activityHTML) {
        activityHTML = `<p class="${currentDark ? 'text-muted-dark' : 'text-muted'}">No recent activity</p>`;
      }
      $activitySection.html(activityHTML);
    }
    
    // ================== Tasks =================== //

    let statuses = JSON.parse(localStorage.getItem('statuses')) || ['To Do', 'In Progress', 'Done'];
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentEditId = null;

    // Initialize board
    function initBoard() {
        $('#taskBoard').empty();
        statuses.forEach(status => createStatusColumn(status));
        loadTasks();
        initSortable();
        updateStatusDropdown();
        updateSummary();
    }

    function createStatusColumn(status) {
        const column = $(`
            <div class="status-column">
                <div class="status-header">
                    <span>${status}</span>
                    <span class="delete-status-btn" data-status="${status}">×</span>
                </div>
                <div class="task-list" data-status="${status}"></div>
            </div>
        `);
        $('#taskBoard').append(column);
    }

    function initSortable() {
        // Safely destroy existing sortables
        $('.task-list').each(function() {
            if ($(this).data('ui-sortable')) {
                $(this).sortable('destroy');
            }
        });

        // Initialize new sortable instances
        $('.task-list').sortable({
            connectWith: '.task-list',
            placeholder: 'sortable-placeholder',
            tolerance: 'pointer',
            cursor: 'move',
            opacity: 0.8,
            start: function(e, ui) {
                ui.item.addClass('dragging');
            },
            stop: function(e, ui) {
                ui.item.removeClass('dragging');
            },
            receive: function(event, ui) {
                const newStatus = $(this).data('status');
                const taskId = ui.item.data('id');

                // Update data model
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                    task.status = newStatus;
                    saveData();
                }

                // Update DOM attributes
                ui.item.attr('data-status', newStatus);
                $(this).sortable('refresh');
            }
        }).disableSelection();
    }

    function loadTasks() {
        tasks.forEach(task => {
            $(`.task-list[data-status="${task.status}"]`).append(createTaskCard(task));
        });
        updateColumnCounts();
    }

    function createTaskCard(task) {
        const card = $(`
            <div class="task-card" data-id="${task.id}" data-status="${task.status}">
                <h6>${task.name}</h6>
                ${task.description ? `<p class="small">${task.description}</p>` : ''}
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-${getPriorityClass(task.priority)} text-muted">${task.priority}</span>
                    <small>${task.dueDate}</small>
                </div>
                <div class="mt-2">
                    <button class="btn btn-sm btn-warning edit-btn">Edit</button>
                    <button class="btn btn-sm btn-danger delete-btn">Delete</button>
                </div>
            </div>
        `);
        card.data('status', task.status);
        return card;
    }

    // Task Form Handling
    $('#taskForm').submit(function(e) {
        e.preventDefault();
        const task = {
            id: currentEditId || Date.now(),
            name: $('#taskName').val().trim(),
            description: $('#taskDescription').val().trim(),
            dueDate: $('#dueDate').val(),
            priority: $('#priority').val(),
            status: $('#taskStatus').val()
        };

        if (!validateTask(task)) return;

        if (currentEditId) {
            updateTask(task);
        } else {
            addTask(task);
        }

        saveData();
        $('#taskModal').modal('hide');
        resetForm();
    });

    function validateTask(task) {
        if (!task.name || !task.dueDate || !task.status) {
            alert('Please fill all required fields');
            return false;
        }
        return true;
    }

    function addTask(task) {
        tasks.push(task);
        $(`.task-list[data-status="${task.status}"]`).append(createTaskCard(task));
    }

    function updateTask(updatedTask) {
        const index = tasks.findIndex(t => t.id === updatedTask.id);
        const oldStatus = tasks[index].status;
        tasks[index] = updatedTask;

        if (oldStatus !== updatedTask.status) {
            $(`.task-card[data-id="${updatedTask.id}"]`).remove();
            $(`.task-list[data-status="${updatedTask.status}"]`).append(createTaskCard(updatedTask));
        } else {
            $(`.task-card[data-id="${updatedTask.id}"]`).replaceWith(createTaskCard(updatedTask));
        }
    }

    // Status Management
    $('#addStatusBtn').click(() => $('#statusModal').modal('show'));

    $('#statusForm').submit(function(e) {
        e.preventDefault();
        const newStatus = $('#statusName').val().trim();

        if (!newStatus) {
            alert('Please enter a status name');
            return;
        }

        if (statuses.includes(newStatus)) {
            alert('Status already exists');
            return;
        }

        statuses.push(newStatus);
        saveData();
        initBoard();
        $('#statusModal').modal('hide');
        $('#statusName').val('');
    });

    $(document).on('click', '.delete-status-btn', function() {
        const status = $(this).data('status');
        if (statuses.length <= 1) {
            alert('You must have at least one status');
            return;
        }

        if (!confirm(`Delete "${status}" status? All tasks will be moved to "${statuses[0]}"`)) return;

        // Move tasks to first status
        tasks = tasks.map(task => {
            if (task.status === status) task.status = statuses[0];
            return task;
        });

        statuses = statuses.filter(s => s !== status);
        saveData();
        initBoard();
    });

    // Edit/Delete Tasks
    $(document).on('click', '.edit-btn', function() {
        const taskId = $(this).closest('.task-card').data('id');
        const task = tasks.find(t => t.id === taskId);

        $('#taskName').val(task.name);
        $('#taskDescription').val(task.description);
        $('#dueDate').val(task.dueDate);
        $('#priority').val(task.priority);
        $('#taskStatus').val(task.status);
        currentEditId = taskId;
        $('#taskModal').modal('show');
    });

    $(document).on('click', '.delete-btn', function() {
        const taskId = $(this).closest('.task-card').data('id');
        tasks = tasks.filter(t => t.id !== taskId);
        $(`.task-card[data-id="${taskId}"]`).remove();
        saveData();
    });

    // Helpers
    function updateStatusDropdown() {
        $('#taskStatus').empty();
        statuses.forEach(status => {
            $('#taskStatus').append($('<option>', {
                value: status,
                text: status
            }));
        });
    }

    function updateColumnCounts() {
        statuses.forEach(status => {
            const count = $(`.task-list[data-status="${status}"] .task-card`).length;
            $(`.status-column:contains('${status}') .count`).text(count);
        });
    }

    function updateSummary() {
        let total = tasks.length;
        let completed = tasks.filter(task => task.status === 'Done').length;
        let pending = total - completed;
        $('#totalTasks').text(total);
        $('#pendingTasks').text(pending);
        $('#completedTasks').text(completed);
    }

    function saveData() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('statuses', JSON.stringify(statuses));
        updateColumnCounts();
        $('.task-list').sortable('refresh');
        updateSummary(); // Update summary counts on each save
        // Update activity feed on index.html
        if (typeof displayRecentTasks === 'function') {
            displayRecentTasks();
        }
    }

    function resetForm() {
        $('#taskForm')[0].reset();
        currentEditId = null;
    }

    // Initialization
    initBoard();


// ================== Contact =================== //

    $("#contactForm").submit(function(event) {
        event.preventDefault();
        alert("Message sent successfully!");
        this.reset();
    });
  });  


// ================== Songs =================== //
$(document).ready(function() {
    // Array to hold song objects
    var songs = [];
    var $songUpload = $('#songUpload');
    var $songList = $('#songList');
    var $songSearch = $('#songSearch');
    var $audioPlayer = $('#audioPlayer');

    // When songs are uploaded, create song objects with an Object URL
    $songUpload.on('change', function(e) {
        var files = Array.from(e.target.files);
        $.each(files, function(index, file) {
            var songObj = {
                name: file.name,
                file: file,
                url: URL.createObjectURL(file)
            };
            songs.push(songObj);
        });
        renderSongs();
    });

    // Render the songs list with optional filtering
    function renderSongs(filter) {
        filter = filter || '';
        $songList.empty();
        var filteredSongs = songs.filter(function(song) {
            return song.name.toLowerCase().includes(filter.toLowerCase());
        });

        $.each(filteredSongs, function(index, song) {
            var col = $('<div class="col"></div>');
            var cardHTML = `
                <div class="card song-card">
                    <div class="card-body">
                        <h5 class="card-title">${song.name}</h5>
                        <button class="btn btn-primary play-btn" data-index="${index}">
                            <i class="fas fa-play"></i> Play
                        </button>
                    </div>
                </div>
            `;
            col.html(cardHTML);
            $songList.append(col);
        });

        // Remove previous handlers then add click events to the play buttons
        $('.play-btn').off('click').on('click', function() {
            var index = $(this).data('index');
            var songToPlay = filteredSongs[index];
            playSong(songToPlay.url);
        });
    }

    // Listen for search input and re-render the songs list
    $songSearch.on('input', function() {
        renderSongs($(this).val());
    });

    // Play the selected song using the HTML5 audio element
    function playSong(url) {
        $audioPlayer.attr('src', url);
        $audioPlayer.show();
        $audioPlayer[0].play();
    }
});






