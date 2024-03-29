// script.js
const apiUrl = "https://restcountries.com/v3.1/all";
let currentPage = 1;
let countriesData;

$(document).ready(function () {
    // Fetch data from the API
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            countriesData = data;
            displayCountries(countriesData);
            addEventListeners();
        })
        .catch(error => console.error('Error fetching data:', error));
});

function displayCountries(countries) {
    const cardList = $('#catalog');
    cardList.empty();

    const startIndex = (currentPage - 1) * 25;
    const endIndex = startIndex + 25;
    const visibleCountries = countries.slice(startIndex, endIndex);

    visibleCountries.forEach(country => {
        const card = $('<div class="country-div">')
            .data('country', country)
            .append(`<img src="${country.flags.png}" alt="Flag">`)
            .append(`<h2>${country.name.common}</h2>`)
            .append(`<hr>`)
            .append(`<p>Population: ${country.population}</p>`)
            .append(`<p>Region: ${country.region}</p>`)
            .append(`<p>Capital: ${country.capital.join(', ')}</p>`)
            .append(`<button class="details-btn">Details</button>`)
            .click(function () {
                const countryData = $(this).data('country');
                displayDetailsModal(countryData);
            });

        cardList.append(card);
    });



    // Update pagination information
    const totalPages = Math.ceil(countries.length / 25);
    $('#currentPage').text(`Page ${currentPage} of ${totalPages}`);
}

function addEventListeners() {
    // Search functionality
    $('#searchBtn').click(function () {
        const searchTerm = $('#searchInput').val().toLowerCase();
        const filteredCountries = countriesData.filter(country => country.name.common.toLowerCase().includes(searchTerm));
        currentPage = 1; // Reset to the first page after searching
        displayCountries(filteredCountries);
    });

    // Sorting functionality
    $('#sortBtn').click(function () {
        const sortType = $('#sort').val();
        const sortedCountries = sortCountries(countriesData, sortType);
        displayCountries(sortedCountries);
    });

    // Pagination functionality
    $('#prevBtn').click(function () {
        if (currentPage > 1) {
            currentPage--;
            displayCountries(countriesData);
        }
    });

    $('#nextBtn').click(function () {
        const totalPages = Math.ceil(countriesData.length / 25);
        if (currentPage < totalPages) {
            currentPage++;
            displayCountries(countriesData);
        }
    });

    // Modal functionality
    $('.country-div').click(function () {
        const countryData = $(this).data('country');
        displayModal(countryData);
    });


    // Close details modal
    $('#detailsModalClose').click(function () {
        $('#detailsModal').hide();
    });


    // Details button in modal
    $('#modalContent').on('click', '.details-btn', function () {
        // Extract country data from the modal content
        const countryData = JSON.parse($('#modalContent').attr('data-country'));
        displayDetailsModal(countryData);
    });
}

function sortCountries(countries, sortType) {
    return countries.sort((a, b) => {
        const nameA = a.name.common.toLowerCase();
        const nameB = b.name.common.toLowerCase();

        if (sortType === 'asc') {
            return nameA.localeCompare(nameB);
        } else {
            return nameB.localeCompare(nameA);
        }
    });
}


function displayDetailsModal(countryData) {
    const detailsModalContent = $('#detailsModalContent');
    detailsModalContent.empty();

    try {
        // Ensure that countryData is a valid JSON string
        const parsedData = JSON.parse(JSON.stringify(countryData));
        const nativeNames = parsedData.name.nativeName;
        const languages = parsedData.languages;
        const currencies = parsedData.currencies;

        // Display detailed information in the details modal
        detailsModalContent.append(`<h2>${parsedData.name.common}</h2>`);
        detailsModalContent.append(`<img src="${parsedData.flags.png}" alt="Flag">`);
        detailsModalContent.append(`<p><strong>Official Name:</strong> ${parsedData.name.official}</p>`);
        if (nativeNames) {
            Object.keys(nativeNames).forEach(lang => {
                const officialName = nativeNames[lang].official;
                detailsModalContent.append(`<p><strong>Native Name (${lang}):</strong> ${officialName}</p>`);
            });
        } else {
            detailsModalContent.append(`<p><strong>Native Name:</strong> N/A</p>`);
        } detailsModalContent.append(`<p><strong>Alternative Names:</strong> ${parsedData.altSpellings.join(', ')}</p>`);
        detailsModalContent.append(`<p><strong>Country Codes:</strong> ${parsedData.cca2} (2 characters), ${parsedData.cca3} (3 characters)</p>`);
        detailsModalContent.append(`<p><strong>Country Calling Code:</strong> +${parsedData.cca2}</p>`);
        detailsModalContent.append(`<p><strong>Region:</strong> ${parsedData.region}</p>`);
        detailsModalContent.append(`<p><strong>Subregion:</strong> ${parsedData.subregion}</p>`);
        detailsModalContent.append(`<p><strong>Area:</strong> ${parsedData.area.toLocaleString()} square kilometers</p>`);
        if (languages) {
            Object.keys(languages).forEach(lang => {
                const language = languages[lang];
                detailsModalContent.append(`<p><strong>Official Language (${lang}):</strong> ${language}</p>`);
            });
        } else {
            detailsModalContent.append(`<p><strong>Official Languages:</strong> N/A</p>`);
        }
        if (currencies) {
            Object.keys(currencies).forEach(currencyCode => {
                const currency = currencies[currencyCode];
                detailsModalContent.append(`<p><strong>Currency (${currencyCode}):</strong> ${currency.name} (${currency.symbol})</p>`);
            });
        } else {
            detailsModalContent.append(`<p><strong>Currencies:</strong> N/A</p>`);
        }

    } catch (error) {
        console.error('Error parsing countryData:', error);
        detailsModalContent.append('<p>Error parsing country data.</p>');
    }

    // Show details modal
    $('#detailsModal').show();
}


