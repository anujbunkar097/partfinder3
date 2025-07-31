document.getElementById('uploadButton').addEventListener('click', processCsvFile);

async function processCsvFile() {
    const fileInput = document.getElementById('csvFile');
    const statusContainer = document.getElementById('statusContainer');
    const loader = document.getElementById('loader');
    const uploadButton = document.getElementById('uploadButton');

    if (fileInput.files.length === 0) {
        alert('Please select a CSV file to upload.');
        return;
    }

    const file = fileInput.files[0];
    const webhookUrl = 'https://transformco.app.n8n.cloud/webhook-test/7fd2740c-a4d7-46d9-9de4-fc4b856b813f'; // Make sure this is your Production URL

    statusContainer.innerHTML = 'Uploading and processing file... This may take several minutes.';
    loader.style.display = 'block';
    uploadButton.disabled = true;

    // Use FormData to send the file
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData, // No 'Content-Type' header needed; the browser sets it for FormData
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        // Get the filename from the response headers
        const disposition = response.headers.get('content-disposition');
        let filename = 'part_results.csv';
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        
        // Get the file content as a Blob
        const blob = await response.blob();

        // Create a temporary link to trigger the download
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        a.remove();
        
        statusContainer.innerHTML = 'Processing complete! Your download should begin shortly.';

    } catch (error) {
        console.error('Error:', error);
        statusContainer.innerHTML = `<p style="color: red;">An error occurred: ${error.message}</p>`;
    } finally {
        loader.style.display = 'none';
        uploadButton.disabled = false;
    }
}
