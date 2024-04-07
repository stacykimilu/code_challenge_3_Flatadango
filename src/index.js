let serverURL = "http://localhost:3000";
let selectedMovie = null;
let moviesList = [];

// Fetch movie data from the server
function fetchMovie(id) {
    return fetch(`${serverURL}/films/${id}`)
        .then(response => response.json())
        .catch(error => console.error("Error fetching movie details:", error));
}

// Fetch all movies
function fetchAllMovies() {
    return fetch(`${serverURL}/films`)
        .then(response => response.json())
        .catch(error => console.error("Error fetching all movies:", error));
}

// Populate the HTML list dynamically from the 'movies' array
function renderMovieList(movies) {
    const movieList = document.getElementById("films");
    let html = '';

    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i];
        // Check if the movie is sold out
        const isSoldOut = movie.capacity - movie.tickets_sold <= 0;
        const buttonContent = isSoldOut ? "Sold Out" : "Delete";
        const buttonClass = isSoldOut ? "sold-out" : "delete-button";
        html += `
            <li class="film item ${isSoldOut ? 'sold-out' : ''}" data-id="${movie.id}">
                ${movie.title}
                <button class="${buttonClass}" data-id="${movie.id}">${buttonContent}</button>
            </li>`;
    }
    movieList.innerHTML = html;

    // Add event listeners to delete buttons
    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach(button => {
        button.addEventListener("click", async function(event) {
            const movieId = event.target.dataset.id;
            await removeMovie(movieId);
        });
    });
}

// Fetch the movies on page load
async function loadMovies() {
    try {
        moviesList = await fetchAllMovies();
        renderMovieList(moviesList);
        // Fetch and display details of the first movie
        if (moviesList.length > 0) {
            await displayMovieDetails(moviesList[0].id);
        }
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

// Display movie details
async function displayMovieDetails(id) {
    try {
        const movie = await fetchMovie(id);
        if (movie) {
            selectedMovie = movie;
            const poster = document.getElementById("poster");
            const title = document.getElementById("title");
            const runtime = document.getElementById("runtime");
            const showtime = document.getElementById("showtime");
            const ticketNum = document.getElementById("ticket-num");

            poster.src = movie.poster;
            poster.alt = movie.title;
            title.innerText = movie.title;
            runtime.innerText = `${movie.runtime} minutes`;
            showtime.innerText = movie.showtime;
            ticketNum.innerText = movie.capacity - movie.tickets_sold;
        }
    } catch (error) {
        console.error("Error displaying movie details:", error);
    }
}

// Buy a ticket for a movie
async function purchaseTicket() {
    if (!selectedMovie || selectedMovie.capacity - selectedMovie.tickets_sold <= 0) {
        return; // No movie selected or sold out
    }

    try {
        // Update tickets_sold on the server
        const updatedMovie = { ...selectedMovie, tickets_sold: selectedMovie.tickets_sold + 1 };
        await updateMovieDetails(updatedMovie);
        // Update UI
        const ticketNum = document.getElementById("ticket-num");
        ticketNum.innerText = updatedMovie.capacity - updatedMovie.tickets_sold;
        // Check if movie is sold out after purchasing ticket
        if (updatedMovie.capacity - updatedMovie.tickets_sold <= 0) {
            renderMovieList(moviesList); // Update movie list to show "Sold Out" button
        }
    } catch (error) {
        console.error("Error purchasing ticket:", error);
    }
}

// Update movie details on the server
async function updateMovieDetails(movie) {
    try {
        const requestOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(movie)
        };
        const response = await fetch(`${serverURL}/films/${movie.id}`, requestOptions);
        if (!response.ok) {
            throw new Error("Failed to update movie details.");
        }
    } catch (error) {
        throw error;
    }
}

// Delete a film from the server
async function removeMovie(id) {
    try {
        const requestOptions = {
            method: "DELETE"
        };
        const response = await fetch(`${serverURL}/films/${id}`, requestOptions);
        if (!response.ok) {
            throw new Error("Failed to delete movie.");
        }
        // Remove the film from the UI
        const movieElement = document.querySelector(`[data-id="${id}"]`);
        if (movieElement) {
            movieElement.remove();
        }
    } catch (error) {
        console.error("Error deleting movie:", error);
    }
}

// Event listener for buying a ticket
document.getElementById("buy-ticket").addEventListener("click", purchaseTicket);

// Event listener for clicking on a movie in the menu
document.getElementById("films").addEventListener("click", function (event) {
    const id = event.target.dataset.id;
    if (id) {
        displayMovieDetails(id);
    }
});

// Initialize the app
loadMovies();
