// This script handles the upload of the JSON file to manage groups
// The file must be formatted as the following sample file:

const sample = [
  {
    name: "👨🏽‍💻 Developers",
    members: [
      "my-first-dev@company.com",
      "my-second-dev@company.com",
      "my-best-dev@company.com",
      "its-a-me@company.com",
    ],
  },
  {
    name: "✨ Designer",
    members: [
      "oh-my-designer@company.com",
      "who-s-that-pokemon@company.com",
      "the-cake-is-a-lie@company.com",
    ],
  },
];

// Update the displayed group list
const updateGroupsList = async function() {
  chrome.storage.local.get('groups', function (result) {
    const groups = Array.isArray(result.groups) ? result.groups : [];

    if (groups.length === 0) {
      document.querySelector("ul#groups").innerHTML = `<p>No registered groups yet 🧐</p>`;

      return;
    } 

    const list = groups.map((group) => {
      if (!group) {
        return;
      }
      
      return `<li>${group.name} (${group?.members?.length || 0} users)</li>`;
    }).join('\n');

    document.querySelector("ul#groups").innerHTML = list;

  });
};

// Get the link to the sample file generated from the above sample JSON
const getSampleFileURL = function() {
  // Format the sample to a JSON with indents
  const jsonContent = JSON.stringify(sample, null, 2);

  // Create a blob file
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8",
  });

  // Expose the blob file to a temp url
  return URL.createObjectURL(blob);
};

// Upload a JSON file that contains the user groups
const upload = function () {
  const input = document.createElement("input");
  input.type = "file";

  input.addEventListener("change", function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const jsonContent = e.target.result;
        const groups = JSON.parse(jsonContent);

        // Check if the file respects the format (compare to the sample one)
        if (Array.isArray(groups)) {
          try {
            // Store the received groups in the chrome extension store
            chrome.storage.local.set({ groups: groups }, function () {
              console.log("Groups uploaded successfully:", groups);
            });

            updateGroupsList();
          } catch (error) {
            console.error("Chrome storage error:", error);
          }
        } else {
          console.error("Invalid file format");
        }
      } catch (error) {
        console.error("Error parsing JSON file:", error);
      }
    };

    reader.readAsText(file);
  });

  input.click();
};

// Add event listeners to the upload button
document.querySelector("button#upload").addEventListener("click", upload);

// Add the href to the generated sample file 
document.querySelector("a#sample").href = getSampleFileURL();

// Generate the displayed content of the currently loaded groups
updateGroupsList();