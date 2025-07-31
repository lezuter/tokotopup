document.addEventListener('DOMContentLoaded', () => {

    // 1. Siapkan semua variabel penting
    const tableBody = document.getElementById('gameTableBody');
    const searchInput = document.getElementById('searchName');
    const gameModal = document.getElementById('gameModal');
    const closeModalBtn = document.querySelector('.close-btn');
    const gameForm = document.getElementById('gameForm');
    const modalTitle = document.getElementById('modalTitle');
    const sectionSelect = document.getElementById('sectionSelect');
    const addGameBtn = document.getElementById('addGameBtn');
    const addNewSectionBtn = document.getElementById('addNewSectionBtn');
    const newSectionInput = document.getElementById('newSectionInput');
    const newSectionContainer = document.getElementById('newSectionContainer');
    const commitSectionBtn = document.getElementById('commitSectionBtn');
    let allGames = [];

    // --- FUNGSI-FUNGSI ---

    async function populateSectionDropdown() {
        try {
            const response = await fetch('/api/sections/names');
            const result = await response.json();
            if (result.success) {
                sectionSelect.innerHTML = '<option value="" disabled selected>-- Pilih Section --</option>';
                result.data.forEach(sectionName => {
                    const option = document.createElement('option');
                    option.value = sectionName;
                    option.textContent = sectionName;
                    sectionSelect.appendChild(option);
                });
            }
        } catch (error) { console.error('Error populating sections:', error); }
    }

    async function loadAndDisplayCards() {
        try {
            const response = await fetch('/api/cards');
            const result = await response.json();
            if (result.success) {
                allGames = result.data;
                renderTable(allGames);
            } else { tableBody.innerHTML = `<tr><td colspan="5">Gagal memuat data.</td></tr>`; }
        } catch (error) { console.error('Error:', error); tableBody.innerHTML = `<tr><td colspan="5">Kesalahan koneksi.</td></tr>`; }
    }

    const renderTable = (games) => {
        tableBody.innerHTML = '';
        if (games.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5">Tidak ada data.</td></tr>`;
            return;
        }
        games.forEach(game => {
            const row = document.createElement('tr');
            row.dataset.code = game.code;
            const imageUrl = game.image ? `/images/card/${game.image}` : '';
            row.innerHTML = `
                <td>${game.code}</td>
                <td>${game.name}</td>
                <td>${game.section}</td>
                <td><img src="${imageUrl}" alt="${game.name}" style="width: 80px;" onerror="this.style.display='none'"></td>
                <td class="actions">
                    <button class="btn btn-edit">Edit</button>
                    <button class="btn btn-delete">Hapus</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };
    
    // --- EVENT LISTENERS ---

    addGameBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Tambah Card Baru';
        gameForm.reset();
        gameForm.formMode.value = 'add';
        document.getElementById('currentImage').textContent = 'Tidak ada';
        newSectionContainer.style.display = 'none';
        newSectionInput.value = '';
        gameModal.style.display = 'block';
    });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredGames = allGames.filter(game => game.name.toLowerCase().includes(searchTerm));
        renderTable(filteredGames);
    });

    tableBody.addEventListener('click', async (event) => {
        const target = event.target;
        if (target.classList.contains('btn-edit')) {
            const gameCode = target.closest('tr').dataset.code;
            const gameToEdit = allGames.find(g => g.code === gameCode);
            if (gameToEdit) {
                modalTitle.textContent = 'Edit Game';
                gameForm.reset();
                newSectionContainer.style.display = 'none';
                newSectionInput.value = '';
                gameForm.formMode.value = 'edit';
                gameForm.originalCode.value = gameToEdit.code;
                gameForm.name.value = gameToEdit.name;
                sectionSelect.value = gameToEdit.section;
                document.getElementById('currentImage').textContent = gameToEdit.image || 'Tidak ada';
                
                // !! INI ADALAH BARIS KUNCI UNTUK MEMPERBAIKI GAMBAR HILANG !!
                // Baris ini mencatat nama gambar lama ke dalam form
                gameForm.oldImage.value = gameToEdit.image || '';

                gameModal.style.display = 'block';
            }
        }
        if (target.classList.contains('btn-delete')) {
            const isConfirmed = confirm('Apakah kamu yakin ingin menghapus game ini? Aksi ini tidak bisa dibatalkan.');
            if (isConfirmed) {
                const gameCode = target.closest('tr').dataset.code;
                try {
                    const response = await fetch(`/api/cards/${gameCode}`, { method: 'DELETE' });
                    const result = await response.json();
                    if (result.success) {
                        alert(result.message);
                        loadAndDisplayCards();
                    } else { alert('Gagal menghapus: ' + result.message); }
                } catch (error) { console.error('Delete error:', error); alert('Terjadi kesalahan saat mencoba menghapus data.'); }
            }
        }
    });

    gameForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(gameForm);
        const mode = formData.get('formMode');
        let url = '/api/cards';
        let method = 'POST';
        if (mode === 'edit') {
            const originalCode = formData.get('originalCode');
            url = `/api/cards/${originalCode}`;
            method = 'PUT';
        }
        try {
            const response = await fetch(url, { method: method, body: formData });
            const result = await response.json();
            if (result.success) {
                alert(result.message);
                gameModal.style.display = 'none';
                populateSectionDropdown();
                loadAndDisplayCards();
            } else { alert('Gagal: ' + result.message); }
        } catch (error) { console.error('Submit error:', error); alert('Terjadi kesalahan saat mengirim data.'); }
    });
    
    addNewSectionBtn.addEventListener('click', () => {
        newSectionContainer.style.display = 'flex';
        sectionSelect.value = '';
        newSectionInput.focus();
    });

    sectionSelect.addEventListener('change', () => {
        if (sectionSelect.value !== '') {
            newSectionContainer.style.display = 'none';
            newSectionInput.value = '';
        }
    });

    commitSectionBtn.addEventListener('click', () => {
        const newName = newSectionInput.value.trim();
        if (newName === '') {
            alert('Nama section baru tidak boleh kosong.');
            return;
        }
        const option = document.createElement('option');
        option.value = newName;
        option.textContent = newName;
        sectionSelect.appendChild(option);
        sectionSelect.value = newName;
        newSectionContainer.style.display = 'none';
        newSectionInput.value = '';
    });

    closeModalBtn.addEventListener('click', () => { gameModal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target == gameModal) { gameModal.style.display = 'none'; } });

    // Panggil fungsi-fungsi utama saat halaman dibuka
    populateSectionDropdown();
    loadAndDisplayCards();
});